import type { Feedback, FeedbackLocation } from "./types";

function csvCell(value: string | number | undefined) {
  const text = value === undefined ? "" : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

export function feedbackCsv(feedback: Feedback[], locations: FeedbackLocation[]) {
  const locationNames = new Map(locations.map((location) => [location.id, location.name]));
  const headers = ["timestamp", "location", "category", "urgency", "sentiment", "status", "feedback_text"];
  const rows = feedback.map((item) => [
    item.createdAt,
    locationNames.get(item.locationId) || "Unknown location",
    item.issueType,
    item.urgency,
    item.sentiment,
    item.status,
    item.message,
  ]);
  return [headers, ...rows].map((row) => row.map((value) => csvCell(value)).join(",")).join("\r\n");
}

export function downloadFeedbackCsv(feedback: Feedback[], locations: FeedbackLocation[]) {
  const blob = new Blob([feedbackCsv(feedback, locations)], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `guestly-feedback-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
