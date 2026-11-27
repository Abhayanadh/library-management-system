"""
Users / Profiles API - Student and Librarian account management.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from supabase import Client

from app.core.auth import get_current_user, get_supabase_admin_client, require_role
from app.schemas.users import ProfileUpdate, StudentDashboardStats, DashboardStats
from datetime import datetime, timezone

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", summary="Get current user's own profile")
async def get_my_profile(
    current_user: dict = Depends(get_current_user),
):
    return current_user


@router.patch("/me", summary="Update current user's own profile")
async def update_my_profile(
    payload: ProfileUpdate,
    current_user: dict = Depends(get_current_user),
    db: Client = Depends(get_supabase_admin_client),
):
    update_data = payload.model_dump(exclude_none=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    res = db.table("profiles").update(update_data).eq("id", current_user["id"]).execute()
    return {"message": "Profile updated", "profile": res.data[0]}


@router.get("/students", summary="List all students [Librarian/Admin]")
async def list_students(
    q: str = Query(None, description="Search by name or roll number"),
    limit: int = Query(50, le=200),
    offset: int = Query(0),
    current_user: dict = Depends(require_role(["librarian", "admin"])),
    db: Client = Depends(get_supabase_admin_client),
):
    query = db.table("profiles").select("*").eq("role", "student")
    if q:
        query = query.or_(f"full_name.ilike.%{q}%,roll_number.ilike.%{q}%,email.ilike.%{q}%")
    res = query.order("created_at", desc=True).range(offset, offset + limit - 1).execute()
    return res.data or []


@router.get("/students/{student_id}", summary="Get student details with active issues [Librarian/Admin]")
async def get_student(
    student_id: str,
    current_user: dict = Depends(require_role(["librarian", "admin"])),
    db: Client = Depends(get_supabase_admin_client),
):
    profile_res = db.table("profiles").select("*").eq("id", student_id).eq("role", "student").single().execute()
    if not profile_res.data:
        raise HTTPException(status_code=404, detail="Student not found")

    issues_res = (
        db.table("book_issues")
        .select("*, book_copies(copy_code, books(title, author))")
        .eq("student_id", student_id)
        .in_("status", ["issued", "overdue"])
        .execute()
    )
    return {"profile": profile_res.data, "active_issues": issues_res.data or []}


@router.patch("/students/{student_id}/deactivate", summary="Deactivate student account [Admin]")
async def deactivate_student(
    student_id: str,
    current_user: dict = Depends(require_role(["admin"])),
    db: Client = Depends(get_supabase_admin_client),
):
    db.table("profiles").update({"is_active": False, "updated_at": datetime.now(timezone.utc).isoformat()}).eq("id", student_id).execute()
    return {"message": "Student account deactivated"}


@router.get("/dashboard/student", response_model=StudentDashboardStats, summary="Student dashboard stats")
async def student_dashboard(
    current_user: dict = Depends(get_current_user),
    db: Client = Depends(get_supabase_admin_client),
):
    if current_user["role"] != "student":
        raise HTTPException(status_code=403, detail="Student access only")

    student_id = current_user["id"]
    settings_res = db.table("library_settings").select("daily_fine_inr").execute()
    daily_fine = float(settings_res.data[0]["daily_fine_inr"]) if settings_res.data else 5.0
    now = datetime.now(timezone.utc)

    active_res = db.table("book_issues").select("id,due_date").eq("student_id", student_id).in_("status", ["issued", "overdue"]).execute()
    returned_res = db.table("book_issues").select("id").eq("student_id", student_id).eq("status", "returned").execute()

    active = active_res.data or []
    currently_borrowed = len(active)
    due_soon = sum(
        1 for i in active
        if (datetime.fromisoformat(i["due_date"].replace("Z", "+00:00")) - now).days <= 3
    )

    # Sum pending fines from returns table where fine_paid = false
    fines_res = (
        db.table("returns")
        .select("fine_amount")
        .eq("fine_paid", False)
        .execute()
    )
    # Filter for this student's issues
    issue_ids = {str(i["id"]) for i in active_res.data or []}
    pending_fine = sum(
        float(r["fine_amount"])
        for r in (fines_res.data or [])
    )

    return StudentDashboardStats(
        currently_borrowed=currently_borrowed,
        total_returned=len(returned_res.data or []),
        due_soon=due_soon,
        pending_fine=pending_fine,
    )


@router.get("/dashboard/stats", response_model=DashboardStats, summary="Librarian/Admin dashboard stats")
async def librarian_dashboard(
    current_user: dict = Depends(require_role(["librarian", "admin"])),
    db: Client = Depends(get_supabase_admin_client),
):
    books_res = db.table("books").select("id", count="exact").execute()
    copies_res = db.table("book_copies").select("id,status", count="exact").execute()
    students_res = db.table("profiles").select("id", count="exact").eq("role", "student").execute()
    librarians_res = db.table("profiles").select("id", count="exact").eq("role", "librarian").execute()
    overdue_res = db.table("book_issues").select("id", count="exact").in_("status", ["overdue"]).execute()

    all_copies = copies_res.data or []
    available_copies = sum(1 for c in all_copies if c["status"] == "available")
    issued_copies = sum(1 for c in all_copies if c["status"] == "issued")

    # Fines
    returns_res = db.table("returns").select("fine_amount,fine_paid").execute()
    all_returns = returns_res.data or []
    total_fines_collected = sum(float(r["fine_amount"]) for r in all_returns if r["fine_paid"])
    pending_fines = sum(float(r["fine_amount"]) for r in all_returns if not r["fine_paid"] and float(r["fine_amount"]) > 0)

    return DashboardStats(
        total_books=books_res.count or 0,
        total_copies=len(all_copies),
        available_copies=available_copies,
        issued_copies=issued_copies,
        overdue_issues=overdue_res.count or 0,
        total_students=students_res.count or 0,
        total_librarians=librarians_res.count or 0,
        total_fines_collected=total_fines_collected,
        pending_fines=pending_fines,
    )
