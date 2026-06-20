"""Reference hospitality signals used by launch checks and reports."""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class Signal:
    source: str
    rating: int | None
    message: str
    guest_name: str | None = None
    channel: str = "qr"
    created_at: str = "2026-06-20T14:00:00Z"


MERIDIAN_SIGNALS = (
    Signal("Room 307", 2, "The room felt damp and the hallway noise made it hard to sleep.", "Mara L."),
    Signal("Lobby QR", 5, "The front desk team was excellent and check-in was fast.", "Daniel R."),
    Signal("Table 18", 2, "My food allergy was not handled confidently by the server.", "Avery K."),
    Signal("Room 307", 2, "The bathroom was not fully cleaned when we arrived.", "Priya S."),
    Signal("Cafe Counter", 3, "The coffee line was very slow this morning.", None),
    Signal("Room 307", 1, "The AC unit kept turning off overnight.", "Owen M."),
    Signal("Receipt QR", 2, "I was charged twice and need someone to fix the bill.", "Nadia P."),
    Signal("Table 18", 3, "The table was sticky, but the staff was kind.", None),
    Signal("Room 307", 2, "There was a loud party near our room after midnight.", "Luis C."),
    Signal("Post-Stay Email", 5, "Great breakfast and very friendly staff.", "Heather W.", "email"),
)
