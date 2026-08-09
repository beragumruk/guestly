import { NextResponse } from "next/server";
import { requirePermission, AccessError } from "@/lib/security/server-auth";
import { deleteFeedbackRecord, deleteOrganization, getDataPreference, purgeExpiredFeedback, recordActivity, saveDataPreference } from "@/lib/security/repository";

function failure(error: unknown) {
  return NextResponse.json({ ok: false, message: error instanceof Error ? error.message : "Privacy request failed." }, { status: error instanceof AccessError ? 403 : 400 });
}

export async function GET() {
  try {
    const actor = await requirePermission("manage_privacy");
    return NextResponse.json({ ok: true, organizationId: actor.organizationId, preference: await getDataPreference(actor.organizationId) });
  } catch (error) {
    return failure(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const actor = await requirePermission("manage_privacy");
    const body = (await request.json()) as { retentionDays?: unknown };
    const retentionDays = body.retentionDays === null ? null : typeof body.retentionDays === "number" && Number.isInteger(body.retentionDays) && body.retentionDays >= 30 && body.retentionDays <= 3650 ? body.retentionDays : undefined;
    if (retentionDays === undefined) throw new Error("Choose a retention period between 30 and 3650 days, or clear the setting.");
    const preference = await saveDataPreference(actor.organizationId, retentionDays, actor.userId);
    await recordActivity({ organizationId: actor.organizationId, actorId: actor.userId, actorLabel: actor.email, eventType: "privacy.retention_updated", objectType: "retention", objectLabel: retentionDays ? `${retentionDays} days` : "No automatic deletion" });
    return NextResponse.json({ ok: true, preference });
  } catch (error) {
    return failure(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const actor = await requirePermission("manage_privacy");
    if (actor.role !== "owner") throw new AccessError("Only an Owner can delete organization data.");
    const body = (await request.json()) as { confirmation?: unknown; feedbackId?: unknown; deleteOrganization?: unknown; purgeExpired?: unknown };
    if (body.deleteOrganization === true) {
      if (body.confirmation !== actor.organizationId) throw new Error("Confirm deletion with the organization id.");
      await recordActivity({ organizationId: actor.organizationId, actorId: actor.userId, actorLabel: actor.email, eventType: "organization.deleted", objectType: "organization", objectLabel: actor.organizationId });
      await deleteOrganization(actor.organizationId);
      return NextResponse.json({ ok: true, deleted: "organization" });
    }
    if (body.purgeExpired === true) {
      if (body.confirmation !== "PURGE") throw new Error("Confirm retention purge by typing PURGE.");
      const preference = await getDataPreference(actor.organizationId);
      if (!preference?.retention_days) throw new Error("Set a retention period before purging expired feedback.");
      const deleted = await purgeExpiredFeedback(actor.organizationId, preference.retention_days);
      await recordActivity({ organizationId: actor.organizationId, actorId: actor.userId, actorLabel: actor.email, eventType: "privacy.retention_purged", objectType: "feedback", objectLabel: `${deleted} records` });
      return NextResponse.json({ ok: true, deleted: "expired_feedback", count: deleted });
    }
    if (typeof body.feedbackId !== "string" || body.confirmation !== "DELETE") throw new Error("Confirm feedback deletion by typing DELETE.");
    await deleteFeedbackRecord(actor.organizationId, body.feedbackId);
    await recordActivity({ organizationId: actor.organizationId, actorId: actor.userId, actorLabel: actor.email, eventType: "feedback.deleted", objectType: "feedback", objectLabel: body.feedbackId });
    return NextResponse.json({ ok: true, deleted: "feedback" });
  } catch (error) {
    return failure(error);
  }
}
