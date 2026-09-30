"""Request validation. The frontend validates too, but the backend never relies on it."""
import re

from pydantic import BaseModel, ConfigDict, Field, field_validator

_SPACES = re.compile(r"[ \t]+")
_PHONE_CHARS = re.compile(r"^[0-9+()\-\s.]+$")


def _clean(value: str) -> str:
    # Drop control characters (keep line breaks), collapse runs of spaces.
    value = "".join(ch for ch in value if ch in "\n\r" or ch.isprintable())
    return "\n".join(_SPACES.sub(" ", line).strip() for line in value.replace("\r\n", "\n").split("\n")).strip()


class LeadIn(BaseModel):
    # Unknown fields from the client are ignored, never stored.
    model_config = ConfigDict(extra="ignore", str_strip_whitespace=True)

    name: str = Field(min_length=1, max_length=100)
    phone: str = Field(min_length=1, max_length=30)
    message: str = Field(min_length=1, max_length=2000)

    @field_validator("name", "message", mode="after")
    @classmethod
    def clean_text(cls, value: str) -> str:
        value = _clean(value)
        if not value:
            raise ValueError("empty")
        return value

    @field_validator("name", mode="after")
    @classmethod
    def single_line(cls, value: str) -> str:
        return " ".join(value.split())

    @field_validator("phone", mode="after")
    @classmethod
    def valid_phone(cls, value: str) -> str:
        if not _PHONE_CHARS.match(value):
            raise ValueError("invalid characters")
        digits = sum(ch.isdigit() for ch in value)
        if not 10 <= digits <= 15:
            raise ValueError("invalid length")
        return " ".join(value.split())
