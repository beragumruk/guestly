import { createHmac } from "node:crypto";
import { decryptSecret } from "./crypto";
import { getConnection, getWebhookWithSecret, listWebhooks, recordWebhookDelivery } from "./repository";
import type { DispatchInput, EmailIntegrationConfig, IntegrationEvent, SlackIntegrationConfig } from "./types";
import { isUrgentFeedback } from "./types";

function appUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL || "https://app.getguestly.com").replace(/\/$/, "");
}

function shouldNotifyEmail(config: EmailIntegrationConfig, input: DispatchInput) {
  if (input.event === "feedback.updated") return false;
  const { feedback } = input;
  return (
    config.rules.allNewFeedback ||
    (config.rules.urgentFeedback && isUrgentFeedback(feedback)) ||
    (config.rules.negativeFeedback && feedback.sentiment === "negative") ||
    config.rules.selectedCategories.includes(feedback.issueType)
  );
}

function emailText(input: DispatchInput) {
  const { feedback, location } = input;
  return [
    `New ${isUrgentFeedback(feedback) ? "urgent " : ""}guest feedback`,
    "",
    `Location: ${location.name}`,
    `Category: ${feedback.issueType.replace(/_/g, " ")}`,
    `Sentiment: ${feedback.sentiment}`,
    `Urgency: ${feedback.urgency}`,
    "",
    `“${feedback.message}”`,
    "",
    `Review in Guestly: ${appUrl()}/dashboard/feedback?feedbackId=${encodeURIComponent(feedback.id)}`,
  ].join("\n");
}

async function deliverEmail(config: EmailIntegrationConfig, input: DispatchInput) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from || config.recipients.length === 0) return { delivered: false, reason: "Email delivery is not configured." };
  const subject = `${isUrgentFeedback(input.feedback) ? "Urgent: " : ""}Guestly feedback from ${input.location.name}`;
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: config.recipients, subject, text: emailText(input) }),
  });
  if (!response.ok) throw new Error(`Email provider rejected delivery (${response.status}).`);
  return { delivered: true };
}

export async function deliverDailyEmailSummary(input: { recipients: string[]; organizationName: string; feedback: Array<{ message: string; priority: string; issue_type: string; sentiment: string; location: { name: string } | null }> }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from || input.recipients.length === 0) throw new Error("Email delivery is not configured.");
  const urgent = input.feedback.filter((item) => item.priority === "high" || item.priority === "critical").length;
  const topLines = input.feedback.slice(0, 8).map((item) => `• ${item.location?.name || "Unknown location"}: ${item.issue_type.replace(/_/g, " ")} (${item.sentiment})`).join("\n");
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: input.recipients,
      subject: `Guestly daily summary: ${input.organizationName}`,
      text: [`Guestly daily feedback summary`, "", `${input.feedback.length} new feedback items`, `${urgent} high or critical items`, "", topLines || "No guest feedback was captured in the past 24 hours.", "", `Open Guestly: ${appUrl()}/dashboard/feedback`].join("\n"),
    }),
  });
  if (!response.ok) throw new Error(`Email provider rejected daily summary (${response.status}).`);
}

function slackBlocks(input: DispatchInput) {
  const { feedback, location } = input;
  return [
    { type: "header", text: { type: "plain_text", text: `New ${isUrgentFeedback(feedback) ? "urgent " : ""}guest feedback` } },
    {
      type: "section",
      fields: [
        { type: "mrkdwn", text: `*Location*\n${location.name}` },
        { type: "mrkdwn", text: `*Category*\n${feedback.issueType.replace(/_/g, " ")}` },
        { type: "mrkdwn", text: `*Sentiment*\n${feedback.sentiment}` },
        { type: "mrkdwn", text: `*Urgency*\n${feedback.urgency}` },
      ],
    },
    { type: "section", text: { type: "mrkdwn", text: `“${feedback.message}”` } },
    {
      type: "actions",
      elements: [{ type: "button", text: { type: "plain_text", text: "Open in Guestly" }, url: `${appUrl()}/dashboard/feedback?feedbackId=${encodeURIComponent(feedback.id)}` }],
    },
  ];
}

async function deliverSlack(config: SlackIntegrationConfig, token: string, input: DispatchInput) {
  if (!config.channelId || !config.events.includes(input.event)) return { delivered: false, reason: "No Slack channel or event rule is configured." };
  const response = await fetch("https://slack.com/api/chat.postMessage", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ channel: config.channelId, text: `New guest feedback from ${input.location.name}`, blocks: slackBlocks(input) }),
  });
  const body = (await response.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
  if (!response.ok || !body?.ok) throw new Error(`Slack delivery failed${body?.error ? `: ${body.error}` : "."}`);
  return { delivered: true };
}

function safeWebhookUrl(endpoint: string) {
  const url = new URL(endpoint);
  const blocked = ["localhost", "127.0.0.1", "::1", "0.0.0.0"];
  if (url.protocol !== "https:" || blocked.includes(url.hostname) || url.hostname.endsWith(".local")) {
    throw new Error("Webhook endpoints must use a public HTTPS URL.");
  }
  return url;
}

export function webhookPayload(input: DispatchInput) {
  const { feedback, location } = input;
  return {
    id: crypto.randomUUID(),
    event: input.event,
    occurredAt: new Date().toISOString(),
    organizationId: input.organizationId,
    feedback: {
      id: feedback.id,
      timestamp: feedback.createdAt,
      category: feedback.issueType,
      urgency: feedback.urgency,
      priority: feedback.priority,
      sentiment: feedback.sentiment,
      status: feedback.status,
      text: feedback.message,
      summary: feedback.aiSummary,
    },
    location: { id: location.id, name: location.name, type: location.locationType, referenceCode: location.referenceCode },
  };
}

export async function deliverWebhook(input: DispatchInput, webhookId: string) {
  const row = await getWebhookWithSecret(input.organizationId, webhookId);
  if (!row || !row.enabled || !row.events.includes(input.event) || !row.signing_secret_encrypted) return { delivered: false, reason: "Webhook is unavailable." };
  const endpoint = safeWebhookUrl(row.endpoint);
  const secret = await decryptSecret(row.signing_secret_encrypted);
  const payload = JSON.stringify(webhookPayload(input));
  const signature = createHmac("sha256", secret).update(payload).digest("hex");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  let recorded = false;
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Guestly-Webhook/1.0",
        "X-Guestly-Event": input.event,
        "X-Guestly-Signature": `sha256=${signature}`,
      },
      body: payload,
      signal: controller.signal,
    });
    await recordWebhookDelivery({
      organizationId: input.organizationId,
      webhookId,
      event: input.event,
      statusCode: response.status,
      success: response.ok,
      error: response.ok ? null : `Endpoint returned ${response.status}.`,
      attemptedAt: new Date().toISOString(),
    });
    recorded = true;
    if (!response.ok) throw new Error(`Webhook endpoint returned ${response.status}.`);
    return { delivered: true };
  } catch (error) {
    if (!recorded) {
      await recordWebhookDelivery({
        organizationId: input.organizationId,
        webhookId,
        event: input.event,
        success: false,
        error: error instanceof Error ? error.message : "Webhook delivery failed.",
        attemptedAt: new Date().toISOString(),
      }).catch(() => {});
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

export async function dispatchIntegrations(input: DispatchInput) {
  const outcomes: Array<{ provider: string; delivered: boolean; reason?: string }> = [];
  const email = await getConnection(input.organizationId, "email");
  if (email?.enabled && email.status === "connected" && shouldNotifyEmail(email.config as EmailIntegrationConfig, input)) {
    const outcome = await deliverEmail(email.config as EmailIntegrationConfig, input);
    outcomes.push({ provider: "email", ...outcome });
  }

  const slack = await getConnection(input.organizationId, "slack");
  if (slack?.enabled && slack.status === "connected" && slack.secret) {
    const outcome = await deliverSlack(slack.config as SlackIntegrationConfig, await decryptSecret(slack.secret), input);
    outcomes.push({ provider: "slack", ...outcome });
  }

  const webhooks = await listWebhooks(input.organizationId);
  for (const webhook of webhooks.filter((item) => item.enabled && item.events.includes(input.event))) {
    try {
      const outcome = await deliverWebhook(input, webhook.id);
      outcomes.push({ provider: `webhook:${webhook.id}`, ...outcome });
    } catch (error) {
      outcomes.push({ provider: `webhook:${webhook.id}`, delivered: false, reason: error instanceof Error ? error.message : "Webhook delivery failed." });
    }
  }
  return outcomes;
}

export function feedbackEventForUpdate(previousStatus: string, nextStatus: string): IntegrationEvent | null {
  return previousStatus !== nextStatus ? "feedback.updated" : null;
}
