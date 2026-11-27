"""FastAPI application entry point for the VVITU Smart Library Management System."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.health import router as health_router
from app.api.books import router as books_router
from app.api.circulation import router as circulation_router
from app.api.users import router as users_router
from app.api.settings import router as settings_router
from app.core.config import get_settings

settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    version="0.4.0",
    description=(
        "REST API for Vasireddy Venkatadri International Technological University "
        "(VVITU) Smart Library Management System. "
        "Built with Python FastAPI + Supabase PostgreSQL."
    ),
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register all routers under /api/v1
prefix = settings.api_v1_prefix
app.include_router(health_router, prefix=prefix)
app.include_router(books_router, prefix=prefix)
app.include_router(circulation_router, prefix=prefix)
app.include_router(users_router, prefix=prefix)
app.include_router(settings_router, prefix=prefix)


@app.get("/", tags=["Root"])
async def root() -> dict[str, str]:
    return {
        "message": "VVITU Smart Library Management System API",
        "version": "0.4.0",
        "docs": "/docs",
        "health": f"{prefix}/health",
    }
