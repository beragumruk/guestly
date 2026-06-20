import type { Department, Feedback, FeedbackLocation, IssueType, Priority, Sentiment, Urgency } from "./types";

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(value));
}

export function pretty(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function countBy<T extends string>(items: T[]) {
  return items.reduce<Record<T, number>>(
    (acc, item) => {
      acc[item] = (acc[item] || 0) + 1;
      return acc;
    },
    {} as Record<T, number>,
  );
}

export function sentimentBreakdown(feedback: Feedback[]) {
  return countBy(feedback.map((item) => item.sentiment as Sentiment));
}

export function urgencyBreakdown(feedback: Feedback[]) {
  return countBy(feedback.map((item) => item.urgency as Urgency));
}

export function departmentBreakdown(feedback: Feedback[]) {
  return countBy(feedback.map((item) => item.department as Department));
}

export function issueTypeBreakdown(feedback: Feedback[]) {
  return countBy(feedback.map((item) => item.issueType as IssueType));
}

export function priorityBreakdown(feedback: Feedback[]) {
  return countBy(feedback.map((item) => item.priority as Priority));
}

export function getLocationName(locations: FeedbackLocation[], locationId: string) {
  return locations.find((location) => location.id === locationId)?.name || "Unknown location";
}

export function topRecurringComplaint(feedback: Feedback[]) {
  const counts = issueTypeBreakdown(feedback.filter((item) => item.sentiment !== "positive"));
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  return sorted[0] ? { issueType: sorted[0][0] as IssueType, count: sorted[0][1] } : null;
}

export function locationPerformance(feedback: Feedback[], locations: FeedbackLocation[]) {
  return locations.map((location) => {
    const locationFeedback = feedback.filter((item) => item.locationId === location.id);
    const urgent = locationFeedback.filter((item) => item.priority === "high" || item.priority === "critical").length;
    const rated = locationFeedback.filter((item) => item.rating);
    const avgRating = rated.length ? rated.reduce((sum, item) => sum + (item.rating || 0), 0) / rated.length : 0;
    return { location, total: locationFeedback.length, urgent, avgRating };
  });
}

export function feedbackOverTime(feedback: Feedback[]) {
  const sorted = [...feedback].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  return sorted.map((item) => ({
    label: formatDate(item.createdAt),
    value: item.sentiment === "positive" ? 4 : item.sentiment === "mixed" ? 3 : item.sentiment === "neutral" ? 2 : 1,
    priority: item.priority,
  }));
}
