#!/usr/bin/env python3
"""Generate an operational signal report for Guestly launch review."""

from __future__ import annotations

import sys
from collections import Counter
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from intelligence.classifier import classify_signal
from intelligence.fixtures import MERIDIAN_SIGNALS


def main() -> None:
    priorities = Counter(classify_signal(signal).priority for signal in MERIDIAN_SIGNALS)
    issues = Counter(classify_signal(signal).issue_type for signal in MERIDIAN_SIGNALS)
    urgent = priorities["critical"] + priorities["high"]
    top_issue, top_issue_count = issues.most_common(1)[0]

    print("Guestly launch signal report")
    print("============================")
    print(f"Signals analyzed: {len(MERIDIAN_SIGNALS)}")
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
