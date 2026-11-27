"""Pydantic schemas for Profiles and Dashboard Stats."""

from typing import Optional
from pydantic import BaseModel, UUID4, EmailStr
from datetime import datetime


class ProfileResponse(BaseModel):
    id: UUID4
    email: str
    full_name: str
    roll_number: Optional[str] = None
    department: Optional[str] = None
    phone: Optional[str] = None
    role: str
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    department: Optional[str] = None
    phone: Optional[str] = None


class DashboardStats(BaseModel):
    """Librarian / Admin dashboard statistics."""
    total_books: int
    total_copies: int
    available_copies: int
    issued_copies: int
    overdue_issues: int
    total_students: int
    total_librarians: int
    total_fines_collected: float
    pending_fines: float


class StudentDashboardStats(BaseModel):
    """Student dashboard statistics."""
    currently_borrowed: int
    total_returned: int
    due_soon: int        # Due within 3 days
    pending_fine: float
