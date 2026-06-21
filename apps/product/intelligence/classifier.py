"""Deterministic signal classifier used by Guestly operational reports."""

from __future__ import annotations

from dataclasses import dataclass

from .fixtures import Signal
from .taxonomy import (
    CRITICAL_RULES,
    DEPARTMENT_RULES,
    HIGH_RULES,
    ISSUE_RULES,
    NEGATIVE_TERMS,
    POSITIVE_TERMS,
    KeywordRule,
    contains_any,
    titleize,
)


@dataclass(frozen=True)
class Classification:
    sentiment: str
    urgency: str
    priority: str
    department: str
    issue_type: str
    ai_summary: str
    suggested_action: str
    risk_flags: tuple[str, ...]
    score: int


def _matching_rules(text: str, rules: tuple[KeywordRule, ...]) -> tuple[KeywordRule, ...]:
    return tuple(rule for rule in rules if rule.matches(text))


def _sentiment(text: str, rating: int | None) -> str:
    has_positive = contains_any(text, POSITIVE_TERMS)
    has_negative = contains_any(text, NEGATIVE_TERMS)
    if has_positive and has_negative:
        return "mixed"
    if has_negative or (rating is not None and rating <= 2):
        return "negative"
    if has_positive or (rating is not None and rating >= 4):
        return "positive"
    return "neutral"


def _route(text: str, rules: dict[str, tuple[str, ...]]) -> str:
    for label, terms in rules.items():
        if contains_any(text, terms):
            return label
    return "other"


def _risk_score(
    rating: int | None,
    sentiment: str,
    critical: tuple[KeywordRule, ...],
    high: tuple[KeywordRule, ...],
) -> tuple[str, int]:
    score = 0
    score += sum(rule.weight for rule in critical)
    score += sum(rule.weight for rule in high)
    if rating == 1:
        score += 5
    elif rating == 2:
        score += 3
    elif rating == 3:
        score += 1
    if sentiment == "negative":
        score += 2
    elif sentiment == "mixed":
        score += 1

    if critical:
        return "critical", score
    if score >= 7:
        return "high", score
    if score >= 2:
        return "medium", score
    return "low", score


def _summary(issue_type: str, department: str, sentiment: str, urgency: str) -> str:
    if urgency == "critical":
        return f"Critical {titleize(issue_type)} signal routed to {titleize(department)} for immediate operator review."
    if urgency == "high":
        return f"High-priority {titleize(issue_type)} issue detected with likely impact on guest recovery."
    if sentiment == "positive":
        return f"Positive guest signal captured for {titleize(department)} with a low operational risk profile."
    if sentiment == "mixed":
        return f"Mixed feedback: praise is present, but {titleize(issue_type)} friction should be reviewed."
    return f"{titleize(issue_type)} feedback classified for {titleize(department)} with standard follow-up priority."


def _action(issue_type: str, urgency: str, department: str) -> str:
    if urgency == "critical":
        return "Escalate to the duty manager now, contact the guest, document the incident, and assign an owner."
    if urgency == "high":
        return f"Assign {titleize(department)} ownership, inspect the source location, and follow up before close of day."
    if issue_type == "wait_time":
        return "Review staffing around the reported service window and monitor repeat queue complaints."
    if issue_type == "cleanliness":
        return "Ask housekeeping to verify the location and record corrective action."
    if issue_type == "billing":
        return "Review the folio or receipt, then contact the guest with a clear resolution."
    if urgency == "low":
        return "Log the signal for trend monitoring and include it in the next team review."
    return "Review the feedback, route it to the relevant lead, and close the loop once action is taken."


def classify_signal(signal: Signal) -> Classification:
    text = signal.message.lower()
    critical = _matching_rules(text, CRITICAL_RULES)
    high = _matching_rules(text, HIGH_RULES)
    sentiment = _sentiment(text, signal.rating)
    urgency, score = _risk_score(signal.rating, sentiment, critical, high)
    department = _route(text, DEPARTMENT_RULES)
    issue_type = _route(text, ISSUE_RULES)
    risk_flags = tuple(rule.label for rule in critical)

    return Classification(
        sentiment=sentiment,
        urgency=urgency,
        priority=urgency,
        department=department,
        issue_type=issue_type,
        ai_summary=_summary(issue_type, department, sentiment, urgency),
        suggested_action=_action(issue_type, urgency, department),
        risk_flags=risk_flags,
        score=score,
    )
