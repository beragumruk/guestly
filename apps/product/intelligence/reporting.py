"""Report builders for Guestly intelligence outputs."""

from __future__ import annotations

import csv
from collections import Counter
from io import StringIO
from typing import Iterable

from .classifier import classify_signal
from .fixtures import Signal
from .patterns import detect_patterns


def _counts(signals: Iterable[Signal]) -> tuple[Counter[str], Counter[str], Counter[str]]:
    priority = Counter()
    department = Counter()
    issue = Counter()
    for signal in signals:
        classification = classify_signal(signal)
        priority[classification.priority] += 1
        department[classification.department] += 1
        issue[classification.issue_type] += 1
    return priority, department, issue


def build_markdown_report(signals: Iterable[Signal]) -> str:
    signals = tuple(signals)
    priority, department, issue = _counts(signals)
    patterns = detect_patterns(signals)
    urgent = priority["critical"] + priority["high"]

    lines = [
        "# Guestly Signal Report",
        "",
        f"Signals analyzed: **{len(signals)}**",
        f"Urgent signals: **{urgent}**",
        "",
        "## Priority Distribution",
    ]
    for label in ("critical", "high", "medium", "low"):
        lines.append(f"- {label}: {priority[label]}")

    lines.extend(["", "## Department Load"])
    for label, count in department.most_common():
        lines.append(f"- {label}: {count}")

    lines.extend(["", "## Issue Trends"])
    for label, count in issue.most_common():
        lines.append(f"- {label}: {count}")

    lines.extend(["", "## Recurring Patterns"])
    for pattern in patterns[:5]:
        lines.append(f"- **{pattern.label}** ({pattern.severity}, {pattern.count}): {pattern.recommendation}")

    return "\n".join(lines)


def build_csv_export(signals: Iterable[Signal]) -> str:
    output = StringIO()
    writer = csv.writer(output)
    writer.writerow(
        [
            "source",
            "rating",
            "message",
            "sentiment",
            "priority",
            "department",
            "issue_type",
            "risk_flags",
            "suggested_action",
        ]
    )
    for signal in signals:
        classification = classify_signal(signal)
        writer.writerow(
            [
                signal.source,
                signal.rating or "",
                signal.message,
                classification.sentiment,
                classification.priority,
                classification.department,
                classification.issue_type,
                "; ".join(classification.risk_flags),
                classification.suggested_action,
            ]
        )
    return output.getvalue()
