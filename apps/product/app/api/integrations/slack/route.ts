import { NextResponse } from "next/server";
import { getConnection, isIntegrationStoreAvailable, saveConnection } from "@/lib/integrations/repository";
import { IntegrationAccessError, requireIntegrationAdmin } from "@/lib/integrations/server-auth";
import { integrationEvents, type IntegrationEvent, type SlackIntegrationConfig } from "@/lib/integrations/types";

export async function PUT(request: Request) {
  try {
    const { organizationId } = await requireIntegrationAdmin();
    if (!isIntegrationStoreAvailable()) throw new Error("Integration storage is not configured.");
    const existing = await getConnection(organizationId, "slack");
    if (!existing?.secret) throw new Error("Connect Slack before configuring a channel.");
    const body = (await request.json()) as { channelId?: unknown; channelName?: unknown; enabled?: unknown; events?: unknown };
    const events = Array.isArray(body.events)
      ? body.events.filter((item): item is IntegrationEvent => typeof item === "string" && integrationEvents.includes(item as IntegrationEvent))
      : [];
    const channelId = typeof body.channelId === "string" ? body.channelId.trim() : "";
    const enabled = Boolean(body.enabled) && Boolean(channelId) && events.length > 0;
    const config: SlackIntegrationConfig = { channelId, channelName: typeof body.channelName === "string" ? body.channelName.trim() : "", events };
    const integration = await saveConnection({ organizationId, provider: "slack", enabled, status: enabled ? "connected" : "needs_attention", config });
    const safeIntegration = { ...integration };
    delete safeIntegration.secret;
    return NextResponse.json({ ok: true, integration: safeIntegration, message: enabled ? "Slack notifications are active." : "Select a channel and at least one event to activate Slack notifications." });
  } catch (error) {
    return NextResponse.json({ ok: false, message: error instanceof Error ? error.message : "Unable to save Slack settings." }, { status: error instanceof IntegrationAccessError ? 401 : 400 });
  }
}
