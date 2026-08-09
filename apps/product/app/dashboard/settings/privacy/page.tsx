"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { Download, ShieldAlert, Trash2 } from "lucide-react";
import { Button, Card, FormField, Input, PageHeader, Select } from "@/components/ui";

export default function PrivacyPage() {
  const [retention, setRetention] = useState<string>("");
  const [message, setMessage] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState("");
  const [feedbackId, setFeedbackId] = useState("");
  const [feedbackConfirmation, setFeedbackConfirmation] = useState("");
  const [organizationId, setOrganizationId] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { void (async () => { const response = await fetch("/api/security/privacy"); const body = await response.json() as { ok?: boolean; organizationId?: string; preference?: { retention_days?: number | null }; message?: string }; if (body.ok) { setRetention(body.preference?.retention_days ? String(body.preference.retention_days) : ""); setOrganizationId(body.organizationId || ""); } else setMessage(body.message || "Privacy controls require production storage."); })(); }, []);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true);
    const retentionDays = retention ? Number(retention) : null;
    const response = await fetch("/api/security/privacy", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ retentionDays }) });
    const body = await response.json() as { ok?: boolean; message?: string };
    setMessage(body.ok ? "Retention preference saved. Data is not deleted until an Owner confirms a purge." : body.message || "Preference could not be saved."); setBusy(false);
  }

  async function destructive(action: "purgeExpired" | "deleteOrganization" | "deleteFeedback") {
    setBusy(true);
    const payload = action === "purgeExpired" ? { purgeExpired: true, confirmation } : action === "deleteOrganization" ? { deleteOrganization: true, confirmation } : { feedbackId, confirmation: feedbackConfirmation };
    const response = await fetch("/api/security/privacy", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const body = await response.json() as { ok?: boolean; message?: string; count?: number };
    setMessage(body.ok ? (action === "purgeExpired" ? `${body.count || 0} expired feedback records deleted.` : action === "deleteFeedback" ? "Feedback record deleted." : "Organization deletion requested.") : body.message || "Action could not be completed."); setConfirmation(""); setFeedbackConfirmation(""); setFeedbackId(""); setBusy(false);
  }

  return <div className="space-y-6"><PageHeader eyebrow="Settings / privacy & data" title="Keep guest data under your control." text="Guestly stores feedback messages, optional contact details, ratings, service-touchpoint context, and the operational classification needed to route and analyze feedback." action={<Link href="/dashboard/settings/security" className="button-secondary"><ShieldAlert className="h-4 w-4" />Security</Link>} />
    {message && <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-700">{message}</div>}
    <div className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]"><Card className="p-5"><p className="mono-label">Organization export</p><h2 className="mt-2 text-xl font-semibold text-zinc-950">Export stored feedback data.</h2><p className="mt-3 text-sm leading-6 text-zinc-500">Authorized Owners and Admins can download the organization’s feedback records in JSON for a controlled handoff or review.</p><a href="/api/security/export" className="button-secondary mt-5"><Download className="h-4 w-4" />Export organization data</a></Card>
      <Card className="p-5"><p className="mono-label">Retention preference</p><h2 className="mt-2 text-xl font-semibold text-zinc-950">Set an owner-controlled retention policy.</h2><form className="mt-5 grid gap-4" onSubmit={save}><FormField label="Feedback retention"><Select value={retention} onChange={(event) => setRetention(event.target.value)}><option value="">No automatic retention period</option><option value="90">90 days</option><option value="180">180 days</option><option value="365">365 days</option><option value="730">2 years</option><option value="1095">3 years</option></Select></FormField><p className="text-xs leading-5 text-zinc-500">Guestly records this policy. To avoid unattended deletion, an Owner must explicitly confirm each purge.</p><Button type="submit" disabled={busy}>Save retention preference</Button></form></Card></div>
    <Card className="border-red-200 p-5"><div className="flex items-start gap-3"><ShieldAlert className="mt-0.5 h-5 w-5 text-red-600" /><div><p className="mono-label text-red-700">Destructive actions</p><h2 className="mt-2 text-xl font-semibold text-zinc-950">Purge data only with explicit confirmation.</h2><p className="mt-2 text-sm leading-6 text-zinc-600">These actions are limited to Owners, are recorded in organization activity, and cannot be undone.</p></div></div><div className="mt-5 grid gap-4 border-t border-red-100 pt-5 lg:grid-cols-[1fr_auto]"><FormField label="Type PURGE to delete feedback older than the saved retention period"><Input value={confirmation} onChange={(event) => setConfirmation(event.target.value)} placeholder="PURGE" /></FormField><div className="lg:self-end"><Button variant="secondary" onClick={() => void destructive("purgeExpired")} disabled={busy || confirmation !== "PURGE"}><Trash2 className="h-4 w-4" />Purge expired feedback</Button></div></div><div className="mt-5 grid gap-4 border-t border-red-100 pt-5 lg:grid-cols-[1fr_auto]"><FormField label="Feedback record ID and confirmation"><div className="grid gap-2"><Input value={feedbackId} onChange={(event) => setFeedbackId(event.target.value)} placeholder="Feedback record ID" /><Input value={feedbackConfirmation} onChange={(event) => setFeedbackConfirmation(event.target.value)} placeholder="Type DELETE" /></div></FormField><div className="lg:self-end"><Button variant="ghost" onClick={() => void destructive("deleteFeedback")} disabled={busy || !feedbackId || feedbackConfirmation !== "DELETE"}><Trash2 className="h-4 w-4" />Delete feedback record</Button></div></div><div className="mt-5 grid gap-4 border-t border-red-100 pt-5 lg:grid-cols-[1fr_auto]"><FormField label={`Type ${organizationId || "your organization ID"} to delete the organization`}><Input value={confirmation} onChange={(event) => setConfirmation(event.target.value)} placeholder="Organization ID" /></FormField><div className="lg:self-end"><Button variant="ghost" onClick={() => void destructive("deleteOrganization")} disabled={busy || confirmation !== organizationId || !organizationId}><Trash2 className="h-4 w-4" />Delete organization</Button></div></div></Card>
  </div>;
}
