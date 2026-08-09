"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { Mail, RefreshCw, ShieldCheck, UserPlus, Users } from "lucide-react";
import { Button, Card, FormField, Input, PageHeader, Select } from "@/components/ui";
import type { TeamMember, UserRole } from "@/lib/types";

type Invitation = { id: string; email: string; role: UserRole; location_ids: string[]; expires_at: string; created_at: string };
type Location = { id: string; name: string };

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [available, setAvailable] = useState(true);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Exclude<UserRole, "owner">>("manager");
  const [locationIds, setLocationIds] = useState<string[]>([]);
  const [editingLocationsFor, setEditingLocationsFor] = useState<string | null>(null);
  const [memberLocationIds, setMemberLocationIds] = useState<string[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    const response = await fetch("/api/team", { cache: "no-store" });
    const body = (await response.json()) as { ok?: boolean; message?: string; members?: TeamMember[]; invitations?: Invitation[]; locations?: Location[] };
    if (!response.ok || !body.ok) {
      setAvailable(false);
      setMessage(body.message || "Team administration is unavailable until production storage is configured.");
      return;
    }
    setMembers(body.members || []);
    setInvitations(body.invitations || []);
    setLocations(body.locations || []);
  }

  useEffect(() => { void load(); }, []);

  function toggleLocation(id: string, checked: boolean) {
    setLocationIds((current) => checked ? [...new Set([...current, id])] : current.filter((item) => item !== id));
  }

  async function invite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setMessage(null);
    try {
      const response = await fetch("/api/team", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, role, locationIds }) });
      const body = (await response.json()) as { ok?: boolean; message?: string; delivered?: boolean };
      if (!response.ok || !body.ok) throw new Error(body.message || "Invitation could not be created.");
      setEmail(""); setLocationIds([]);
      setMessage(body.delivered ? "Invitation sent." : "Invitation recorded. Configure Resend to deliver the invite email.");
      await load();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Invitation could not be created."); } finally { setBusy(false); }
  }

  async function changeRole(member: TeamMember, nextRole: Exclude<UserRole, "owner">) {
    const response = await fetch("/api/team", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ memberId: member.id, role: nextRole, locationIds: member.locationIds }) });
    const body = (await response.json()) as { ok?: boolean; message?: string };
    setMessage(body.ok ? "Member role updated." : body.message || "Role update failed.");
    if (body.ok) await load();
  }

  async function revoke(member: TeamMember) {
    if (!window.confirm(`Revoke ${member.email}'s access?`)) return;
    const response = await fetch("/api/team", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ memberId: member.id }) });
    const body = (await response.json()) as { ok?: boolean; message?: string };
    setMessage(body.ok ? "Access revoked." : body.message || "Access could not be revoked.");
    if (body.ok) await load();
  }

  async function saveMemberLocations(member: TeamMember) {
    setBusy(true);
    try {
      const response = await fetch("/api/team", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ memberId: member.id, role: member.role, locationIds: memberLocationIds }) });
      const body = (await response.json()) as { ok?: boolean; message?: string };
      setMessage(body.ok ? "Location access updated." : body.message || "Location access could not be updated.");
      if (body.ok) { setEditingLocationsFor(null); await load(); }
    } finally { setBusy(false); }
  }

  async function resend(invite: Invitation) {
    setBusy(true);
    try {
      const response = await fetch("/api/team", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: invite.email, role: invite.role, locationIds: invite.location_ids }) });
      const body = (await response.json()) as { ok?: boolean; message?: string; delivered?: boolean };
      setMessage(body.ok ? (body.delivered ? "Invitation resent." : "Invitation refreshed. Configure Resend to deliver it.") : body.message || "Invitation could not be resent.");
      if (body.ok) await load();
    } finally { setBusy(false); }
  }

  return <div className="space-y-6">
    <PageHeader eyebrow="Settings / team" title="Manage access across your organization." text="Owners and Admins can invite teammates, set organization roles, and scope operational access to locations." action={<Link href="/dashboard/settings/security" className="button-secondary"><ShieldCheck className="h-4 w-4" />Security</Link>} />
    {message && <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-700">{message}</div>}
    {!available ? <Card className="p-6"><p className="mono-label">Team administration</p><h2 className="mt-2 text-xl font-semibold text-zinc-950">Production storage required</h2><p className="mt-3 text-sm leading-6 text-zinc-500">Guestly will not display placeholder teammates. Apply the security administration migration and configure server storage to manage real organization members and invitations.</p></Card> : <>
      <div className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
        <Card className="p-5"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl border border-zinc-200 bg-zinc-50"><UserPlus className="h-4 w-4" /></span><div><p className="mono-label">Invite member</p><h2 className="mt-1 text-xl font-semibold text-zinc-950">Give the right access.</h2></div></div><form className="mt-5 grid gap-4" onSubmit={invite}><FormField label="Email"><Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></FormField><FormField label="Role"><Select value={role} onChange={(event) => setRole(event.target.value as Exclude<UserRole, "owner">)}><option value="admin">Admin</option><option value="manager">Manager</option><option value="viewer">Viewer</option></Select></FormField><div><p className="field-label">Permitted locations</p><div className="mt-2 grid gap-2">{locations.map((location) => <label key={location.id} className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-700"><input type="checkbox" checked={locationIds.includes(location.id)} onChange={(event) => toggleLocation(location.id, event.target.checked)} />{location.name}</label>)}</div></div><Button type="submit" disabled={busy}><Mail className="h-4 w-4" />{busy ? "Sending..." : "Send invitation"}</Button></form></Card>
        <Card className="p-5"><div className="flex items-center justify-between"><div><p className="mono-label">Organization members</p><h2 className="mt-2 text-xl font-semibold text-zinc-950">Active access</h2></div><Users className="h-5 w-5 text-zinc-400" /></div><div className="mt-5 divide-y divide-zinc-200">{members.map((member) => <div key={member.id} className="py-4"><div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"><div><p className="text-sm font-semibold text-zinc-950">{member.name}</p><p className="mt-1 text-xs text-zinc-500">{member.email} · {member.status === "active" ? "Active" : "Access revoked"}</p></div><div className="flex flex-wrap items-center gap-2">{member.role === "owner" ? <span className="rounded-full border border-zinc-300 bg-zinc-50 px-2.5 py-1 text-xs text-zinc-600">Owner</span> : <Select value={member.role} onChange={(event) => void changeRole(member, event.target.value as Exclude<UserRole, "owner">)}><option value="admin">Admin</option><option value="manager">Manager</option><option value="viewer">Viewer</option></Select>} {member.role !== "owner" && member.status === "active" && <><Button variant="secondary" onClick={() => { setEditingLocationsFor(member.id); setMemberLocationIds(member.locationIds); }}>Locations</Button><Button variant="ghost" onClick={() => void revoke(member)}>Revoke</Button></>}</div></div>{editingLocationsFor === member.id && <div className="mt-4 rounded-xl border border-zinc-200 bg-zinc-50 p-3"><p className="text-xs font-medium text-zinc-600">Permitted locations</p><div className="mt-3 grid gap-2 sm:grid-cols-2">{locations.map((location) => <label key={location.id} className="flex items-center gap-2 text-sm text-zinc-700"><input type="checkbox" checked={memberLocationIds.includes(location.id)} onChange={(event) => setMemberLocationIds((current) => event.target.checked ? [...new Set([...current, location.id])] : current.filter((id) => id !== location.id))} />{location.name}</label>)}</div><div className="mt-4 flex gap-2"><Button variant="secondary" onClick={() => void saveMemberLocations(member)} disabled={busy}>Save locations</Button><Button variant="ghost" onClick={() => setEditingLocationsFor(null)}>Cancel</Button></div></div>}</div>)}</div></Card>
      </div>
      <Card className="p-5"><div className="flex items-center justify-between"><div><p className="mono-label">Pending invitations</p><h2 className="mt-2 text-xl font-semibold text-zinc-950">Awaiting acceptance</h2></div><RefreshCw className="h-5 w-5 text-zinc-400" /></div><div className="mt-5 divide-y divide-zinc-200">{invitations.length === 0 ? <p className="py-2 text-sm text-zinc-500">No invitations are pending.</p> : invitations.map((invite) => <div key={invite.id} className="flex flex-wrap items-center justify-between gap-3 py-4"><div><p className="text-sm font-semibold text-zinc-950">{invite.email}</p><p className="mt-1 text-xs text-zinc-500">Invitation pending · {invite.role} · expires {new Date(invite.expires_at).toLocaleDateString()}</p></div><Button variant="secondary" onClick={() => void resend(invite)} disabled={busy}><RefreshCw className="h-4 w-4" />Resend</Button></div>)}</div></Card>
    </>}
  </div>;
}
