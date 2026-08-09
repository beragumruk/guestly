"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Activity, ArrowRight, KeyRound, ShieldCheck, Users } from "lucide-react";
import { Card, PageHeader } from "@/components/ui";

type ActivityEvent = { id: string; actor_label: string; event_type: string; object_type?: string | null; object_label?: string | null; created_at: string };

export default function SecurityPage() {
  const [activity, setActivity] = useState<ActivityEvent[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  useEffect(() => { void (async () => { const response = await fetch("/api/security/activity"); const body = await response.json() as { ok?: boolean; activity?: ActivityEvent[]; message?: string }; if (body.ok) setActivity(body.activity || []); else setMessage(body.message || "Activity is unavailable until production storage is configured."); })(); }, []);
  return <div className="space-y-6"><PageHeader eyebrow="Settings / security" title="Security and access, in one place." text="Review account protections, manage who can access operational data, and keep a concise record of administrative changes." />
    <div className="grid gap-4 xl:grid-cols-3"><Card className="p-5"><KeyRound className="h-5 w-5 text-zinc-500" /><p className="mono-label mt-5">Account security</p><h2 className="mt-2 text-xl font-semibold text-zinc-950">Signed, time-limited sessions</h2><p className="mt-2 text-sm leading-6 text-zinc-500">Dashboard sessions are HTTP-only, same-site, secure in production, and expire after eight hours.</p></Card><Card className="p-5"><Users className="h-5 w-5 text-zinc-500" /><p className="mono-label mt-5">Team access</p><h2 className="mt-2 text-xl font-semibold text-zinc-950">Role-based administration</h2><p className="mt-2 text-sm leading-6 text-zinc-500">Owners and Admins manage team access. Managers and Viewers receive smaller operational scopes.</p><Link href="/dashboard/settings/team" className="button-secondary mt-5"><Users className="h-4 w-4" />Manage team</Link></Card><Card className="p-5"><ShieldCheck className="h-5 w-5 text-zinc-500" /><p className="mono-label mt-5">Privacy & data</p><h2 className="mt-2 text-xl font-semibold text-zinc-950">Export and deletion controls</h2><p className="mt-2 text-sm leading-6 text-zinc-500">Owners can set retention, export data, and use confirmation-protected deletion actions.</p><Link href="/dashboard/settings/privacy" className="button-secondary mt-5">Privacy controls<ArrowRight className="h-4 w-4" /></Link></Card></div>
    <Card className="p-5"><div className="flex items-center justify-between"><div><p className="mono-label">Organization activity</p><h2 className="mt-2 text-xl font-semibold text-zinc-950">Administrative changes</h2></div><Activity className="h-5 w-5 text-zinc-400" /></div>{message ? <p className="mt-5 text-sm text-zinc-500">{message}</p> : <div className="mt-5 divide-y divide-zinc-200">{activity.length === 0 ? <p className="py-2 text-sm text-zinc-500">No administrative activity has been recorded yet.</p> : activity.map((item) => <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 py-4"><div><p className="text-sm font-semibold text-zinc-950">{item.event_type.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase())}</p><p className="mt-1 text-xs text-zinc-500">{item.actor_label}{item.object_label ? ` · ${item.object_label}` : ""}</p></div><span className="text-xs text-zinc-500">{new Date(item.created_at).toLocaleString()}</span></div>)}</div>}</Card>
  </div>;
}
