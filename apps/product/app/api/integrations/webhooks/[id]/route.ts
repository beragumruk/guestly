import { NextResponse } from "next/server";
import { deleteWebhook, isIntegrationStoreAvailable, updateWebhook } from "@/lib/integrations/repository";
import { IntegrationAccessError, requireIntegrationAdmin } from "@/lib/integrations/server-auth";
import { integrationEvents, type IntegrationEvent } from "@/lib/integrations/types";

function failure(error: unknown) {
  return NextResponse.json({ ok: false, message: error instanceof Error ? error.message : "Webhook request failed." }, { status: error instanceof IntegrationAccessError ? 401 : 400 });
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { organizationId } = await requireIntegrationAdmin();
    if (!isIntegrationStoreAvailable()) throw new Error("Integration storage is not configured.");
    const { id } = await context.params;
    const body = (await request.json()) as { enabled?: unknown; events?: unknown };
    const events = Array.isArray(body.events)
      ? body.events.filter((item): item is IntegrationEvent => typeof item === "string" && integrationEvents.includes(item as IntegrationEvent))
      : undefined;
    const webhook = await updateWebhook(organizationId, id, {
      enabled: typeof body.enabled === "boolean" ? body.enabled : undefined,
      events,
    });
    if (!webhook) return NextResponse.json({ ok: false, message: "Webhook was not found." }, { status: 404 });
    return NextResponse.json({ ok: true, webhook });
  } catch (error) {
    return failure(error);
  }
}

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { organizationId } = await requireIntegrationAdmin();
    if (!isIntegrationStoreAvailable()) throw new Error("Integration storage is not configured.");
    const { id } = await context.params;
    await deleteWebhook(organizationId, id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return failure(error);
  }
}
