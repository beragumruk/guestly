#!/usr/bin/env python3
"""Generate an operational signal report for Guestly launch review."""

from __future__ import annotations

from collections import Counter
from dataclasses import dataclass


@dataclass(frozen=True)
class Signal:
    source: str
    rating: int
    message: str


SIGNALS = [
    Signal("Room 307", 2, "The room felt damp and the hallway noise made it hard to sleep."),
    Signal("Lobby QR", 5, "The front desk team was excellent and check-in was fast."),
    Signal("Table 18", 2, "My food allergy was not handled confidently by the server."),
    Signal("Room 307", 2, "The bathroom was not fully cleaned when we arrived."),
    Signal("Cafe Counter", 3, "The coffee line was very slow this morning."),
    Signal("Room 307", 1, "The AC unit kept turning off overnight."),
    Signal("Receipt QR", 2, "I was charged twice and need someone to fix the bill."),
    Signal("Table 18", 3, "The table was sticky, but the staff was kind."),
    Signal("Room 307", 2, "There was a loud party near our room after midnight."),
    Signal("Post-Stay Email", 5, "Great breakfast and very friendly staff."),
]


CRITICAL_TERMS = {"allergy", "allergen", "injury", "safety", "theft", "violence", "legal"}
HIGH_TERMS = {"ac", "charged twice", "refund", "broken", "angry", "maintenance"}
ISSUE_TERMS = {
    "cleanliness": {"cleaned", "dirty", "sticky", "bathroom"},
    "noise": {"noise", "loud", "party", "sleep"},
    "food_quality": {"food", "breakfast", "coffee", "allergy"},
    "billing": {"charged", "bill"},
    "maintenance": {"ac", "unit", "broken"},
    "wait_time": {"slow", "line", "wait"},
    "staff": {"staff", "server", "front desk", "team"},
}


def classify_priority(signal: Signal) -> str:
    text = signal.message.lower()
    if any(term in text for term in CRITICAL_TERMS):
        return "critical"
    if signal.rating == 1 or any(term in text for term in HIGH_TERMS):
        return "high"
    if signal.rating <= 3:
        return "medium"
    return "low"


def classify_issue(signal: Signal) -> str:
    text = signal.message.lower()
    for issue, terms in ISSUE_TERMS.items():
        if any(term in text for term in terms):
            return issue
    return "other"


def main() -> None:
    priorities = Counter(classify_priority(signal) for signal in SIGNALS)
    issues = Counter(classify_issue(signal) for signal in SIGNALS)
    urgent = priorities["critical"] + priorities["high"]
    top_issue, top_issue_count = issues.most_common(1)[0]

    print("Guestly launch signal report")
    print("============================")
    print(f"Signals analyzed: {len(SIGNALS)}")
    print(f"Urgent signals: {urgent}")
    print(f"Top recurring issue: {top_issue} ({top_issue_count})")
    print("")
    print("Priority distribution")
    for priority in ("critical", "high", "medium", "low"):
        print(f"- {priority}: {priorities[priority]}")
    print("")
    print("Issue distribution")
    for issue, count in issues.most_common():
        print(f"- {issue}: {count}")


if __name__ == "__main__":
    main()
