"""Anomaly detection for hospitality feedback streams."""

from __future__ import annotations

from collections import Counter
from dataclasses import dataclass
from math import sqrt
from statistics import mean, pstdev
from typing import Iterable

from .classifier import classify_signal
from .fixtures import Signal


@dataclass(frozen=True)
class Anomaly:
    dimension: str
    value: str
    observed: int
    expected: float
    z_score: float
    severity: str
    explanation: str


def _severity(z_score: float, observed: int) -> str:
    if z_score >= 3 or observed >= 5:
        return "critical"
    if z_score >= 2:
        return "high"
    if z_score >= 1:
        return "medium"
    return "low"


def _z_score(observed: int, baseline: list[int]) -> float:
    if not baseline:
        return 0.0
    sigma = pstdev(baseline)
    if sigma == 0:
        return sqrt(observed) if observed > mean(baseline) else 0.0
    return (observed - mean(baseline)) / sigma


def detect_issue_anomalies(signals: Iterable[Signal], baseline_counts: dict[str, list[int]] | None = None) -> tuple[Anomaly, ...]:
    baseline_counts = baseline_counts or {
        "noise": [0, 1, 1, 0, 1, 1, 0],
        "food_quality": [1, 1, 0, 1, 1, 0, 1],
        "cleanliness": [1, 0, 1, 0, 1, 1, 0],
        "maintenance": [0, 0, 1, 0, 0, 1, 0],
        "billing": [0, 1, 0, 0, 0, 1, 0],
    }
    counts = Counter(classify_signal(signal).issue_type for signal in signals)
    anomalies: list[Anomaly] = []
    for issue_type, observed in counts.items():
        baseline = baseline_counts.get(issue_type, [0])
        z_score = _z_score(observed, baseline)
        if z_score >= 1 or observed >= 3:
            severity = _severity(z_score, observed)
            anomalies.append(
                Anomaly(
                    dimension="issue_type",
                    value=issue_type,
                    observed=observed,
                    expected=round(mean(baseline), 2),
                    z_score=round(z_score, 2),
                    severity=severity,
                    explanation=f"{issue_type} volume is above the operating baseline.",
                )
            )
    return tuple(sorted(anomalies, key=lambda item: (-item.z_score, -item.observed, item.value)))


def detect_location_anomalies(signals: Iterable[Signal]) -> tuple[Anomaly, ...]:
    counts = Counter(signal.source for signal in signals)
    values = list(counts.values())
    anomalies: list[Anomaly] = []
    for source, observed in counts.items():
        z_score = _z_score(observed, values)
        if observed >= 3 or z_score >= 1.5:
            anomalies.append(
                Anomaly(
                    dimension="location",
                    value=source,
                    observed=observed,
                    expected=round(mean(values), 2),
                    z_score=round(z_score, 2),
                    severity=_severity(z_score, observed),
                    explanation=f"{source} is carrying disproportionate recovery load.",
                )
            )
    return tuple(sorted(anomalies, key=lambda item: (-item.observed, item.value)))
