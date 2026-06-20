import type { Classification, Department, IssueType, Sentiment, Urgency } from "./types";

const criticalPatterns = [
  ["allergy", "Allergy"],
  ["allergen", "Allergy"],
  ["food poisoning", "Food poisoning"],
  ["poisoning", "Food poisoning"],
  ["discrimination", "Discrimination"],
  ["injury", "Injury"],
  ["injured", "Injury"],
  ["safety", "Safety"],
  ["unsafe", "Safety"],
  ["theft", "Theft"],
  ["stolen", "Theft"],
  ["violence", "Violence"],
  ["violent", "Violence"],
  ["lawyer", "Legal threat"],
  ["legal", "Legal threat"],
  ["sue", "Legal threat"],
  ["viral", "Viral risk"],
  ["social media", "Social media risk"],
  ["tiktok", "Social media risk"],
  ["instagram", "Social media risk"],
];

const highPatterns = [
  "again",
  "repeated",
  "still broken",
  "very angry",
  "furious",
  "refund",
  "broken ac",
  "ac unit",
  "air conditioning",
  "maintenance",
  "kept turning off",
  "severe",
  "unacceptable",
  "charged twice",
];

const positivePatterns = ["great", "excellent", "friendly", "kind", "fast", "amazing", "wonderful", "clean", "helpful"];
const negativePatterns = [
  "dirty",
  "not cleaned",
  "sticky",
  "slow",
  "noise",
  "loud",
  "damp",
  "broken",
  "charged",
  "angry",
  "refund",
  "bad",
  "hard to sleep",
  "wait",
];

function includesAny(text: string, words: string[]) {
  return words.some((word) => text.includes(word));
}

function titleCase(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function detectDepartment(text: string): Department {
  if (includesAny(text, ["room", "hallway", "sleep", "bed", "damp"])) return "rooms";
  if (includesAny(text, ["front desk", "check-in", "checkout", "check in", "bill", "charged"])) return "front_desk";
  if (includesAny(text, ["clean", "bathroom", "towel", "sticky", "housekeeping"])) return "housekeeping";
  if (includesAny(text, ["food", "breakfast", "coffee", "allergy", "allergen", "poisoning", "kitchen"])) return "kitchen";
  if (includesAny(text, ["server", "staff", "table", "line", "wait"])) return "service";
  if (includesAny(text, ["ac", "air conditioning", "broken", "maintenance", "leak", "unit"])) return "maintenance";
  if (includesAny(text, ["manager", "legal", "discrimination", "refund", "social media"])) return "management";
  return "other";
}

function detectIssueType(text: string): IssueType {
  if (includesAny(text, ["clean", "dirty", "sticky", "bathroom"])) return "cleanliness";
  if (includesAny(text, ["noise", "loud", "party", "sleep"])) return "noise";
  if (includesAny(text, ["food", "breakfast", "coffee", "allergy", "allergen", "poisoning"])) return "food_quality";
  if (includesAny(text, ["staff", "server", "front desk", "team", "kind", "friendly"])) return "staff";
  if (includesAny(text, ["slow", "wait", "line", "queue"])) return "wait_time";
  if (includesAny(text, ["safety", "unsafe", "injury", "violence", "theft"])) return "safety";
  if (includesAny(text, ["charged", "bill", "billing", "refund"])) return "billing";
  if (includesAny(text, ["damp", "bed", "sleep", "comfort"])) return "comfort";
  if (includesAny(text, ["ac", "broken", "maintenance", "unit", "leak"])) return "maintenance";
  return "other";
}

function detectSentiment(text: string, rating?: number): Sentiment {
  const hasPositive = includesAny(text, positivePatterns);
  const hasNegative = includesAny(text, negativePatterns);
  if (hasPositive && hasNegative) return "mixed";
  if (hasNegative || (rating && rating <= 2)) return "negative";
  if (hasPositive || (rating && rating >= 4)) return "positive";
  return "neutral";
}

function scoreUrgency(text: string, sentiment: Sentiment, rating?: number): { urgency: Urgency; riskFlags?: string[] } {
  const riskFlags = criticalPatterns.filter(([pattern]) => text.includes(pattern)).map(([, label]) => label);
  if (riskFlags.length > 0) return { urgency: "critical", riskFlags };
  if (includesAny(text, highPatterns) || rating === 1) return { urgency: "high" };
  if (sentiment === "negative" || sentiment === "mixed" || rating === 2 || rating === 3) return { urgency: "medium" };
  return { urgency: "low" };
}

function summaryFor(issueType: IssueType, department: Department, sentiment: Sentiment, urgency: Urgency) {
  if (urgency === "critical") return `Critical ${titleCase(issueType)} signal routed to ${titleCase(department)} for immediate operator review.`;
  if (urgency === "high") return `High-priority ${titleCase(issueType)} issue detected with likely impact on guest recovery.`;
  if (sentiment === "positive") return `Positive guest signal captured for ${titleCase(department)} with a low operational risk profile.`;
  if (sentiment === "mixed") return `Mixed feedback: praise is present, but ${titleCase(issueType)} friction should be reviewed.`;
  return `${titleCase(issueType)} feedback classified for ${titleCase(department)} with standard follow-up priority.`;
}

function actionFor(issueType: IssueType, urgency: Urgency, department: Department) {
  if (urgency === "critical") return "Escalate to the duty manager now, contact the guest, document the incident, and assign an owner.";
  if (urgency === "high") return `Assign ${titleCase(department)} ownership, inspect the source location, and follow up with the guest before close of day.`;
  if (issueType === "wait_time") return "Review staffing around the reported service window and monitor repeat queue complaints.";
  if (issueType === "cleanliness") return "Ask housekeeping to verify the location and record corrective action.";
  if (issueType === "billing") return "Review the folio or receipt, then contact the guest with a clear resolution.";
  if (urgency === "low") return "Log the signal for trend monitoring and include it in the next team review.";
  return "Review the feedback, route it to the relevant lead, and close the loop once action is taken.";
}

export function classifyFeedback(message: string, rating?: number): Classification {
  const text = message.toLowerCase();
  const sentiment = detectSentiment(text, rating);
  const department = detectDepartment(text);
  const issueType = detectIssueType(text);
  const { urgency, riskFlags } = scoreUrgency(text, sentiment, rating);

  return {
    sentiment,
    urgency,
    priority: urgency,
    department,
    issueType,
    aiSummary: summaryFor(issueType, department, sentiment, urgency),
    suggestedAction: actionFor(issueType, urgency, department),
    riskFlags,
  };
}
