"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Check, Download, ExternalLink, Mail, MessageSquareText, Plug, Send, Webhook, X } from "lucide-react";
import { Button, Card, FormField, Input, PageHeader } from "@/components/ui";
import type { EmailRules, IntegrationConnection, IntegrationEvent, WebhookEndpoint } from "@/lib/integrations/types";

const eventOptions: Array<{ value: IntegrationEvent; label: string }> = [
  { value: "feedback.created", label: "New feedback" },
  { value: "feedback.urgent", label: "Urgent feedback" },
  { value: "feedback.updated", label: "Feedback updates" },
];

const categoryOptions = ["cleanliness", "noise", "food_quality", "staff", "wait_time", "safety", "billing", "comfort", "maintenance", "other"] as const;

const defaultRules: EmailRules = {
  allNewFeedback: false,
  urgentFeedback: true,
  negativeFeedback: false,
  selectedCategories: [],
  dailySummary: false,
};

type Snapshot = {
  storageAvailable: boolean;
  slackOAuthAvailable: boolean;
  integrations: { email: IntegrationConnection | null; slack: IntegrationConnection | null };
  webhooks: WebhookEndpoint[];
};

function emptySnapshot(): Snapshot {
  return { storageAvailable: false, slackOAuthAvailable: false, integrations: { email: null, slack: null }, webhooks: [] };
}

function statusLabel(status?: string) {
  if (status === "connected") return "Connected";
  if (status === "needs_attention") return "Needs attention";
  if (status === "coming_soon") return "Coming soon";
  return "Not connected";
}

function StatusBadge({ status }: { status?: string }) {
  const className = status === "connected" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : status === "needs_attention" ? "border-amber-200 bg-amber-50 text-amber-700" : "border-zinc-200 bg-zinc-50 text-zinc-600";
  return <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${className}`}>{statusLabel(status)}</span>;
}

function RuleToggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className="flex items-center justify-between gap-4 border-b border-zinc-100 py-3 last:border-b-0">
      <span className="text-sm text-zinc-700">{label}</span>
      <input className="h-4 w-4 accent-zinc-950" type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
    </label>
  );
}

export default function IntegrationsPage() {
  const [snapshot, setSnapshot] = useState<Snapshot>(emptySnapshot);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [recipients, setRecipients] = useState("");
  const [rules, setRules] = useState<EmailRules>(defaultRules);
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [slackChannelId, setSlackChannelId] = useState("");
  const [slackChannelName, setSlackChannelName] = useState("");
  const [slackEvents, setSlackEvents] = useState<IntegrationEvent[]>(["feedback.urgent"]);
  const [slackEnabled, setSlackEnabled] = useState(false);
  const [endpoint, setEndpoint] = useState("");
  const [webhookEvents, setWebhookEvents] = useState<IntegrationEvent[]>(["feedback.created", "feedback.urgent"]);
  const [signingSecret, setSigningSecret] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const response = await fetch("/api/integrations", { cache: "no-store" });
      const body = (await response.json()) as Snapshot & { ok?: boolean; message?: string };
      if (!response.ok || !body.ok) throw new Error(body.message || "Unable to load integrations.");
      setSnapshot(body);
      const email = body.integrations.email;
      if (email) {
        const config = email.config as { recipients?: string[]; rules?: EmailRules };
        setRecipients((config.recipients || []).join(", "));
        setRules({ ...defaultRules, ...(config.rules || {}) });
        setEmailEnabled(email.enabled);
      }
      const slack = body.integrations.slack;
      if (slack) {
        const config = slack.config as { channelId?: string; channelName?: string; events?: IntegrationEvent[] };
        setSlackChannelId(config.channelId || "");
        setSlackChannelName(config.channelName || "");
        setSlackEvents(config.events || ["feedback.urgent"]);
        setSlackEnabled(slack.enabled);
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to load integrations.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const emailStatus = snapshot.integrations.email?.status;
  const slackStatus = snapshot.integrations.slack?.status || (snapshot.slackOAuthAvailable ? "not_connected" : "coming_soon");
  const activeWebhookCount = useMemo(() => snapshot.webhooks.filter((item) => item.enabled).length, [snapshot.webhooks]);

  async function saveEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy("email");
    setMessage(null);
    try {
      const response = await fetch("/api/integrations", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipients: recipients.split(",").map((item) => item.trim()).filter(Boolean), rules, enabled: emailEnabled }),
      });
      const body = (await response.json()) as { ok?: boolean; message?: string };
      if (!response.ok || !body.ok) throw new Error(body.message || "Unable to save email settings.");
      setMessage(body.message || "Email settings saved.");
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save email settings.");
    } finally {
      setBusy(null);
    }
  }

  async function saveSlack(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy("slack");
    setMessage(null);
    try {
      const response = await fetch("/api/integrations/slack", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channelId: slackChannelId, channelName: slackChannelName, events: slackEvents, enabled: slackEnabled }),
      });
      const body = (await response.json()) as { ok?: boolean; message?: string };
      if (!response.ok || !body.ok) throw new Error(body.message || "Unable to save Slack settings.");
      setMessage(body.message || "Slack settings saved.");
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save Slack settings.");
    } finally {
      setBusy(null);
    }
  }

  async function addWebhook(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy("webhook");
    setMessage(null);
    try {
      const response = await fetch("/api/integrations/webhooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint, events: webhookEvents }),
      });
      const body = (await response.json()) as { ok?: boolean; message?: string; signingSecret?: string };
      if (!response.ok || !body.ok) throw new Error(body.message || "Unable to add webhook.");
      setSigningSecret(body.signingSecret || null);
      setEndpoint("");
      setMessage("Webhook added. Copy the signing secret now, it will not be shown again.");
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to add webhook.");
    } finally {
      setBusy(null);
    }
  }

  async function webhookAction(id: string, action: "test" | "toggle" | "delete", enabled?: boolean) {
    setBusy(`${action}-${id}`);
    setMessage(null);
    try {
      const response = action === "test"
        ? await fetch(`/api/integrations/webhooks/${id}/test`, { method: "POST" })
        : action === "toggle"
          ? await fetch(`/api/integrations/webhooks/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ enabled }) })
          : await fetch(`/api/integrations/webhooks/${id}`, { method: "DELETE" });
      const body = (await response.json()) as { ok?: boolean; message?: string };
      if (!response.ok || !body.ok) throw new Error(body.message || "Webhook action failed.");
      setMessage(body.message || "Webhook updated.");
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Webhook action failed.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Settings / integrations"
        title="Connect Guestly to your operating workflow."
        text="Set organization-level delivery rules, export filtered feedback, and send signed event data to the systems your team already uses."
        action={<Link href="/dashboard/settings" className="button-secondary"><Plug className="h-4 w-4" />Workspace settings</Link>}
      />

      {message && (
        <div className="flex items-start justify-between gap-4 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-700" role="status">
          <span>{message}</span>
          <button className="text-zinc-500 hover:text-zinc-900" type="button" onClick={() => setMessage(null)} aria-label="Dismiss message"><X className="h-4 w-4" /></button>
        </div>
      )}

      {!loading && !snapshot.storageAvailable && (
        <Card className="border-amber-200 bg-amber-50/70 p-5">
          <p className="mono-label text-amber-700">Setup required</p>
          <p className="mt-2 text-sm leading-6 text-amber-900">Integration storage is not configured in this workspace. CSV export is available now. Add the database migration and server environment variables documented in the repository to activate email, Slack, and webhooks.</p>
        </Card>
      )}

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-800"><Mail className="h-4 w-4" /></span>
              <div><p className="mono-label">Email notifications</p><h2 className="mt-2 text-xl font-semibold text-zinc-950">Operational alerts by email</h2></div>
            </div>
            <StatusBadge status={emailStatus} />
          </div>
          <form className="mt-6 grid gap-5" onSubmit={saveEmail}>
            <FormField label="Alert recipients, separated by commas">
              <Input value={recipients} onChange={(event) => setRecipients(event.target.value)} placeholder="ops@example.com, manager@example.com" disabled={!snapshot.storageAvailable} />
            </FormField>
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4">
              <RuleToggle label="All new feedback" checked={rules.allNewFeedback} onChange={(value) => setRules({ ...rules, allNewFeedback: value })} />
              <RuleToggle label="Urgent feedback only" checked={rules.urgentFeedback} onChange={(value) => setRules({ ...rules, urgentFeedback: value })} />
              <RuleToggle label="Negative feedback" checked={rules.negativeFeedback} onChange={(value) => setRules({ ...rules, negativeFeedback: value })} />
              <RuleToggle label="Daily summary" checked={rules.dailySummary} onChange={(value) => setRules({ ...rules, dailySummary: value })} />
              <RuleToggle label="Enable delivery" checked={emailEnabled} onChange={setEmailEnabled} />
            </div>
            <div>
              <p className="field-label">Selected categories</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {categoryOptions.map((category) => {
                  const selected = rules.selectedCategories.includes(category);
                  return <label key={category} className={`cursor-pointer rounded-lg border px-2.5 py-1.5 text-xs ${selected ? "border-zinc-950 bg-zinc-950 text-zinc-50" : "border-zinc-200 bg-white text-zinc-600"}`}><input className="sr-only" type="checkbox" checked={selected} onChange={(event) => setRules({ ...rules, selectedCategories: event.target.checked ? [...rules.selectedCategories, category] : rules.selectedCategories.filter((item) => item !== category) })} />{category.replace(/_/g, " ")}</label>;
                })}
              </div>
            </div>
            <Button type="submit" disabled={!snapshot.storageAvailable || busy === "email"}><Mail className="h-4 w-4" />{busy === "email" ? "Saving..." : "Save email rules"}</Button>
          </form>
        </Card>

        <div className="grid gap-4">
          <Card className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-start gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-800"><MessageSquareText className="h-4 w-4" /></span><div><p className="mono-label">Slack</p><h2 className="mt-2 text-xl font-semibold text-zinc-950">Channel notifications</h2></div></div>
              <StatusBadge status={slackStatus} />
            </div>
            {snapshot.integrations.slack ? (
              <form className="mt-5 grid gap-4" onSubmit={saveSlack}>
                <div className="grid gap-3 sm:grid-cols-2"><FormField label="Channel ID"><Input value={slackChannelId} onChange={(event) => setSlackChannelId(event.target.value)} placeholder="C0123456789" /></FormField><FormField label="Channel name"><Input value={slackChannelName} onChange={(event) => setSlackChannelName(event.target.value)} placeholder="guestly-alerts" /></FormField></div>
                <EventPicker events={slackEvents} onChange={setSlackEvents} />
                <RuleToggle label="Enable Slack delivery" checked={slackEnabled} onChange={setSlackEnabled} />
                <Button type="submit" disabled={busy === "slack"}><MessageSquareText className="h-4 w-4" />{busy === "slack" ? "Saving..." : "Save Slack settings"}</Button>
              </form>
            ) : snapshot.slackOAuthAvailable && snapshot.storageAvailable ? (
              <div className="mt-5"><p className="text-sm leading-6 text-zinc-600">Connect a Slack workspace, then choose the channel and guest-feedback events that should post there.</p><a href="/api/integrations/slack/connect" className="button-secondary mt-5"><ExternalLink className="h-4 w-4" />Connect Slack</a></div>
            ) : (
              <p className="mt-5 text-sm leading-6 text-zinc-600">Slack OAuth credentials are not configured for this deployment. The connection flow is ready, but remains disabled until they are supplied.</p>
            )}
          </Card>

          <Card className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-4"><div className="flex items-start gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-800"><Download className="h-4 w-4" /></span><div><p className="mono-label">CSV export</p><h2 className="mt-2 text-xl font-semibold text-zinc-950">Filtered feedback, ready to share</h2></div></div><StatusBadge status="connected" /></div>
            <p className="mt-4 text-sm leading-6 text-zinc-600">Export the feedback currently visible in the inbox, including timestamp, location, category, urgency, sentiment, status, and feedback text.</p>
            <Link href="/dashboard/feedback" className="button-secondary mt-5"><Download className="h-4 w-4" />Open feedback export</Link>
          </Card>
        </div>
      </div>

      <Card className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-4"><div className="flex items-start gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-800"><Webhook className="h-4 w-4" /></span><div><p className="mono-label">Webhooks</p><h2 className="mt-2 text-xl font-semibold text-zinc-950">Send structured feedback events to your systems</h2></div></div><StatusBadge status={activeWebhookCount > 0 ? "connected" : "not_connected"} /></div>
        <p className="mt-4 max-w-3xl text-sm leading-6 text-zinc-600">Each endpoint receives a signed JSON payload for feedback.created, feedback.urgent, or feedback.updated. Guestly logs each delivery attempt and failure.</p>
        <form className="mt-6 grid gap-4 border-t border-zinc-200 pt-5 lg:grid-cols-[1fr_auto]" onSubmit={addWebhook}>
          <FormField label="HTTPS endpoint"><Input type="url" value={endpoint} onChange={(event) => setEndpoint(event.target.value)} placeholder="https://ops.example.com/guestly" disabled={!snapshot.storageAvailable} required /></FormField>
          <div className="lg:self-end"><Button type="submit" disabled={!snapshot.storageAvailable || busy === "webhook"}><Webhook className="h-4 w-4" />{busy === "webhook" ? "Adding..." : "Add webhook"}</Button></div>
          <div className="lg:col-span-2"><EventPicker events={webhookEvents} onChange={setWebhookEvents} /></div>
        </form>
        {signingSecret && <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4"><p className="text-sm font-semibold text-amber-900">Copy your signing secret now</p><code className="mt-2 block break-all rounded-lg border border-amber-200 bg-white px-3 py-2 text-xs text-zinc-700">{signingSecret}</code><Button variant="ghost" className="mt-2" onClick={() => setSigningSecret(null)}><Check className="h-4 w-4" />I saved it</Button></div>}
        <div className="mt-6 divide-y divide-zinc-200 border-t border-zinc-200">
          {snapshot.webhooks.length === 0 ? <p className="py-5 text-sm text-zinc-500">No webhook endpoints are configured.</p> : snapshot.webhooks.map((webhook) => <div key={webhook.id} className="flex flex-col gap-3 py-4 lg:flex-row lg:items-center lg:justify-between"><div className="min-w-0"><p className="truncate text-sm font-semibold text-zinc-950">{webhook.endpoint}</p><p className="mt-1 text-xs text-zinc-500">{webhook.events.join(" · ")}</p></div><div className="flex flex-wrap gap-2"><Button variant="secondary" onClick={() => void webhookAction(webhook.id, "test")} disabled={busy === `test-${webhook.id}`}><Send className="h-4 w-4" />Test</Button><Button variant="ghost" onClick={() => void webhookAction(webhook.id, "toggle", !webhook.enabled)} disabled={busy === `toggle-${webhook.id}`}>{webhook.enabled ? "Disable" : "Enable"}</Button><Button variant="ghost" onClick={() => void webhookAction(webhook.id, "delete")} disabled={busy === `delete-${webhook.id}`}>Remove</Button></div></div>)}
        </div>
      </Card>
    </div>
  );
}

function EventPicker({ events, onChange }: { events: IntegrationEvent[]; onChange: (events: IntegrationEvent[]) => void }) {
  return <div><p className="field-label">Trigger events</p><div className="mt-2 flex flex-wrap gap-2">{eventOptions.map((option) => <label key={option.value} className={`cursor-pointer rounded-lg border px-2.5 py-1.5 text-xs ${events.includes(option.value) ? "border-zinc-950 bg-zinc-950 text-zinc-50" : "border-zinc-200 bg-white text-zinc-600"}`}><input className="sr-only" type="checkbox" checked={events.includes(option.value)} onChange={(event) => onChange(event.target.checked ? [...new Set([...events, option.value])] : events.filter((item) => item !== option.value))} />{option.label}</label>)}</div></div>;
}
