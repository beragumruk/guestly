import { NextResponse } from "next/server";
import { createSigningSecret } from "@/lib/integrations/crypto";
import { createWebhook, deleteWebhook, isIntegrationStoreAvailable } from "@/lib/integrations/repository";
import { IntegrationAccessError, requireIntegrationAdmin } from "@/lib/integrations/server-auth";
import { integrationEvents, type IntegrationEvent } from "@/lib/integrations/types";
import { recordActivity } from "@/lib/security/repository";

function failure(error: unknown) {
  return NextResponse.json({ ok: false, message: error instanceof Error ? error.message : "Webhook request failed." }, { status: error instanceof IntegrationAccessError ? 401 : 400 });
}

function validatedEvents(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is IntegrationEvent => typeof item === "string" && integrationEvents.includes(item as IntegrationEvent)) : [];
}

function validatedEndpoint(value: unknown) {
  if (typeof value !== "string") throw new Error("A webhook endpoint is required.");
  const url = new URL(value);
  if (url.protocol !== "https:" || ["localhost", "127.0.0.1", "::1", "0.0.0.0"].includes(url.hostname) || url.hostname.endsWith(".local")) {
    throw new Error("Webhook endpoints must use a public HTTPS URL.");
  }
  return url.toString();
}

export async function POST(request: Request) {
  try {
    const actor = await requireIntegrationAdmin();
    const { organizationId } = actor;
    if (!isIntegrationStoreAvailable()) throw new Error("Integration storage is not configured. Add Supabase service credentials and run the integration migration first.");
    const body = (await request.json()) as { endpoint?: unknown; events?: unknown };
    const events = validatedEvents(body.events);
    if (events.length === 0) throw new Error("Choose at least one webhook event.");
    const signingSecret = createSigningSecret();
    const webhook = await createWebhook({ organizationId, endpoint: validatedEndpoint(body.endpoint), enabled: true, events, signingSecret });
    await recordActivity({ organizationId, actorId: actor.userId, actorLabel: actor.email, eventType: "integration.webhook_connected", objectType: "webhook", objectLabel: webhook.endpoint });
    return NextResponse.json({ ok: true, webhook, signingSecret });
  } catch (error) {
    return failure(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const actor = await requireIntegrationAdmin();
    const { organizationId } = actor;
    if (!isIntegrationStoreAvailable()) throw new Error("Integration storage is not configured.");
    const body = (await request.json()) as { id?: unknown };
    if (typeof body.id !== "string") throw new Error("Webhook id is required.");
    await deleteWebhook(organizationId, body.id);
    await recordActivity({ organizationId, actorId: actor.userId, actorLabel: actor.email, eventType: "integration.webhook_disconnected", objectType: "webhook", objectLabel: body.id });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return failure(error);
  }
}
