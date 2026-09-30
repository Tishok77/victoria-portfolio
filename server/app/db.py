"""SQLite storage. All SQL lives in repositories/, so moving to PostgreSQL
means swapping this module and the repository — the API and frontend stay."""
import sqlite3
from contextlib import contextmanager
from pathlib import Path
from typing import Iterator

from .config import settings

# Ordered migrations; each runs once, tracked by PRAGMA user_version.
MIGRATIONS = [
    """
    CREATE TABLE leads (
        id                  INTEGER PRIMARY KEY AUTOINCREMENT,
        name                TEXT    NOT NULL,
        phone               TEXT    NOT NULL,
        message             TEXT    NOT NULL,
        status              TEXT    NOT NULL DEFAULT 'new'
                                    CHECK (status IN ('new', 'contacted', 'closed')),
        notification_status TEXT    NOT NULL DEFAULT 'pending'
                                    CHECK (notification_status IN ('pending', 'sent', 'skipped', 'failed')),
        created_at          TEXT    NOT NULL,
        updated_at          TEXT    NOT NULL
    );
    CREATE INDEX leads_created_at ON leads (created_at);
    CREATE INDEX leads_status ON leads (status);
    """,
]


def _connect(path: Path) -> sqlite3.Connection:
    connection = sqlite3.connect(path, timeout=10)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON")
    return connection


def init_db() -> None:
    path = settings.database_path
    path.parent.mkdir(parents=True, exist_ok=True)
    with _connect(path) as connection:
        connection.execute("PRAGMA journal_mode = WAL")
        version = connection.execute("PRAGMA user_version").fetchone()[0]
        for number, script in enumerate(MIGRATIONS[version:], start=version + 1):
            connection.executescript(script)
            connection.execute(f"PRAGMA user_version = {number}")


@contextmanager
def get_connection() -> Iterator[sqlite3.Connection]:
    connection = _connect(settings.database_path)
    try:
        with connection:  # commit on success, rollback on error
            yield connection
    finally:
        connection.close()
