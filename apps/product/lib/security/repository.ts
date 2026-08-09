import { createHash } from "node:crypto";
import type { FeedbackLocation, TeamMember, UserRole } from "@/lib/types";

type ProfileRow = { id: string; organization_id: string; email: string; name: string; role: UserRole; status: "active" | "access_revoked"; created_at: string };
type InvitationRow = { id: string; organization_id: string; email: string; role: UserRole; location_ids: string[]; token_hash: string; expires_at: string; created_at: string; revoked_at?: string | null };

function config() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return url && key ? { url: url.replace(/\/$/, ""), key } : null;
}

export function isSecurityStoreAvailable() {
  return Boolean(config());
}

async function rest<T>(path: string, init: RequestInit = {}) {
  const database = config();
  if (!database) throw new Error("Security administration storage is not configured.");
  const response = await fetch(`${database.url}/rest/v1/${path}`, {
    ...init,
    headers: { apikey: database.key, Authorization: `Bearer ${database.key}`, "Content-Type": "application/json", ...(init.headers || {}) },
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Security storage request failed (${response.status}).`);
  return (await response.json()) as T;
}

function member(row: ProfileRow, locationIds: string[]): TeamMember {
  return { id: row.id, organizationId: row.organization_id, email: row.email, name: row.name, role: row.role, status: row.status, locationIds, createdAt: row.created_at };
}

export async function listTeam(organizationId: string) {
  const profiles = await rest<ProfileRow[]>(`profiles?organization_id=eq.${encodeURIComponent(organizationId)}&select=*&order=created_at.asc`);
  const assignments = await rest<Array<{ profile_id: string; location_id: string }>>(`profile_location_access?select=profile_id,location_id`);
  const profileIds = new Set(profiles.map((profile) => profile.id));
  return profiles.map((profile) => member(profile, assignments.filter((item) => profileIds.has(item.profile_id) && item.profile_id === profile.id).map((item) => item.location_id)));
}

export async function listInvitations(organizationId: string) {
  return rest<InvitationRow[]>(`team_invitations?organization_id=eq.${encodeURIComponent(organizationId)}&accepted_at=is.null&revoked_at=is.null&select=*&order=created_at.desc`);
}

export async function getLocations(organizationId: string) {
  const rows = await rest<Array<{ id: string; organization_id: string; name: string; location_type: FeedbackLocation["locationType"]; reference_code: string; public_slug: string; active: boolean; created_at: string }>>(
    `feedback_locations?organization_id=eq.${encodeURIComponent(organizationId)}&select=*&order=name.asc`,
  );
  return rows.map((row) => ({ id: row.id, organizationId: row.organization_id, name: row.name, locationType: row.location_type, referenceCode: row.reference_code, publicSlug: row.public_slug, active: row.active, createdAt: row.created_at }));
}

export async function createInvitation(input: { organizationId: string; email: string; role: Exclude<UserRole, "owner">; locationIds: string[]; invitedBy: string; rawToken: string }) {
  const rows = await rest<InvitationRow[]>("team_invitations?on_conflict=organization_id,email", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=representation" },
    body: JSON.stringify({
      id: crypto.randomUUID(), organization_id: input.organizationId, email: input.email.toLowerCase(), role: input.role, location_ids: input.locationIds,
      token_hash: createHash("sha256").update(input.rawToken).digest("hex"), invited_by: input.invitedBy,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), updated_at: new Date().toISOString(),
    }),
  });
  return rows[0];
}

export async function updateMemberRole(organizationId: string, memberId: string, role: Exclude<UserRole, "owner">) {
  const rows = await rest<ProfileRow[]>(`profiles?organization_id=eq.${encodeURIComponent(organizationId)}&id=eq.${encodeURIComponent(memberId)}`, {
    method: "PATCH", headers: { Prefer: "return=representation" }, body: JSON.stringify({ role }),
  });
  return rows[0] || null;
}

export async function setMemberLocations(memberId: string, locationIds: string[]) {
  await rest(`profile_location_access?profile_id=eq.${encodeURIComponent(memberId)}`, { method: "DELETE" });
  if (locationIds.length === 0) return;
  await rest("profile_location_access", { method: "POST", body: JSON.stringify(locationIds.map((locationId) => ({ profile_id: memberId, location_id: locationId }))) });
}

export async function revokeMember(organizationId: string, memberId: string) {
  const rows = await rest<ProfileRow[]>(`profiles?organization_id=eq.${encodeURIComponent(organizationId)}&id=eq.${encodeURIComponent(memberId)}`, {
    method: "PATCH", headers: { Prefer: "return=representation" }, body: JSON.stringify({ status: "access_revoked", revoked_at: new Date().toISOString() }),
  });
  return rows[0] || null;
}

export async function recordActivity(input: { organizationId: string; actorId?: string; actorLabel: string; eventType: string; objectType?: string; objectLabel?: string }) {
  await rest("organization_activity_log", { method: "POST", body: JSON.stringify({ id: crypto.randomUUID(), organization_id: input.organizationId, actor_id: input.actorId || null, actor_label: input.actorLabel, event_type: input.eventType, object_type: input.objectType || null, object_label: input.objectLabel || null }) });
}

export async function listActivity(organizationId: string) {
  return rest<Array<{ id: string; actor_label: string; event_type: string; object_type?: string | null; object_label?: string | null; created_at: string }>>(
    `organization_activity_log?organization_id=eq.${encodeURIComponent(organizationId)}&select=*&order=created_at.desc&limit=100`,
  );
}

export async function getDataPreference(organizationId: string) {
  const rows = await rest<Array<{ retention_days: number | null; updated_at: string }>>(`organization_data_preferences?organization_id=eq.${encodeURIComponent(organizationId)}&select=*&limit=1`);
  return rows[0] || null;
}

export async function saveDataPreference(organizationId: string, retentionDays: number | null, userId: string) {
  const rows = await rest<Array<{ retention_days: number | null; updated_at: string }>>("organization_data_preferences?on_conflict=organization_id", {
    method: "POST", headers: { Prefer: "resolution=merge-duplicates,return=representation" }, body: JSON.stringify({ organization_id: organizationId, retention_days: retentionDays, updated_by: userId, updated_at: new Date().toISOString() }),
  });
  return rows[0];
}

export async function deleteFeedbackRecord(organizationId: string, id: string) {
  await rest(`feedback?organization_id=eq.${encodeURIComponent(organizationId)}&id=eq.${encodeURIComponent(id)}`, { method: "DELETE" });
}

export async function deleteOrganization(organizationId: string) {
  await rest(`organizations?id=eq.${encodeURIComponent(organizationId)}`, { method: "DELETE" });
}

export async function purgeExpiredFeedback(organizationId: string, retentionDays: number) {
  const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000).toISOString();
  const rows = await rest<Array<{ id: string }>>(
    `feedback?organization_id=eq.${encodeURIComponent(organizationId)}&created_at=lt.${encodeURIComponent(cutoff)}&select=id`,
  );
  if (rows.length === 0) return 0;
  await rest(`feedback?organization_id=eq.${encodeURIComponent(organizationId)}&created_at=lt.${encodeURIComponent(cutoff)}`, { method: "DELETE" });
  return rows.length;
}
