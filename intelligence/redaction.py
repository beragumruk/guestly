"""Privacy helpers for guest-facing operational data."""

from __future__ import annotations

import re
from dataclasses import dataclass

EMAIL_RE = re.compile(r"\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b", re.IGNORECASE)
PHONE_RE = re.compile(r"(?<!\d)(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}(?!\d)")
CARD_RE = re.compile(r"(?<!\d)(?:\d[ -]*?){13,16}(?!\d)")
ROOM_RE = re.compile(r"\b(room|suite)\s+(\d{2,4})\b", re.IGNORECASE)


@dataclass(frozen=True)
class RedactionResult:
    text: str
    redactions: tuple[str, ...]


def _mask_card(match: re.Match[str]) -> str:
    digits = re.sub(r"\D", "", match.group(0))
    if len(digits) < 13:
        return match.group(0)
    return f"[card ending {digits[-4:]}]"


def redact_guest_text(text: str) -> RedactionResult:
    redactions: list[str] = []

    def replace_email(_: re.Match[str]) -> str:
        redactions.append("email")
        return "[email]"

    def replace_phone(_: re.Match[str]) -> str:
        redactions.append("phone")
        return "[phone]"

    def replace_card(match: re.Match[str]) -> str:
        redactions.append("payment_card")
        return _mask_card(match)

    def replace_room(match: re.Match[str]) -> str:
        redactions.append("room_reference")
        return f"{match.group(1).title()} [reference]"

    scrubbed = EMAIL_RE.sub(replace_email, text)
    scrubbed = PHONE_RE.sub(replace_phone, scrubbed)
    scrubbed = CARD_RE.sub(replace_card, scrubbed)
    scrubbed = ROOM_RE.sub(replace_room, scrubbed)
    return RedactionResult(scrubbed, tuple(sorted(set(redactions))))


def normalize_guest_name(name: str | None) -> str:
    if not name:
        return "Guest"
    parts = [part.strip() for part in name.split() if part.strip()]
    if not parts:
        return "Guest"
    first = parts[0]
    last_initial = f" {parts[-1][0]}." if len(parts) > 1 else ""
    return f"{first}{last_initial}"
