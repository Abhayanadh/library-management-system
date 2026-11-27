"""
Circulation API - Book Issue, Return, and Fine Calculation.
Issues/Returns are performed by Librarians and Admins.
Students can view their own records.
"""

from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, status
from supabase import Client

from app.core.auth import get_current_user, get_supabase_admin_client, require_role
from app.schemas.circulation import IssueRequest, ReturnRequest

router = APIRouter(prefix="/circulation", tags=["Circulation"])


def calculate_fine(due_date_str: str, return_date: datetime, daily_fine: float = 5.0) -> tuple[int, float]:
    """Return (overdue_days, fine_amount). Fine is 0 if returned on or before due date."""
    due = datetime.fromisoformat(due_date_str.replace("Z", "+00:00"))
    if return_date.tzinfo is None:
        return_date = return_date.replace(tzinfo=timezone.utc)
    if due.tzinfo is None:
        due = due.replace(tzinfo=timezone.utc)
    delta = (return_date.date() - due.date()).days
    overdue_days = max(0, delta)
    fine = overdue_days * daily_fine
    return overdue_days, fine


@router.post("/issue", status_code=status.HTTP_201_CREATED, summary="Issue a book copy to a student [Librarian/Admin]")
async def issue_book(
    payload: IssueRequest,
    current_user: dict = Depends(require_role(["librarian", "admin"])),
    db: Client = Depends(get_supabase_admin_client),
):
    # 1. Verify the copy is available
    copy_res = db.table("book_copies").select("*").eq("id", str(payload.copy_id)).single().execute()
    if not copy_res.data:
        raise HTTPException(status_code=404, detail="Book copy not found")
    if copy_res.data["status"] != "available":
        raise HTTPException(
            status_code=409,
            detail=f"This copy is currently '{copy_res.data['status']}' and cannot be issued.",
        )

    # 2. Get library borrowing period from settings
    settings_res = db.table("library_settings").select("borrowing_period_days, max_books_per_student").execute()
    settings = settings_res.data[0] if settings_res.data else {"borrowing_period_days": 14, "max_books_per_student": 3}
    borrowing_days = settings["borrowing_period_days"]
    max_books = settings["max_books_per_student"]

    # 3. Check student hasn't exceeded max active issues
    active_issues_res = (
        db.table("book_issues")
        .select("id")
        .eq("student_id", str(payload.student_id))
        .in_("status", ["issued", "overdue"])
        .execute()
    )
    if len(active_issues_res.data or []) >= max_books:
        raise HTTPException(
            status_code=409,
            detail=f"Student already has {max_books} active book issues (the library maximum).",
        )

    # 4. Create the issue record
    now = datetime.now(timezone.utc)
    due = now + timedelta(days=borrowing_days)
    issue_data = {
        "copy_id": str(payload.copy_id),
        "student_id": str(payload.student_id),
        "issued_by": current_user["id"],
        "issue_date": now.isoformat(),
        "due_date": due.isoformat(),
        "status": "issued",
        "remarks": payload.remarks,
    }
    res = db.table("book_issues").insert(issue_data).execute()
    # Trigger trg_sync_copy_status automatically updates copy status to 'issued'
    return {
        "message": f"Book issued successfully. Due back by {due.strftime('%d %b %Y')}.",
        "issue": res.data[0],
    }


@router.post("/return", status_code=status.HTTP_200_OK, summary="Process a book return [Librarian/Admin]")
async def return_book(
    payload: ReturnRequest,
    current_user: dict = Depends(require_role(["librarian", "admin"])),
    db: Client = Depends(get_supabase_admin_client),
):
    # 1. Find the active issue for this copy
    issue_res = (
        db.table("book_issues")
        .select("*")
        .eq("copy_id", str(payload.copy_id))
        .in_("status", ["issued", "overdue"])
        .execute()
    )
    if not issue_res.data:
        raise HTTPException(status_code=404, detail="No active issue found for this copy code.")
    issue = issue_res.data[0]

    # 2. Get daily fine rate from settings
    settings_res = db.table("library_settings").select("daily_fine_inr").execute()
    daily_fine = float(settings_res.data[0]["daily_fine_inr"]) if settings_res.data else 5.0

    # 3. Calculate fine
    return_date = datetime.now(timezone.utc)
    overdue_days, fine_amount = calculate_fine(issue["due_date"], return_date, daily_fine)

    # 4. Create return record
    return_data = {
        "issue_id": issue["id"],
        "returned_to": current_user["id"],
        "return_date": return_date.isoformat(),
        "overdue_days": overdue_days,
        "fine_amount": fine_amount,
        "fine_paid": False,
        "remarks": payload.remarks,
    }
    return_res = db.table("returns").insert(return_data).execute()

    # 5. Mark issue as returned (trigger updates copy to 'available')
    db.table("book_issues").update({"status": "returned", "updated_at": return_date.isoformat()}).eq("id", issue["id"]).execute()

    return {
        "message": "Book returned successfully.",
        "overdue_days": overdue_days,
        "fine_amount": fine_amount,
        "fine_note": "No fine — returned on time." if fine_amount == 0 else f"₹{fine_amount:.2f} overdue fine ({overdue_days} day(s) × ₹{daily_fine}/day).",
        "return": return_res.data[0],
    }


@router.get("/issues", summary="List all book issues [Librarian/Admin] or own issues [Student]")
async def list_issues(
    status_filter: str = Query("all", alias="status"),
    limit: int = Query(50, le=200),
    offset: int = Query(0),
    current_user: dict = Depends(get_current_user),
    db: Client = Depends(get_supabase_admin_client),
):
    query = db.table("book_issues").select(
        "*, book_copies(copy_code, book_id, books(title, author)), profiles!student_id(full_name, roll_number, email)"
    )

    # Students only see their own issues
    if current_user["role"] == "student":
        query = query.eq("student_id", current_user["id"])

    if status_filter and status_filter != "all":
        query = query.eq("status", status_filter)

    res = query.order("created_at", desc=True).range(offset, offset + limit - 1).execute()
    return res.data or []


@router.get("/overdue", summary="List overdue issues and calculate current fines")
async def list_overdue(
    current_user: dict = Depends(require_role(["librarian", "admin"])),
    db: Client = Depends(get_supabase_admin_client),
):
    settings_res = db.table("library_settings").select("daily_fine_inr").execute()
    daily_fine = float(settings_res.data[0]["daily_fine_inr"]) if settings_res.data else 5.0

    now = datetime.now(timezone.utc)
    # Mark overdue in DB first (auto-update)
    db.table("book_issues").update({"status": "overdue"}).lt("due_date", now.isoformat()).eq("status", "issued").execute()

    res = db.table("book_issues").select(
        "*, book_copies(copy_code, books(title, author)), profiles!student_id(full_name, roll_number, email)"
    ).in_("status", ["issued", "overdue"]).lt("due_date", now.isoformat()).execute()

    result = []
    for issue in (res.data or []):
        overdue_days, fine_amount = calculate_fine(issue["due_date"], now, daily_fine)
        issue["overdue_days"] = overdue_days
        issue["current_fine"] = fine_amount
        result.append(issue)

    return result
