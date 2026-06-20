"use client";

import { DashboardChart, BarList } from "@/components/dashboard-chart";
import { Card, PageHeader, StatCard } from "@/components/ui";
import { useGuestly } from "@/components/use-guestly";
import {
  departmentBreakdown,
  feedbackOverTime,
  issueTypeBreakdown,
  locationPerformance,
  pretty,
  priorityBreakdown,
  topRecurringComplaint,
  urgencyBreakdown,
} from "@/lib/analytics";

export default function AnalyticsPage() {
  const state = useGuestly();
  if (!state) return null;

  const recurring = topRecurringComplaint(state.feedback);
  const urgency = urgencyBreakdown(state.feedback);
  const departments = departmentBreakdown(state.feedback);
  const issues = issueTypeBreakdown(state.feedback);
  const priorities = priorityBreakdown(state.feedback);
  const locations = locationPerformance(state.feedback, state.locations);
  const trend = feedbackOverTime(state.feedback);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Analytics"
        title="Patterns across the guest experience."
        text="Track sentiment movement, recurring complaints, department load, urgency distribution, and location performance."
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Recurring complaint" value={recurring ? pretty(recurring.issueType) : "None"} detail={`${recurring?.count || 0} related signals`} />
        <StatCard label="Critical ratio" value={`${Math.round(((priorities.critical || 0) / state.feedback.length) * 100)}%`} detail="Critical items divided by total feedback" />
        <StatCard label="Active locations" value={state.locations.filter((location) => location.active).length} detail="Feedback collection points" />
        <StatCard label="Average volume" value={(state.feedback.length / state.locations.length).toFixed(1)} detail="Responses per collection point" />
      </div>
      <Card className="p-5">
        <p className="mono-label">Sentiment over time</p>
        <h2 className="mt-2 text-xl font-semibold text-zinc-950">Recent signal trajectory</h2>
        <p className="mt-2 text-sm text-zinc-500">Higher points represent more positive guest sentiment. Critical priority points are emphasized.</p>
        <div className="mt-5">
          <DashboardChart points={trend} />
        </div>
      </Card>
      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="p-5">
          <p className="mono-label">Urgency distribution</p>
          <h2 className="mt-2 text-xl font-semibold text-zinc-950">Escalation load</h2>
          <div className="mt-5">
            <BarList data={Object.entries(urgency).map(([label, value]) => ({ label, value }))} />
          </div>
        </Card>
        <Card className="p-5">
          <p className="mono-label">Department breakdown</p>
          <h2 className="mt-2 text-xl font-semibold text-zinc-950">Routing pressure</h2>
          <div className="mt-5">
            <BarList data={Object.entries(departments).map(([label, value]) => ({ label, value }))} />
          </div>
        </Card>
        <Card className="p-5">
          <p className="mono-label">Issue type trends</p>
          <h2 className="mt-2 text-xl font-semibold text-zinc-950">Complaint taxonomy</h2>
          <div className="mt-5">
            <BarList data={Object.entries(issues).map(([label, value]) => ({ label, value }))} />
          </div>
        </Card>
      </div>
      <Card className="p-5">
        <p className="mono-label">Location performance</p>
        <h2 className="mt-2 text-xl font-semibold text-zinc-950">Feedback by collection point</h2>
        <div className="mt-5 overflow-hidden rounded-xl border border-zinc-200 bg-white">
          <div className="hidden grid-cols-4 gap-4 border-b border-zinc-200 bg-zinc-50 px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500 md:grid">
            <span>Location</span>
            <span>Total</span>
            <span>Urgent</span>
            <span>Avg rating</span>
          </div>
          <div className="divide-y divide-zinc-200">
            {locations.map(({ location, total, urgent, avgRating }) => (
              <div key={location.id} className="grid gap-2 px-4 py-4 text-sm md:grid-cols-4">
                <span className="font-semibold text-zinc-950">{location.name}</span>
                <span className="text-zinc-600">{total} responses</span>
                <span className="text-zinc-600">{urgent} urgent</span>
                <span className="text-zinc-600">{avgRating ? avgRating.toFixed(1) : "No rating"}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
