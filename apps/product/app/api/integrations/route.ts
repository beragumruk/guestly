import { NextResponse } from "next/server";
import { isIntegrationStoreAvailable, listConnections, listWebhooks, saveConnection } from "@/lib/integrations/repository";
import { IntegrationAccessError, requireIntegrationAdmin } from "@/lib/integrations/server-auth";
import type { EmailIntegrationConfig, EmailRules } from "@/lib/integrations/types";
import { recordActivity } from "@/lib/security/repository";

const defaultEmailRules: EmailRules = {
  allNewFeedback: false,
  urgentFeedback: true,
  negativeFeedback: false,
  selectedCategories: [],
  dailySummary: false,
};

function failure(error: unknown) {
  const status = error instanceof IntegrationAccessError ? 401 : 400;
  return NextResponse.json({ ok: false, message: error instanceof Error ? error.message : "Integration request failed." }, { status });
}

function publicIntegration(integration: Awaited<ReturnType<typeof listConnections>>[number] | null) {
  if (!integration) return null;
  const safeIntegration = { ...integration };
  delete safeIntegration.secret;
  return safeIntegration;
}

export async function GET() {
  try {
    const actor = await requireIntegrationAdmin();
    const { organizationId } = actor;
    const storageAvailable = isIntegrationStoreAvailable();
    if (!storageAvailable) {
      return NextResponse.json({
        ok: true,
        storageAvailable: false,
        integrations: { email: null, slack: null },
        webhooks: [],
        slackOAuthAvailable: Boolean(process.env.SLACK_CLIENT_ID && process.env.SLACK_CLIENT_SECRET && process.env.SLACK_REDIRECT_URI),
      });
    }
    const [connections, webhooks] = await Promise.all([listConnections(organizationId), listWebhooks(organizationId)]);
    return NextResponse.json({
      ok: true,
      storageAvailable: true,
      integrations: {
        email: publicIntegration(connections.find((item) => item.provider === "email") || null),
        slack: publicIntegration(connections.find((item) => item.provider === "slack") || null),
      },
      webhooks,
      slackOAuthAvailable: Boolean(process.env.SLACK_CLIENT_ID && process.env.SLACK_CLIENT_SECRET && process.env.SLACK_REDIRECT_URI),
    });
  } catch (error) {
    return failure(error);
  }
}

export async function PUT(request: Request) {
  try {
    const actor = await requireIntegrationAdmin();
    const { organizationId } = actor;
    if (!isIntegrationStoreAvailable()) throw new Error("Integration storage is not configured. Add Supabase service credentials and run the integration migration first.");
    const body = (await request.json()) as { recipients?: unknown; enabled?: unknown; rules?: Partial<EmailRules> };
    const recipients = Array.isArray(body.recipients)
      ? body.recipients.filter((value): value is string => typeof value === "string" && /^\S+@\S+\.\S+$/.test(value.trim())).map((value) => value.trim().toLowerCase())
      : [];
    const config: EmailIntegrationConfig = {
      recipients,
      rules: { ...defaultEmailRules, ...(body.rules || {}) },
    };
    const emailProviderConfigured = Boolean(process.env.RESEND_API_KEY && process.env.RESEND_FROM_EMAIL);
    const enabled = Boolean(body.enabled) && recipients.length > 0 && emailProviderConfigured;
    const integration = await saveConnection({
      organizationId,
      provider: "email",
      enabled,
      status: enabled ? "connected" : recipients.length > 0 ? "needs_attention" : "not_connected",
      config,
    });
    await recordActivity({ organizationId, actorId: actor.userId, actorLabel: actor.email, eventType: enabled ? "integration.email_connected" : "integration.email_disconnected", objectType: "integration", objectLabel: "Email notifications" });
    return NextResponse.json({
      ok: true,
      integration: publicIntegration(integration),
      providerConfigured: emailProviderConfigured,
      message: enabled ? "Email notifications are active." : emailProviderConfigured ? "Add a recipient and enable delivery to activate email notifications." : "Email settings saved. Add RESEND_API_KEY and RESEND_FROM_EMAIL to activate delivery.",
    });
  } catch (error) {
    return failure(error);
  }
}
