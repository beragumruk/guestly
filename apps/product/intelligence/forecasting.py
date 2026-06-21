"""Lightweight forecasting helpers for Guestly operating cadence."""

from __future__ import annotations

from dataclasses import dataclass
from statistics import mean


@dataclass(frozen=True)
class ForecastPoint:
    period: str
    expected_volume: float
    expected_urgent: float
    confidence: str


def moving_average(values: tuple[int, ...], window: int = 3) -> tuple[float, ...]:
    if window <= 0:
        raise ValueError("window must be positive")
    output: list[float] = []
    for index in range(len(values)):
        start = max(0, index - window + 1)
        output.append(round(mean(values[start : index + 1]), 2))
    return tuple(output)


def forecast_volume(daily_counts: tuple[int, ...], urgent_counts: tuple[int, ...], periods: int = 7) -> tuple[ForecastPoint, ...]:
    if len(daily_counts) != len(urgent_counts):
        raise ValueError("daily_counts and urgent_counts must have the same length")
    if not daily_counts:
        return tuple()

    volume_baseline = moving_average(daily_counts)[-1]
    urgent_baseline = moving_average(urgent_counts)[-1]
    volatility = max(daily_counts) - min(daily_counts)
    confidence = "high" if volatility <= 2 else "medium" if volatility <= 5 else "low"

    forecast: list[ForecastPoint] = []
    for index in range(1, periods + 1):
        weekday_factor = 1.18 if index in {5, 6} else 1.0
        forecast.append(
            ForecastPoint(
                period=f"day_{index}",
                expected_volume=round(volume_baseline * weekday_factor, 2),
                expected_urgent=round(urgent_baseline * weekday_factor, 2),
                confidence=confidence,
            )
        )
    return tuple(forecast)


def staffing_pressure_score(expected_urgent: float, active_managers: int, active_departments: int) -> float:
    manager_capacity = max(active_managers, 1) * 4
    department_complexity = max(active_departments, 1) * 0.35
    return round((expected_urgent / manager_capacity) + department_complexity, 2)
