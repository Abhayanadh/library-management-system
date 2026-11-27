"""Health-check endpoint for service monitoring and frontend connectivity checks."""

from datetime import datetime, timezone
from fastapi import APIRouter
from pydantic import BaseModel

from app.core.config import get_settings

router = APIRouter(tags=["Health"])


class HealthResponse(BaseModel):
    """Schema for the health-check response."""

    status: str
    service: str
    version: str
    environment: str
    timestamp: str


@router.get(
    "/health",
    response_model=HealthResponse,
    summary="API Health Check",
    description="Verify that the VVITU Smart Library FastAPI backend is running.",
)
async def health_check() -> HealthResponse:
    """Return service health metadata."""
    settings = get_settings()
    return HealthResponse(
        status="ok",
        service=settings.app_name,
        version=settings.app_version,
        environment=settings.environment,
        timestamp=datetime.now(timezone.utc).isoformat(),
    )
