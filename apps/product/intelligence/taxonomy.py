"""Taxonomy, keyword maps, and scoring constants for Guestly intelligence."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable

SENTIMENTS = ("positive", "neutral", "negative", "mixed")
URGENCY_LEVELS = ("low", "medium", "high", "critical")
PRIORITIES = ("low", "medium", "high", "critical")
DEPARTMENTS = (
    "rooms",
    "front_desk",
    "housekeeping",
    "kitchen",
    "service",
    "management",
    "maintenance",
    "other",
)
ISSUE_TYPES = (
    "cleanliness",
    "noise",
    "food_quality",
    "staff",
    "wait_time",
    "safety",
    "billing",
    "comfort",
    "maintenance",
    "other",
)


@dataclass(frozen=True)
class KeywordRule:
    label: str
    terms: tuple[str, ...]
    weight: int = 1

    def matches(self, text: str) -> bool:
        return any(term in text for term in self.terms)


CRITICAL_RULES = (
    KeywordRule("Allergy", ("allergy", "allergen", "anaphylaxis"), 8),
    KeywordRule("Food poisoning", ("food poisoning", "poisoning", "vomiting after eating"), 8),
    KeywordRule("Discrimination", ("discrimination", "racist", "sexist", "harassed"), 8),
    KeywordRule("Injury", ("injury", "injured", "fell", "bleeding"), 8),
    KeywordRule("Safety", ("safety", "unsafe", "dangerous", "hazard"), 8),
    KeywordRule("Theft", ("theft", "stolen", "missing wallet", "missing passport"), 8),
    KeywordRule("Violence", ("violence", "violent", "threatened", "assault"), 8),
    KeywordRule("Legal threat", ("lawyer", "legal", "sue", "lawsuit"), 8),
    KeywordRule("Social escalation", ("viral", "social media", "tiktok", "instagram", "post this"), 7),
)

HIGH_RULES = (
    KeywordRule("Repeated problem", ("again", "repeated", "still broken", "second time"), 4),
    KeywordRule("Refund demand", ("refund", "money back", "comped", "chargeback"), 4),
    KeywordRule("Broken climate", ("broken ac", "ac unit", "air conditioning", "heat not working"), 4),
    KeywordRule("Maintenance failure", ("maintenance", "leak", "flood", "kept turning off"), 4),
    KeywordRule("Angry guest", ("angry", "furious", "unacceptable", "never coming back"), 4),
    KeywordRule("Billing failure", ("charged twice", "double charged", "wrong bill"), 4),
)

POSITIVE_TERMS = (
    "great",
    "excellent",
    "friendly",
    "kind",
    "fast",
    "amazing",
    "wonderful",
    "clean",
    "helpful",
    "thoughtful",
)

NEGATIVE_TERMS = (
    "dirty",
    "not cleaned",
    "sticky",
    "slow",
    "noise",
    "loud",
    "damp",
    "broken",
    "charged",
    "angry",
    "refund",
    "bad",
    "hard to sleep",
    "wait",
    "unsafe",
)

DEPARTMENT_RULES = {
    "rooms": ("room", "hallway", "sleep", "bed", "damp", "pillow", "suite"),
    "front_desk": ("front desk", "check-in", "checkout", "check in", "bill", "charged", "folio"),
    "housekeeping": ("clean", "bathroom", "towel", "sticky", "housekeeping", "linen"),
    "kitchen": ("food", "breakfast", "coffee", "allergy", "allergen", "poisoning", "kitchen"),
    "service": ("server", "staff", "table", "line", "wait", "queue", "host"),
    "maintenance": ("ac", "air conditioning", "broken", "maintenance", "leak", "unit", "elevator"),
    "management": ("manager", "legal", "discrimination", "refund", "social media", "unsafe"),
}

ISSUE_RULES = {
    "cleanliness": ("clean", "dirty", "sticky", "bathroom", "linen", "towel"),
    "noise": ("noise", "loud", "party", "sleep", "midnight", "hallway"),
    "food_quality": ("food", "breakfast", "coffee", "allergy", "allergen", "poisoning", "meal"),
    "staff": ("staff", "server", "front desk", "team", "kind", "friendly", "rude"),
    "wait_time": ("slow", "wait", "line", "queue", "delayed"),
    "safety": ("safety", "unsafe", "injury", "violence", "theft", "hazard"),
    "billing": ("charged", "bill", "billing", "refund", "receipt", "folio"),
    "comfort": ("damp", "bed", "sleep", "comfort", "temperature", "pillow"),
    "maintenance": ("ac", "broken", "maintenance", "unit", "leak", "elevator"),
}


def contains_any(text: str, terms: Iterable[str]) -> bool:
    return any(term in text for term in terms)


def titleize(value: str) -> str:
    return value.replace("_", " ").title()
