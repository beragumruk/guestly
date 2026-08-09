import { createHmac, timingSafeEqual } from "node:crypto";

type SlackState = { organizationId: string; expiresAt: number };

function stateSecret() {
  const secret = process.env.SLACK_OAUTH_STATE_SECRET || process.env.GUESTLY_INTEGRATIONS_ENCRYPTION_KEY;
  if (!secret) throw new Error("SLACK_OAUTH_STATE_SECRET is not configured.");
  return secret;
}

export function slackOAuthConfigured() {
  return Boolean(process.env.SLACK_CLIENT_ID && process.env.SLACK_CLIENT_SECRET && process.env.SLACK_REDIRECT_URI && (process.env.SLACK_OAUTH_STATE_SECRET || process.env.GUESTLY_INTEGRATIONS_ENCRYPTION_KEY));
}

export function createSlackState(organizationId: string) {
  const payload: SlackState = { organizationId, expiresAt: Date.now() + 10 * 60 * 1000 };
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = createHmac("sha256", stateSecret()).update(encoded).digest("base64url");
  return `${encoded}.${signature}`;
}

export function readSlackState(value: string) {
  const [encoded, signature] = value.split(".");
  if (!encoded || !signature) throw new Error("Slack connection state is invalid.");
  const expected = createHmac("sha256", stateSecret()).update(encoded).digest();
  const supplied = Buffer.from(signature, "base64url");
  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) throw new Error("Slack connection state is invalid.");
  const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as SlackState;
  if (!payload.organizationId || payload.expiresAt < Date.now()) throw new Error("Slack connection state has expired.");
  return payload;
}
