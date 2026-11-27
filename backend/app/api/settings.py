"""
Library Settings API - Admin-only configuration endpoint.
"""

from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from supabase import Client

from app.core.auth import get_current_user, get_supabase_admin_client, require_role

router = APIRouter(prefix="/settings", tags=["Settings"])


class SettingsUpdate(BaseModel):
    borrowing_period_days: int | None = None
    daily_fine_inr: float | None = None
    max_books_per_student: int | None = None


@router.get("", summary="Get current library settings [Authenticated]")
async def get_settings_data(
    current_user: dict = Depends(get_current_user),
    db: Client = Depends(get_supabase_admin_client),
):
    res = db.table("library_settings").select("*").execute()
    if not res.data:
        return {"borrowing_period_days": 14, "daily_fine_inr": 5.0, "max_books_per_student": 3}
    return res.data[0]


@router.patch("", summary="Update library settings [Admin only]")
async def update_settings(
    payload: SettingsUpdate,
    current_user: dict = Depends(require_role(["admin"])),
    db: Client = Depends(get_supabase_admin_client),
):
    update_data = payload.model_dump(exclude_none=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No settings to update")

    update_data["updated_by"] = current_user["id"]
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()

    # Update the single settings row
    existing = db.table("library_settings").select("id").execute()
    if existing.data:
        res = db.table("library_settings").update(update_data).eq("id", existing.data[0]["id"]).execute()
    else:
        res = db.table("library_settings").insert(update_data).execute()

    return {"message": "Library settings updated", "settings": res.data[0]}
