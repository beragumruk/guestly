"""Notification payload generation for Guestly workflow events."""

from __future__ import annotations

from dataclasses import dataclass

from .classifier import Classification
from .fixtures import Signal
from .routing import RoutePlan


@dataclass(frozen=True)
class NotificationPayload:
    channel: str
    recipient_group: str
    subject: str
    body: str
    urgency: str
    metadata: dict[str, str]


def build_notification(signal: Signal, classification: Classification, route: RoutePlan) -> NotificationPayload:
    subject = f"{classification.priority.upper()} signal at {signal.source}"
    risk = f" Risk flags: {', '.join(classification.risk_flags)}." if classification.risk_flags else ""
    body = (
        f"{classification.ai_summary} Suggested action: {classification.suggested_action}"
        f" Owner: {route.owner}. Playbook: {route.playbook}.{risk}"
    )
    return NotificationPayload(
        channel=route.escalation_channel,
        recipient_group=route.owner,
        subject=subject,
        body=body,
        urgency=classification.priority,
        metadata={
            "source": signal.source,
            "department": classification.department,
            "issue_type": classification.issue_type,
            "sentiment": classification.sentiment,
        },
    )


def build_digest(signals: tuple[Signal, ...]) -> NotificationPayload:
    from .classifier import classify_signal

    urgent = [signal for signal in signals if classify_signal(signal).priority in {"critical", "high"}]
    subject = f"{len(urgent)} urgent Guestly signals need review"
    body = "\n".join(f"- {signal.source}: {signal.message}" for signal in urgent) or "No urgent signals currently require review."
    return NotificationPayload(
        channel="daily_digest",
        recipient_group="Operations leadership",
        subject=subject,
        body=body,
        urgency="high" if urgent else "low",
        metadata={"urgent_count": str(len(urgent)), "total_count": str(len(signals))},
    )
