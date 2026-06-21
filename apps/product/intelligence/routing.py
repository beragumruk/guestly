"""Operational routing and SLA planning for Guestly signals."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta, timezone

from .classifier import Classification
from .fixtures import Signal


OWNER_BY_DEPARTMENT = {
    "rooms": "Rooms lead",
    "front_desk": "Front desk manager",
    "housekeeping": "Housekeeping lead",
    "kitchen": "Kitchen manager",
    "service": "Service manager",
    "management": "Duty manager",
    "maintenance": "Facilities lead",
    "other": "Operations lead",
}

SLA_MINUTES = {
    "critical": 15,
    "high": 60,
    "medium": 240,
    "low": 1440,
}


@dataclass(frozen=True)
class RoutePlan:
    owner: str
    response_due_at: datetime
    playbook: str
    escalation_channel: str
    customer_recovery_required: bool


def _parse_time(value: str) -> datetime:
    if value.endswith("Z"):
        value = value.replace("Z", "+00:00")
    return datetime.fromisoformat(value).astimezone(timezone.utc)


def _playbook(classification: Classification) -> str:
    if classification.priority == "critical":
        return "incident_response"
    if classification.issue_type == "billing":
        return "billing_recovery"
    if classification.issue_type == "cleanliness":
        return "room_readiness"
    if classification.issue_type == "wait_time":
        return "service_capacity"
    if classification.department == "maintenance":
        return "facilities_dispatch"
    return "guest_recovery"


def _channel(classification: Classification) -> str:
    if classification.priority == "critical":
        return "manager_sms"
    if classification.priority == "high":
        return "operations_queue"
    return "daily_digest"


def build_route_plan(signal: Signal, classification: Classification) -> RoutePlan:
    created_at = _parse_time(signal.created_at)
    minutes = SLA_MINUTES[classification.priority]
    return RoutePlan(
        owner=OWNER_BY_DEPARTMENT.get(classification.department, OWNER_BY_DEPARTMENT["other"]),
        response_due_at=created_at + timedelta(minutes=minutes),
        playbook=_playbook(classification),
        escalation_channel=_channel(classification),
        customer_recovery_required=classification.priority in {"critical", "high"} or classification.sentiment == "negative",
    )
