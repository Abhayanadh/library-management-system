"""Pydantic schemas for Book Issues and Returns."""

from typing import Optional
from pydantic import BaseModel, UUID4
from datetime import datetime


class IssueRequest(BaseModel):
    """Librarian issues a specific physical copy to a student."""
    student_id: UUID4
    copy_id: UUID4
    remarks: Optional[str] = None


class IssueResponse(BaseModel):
    id: UUID4
    copy_id: UUID4
    student_id: UUID4
    issued_by: Optional[UUID4] = None
    issue_date: datetime
    due_date: datetime
    status: str
    remarks: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class ReturnRequest(BaseModel):
    """Librarian processes a book return."""
    copy_id: UUID4
    remarks: Optional[str] = None


class ReturnResponse(BaseModel):
    id: UUID4
    issue_id: UUID4
    return_date: datetime
    overdue_days: int
    fine_amount: float
    fine_paid: bool
    remarks: Optional[str] = None

    model_config = {"from_attributes": True}


class FineCalculation(BaseModel):
    issue_id: UUID4
    student_name: str
    book_title: str
    copy_code: str
    due_date: datetime
    return_date: Optional[datetime] = None
    overdue_days: int
    fine_amount: float
