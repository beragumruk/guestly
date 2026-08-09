import { NextResponse } from "next/server";
import { requirePermission, AccessError } from "@/lib/security/server-auth";
import { listActivity, recordActivity } from "@/lib/security/repository";

export async function GET() {
  try {
    const actor = await requirePermission("manage_team");
    return NextResponse.json({ ok: true, activity: await listActivity(actor.organizationId) });
  } catch (error) {
    return NextResponse.json({ ok: false, message: error instanceof Error ? error.message : "Unable to load activity." }, { status: error instanceof AccessError ? 403 : 400 });
  }
}

export async function POST(request: Request) {
  try {
    const actor = await requirePermission("manage_organization");
    const body = (await request.json()) as { eventType?: unknown; objectLabel?: unknown };
    const eventType = body.eventType;
    if (eventType !== "location.created" && eventType !== "location.updated" && eventType !== "organization.settings_changed") {
      throw new Error("This activity event is not supported.");
    }
    const objectLabel = typeof body.objectLabel === "string" ? body.objectLabel.slice(0, 120) : undefined;
    await recordActivity({ organizationId: actor.organizationId, actorId: actor.userId, actorLabel: actor.email, eventType, objectType: eventType.startsWith("location") ? "location" : "organization", objectLabel });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ ok: false, message: error instanceof Error ? error.message : "Unable to record activity." }, { status: error instanceof AccessError ? 403 : 400 });
  }
}
