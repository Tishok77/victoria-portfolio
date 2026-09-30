"""Settings from environment variables, optionally loaded from server/.env.

Secrets (SMTP password, future AI keys) live only here on the backend —
never in the frontend or content/*.js. See server/.env.example.
"""
import os
from dataclasses import dataclass
from pathlib import Path

SERVER_DIR = Path(__file__).resolve().parent.parent
SITE_ROOT = SERVER_DIR.parent


def _load_env_file(path: Path) -> None:
    """Minimal KEY=VALUE loader; real environment variables take precedence."""
    if not path.is_file():
        return
    for raw in path.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        value = value.strip()
        if len(value) >= 2 and value[0] == value[-1] and value[0] in "\"'":
            value = value[1:-1]
        os.environ.setdefault(key.strip(), value)


def _bool(name: str, default: bool) -> bool:
    value = os.environ.get(name)
    if value is None or value == "":
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


def _int(name: str, default: int) -> int:
    value = os.environ.get(name, "")
    return int(value) if value.strip().isdigit() else default


@dataclass(frozen=True)
class Settings:
    database_path: Path
    timezone: str
    api_docs: bool
    # Leads
    leads_rate_limit: int  # accepted leads per client IP per 10 minutes
    # Email notifications
    email_enabled: bool
    smtp_host: str
    smtp_port: int
    smtp_user: str
    smtp_password: str
    smtp_security: str  # "ssl" | "starttls" | "none"
    lead_email_from: str
    lead_email_to: str

    @property
    def smtp_configured(self) -> bool:
        return bool(self.smtp_host and self.lead_email_from and self.lead_email_to)


def load_settings() -> Settings:
    _load_env_file(SERVER_DIR / ".env")
    database = os.environ.get("DATABASE_PATH") or str(SERVER_DIR / "data" / "leads.db")
    smtp_user = os.environ.get("SMTP_USER", "")
    return Settings(
        database_path=Path(database),
        timezone=os.environ.get("TIMEZONE", "Europe/Moscow"),
        api_docs=_bool("API_DOCS", False),
        leads_rate_limit=_int("LEADS_RATE_LIMIT", 5),
        email_enabled=_bool("EMAIL_ENABLED", False),
        smtp_host=os.environ.get("SMTP_HOST", ""),
        smtp_port=_int("SMTP_PORT", 465),
        smtp_user=smtp_user,
        smtp_password=os.environ.get("SMTP_PASSWORD", ""),
        smtp_security=os.environ.get("SMTP_SECURITY", "ssl").strip().lower(),
        lead_email_from=os.environ.get("LEAD_EMAIL_FROM") or smtp_user,
        lead_email_to=os.environ.get("LEAD_EMAIL_TO", "Mylnikova.Viktoria.job@yandex.ru"),
    )


settings = load_settings()
