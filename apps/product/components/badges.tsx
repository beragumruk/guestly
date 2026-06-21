"use client";

import type { FeedbackStatus, Priority, Sentiment, Urgency } from "@/lib/types";

const priorityClasses: Record<Priority, string> = {
  low: "border-zinc-200 bg-zinc-50 text-zinc-600",
  medium: "border-zinc-300 bg-white text-zinc-800",
  high: "border-zinc-400 bg-zinc-100 text-zinc-950",
  critical: "border-zinc-950 bg-zinc-950 text-zinc-50",
};

const sentimentClasses: Record<Sentiment, string> = {
  positive: "border-zinc-300 bg-white text-zinc-950",
  neutral: "border-zinc-200 bg-zinc-50 text-zinc-600",
  negative: "border-zinc-400 bg-zinc-100 text-zinc-950",
  mixed: "border-zinc-300 bg-white text-zinc-700",
};

const urgencyClasses: Record<Urgency, string> = {
  low: "border-zinc-200 bg-zinc-50 text-zinc-600",
  medium: "border-zinc-300 bg-white text-zinc-800",
  high: "border-zinc-400 bg-zinc-100 text-zinc-950",
  critical: "border-zinc-950 bg-zinc-950 text-zinc-50",
};

function label(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function Badge({ children, className }: { children: string; className: string }) {
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${className}`}>{children}</span>;
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  return <Badge className={priorityClasses[priority]}>{label(priority)}</Badge>;
}

export function SentimentBadge({ sentiment }: { sentiment: Sentiment }) {
  return <Badge className={sentimentClasses[sentiment]}>{label(sentiment)}</Badge>;
}

export function UrgencyBadge({ urgency }: { urgency: Urgency }) {
  return <Badge className={urgencyClasses[urgency]}>{label(urgency)}</Badge>;
}

export function StatusSelect({
  value,
  onChange,
}: {
  value: FeedbackStatus;
  onChange: (status: FeedbackStatus) => void;
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value as FeedbackStatus)}
      className="rounded-lg border border-zinc-200 bg-white px-2.5 py-2 text-xs font-medium text-zinc-700 outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-950/5"
    >
      <option value="new">New</option>
      <option value="in_review">In review</option>
      <option value="assigned">Assigned</option>
      <option value="resolved">Resolved</option>
      <option value="archived">Archived</option>
    </select>
  );
}
