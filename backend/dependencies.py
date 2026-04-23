"""Shared FastAPI dependencies."""
from fastapi import Header, HTTPException
from typing import Optional
from db import supabase


def get_current_user(authorization: Optional[str] = Header(default=None)) -> dict:
    """Verify the Supabase JWT and return the user dict. Raises 401 if invalid."""
    if not authorization:
        raise HTTPException(status_code=401, detail="Not authenticated.")
    if not supabase:
        raise HTTPException(status_code=500, detail="Auth service unavailable.")
    try:
        jwt  = authorization.removeprefix("Bearer ").strip()
        user = supabase.auth.get_user(jwt)
        return {"id": user.user.id, "email": user.user.email}
    except Exception as exc:
        raise HTTPException(status_code=401, detail="Invalid or expired token.") from exc


def get_admin_user(authorization: Optional[str] = Header(default=None)) -> dict:
    """Same as get_current_user but also checks the admin email env var."""
    import os  # pylint: disable=import-outside-toplevel
    user = get_current_user(authorization)
    admin_email = os.environ.get("ADMIN_EMAIL", "")
    if admin_email and user["email"] != admin_email:
        raise HTTPException(status_code=403, detail="Admin access required.")
    return user
