"""Pattern detection for recurring hospitality feedback."""

from __future__ import annotations

from collections import Counter, defaultdict
from dataclasses import dataclass
from typing import Iterable

from .classifier import Classification, classify_signal
from .fixtures import Signal


@dataclass(frozen=True)
class Pattern:
    label: str
    count: int
    severity: str
    recommendation: str


def _severity(count: int, critical_count: int, high_count: int) -> str:
    if critical_count > 0:
        return "critical"
    if high_count >= 2 or count >= 4:
        return "high"
    if high_count == 1 or count >= 2:
        return "medium"
    return "low"


def _recommendation(label: str, severity: str) -> str:
    if severity == "critical":
        return f"Escalate the {label} cluster to management and document same-day recovery."
    if severity == "high":
        return f"Assign an owner for the recurring {label} pattern and review source locations."
    if severity == "medium":
        return f"Monitor {label} signals and inspect the highest-volume location this week."
    return f"Keep {label} in weekly trend review."


def detect_patterns(signals: Iterable[Signal]) -> tuple[Pattern, ...]:
    classified: list[tuple[Signal, Classification]] = [(signal, classify_signal(signal)) for signal in signals]
    issue_counts = Counter(classification.issue_type for _, classification in classified)
    location_groups: dict[str, list[Classification]] = defaultdict(list)
    for signal, classification in classified:
        location_groups[signal.source].append(classification)

    patterns: list[Pattern] = []
    for issue_type, count in issue_counts.items():
        related = [classification for _, classification in classified if classification.issue_type == issue_type]
        critical_count = sum(1 for item in related if item.priority == "critical")
        high_count = sum(1 for item in related if item.priority == "high")
        severity = _severity(count, critical_count, high_count)
        patterns.append(Pattern(issue_type, count, severity, _recommendation(issue_type, severity)))

    for location, classifications in location_groups.items():
        urgent_count = sum(1 for item in classifications if item.priority in {"critical", "high"})
        if urgent_count >= 2:
            label = f"{location} recovery load"
            severity = _severity(len(classifications), sum(1 for item in classifications if item.priority == "critical"), urgent_count)
            patterns.append(Pattern(label, urgent_count, severity, _recommendation(label, severity)))

    return tuple(sorted(patterns, key=lambda pattern: (pattern.severity != "critical", -pattern.count, pattern.label)))
