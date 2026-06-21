"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Plus, X } from "lucide-react";
import { formatDate, getLocationName, pretty } from "@/lib/analytics";
import { createActionItem, updateFeedbackStatus } from "@/lib/store";
import type { Feedback, FeedbackLocation, FeedbackStatus } from "@/lib/types";
import { PriorityBadge, SentimentBadge, StatusSelect, UrgencyBadge } from "./badges";
import { Button, EmptyState } from "./ui";

export function FeedbackTable({
  feedback,
  locations,
}: {
  feedback: Feedback[];
  locations: FeedbackLocation[];
}) {
  const [selectedId, setSelectedId] = useState<string | null>(feedback[0]?.id || null);
  const selected = useMemo(() => feedback.find((item) => item.id === selectedId) || feedback[0], [feedback, selectedId]);

  if (feedback.length === 0) {
    return <EmptyState title="No matching feedback" text="Adjust filters or submit a new public feedback item to see it classified here." />;
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_26rem]">
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white/92">
        <div className="hidden grid-cols-[1.1fr_1.8fr_0.9fr_0.9fr_0.9fr] gap-4 border-b border-zinc-200 bg-zinc-50 px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500 lg:grid">
          <span>Source</span>
          <span>Feedback</span>
          <span>Priority</span>
          <span>Signal</span>
          <span>Status</span>
        </div>
        <div className="divide-y divide-zinc-200">
          {feedback.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelectedId(item.id)}
              className={`grid w-full gap-3 px-4 py-4 text-left transition hover:bg-zinc-50 lg:grid-cols-[1.1fr_1.8fr_0.9fr_0.9fr_0.9fr] lg:items-center ${
                selected?.id === item.id ? "bg-zinc-50" : "bg-white"
              }`}
            >
              <div>
                <p className="text-sm font-semibold text-zinc-950">{getLocationName(locations, item.locationId)}</p>
                <p className="mt-1 text-xs text-zinc-500">{formatDate(item.createdAt)}</p>
              </div>
              <div>
                <p className="line-clamp-2 text-sm leading-6 text-zinc-700">{item.message}</p>
                <p className="mt-1 text-xs text-zinc-500">{item.aiSummary}</p>
              </div>
              <PriorityBadge priority={item.priority} />
              <div className="flex flex-wrap gap-2">
                <SentimentBadge sentiment={item.sentiment} />
                <UrgencyBadge urgency={item.urgency} />
              </div>
              <StatusSelect
                value={item.status}
                onChange={(status) => {
                  updateFeedbackStatus(item.id, status);
                }}
              />
            </button>
          ))}
        </div>
      </div>
      {selected && <FeedbackDetailPanel feedback={selected} locations={locations} onClose={() => setSelectedId(null)} />}
    </div>
  );
}

export function FeedbackDetailPanel({
  feedback,
  locations,
  onClose,
}: {
  feedback: Feedback;
  locations: FeedbackLocation[];
  onClose: () => void;
}) {
  function changeStatus(status: FeedbackStatus) {
    updateFeedbackStatus(feedback.id, status);
  }

  return (
    <aside className="panel rounded-xl p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="mono-label">Feedback detail</p>
          <h2 className="mt-2 text-lg font-semibold text-zinc-950">{getLocationName(locations, feedback.locationId)}</h2>
        </div>
        <button className="button-ghost xl:hidden" type="button" onClick={onClose} aria-label="Close detail">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        <PriorityBadge priority={feedback.priority} />
        <UrgencyBadge urgency={feedback.urgency} />
        <SentimentBadge sentiment={feedback.sentiment} />
      </div>
      <p className="mt-5 text-sm leading-6 text-zinc-700">{feedback.message}</p>
      <div className="mt-5 grid gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-4">
        <Info label="AI summary" value={feedback.aiSummary} />
        <Info label="Suggested action" value={feedback.suggestedAction} />
        <Info label="Department" value={pretty(feedback.department)} />
        <Info label="Issue type" value={pretty(feedback.issueType)} />
        {feedback.riskFlags && feedback.riskFlags.length > 0 && <Info label="Risk flags" value={feedback.riskFlags.join(", ")} />}
      </div>
      <div className="mt-5 grid gap-3">
        <label>
          <span className="field-label">Status</span>
          <StatusSelect value={feedback.status} onChange={changeStatus} />
        </label>
        <Button
          variant="secondary"
          onClick={() => {
            createActionItem(feedback.id);
          }}
        >
          <Plus className="h-4 w-4" />
          Create action item
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            changeStatus("resolved");
          }}
        >
          <CheckCircle2 className="h-4 w-4" />
          Mark resolved
        </Button>
      </div>
    </aside>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">{label}</p>
      <p className="mt-1 text-sm leading-6 text-zinc-800">{value}</p>
    </div>
  );
}
