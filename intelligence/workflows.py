"""Workflow graph orchestration for Guestly signal operations."""

from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum
from typing import Iterable

from .classifier import Classification, classify_signal
from .fixtures import Signal
from .routing import RoutePlan, build_route_plan


class WorkflowState(str, Enum):
    INTAKE = "intake"
    CLASSIFY = "classify"
    ENRICH = "enrich"
    ROUTE = "route"
    ESCALATE = "escalate"
    RECOVER = "recover"
    MONITOR = "monitor"
    RESOLVE = "resolve"


@dataclass(frozen=True)
class WorkflowNode:
    state: WorkflowState
    label: str
    owner: str
    service_level_minutes: int
    exit_criteria: tuple[str, ...]


@dataclass(frozen=True)
class WorkflowTransition:
    source: WorkflowState
    target: WorkflowState
    condition: str


@dataclass(frozen=True)
class WorkflowPlan:
    signal_id: str
    source: str
    classification: Classification
    route: RoutePlan
    nodes: tuple[WorkflowNode, ...]
    transitions: tuple[WorkflowTransition, ...]
    required_evidence: tuple[str, ...]
    executive_visibility: bool
    automation_notes: tuple[str, ...] = field(default_factory=tuple)


def _node_catalog(route: RoutePlan, classification: Classification) -> tuple[WorkflowNode, ...]:
    escalation_minutes = 15 if classification.priority == "critical" else 60
    recovery_minutes = 240 if classification.priority in {"critical", "high"} else 1440
    return (
        WorkflowNode(
            WorkflowState.INTAKE,
            "Capture guest signal with source context",
            "Guestly intake",
            1,
            ("message persisted", "location attached", "timestamp recorded"),
        ),
        WorkflowNode(
            WorkflowState.CLASSIFY,
            "Classify sentiment, risk, issue type, and ownership route",
            "Signal intelligence",
            1,
            ("classification complete", "risk flags evaluated", "summary generated"),
        ),
        WorkflowNode(
            WorkflowState.ENRICH,
            "Enrich with recurrence, location, and operational history",
            "Pattern engine",
            5,
            ("pattern context attached", "similar signals counted"),
        ),
        WorkflowNode(
            WorkflowState.ROUTE,
            "Assign the signal to the operational owner",
            route.owner,
            route.response_due_at.minute or 15,
            ("owner assigned", "playbook selected", "SLA clock started"),
        ),
        WorkflowNode(
            WorkflowState.ESCALATE,
            "Escalate risk-bearing incidents to management",
            "Duty manager",
            escalation_minutes,
            ("manager acknowledged", "guest recovery started", "incident notes opened"),
        ),
        WorkflowNode(
            WorkflowState.RECOVER,
            "Coordinate guest recovery and operational correction",
            route.owner,
            recovery_minutes,
            ("guest contacted", "corrective action recorded", "source location verified"),
        ),
        WorkflowNode(
            WorkflowState.MONITOR,
            "Monitor for recurrence after corrective action",
            "Guestly pattern monitor",
            1440,
            ("no repeat critical signal", "trend updated"),
        ),
        WorkflowNode(
            WorkflowState.RESOLVE,
            "Close the loop with durable evidence",
            route.owner,
            30,
            ("status resolved", "action item closed", "audit trail complete"),
        ),
    )


def _transitions(classification: Classification) -> tuple[WorkflowTransition, ...]:
    transitions = [
        WorkflowTransition(WorkflowState.INTAKE, WorkflowState.CLASSIFY, "new signal captured"),
        WorkflowTransition(WorkflowState.CLASSIFY, WorkflowState.ENRICH, "classification is available"),
        WorkflowTransition(WorkflowState.ENRICH, WorkflowState.ROUTE, "owner route is known"),
    ]
    if classification.priority in {"critical", "high"}:
        transitions.append(WorkflowTransition(WorkflowState.ROUTE, WorkflowState.ESCALATE, "priority requires management visibility"))
        transitions.append(WorkflowTransition(WorkflowState.ESCALATE, WorkflowState.RECOVER, "manager acknowledges"))
    else:
        transitions.append(WorkflowTransition(WorkflowState.ROUTE, WorkflowState.RECOVER, "owner accepts"))
    transitions.extend(
        [
            WorkflowTransition(WorkflowState.RECOVER, WorkflowState.MONITOR, "corrective action saved"),
            WorkflowTransition(WorkflowState.MONITOR, WorkflowState.RESOLVE, "recurrence window clears"),
        ]
    )
    return tuple(transitions)


def _required_evidence(classification: Classification) -> tuple[str, ...]:
    evidence = ["owner note", "status change timestamp"]
    if classification.priority in {"critical", "high"}:
        evidence.extend(["guest contact record", "manager acknowledgement"])
    if classification.issue_type in {"cleanliness", "maintenance", "food_quality"}:
        evidence.append("source location verification")
    if classification.risk_flags:
        evidence.extend(["incident summary", "risk flag disposition"])
    return tuple(dict.fromkeys(evidence))


def build_workflow_plan(signal: Signal, signal_id: str | None = None) -> WorkflowPlan:
    classification = classify_signal(signal)
    route = build_route_plan(signal, classification)
    notes = [
        f"Apply {route.playbook} playbook.",
        f"Escalate through {route.escalation_channel}.",
    ]
    if classification.risk_flags:
        notes.append(f"Risk flags: {', '.join(classification.risk_flags)}.")
    return WorkflowPlan(
        signal_id=signal_id or signal.source.lower().replace(" ", "_"),
        source=signal.source,
        classification=classification,
        route=route,
        nodes=_node_catalog(route, classification),
        transitions=_transitions(classification),
        required_evidence=_required_evidence(classification),
        executive_visibility=classification.priority in {"critical", "high"},
        automation_notes=tuple(notes),
    )


def build_workflow_portfolio(signals: Iterable[Signal]) -> tuple[WorkflowPlan, ...]:
    return tuple(build_workflow_plan(signal, f"sig_{index + 1}") for index, signal in enumerate(signals))
