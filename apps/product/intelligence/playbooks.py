"""Operational playbooks used by Guestly recovery workflows."""

from __future__ import annotations

from dataclasses import dataclass

from .classifier import Classification


@dataclass(frozen=True)
class PlaybookStep:
    order: int
    title: str
    owner: str
    evidence_required: bool


@dataclass(frozen=True)
class Playbook:
    key: str
    title: str
    trigger: str
    steps: tuple[PlaybookStep, ...]


PLAYBOOKS = {
    "incident_response": Playbook(
        "incident_response",
        "Incident response",
        "Critical safety, legal, allergy, theft, injury, or social escalation signal",
        (
            PlaybookStep(1, "Acknowledge alert and assign duty manager", "Duty manager", True),
            PlaybookStep(2, "Contact guest and document recovery path", "Duty manager", True),
            PlaybookStep(3, "Notify department lead and capture corrective action", "Department lead", True),
            PlaybookStep(4, "Monitor recurrence window and close incident record", "Operations lead", True),
        ),
    ),
    "billing_recovery": Playbook(
        "billing_recovery",
        "Billing recovery",
        "Double charge, refund request, folio issue, or receipt dispute",
        (
            PlaybookStep(1, "Review folio and payment event history", "Front desk manager", True),
            PlaybookStep(2, "Contact guest with clear resolution", "Front desk manager", True),
            PlaybookStep(3, "Record correction or refund disposition", "Operations lead", True),
        ),
    ),
    "room_readiness": Playbook(
        "room_readiness",
        "Room readiness correction",
        "Cleanliness, comfort, dampness, or arrival-readiness issue",
        (
            PlaybookStep(1, "Inspect room or source area", "Housekeeping lead", True),
            PlaybookStep(2, "Correct issue and update readiness notes", "Housekeeping lead", True),
            PlaybookStep(3, "Review recurrence across same room or floor", "Rooms lead", False),
        ),
    ),
    "service_capacity": Playbook(
        "service_capacity",
        "Service capacity review",
        "Line, wait time, queue, or slow service complaint",
        (
            PlaybookStep(1, "Identify service window and staffing level", "Service manager", True),
            PlaybookStep(2, "Adjust staffing or queue process", "Service manager", False),
            PlaybookStep(3, "Monitor next peak period", "Operations lead", False),
        ),
    ),
    "guest_recovery": Playbook(
        "guest_recovery",
        "Guest recovery",
        "General dissatisfaction or mixed feedback requiring follow-up",
        (
            PlaybookStep(1, "Assign owner and review context", "Operations lead", False),
            PlaybookStep(2, "Respond to guest when contact is available", "Assigned owner", True),
            PlaybookStep(3, "Close loop and tag trend", "Assigned owner", True),
        ),
    ),
}


def select_playbook(classification: Classification) -> Playbook:
    if classification.priority == "critical":
        return PLAYBOOKS["incident_response"]
    if classification.issue_type == "billing":
        return PLAYBOOKS["billing_recovery"]
    if classification.issue_type in {"cleanliness", "comfort", "maintenance"}:
        return PLAYBOOKS["room_readiness"]
    if classification.issue_type == "wait_time":
        return PLAYBOOKS["service_capacity"]
    return PLAYBOOKS["guest_recovery"]
