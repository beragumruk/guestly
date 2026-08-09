import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { requirePermission, AccessError } from "@/lib/security/server-auth";
import { createInvitation, getLocations, listInvitations, listTeam, recordActivity, revokeMember, setMemberLocations, updateMemberRole } from "@/lib/security/repository";
import type { UserRole } from "@/lib/types";

function errorResponse(error: unknown) {
  return NextResponse.json({ ok: false, message: error instanceof Error ? error.message : "Team request failed." }, { status: error instanceof AccessError ? 403 : 400 });
}

function inviteRole(value: unknown): Exclude<UserRole, "owner"> {
  if (value === "admin" || value === "manager" || value === "viewer") return value;
  throw new Error("Choose an Admin, Manager, or Viewer role.");
}

async function sendInvitationEmail(input: { email: string; token: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) return false;
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://app.getguestly.com").replace(/\/$/, "");
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: input.email, subject: "You have been invited to Guestly", text: `You have been invited to join a Guestly workspace. Sign in or create your organization account, then use this invite token: ${input.token}\n\n${appUrl}/login?invite=${encodeURIComponent(input.token)}` }),
  });
  if (!response.ok) throw new Error(`Invitation email could not be delivered (${response.status}).`);
  return true;
}

export async function GET() {
  try {
    const actor = await requirePermission("manage_team");
    const [members, invitations, locations] = await Promise.all([listTeam(actor.organizationId), listInvitations(actor.organizationId), getLocations(actor.organizationId)]);
    return NextResponse.json({ ok: true, members, invitations: invitations.map((invitation) => ({ id: invitation.id, email: invitation.email, role: invitation.role, location_ids: invitation.location_ids, expires_at: invitation.expires_at, created_at: invitation.created_at })), locations });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const actor = await requirePermission("manage_team");
    const body = (await request.json()) as { email?: unknown; role?: unknown; locationIds?: unknown };
    const email = typeof body.email === "string" && /^\S+@\S+\.\S+$/.test(body.email.trim()) ? body.email.trim().toLowerCase() : "";
    if (!email) throw new Error("A valid team email is required.");
    const locations = await getLocations(actor.organizationId);
    const locationIds = Array.isArray(body.locationIds) ? body.locationIds.filter((id): id is string => typeof id === "string" && locations.some((location) => location.id === id)) : [];
    const token = randomBytes(32).toString("base64url");
    const invitation = await createInvitation({ organizationId: actor.organizationId, email, role: inviteRole(body.role), locationIds, invitedBy: actor.userId, rawToken: token });
    const delivered = await sendInvitationEmail({ email, token });
    await recordActivity({ organizationId: actor.organizationId, actorId: actor.userId, actorLabel: actor.email, eventType: "user.invited", objectType: "invitation", objectLabel: email });
    return NextResponse.json({ ok: true, invitation: { ...invitation, token_hash: undefined }, delivered });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const actor = await requirePermission("manage_team");
    const body = (await request.json()) as { memberId?: unknown; role?: unknown; locationIds?: unknown };
    if (typeof body.memberId !== "string") throw new Error("Member id is required.");
    if (body.memberId === actor.userId && body.role && body.role !== actor.role) throw new Error("You cannot change your own role.");
    const role = inviteRole(body.role);
    const updated = await updateMemberRole(actor.organizationId, body.memberId, role);
    if (!updated) throw new Error("Member was not found.");
    const locations = await getLocations(actor.organizationId);
    const locationIds = Array.isArray(body.locationIds) ? body.locationIds.filter((id): id is string => typeof id === "string" && locations.some((location) => location.id === id)) : [];
    await setMemberLocations(updated.id, locationIds);
    await recordActivity({ organizationId: actor.organizationId, actorId: actor.userId, actorLabel: actor.email, eventType: "user.role_changed", objectType: "user", objectLabel: updated.email });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const actor = await requirePermission("manage_team");
    const body = (await request.json()) as { memberId?: unknown };
    if (typeof body.memberId !== "string") throw new Error("Member id is required.");
    if (body.memberId === actor.userId) throw new Error("You cannot revoke your own access.");
    const member = await revokeMember(actor.organizationId, body.memberId);
    if (!member) throw new Error("Member was not found.");
    await recordActivity({ organizationId: actor.organizationId, actorId: actor.userId, actorLabel: actor.email, eventType: "user.revoked", objectType: "user", objectLabel: member.email });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}
