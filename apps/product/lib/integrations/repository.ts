import { encryptSecret } from "./crypto";
import type {
  EmailIntegrationConfig,
  IntegrationConnection,
  IntegrationEvent,
  IntegrationProvider,
  IntegrationStatus,
  SlackIntegrationConfig,
  WebhookDelivery,
  WebhookEndpoint,
} from "./types";
import type { Feedback, FeedbackLocation } from "@/lib/types";

type DatabaseConnection = {
  id: string;
  organization_id: string;
  provider: IntegrationProvider;
  enabled: boolean;
  status: IntegrationStatus;
  config: EmailIntegrationConfig | SlackIntegrationConfig;
  secret_encrypted?: string | null;
  created_at: string;
  updated_at: string;
};

type DatabaseWebhook = {
  id: string;
  organization_id: string;
  endpoint: string;
  enabled: boolean;
  events: IntegrationEvent[];
  signing_secret_encrypted?: string | null;
  created_at: string;
  updated_at: string;
};

type DatabaseLocation = {
  id: string;
  organization_id: string;
  name: string;
  location_type: FeedbackLocation["locationType"];
  reference_code: string;
  public_slug: string;
  active: boolean;
  created_at: string;
};

function databaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return url && key ? { url: url.replace(/\/$/, ""), key } : null;
}

export function isIntegrationStoreAvailable() {
  return Boolean(databaseConfig());
}

async function rest<T>(path: string, init: RequestInit = {}) {
  const config = databaseConfig();
  if (!config) throw new Error("Integration storage is not configured.");
  const response = await fetch(`${config.url}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: config.key,
      Authorization: `Bearer ${config.key}`,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Integration storage request failed (${response.status}).`);
  return (await response.json()) as T;
}

function toConnection(row: DatabaseConnection): IntegrationConnection {
  return {
    id: row.id,
    organizationId: row.organization_id,
    provider: row.provider,
    enabled: row.enabled,
    status: row.status,
    config: row.config,
    secret: row.secret_encrypted || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toWebhook(row: DatabaseWebhook): WebhookEndpoint {
  return {
    id: row.id,
    organizationId: row.organization_id,
    endpoint: row.endpoint,
    enabled: row.enabled,
    events: row.events,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listConnections(organizationId: string) {
  const rows = await rest<DatabaseConnection[]>(`organization_integrations?organization_id=eq.${encodeURIComponent(organizationId)}&select=*`);
  return rows.map(toConnection);
}

export async function getConnection(organizationId: string, provider: IntegrationProvider) {
  const rows = await rest<DatabaseConnection[]>(
    `organization_integrations?organization_id=eq.${encodeURIComponent(organizationId)}&provider=eq.${provider}&select=*&limit=1`,
  );
  return rows[0] ? toConnection(rows[0]) : null;
}

export async function saveConnection(input: {
  organizationId: string;
  provider: IntegrationProvider;
  enabled: boolean;
  status: IntegrationStatus;
  config: EmailIntegrationConfig | SlackIntegrationConfig;
  secret?: string | null;
}) {
  const existing = await getConnection(input.organizationId, input.provider);
  const secretEncrypted = input.secret === undefined ? existing?.secret || null : input.secret ? await encryptSecret(input.secret) : null;
  const row = {
    id: existing?.id || crypto.randomUUID(),
    organization_id: input.organizationId,
    provider: input.provider,
    enabled: input.enabled,
    status: input.status,
    config: input.config,
    secret_encrypted: secretEncrypted,
    updated_at: new Date().toISOString(),
  };
  const rows = await rest<DatabaseConnection[]>("organization_integrations?on_conflict=organization_id,provider", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=representation" },
    body: JSON.stringify(row),
  });
  return toConnection(rows[0]);
}

export async function listWebhooks(organizationId: string) {
  const rows = await rest<DatabaseWebhook[]>(`integration_webhooks?organization_id=eq.${encodeURIComponent(organizationId)}&select=*&order=created_at.desc`);
  return rows.map(toWebhook);
}

export async function getWebhookWithSecret(organizationId: string, id: string) {
  const rows = await rest<DatabaseWebhook[]>(
    `integration_webhooks?organization_id=eq.${encodeURIComponent(organizationId)}&id=eq.${encodeURIComponent(id)}&select=*&limit=1`,
  );
  return rows[0] || null;
}

export async function createWebhook(input: { organizationId: string; endpoint: string; enabled: boolean; events: IntegrationEvent[]; signingSecret: string }) {
  const row = {
    id: crypto.randomUUID(),
    organization_id: input.organizationId,
    endpoint: input.endpoint,
    enabled: input.enabled,
    events: input.events,
    signing_secret_encrypted: await encryptSecret(input.signingSecret),
  };
  const rows = await rest<DatabaseWebhook[]>("integration_webhooks", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(row),
  });
  return toWebhook(rows[0]);
}

export async function updateWebhook(organizationId: string, id: string, patch: Partial<Pick<WebhookEndpoint, "endpoint" | "enabled" | "events">>) {
  const rows = await rest<DatabaseWebhook[]>(
    `integration_webhooks?organization_id=eq.${encodeURIComponent(organizationId)}&id=eq.${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({ ...patch, updated_at: new Date().toISOString() }),
    },
  );
  return rows[0] ? toWebhook(rows[0]) : null;
}

export async function deleteWebhook(organizationId: string, id: string) {
  await rest(`integration_webhooks?organization_id=eq.${encodeURIComponent(organizationId)}&id=eq.${encodeURIComponent(id)}`, { method: "DELETE" });
}

export async function recordWebhookDelivery(input: Omit<WebhookDelivery, "id">) {
  await rest("integration_webhook_deliveries", {
    method: "POST",
    body: JSON.stringify({
      id: crypto.randomUUID(),
      organization_id: input.organizationId,
      webhook_id: input.webhookId,
      event: input.event,
      status_code: input.statusCode || null,
      success: input.success,
      error: input.error || null,
      attempted_at: input.attemptedAt,
    }),
  });
}

function toLocation(row: DatabaseLocation): FeedbackLocation {
  return {
    id: row.id,
    organizationId: row.organization_id,
    name: row.name,
    locationType: row.location_type,
    referenceCode: row.reference_code,
    publicSlug: row.public_slug,
    active: row.active,
    createdAt: row.created_at,
  };
}

export async function getPublicLocation(publicSlug: string) {
  const rows = await rest<DatabaseLocation[]>(`feedback_locations?public_slug=eq.${encodeURIComponent(publicSlug)}&active=is.true&select=*&limit=1`);
  return rows[0] ? toLocation(rows[0]) : null;
}

export async function insertFeedback(feedback: Feedback) {
  await rest("feedback", {
    method: "POST",
    body: JSON.stringify({
      id: feedback.id,
      organization_id: feedback.organizationId,
      location_id: feedback.locationId,
      rating: feedback.rating || null,
      message: feedback.message,
      guest_name: feedback.guestName || null,
      guest_email: feedback.guestEmail || null,
      visit_context: feedback.visitContext || null,
      sentiment: feedback.sentiment,
      urgency: feedback.urgency,
      priority: feedback.priority,
      department: feedback.department,
      issue_type: feedback.issueType,
      ai_summary: feedback.aiSummary,
      suggested_action: feedback.suggestedAction,
      risk_flags: feedback.riskFlags || [],
      status: feedback.status,
      created_at: feedback.createdAt,
      updated_at: feedback.updatedAt,
    }),
  });
}

export async function listDailyEmailConnections() {
  const rows = await rest<DatabaseConnection[]>("organization_integrations?provider=eq.email&enabled=is.true&status=eq.connected&select=*");
  return rows.map(toConnection).filter((connection) => (connection.config as EmailIntegrationConfig).rules.dailySummary);
}

export async function listDailyFeedback(organizationId: string, since: string) {
  return rest<Array<{ id: string; message: string; priority: string; issue_type: string; sentiment: string; created_at: string; location: { name: string } | null }>>(
    `feedback?organization_id=eq.${encodeURIComponent(organizationId)}&created_at=gte.${encodeURIComponent(since)}&select=id,message,priority,issue_type,sentiment,created_at,location:feedback_locations(name)&order=created_at.desc`,
  );
}
