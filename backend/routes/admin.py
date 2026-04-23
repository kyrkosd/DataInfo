"""Admin analytics endpoints."""
from fastapi import APIRouter, Depends
from dependencies import get_admin_user
from db import supabase

router = APIRouter()


@router.get("/admin/stats")
def get_stats(user: dict = Depends(get_admin_user)):  # pylint: disable=unused-argument
    """Return aggregate usage stats: total searches, users, top queries, daily counts."""
    total_searches = (
        supabase.table("searches").select("id", count="exact").execute()
    )
    total_users = (
        supabase.table("user_profiles").select("id", count="exact").execute()
    )
    top_queries = (
        supabase.table("searches")
        .select("query, result_status")
        .order("created_at", desc=True)
        .limit(100)
        .execute()
    )
    recent_activity = (
        supabase.table("searches")
        .select("created_at, tab, result_status")
        .order("created_at", desc=True)
        .limit(200)
        .execute()
    )

    # Count searches per day from recent_activity
    daily: dict = {}
    for row in recent_activity.data:
        day = row["created_at"][:10]
        daily[day] = daily.get(day, 0) + 1

    # Count result statuses
    status_counts: dict = {}
    for row in top_queries.data:
        s = row.get("result_status") or "unknown"
        status_counts[s] = status_counts.get(s, 0) + 1

    return {
        "total_searches": total_searches.count,
        "total_users":    total_users.count,
        "status_counts":  status_counts,
        "searches_by_day": [
            {"date": d, "count": c}
            for d, c in sorted(daily.items(), reverse=True)
        ],
    }
