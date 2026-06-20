"use client";

import { AlertTriangle, ArrowRight, CheckCircle2, ClipboardList, Inbox, ShieldAlert } from "lucide-react";
import { BarList } from "@/components/dashboard-chart";
import { PriorityBadge, SentimentBadge, UrgencyBadge } from "@/components/badges";
import { Button, Card, EmptyState, PageHeader, StatCard } from "@/components/ui";
import { useGuestly } from "@/components/use-guestly";
import { departmentBreakdown, getLocationName, pretty, sentimentBreakdown, topRecurringComplaint } from "@/lib/analytics";
import { updateActionStatus } from "@/lib/store";

export default function DashboardOverview() {
  const state = useGuestly();
  if (!state) return null;

  const urgent = state.feedback.filter((item) => item.priority === "high" || item.priority === "critical");
  const critical = state.feedback.filter((item) => item.priority === "critical");
  const topComplaint = topRecurringComplaint(state.feedback);
  const sentiment = sentimentBreakdown(state.feedback);
  const departments = departmentBreakdown(state.feedback);
  const queue = state.feedback.filter((item) => item.status !== "resolved" && item.status !== "archived").slice(0, 5);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Guestly intelligence"
        title="Command view for guest experience risk."
        text="Monitor new signals, prioritize operational recovery, and spot recurring hospitality issues before they become public reviews."
        action={
          <a className="button-primary" href="/dashboard/feedback">
            Open inbox
            <ArrowRight className="h-4 w-4" />
          </a>
        }
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Total responses" value={state.feedback.length} detail="All captured guest signals" />
        <StatCard label="Urgent issues" value={urgent.length} detail="High and critical queue" />
        <StatCard label="Critical issues" value={critical.length} detail="Safety, legal, PR, allergy risk" />
        <StatCard label="Top complaint" value={topComplaint ? pretty(topComplaint.issueType) : "None"} detail={`${topComplaint?.count || 0} recurring signals`} />
        <StatCard label="Open actions" value={state.actionItems.filter((item) => item.status !== "resolved").length} detail="Assigned recovery work" />
      </div>
      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="mono-label">Recent feedback</p>
              <h2 className="mt-2 text-xl font-semibold text-zinc-950">Latest classified signals</h2>
            </div>
            <Inbox className="h-5 w-5 text-zinc-400" />
          </div>
          <div className="mt-5 divide-y divide-zinc-200">
            {state.feedback.slice(0, 5).map((item) => (
              <div key={item.id} className="grid gap-3 py-4 lg:grid-cols-[1fr_auto]">
                <div>
                  <p className="text-sm font-semibold text-zinc-950">{getLocationName(state.locations, item.locationId)}</p>
                  <p className="mt-1 text-sm leading-6 text-zinc-600">{item.message}</p>
                  <p className="mt-1 text-xs text-zinc-500">{item.aiSummary}</p>
                </div>
                <div className="flex flex-wrap items-start gap-2 lg:justify-end">
                  <PriorityBadge priority={item.priority} />
                  <SentimentBadge sentiment={item.sentiment} />
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-5">
          <p className="mono-label">Sentiment breakdown</p>
          <h2 className="mt-2 text-xl font-semibold text-zinc-950">Signal quality</h2>
          <div className="mt-5">
            <BarList data={Object.entries(sentiment).map(([label, value]) => ({ label, value }))} total={state.feedback.length} />
          </div>
        </Card>
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="p-5 xl:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="mono-label">Priority queue</p>
              <h2 className="mt-2 text-xl font-semibold text-zinc-950">Needs operator review</h2>
            </div>
            <ShieldAlert className="h-5 w-5 text-zinc-400" />
          </div>
          <div className="mt-5 grid gap-3">
            {queue.map((item) => (
              <div key={item.id} className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-zinc-950">{getLocationName(state.locations, item.locationId)}</p>
                    <p className="mt-1 text-sm leading-6 text-zinc-600">{item.suggestedAction}</p>
                  </div>
                  <UrgencyBadge urgency={item.urgency} />
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="mono-label">Department breakdown</p>
              <h2 className="mt-2 text-xl font-semibold text-zinc-950">Routing load</h2>
            </div>
            <AlertTriangle className="h-5 w-5 text-zinc-400" />
          </div>
          <div className="mt-5">
            <BarList data={Object.entries(departments).map(([label, value]) => ({ label, value }))} />
          </div>
        </Card>
      </div>
      <Card className="p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="mono-label">Action items</p>
            <h2 className="mt-2 text-xl font-semibold text-zinc-950">Recovery work</h2>
          </div>
          <ClipboardList className="h-5 w-5 text-zinc-400" />
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {state.actionItems.length === 0 && <EmptyState title="No action items" text="Create actions from feedback detail panels when a signal needs ownership." />}
          {state.actionItems.map((item) => (
            <div key={item.id} className="rounded-xl border border-zinc-200 bg-white p-4">
              <p className="text-sm font-semibold text-zinc-950">{item.title}</p>
              <p className="mt-2 text-xs text-zinc-500">Owner: {item.owner || "Unassigned"}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs text-zinc-600">{pretty(item.status)}</span>
                <Button variant="ghost" onClick={() => updateActionStatus(item.id, "resolved")}>
                  <CheckCircle2 className="h-4 w-4" />
                  Resolve
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
