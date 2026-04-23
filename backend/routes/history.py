"""User search history endpoint."""
from fastapi import APIRouter, Depends, Query
from dependencies import get_current_user
from db import supabase

router = APIRouter()


@router.get("/history")
def get_history(
    user: dict = Depends(get_current_user),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
):
    """Return the authenticated user's past searches, newest first."""
    offset = (page - 1) * page_size
    rows = (
        supabase.table("searches")
        .select("id, query, tab, result_status, created_at")
        .eq("user_id", user["id"])
        .order("created_at", desc=True)
        .range(offset, offset + page_size - 1)
        .execute()
    )
    return {"searches": rows.data, "page": page, "page_size": page_size}
