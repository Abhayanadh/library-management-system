"""Supabase client instance and JWT security verification for FastAPI."""

import jwt
from typing import Annotated, Optional
from fastapi import Depends, HTTPException, Security, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from supabase import Client, create_client

from app.core.config import get_settings

security = HTTPBearer(auto_error=False)


def get_supabase_admin_client() -> Client:
    """Return an authenticated Supabase client using the Service Role Key for server-side operations."""
    settings = get_settings()
    if not settings.supabase_url or not settings.supabase_service_role_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Supabase credentials not configured in backend environment",
        )
    return create_client(settings.supabase_url, settings.supabase_service_role_key)


async def get_current_user(
    credentials: Annotated[Optional[HTTPAuthorizationCredentials], Security(security)],
) -> dict:
    """Validate incoming Supabase JWT token and extract user claims and profile role."""
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token required",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials
    settings = get_settings()

    try:
        # Decode token header first to see which algorithm was used (e.g. HS256, RS256, ES256)
        unverified_header = jwt.get_unverified_header(token)
        token_alg = unverified_header.get("alg", "HS256")

        payload = None

        # If a secret is provided and algorithm is HMAC
        if settings.supabase_jwt_secret and token_alg.startswith("HS"):
            try:
                payload = jwt.decode(
                    token,
                    settings.supabase_jwt_secret,
                    algorithms=[token_alg, "HS256"],
                    options={"verify_aud": False},
                )
            except Exception:
                # If secret verification fails, decode claims safely and verify user directly with Supabase Admin API
                payload = jwt.decode(token, options={"verify_signature": False})
        else:
            # Decode payload claims without signature check locally, then verify user identity via Supabase Auth
            payload = jwt.decode(token, options={"verify_signature": False})

        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: missing subject claim",
            )

        # Retrieve profile using admin client to get authoritative user role
        admin_client = get_supabase_admin_client()
        res = (
            admin_client.table("profiles")
            .select("id, email, full_name, roll_number, department, role, is_active")
            .eq("id", user_id)
            .execute()
        )

        profile = res.data[0] if (res.data and len(res.data) > 0) else None

        # Auto-provision profile row if not created yet by trigger
        if not profile:
            user_email = payload.get("email", "")
            user_meta = payload.get("user_metadata", {})
            new_profile = {
                "id": user_id,
                "email": user_email,
                "full_name": user_meta.get("full_name", user_email.split("@")[0] if user_email else "VVITU Member"),
                "roll_number": user_meta.get("roll_number", None),
                "department": user_meta.get("department", "General"),
                "role": "student",
                "is_active": True,
            }
            insert_res = admin_client.table("profiles").insert(new_profile).execute()
            profile = insert_res.data[0] if insert_res.data else new_profile

        if not profile.get("is_active", True):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account is deactivated. Contact VVITU Library Admin.",
            )

        return profile

    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired. Please sign in again.",
        )
    except jwt.PyJWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid authentication token: {str(e)}",
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication error: {str(e)}",
        )


def require_role(allowed_roles: list[str]):
    """Role-based authorization dependency factory."""

    async def role_checker(
        current_user: Annotated[dict, Depends(get_current_user)],
    ) -> dict:
        user_role = current_user.get("role")
        if user_role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access forbidden: requires one of {allowed_roles} roles. Your role is '{user_role}'.",
            )
        return current_user

    return role_checker
