"""
Books API - CRUD for book catalog and physical copies.
Accessible by Librarians and Admins (write); all authenticated users (read).
"""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from supabase import Client

from app.core.auth import get_current_user, get_supabase_admin_client, require_role
from app.schemas.books import BookCreate, BookResponse, BookUpdate, BookCopyResponse

router = APIRouter(prefix="/books", tags=["Books"])


@router.get("", response_model=list[dict], summary="List all books with copy counts")
async def list_books(
    q: Optional[str] = Query(None, description="Search by title, author, or ISBN"),
    category: Optional[str] = Query(None),
    availability: Optional[str] = Query(None, description="'available' | 'issued' | all"),
    limit: int = Query(50, le=200),
    offset: int = Query(0),
    current_user: dict = Depends(get_current_user),
    db: Client = Depends(get_supabase_admin_client),
):
    """Return catalog books with aggregated copy availability counts."""
    query = db.table("books").select(
        "*, book_copies(id, status)"
    )

    if q:
        # Supabase PostgREST full-text / ilike search
        query = query.or_(f"title.ilike.%{q}%,author.ilike.%{q}%,isbn.ilike.%{q}%")
    if category and category.lower() != "all categories":
        query = query.eq("category", category)

    res = query.range(offset, offset + limit - 1).execute()
    books = res.data or []

    # Annotate with copy counts
    result = []
    for book in books:
        copies = book.pop("book_copies", []) or []
        total = len(copies)
        available = sum(1 for c in copies if c["status"] == "available")
        book["total_copies"] = total
        book["available_copies"] = available

        if availability == "available" and available == 0:
            continue
        if availability == "issued" and available == total:
            continue

        result.append(book)

    return result


@router.get("/{book_id}", summary="Get single book details")
async def get_book(
    book_id: str,
    current_user: dict = Depends(get_current_user),
    db: Client = Depends(get_supabase_admin_client),
):
    res = db.table("books").select("*, book_copies(*)").eq("id", book_id).single().execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Book not found")
    book = res.data
    copies = book.pop("book_copies", []) or []
    book["total_copies"] = len(copies)
    book["available_copies"] = sum(1 for c in copies if c["status"] == "available")
    book["copies"] = copies
    return book


@router.post("", status_code=status.HTTP_201_CREATED, summary="Add new book [Librarian/Admin]")
async def create_book(
    payload: BookCreate,
    current_user: dict = Depends(require_role(["librarian", "admin"])),
    db: Client = Depends(get_supabase_admin_client),
):
    # Check ISBN uniqueness
    existing = db.table("books").select("id").eq("isbn", payload.isbn).execute()
    if existing.data:
        raise HTTPException(status_code=409, detail=f"A book with ISBN '{payload.isbn}' already exists.")

    book_data = payload.model_dump(exclude={"num_copies"})
    res = db.table("books").insert(book_data).execute()
    book = res.data[0]

    # Create the requested number of physical copies
    if payload.num_copies > 0:
        copies = [
            {
                "book_id": book["id"],
                "copy_code": f"VVITU-{payload.isbn[:6].upper()}-{str(i + 1).zfill(3)}",
                "status": "available",
            }
            for i in range(payload.num_copies)
        ]
        db.table("book_copies").insert(copies).execute()

    return {"message": "Book added successfully", "book": book}


@router.patch("/{book_id}", summary="Update book metadata [Librarian/Admin]")
async def update_book(
    book_id: str,
    payload: BookUpdate,
    current_user: dict = Depends(require_role(["librarian", "admin"])),
    db: Client = Depends(get_supabase_admin_client),
):
    update_data = payload.model_dump(exclude_none=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")

    from datetime import datetime, timezone
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    res = db.table("books").update(update_data).eq("id", book_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Book not found")
    return {"message": "Book updated", "book": res.data[0]}


@router.delete("/{book_id}", summary="Delete book [Librarian/Admin]")
async def delete_book(
    book_id: str,
    current_user: dict = Depends(require_role(["librarian", "admin"])),
    db: Client = Depends(get_supabase_admin_client),
):
    # Ensure no copies are currently issued
    active = db.table("book_copies").select("id").eq("book_id", book_id).eq("status", "issued").execute()
    if active.data:
        raise HTTPException(
            status_code=409,
            detail="Cannot delete: one or more copies of this book are currently issued to students.",
        )
    db.table("books").delete().eq("id", book_id).execute()
    return {"message": "Book and all its copies deleted successfully"}


@router.get("/{book_id}/copies", summary="List physical copies of a book")
async def list_copies(
    book_id: str,
    current_user: dict = Depends(get_current_user),
    db: Client = Depends(get_supabase_admin_client),
):
    res = db.table("book_copies").select("*").eq("book_id", book_id).execute()
    return res.data or []
