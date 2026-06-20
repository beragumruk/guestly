"""Workload planning utilities for hospitality operators."""

from __future__ import annotations

from collections import defaultdict
from dataclasses import dataclass
from typing import Iterable

from .classifier import classify_signal
from .fixtures import Signal
from .routing import build_route_plan


@dataclass(frozen=True)
class WorkloadItem:
    owner: str
    open_count: int
    critical_count: int
    high_count: int
    suggested_focus: str


def _focus(owner: str, critical: int, high: int, total: int) -> str:
    if critical:
        return f"{owner} should clear critical recovery work before routine tasks."
    if high >= 2:
        return f"{owner} has multiple high-priority signals and should review staffing or maintenance capacity."
    if total >= 4:
        return f"{owner} should review recurring friction and close stale items."
    return f"{owner} is within normal operating load."


def build_workload(signals: Iterable[Signal]) -> tuple[WorkloadItem, ...]:
    buckets: dict[str, list[str]] = defaultdict(list)
    for signal in signals:
        classification = classify_signal(signal)
        route = build_route_plan(signal, classification)
        buckets[route.owner].append(classification.priority)

    items: list[WorkloadItem] = []
    for owner, priorities in buckets.items():
        critical = priorities.count("critical")
        high = priorities.count("high")
        total = len(priorities)
        items.append(
            WorkloadItem(
                owner=owner,
                open_count=total,
                critical_count=critical,
                high_count=high,
                suggested_focus=_focus(owner, critical, high, total),
            )
        )
    return tuple(sorted(items, key=lambda item: (-item.critical_count, -item.high_count, -item.open_count, item.owner)))
