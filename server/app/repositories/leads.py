"""Data access for leads. The future admin API (list, view, change status,
archive, stats) adds methods here; routes never write SQL themselves."""
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from typing import Optional

from ..db import get_connection

LEAD_STATUSES = ("new", "contacted", "closed")


@dataclass(frozen=True)
class Lead:
    id: int
    name: str
    phone: str
    message: str
    status: str
    notification_status: str
    created_at: datetime


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _row_to_lead(row) -> Lead:
    return Lead(
        id=row["id"],
        name=row["name"],
        phone=row["phone"],
        message=row["message"],
        status=row["status"],
        notification_status=row["notification_status"],
        created_at=datetime.fromisoformat(row["created_at"]),
    )


def create(name: str, phone: str, message: str) -> Lead:
    now = _now().isoformat()
    with get_connection() as connection:
        cursor = connection.execute(
            "INSERT INTO leads (name, phone, message, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
            (name, phone, message, now, now),
        )
        row = connection.execute("SELECT * FROM leads WHERE id = ?", (cursor.lastrowid,)).fetchone()
    return _row_to_lead(row)


def find_recent_duplicate(phone: str, message: str, within: timedelta) -> Optional[Lead]:
    """Same phone + message shortly after: a repeated submit, not a new lead."""
    since = (_now() - within).isoformat()
    with get_connection() as connection:
        row = connection.execute(
            "SELECT * FROM leads WHERE phone = ? AND message = ? AND created_at >= ? ORDER BY id DESC LIMIT 1",
            (phone, message, since),
        ).fetchone()
    return _row_to_lead(row) if row else None


def set_notification_status(lead_id: int, status: str) -> None:
    with get_connection() as connection:
        connection.execute(
            "UPDATE leads SET notification_status = ?, updated_at = ? WHERE id = ?",
            (status, _now().isoformat(), lead_id),
        )
