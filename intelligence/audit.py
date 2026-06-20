"""Launch audit checks for the Guestly intelligence layer."""

from __future__ import annotations

from dataclasses import dataclass

from .classifier import classify_signal
from .fixtures import MERIDIAN_SIGNALS, Signal
from .redaction import redact_guest_text


@dataclass(frozen=True)
class AuditResult:
    name: str
    passed: bool
    detail: str


def audit_classifier() -> tuple[AuditResult, ...]:
    allergy = Signal("Table 18", 2, "My food allergy was not handled confidently by the server.")
    ac = Signal("Room 307", 1, "The AC unit kept turning off overnight.")
    positive = Signal("Lobby QR", 5, "The front desk team was excellent and check-in was fast.")
    billing = Signal("Receipt QR", 2, "I was charged twice and need someone to fix the bill.")

    cases = (
        ("allergy-critical", classify_signal(allergy).priority == "critical", "Allergy signals route as critical."),
        ("ac-maintenance", classify_signal(ac).department == "maintenance", "AC signals route to maintenance."),
        ("positive-sentiment", classify_signal(positive).sentiment == "positive", "Praise stays positive."),
        ("billing-route", classify_signal(billing).issue_type == "billing", "Billing complaints route to billing."),
    )
    return tuple(AuditResult(name, passed, detail) for name, passed, detail in cases)


def audit_privacy() -> tuple[AuditResult, ...]:
    sample = "Please call me at 555-123-4567 or email alex@example.com about Room 307."
    result = redact_guest_text(sample)
    return (
        AuditResult("phone-redaction", "[phone]" in result.text, "Phone numbers are redacted."),
        AuditResult("email-redaction", "[email]" in result.text, "Email addresses are redacted."),
        AuditResult("room-reference", "Room [reference]" in result.text, "Room references can be normalized."),
    )


def audit_seed_volume() -> tuple[AuditResult, ...]:
    return (
        AuditResult("seed-volume", len(MERIDIAN_SIGNALS) >= 10, "Launch workspace contains enough feedback variety."),
        AuditResult(
            "critical-seed",
            any(classify_signal(signal).priority == "critical" for signal in MERIDIAN_SIGNALS),
            "Launch workspace includes critical signal handling.",
        ),
    )


def run_audit() -> tuple[AuditResult, ...]:
    return audit_classifier() + audit_privacy() + audit_seed_volume()
