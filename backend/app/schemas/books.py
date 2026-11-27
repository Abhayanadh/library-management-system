"""Pydantic schemas for Books and Book Copies."""

from typing import Optional
from pydantic import BaseModel, UUID4
from datetime import datetime


class BookBase(BaseModel):
    isbn: str
    title: str
    author: str
    category: str
    publisher: Optional[str] = None
    publication_year: Optional[int] = None
    description: Optional[str] = None
    cover_image_url: Optional[str] = None


class BookCreate(BookBase):
    num_copies: int = 1  # Number of physical copies to create on add


class BookUpdate(BaseModel):
    title: Optional[str] = None
    author: Optional[str] = None
    category: Optional[str] = None
    publisher: Optional[str] = None
    publication_year: Optional[int] = None
    description: Optional[str] = None
    cover_image_url: Optional[str] = None


class BookResponse(BookBase):
    id: UUID4
    total_copies: int = 0
    available_copies: int = 0
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class BookCopyCreate(BaseModel):
    book_id: UUID4
    copy_code: str
    shelf_location: Optional[str] = None


class BookCopyResponse(BaseModel):
    id: UUID4
    book_id: UUID4
    copy_code: str
    status: str
    shelf_location: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}
