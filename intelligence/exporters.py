"""Export helpers for executive reporting and downstream systems."""

from __future__ import annotations

import json
from dataclasses import asdict

from .fixtures import Signal
from .notifications import build_digest
from .patterns import detect_patterns
from .portfolio import issue_heatmap
from .workflows import build_workflow_portfolio


def export_operations_packet(signals: tuple[Signal, ...]) -> str:
    workflows = build_workflow_portfolio(signals)
    patterns = detect_patterns(signals)
    packet = {
        "digest": asdict(build_digest(signals)),
        "patterns": [asdict(pattern) for pattern in patterns],
        "heatmap": issue_heatmap(signals),
        "workflows": [
            {
                "signal_id": workflow.signal_id,
                "source": workflow.source,
                "priority": workflow.classification.priority,
                "department": workflow.classification.department,
                "owner": workflow.route.owner,
                "playbook": workflow.route.playbook,
                "required_evidence": workflow.required_evidence,
                "executive_visibility": workflow.executive_visibility,
            }
            for workflow in workflows
        ],
    }
    return json.dumps(packet, indent=2, sort_keys=True, default=str)
