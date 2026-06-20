"""Portfolio-level intelligence for hospitality groups."""

from __future__ import annotations

from collections import Counter, defaultdict
from dataclasses import dataclass
from typing import Iterable

from .classifier import classify_signal
from .fixtures import Signal


@dataclass(frozen=True)
class PropertyRollup:
    property_name: str
    total_signals: int
    urgent_signals: int
    top_issue: str
    top_department: str
    operating_risk: str


def _risk(total: int, urgent: int, critical: int) -> str:
    if critical > 0:
        return "critical"
    if urgent / max(total, 1) >= 0.35:
        return "high"
    if urgent > 0:
        return "medium"
    return "low"


def rollup_property(property_name: str, signals: Iterable[Signal]) -> PropertyRollup:
    signals = tuple(signals)
    classified = [classify_signal(signal) for signal in signals]
    issue_counts = Counter(item.issue_type for item in classified)
    department_counts = Counter(item.department for item in classified)
    urgent = sum(1 for item in classified if item.priority in {"critical", "high"})
    critical = sum(1 for item in classified if item.priority == "critical")
    top_issue = issue_counts.most_common(1)[0][0] if issue_counts else "none"
    top_department = department_counts.most_common(1)[0][0] if department_counts else "none"
    return PropertyRollup(property_name, len(signals), urgent, top_issue, top_department, _risk(len(signals), urgent, critical))


def rollup_portfolio(property_signals: dict[str, tuple[Signal, ...]]) -> tuple[PropertyRollup, ...]:
    return tuple(sorted((rollup_property(name, signals) for name, signals in property_signals.items()), key=lambda item: item.operating_risk))


def issue_heatmap(signals: Iterable[Signal]) -> dict[str, dict[str, int]]:
    heatmap: dict[str, dict[str, int]] = defaultdict(lambda: defaultdict(int))
    for signal in signals:
        classification = classify_signal(signal)
        heatmap[signal.source][classification.issue_type] += 1
    return {source: dict(issues) for source, issues in heatmap.items()}
