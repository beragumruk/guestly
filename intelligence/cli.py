"""Command line utilities for Guestly intelligence checks."""

from __future__ import annotations

import argparse
import sys

from .classifier import classify_signal
from .fixtures import MERIDIAN_SIGNALS
from .reporting import build_csv_export, build_markdown_report


def _report(format_name: str) -> int:
    if format_name == "csv":
        print(build_csv_export(MERIDIAN_SIGNALS))
        return 0
    print(build_markdown_report(MERIDIAN_SIGNALS))
    return 0


def _verify() -> int:
    critical = [classify_signal(signal) for signal in MERIDIAN_SIGNALS if "allergy" in signal.message.lower()]
    if not critical or critical[0].priority != "critical":
        print("Allergy signal must classify as critical.", file=sys.stderr)
        return 1

    ac_signal = next(signal for signal in MERIDIAN_SIGNALS if "AC unit" in signal.message)
    ac_classification = classify_signal(ac_signal)
    if ac_classification.priority != "high" or ac_classification.department != "maintenance":
        print("AC signal must route to high-priority maintenance.", file=sys.stderr)
        return 1

    positive_signal = next(signal for signal in MERIDIAN_SIGNALS if "excellent" in signal.message)
    if classify_signal(positive_signal).sentiment != "positive":
        print("Positive front desk signal must classify as positive.", file=sys.stderr)
        return 1

    print("Guestly intelligence verification passed.")
    return 0


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Guestly intelligence utilities")
    subparsers = parser.add_subparsers(dest="command", required=True)

    report_parser = subparsers.add_parser("report", help="Generate a signal report")
    report_parser.add_argument("--format", choices=("markdown", "csv"), default="markdown")
    subparsers.add_parser("verify", help="Verify classifier expectations")

    args = parser.parse_args(argv)
    if args.command == "report":
        return _report(args.format)
    if args.command == "verify":
        return _verify()
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
