export const DEMO_ACCESS_EMAIL = process.env.GUESTLY_DEMO_EMAIL || "demo@getguestly.com";
export const WORKSPACE_ACCESS_COOKIE = "guestly_workspace_access";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;

export type WorkspaceSessionPayload = {
  userId: string;
  organizationId: string;
  email: string;
  expiresAt: number;
};

export function getDemoAccessPassword() {
  return process.env.GUESTLY_DEMO_PASSWORD || "";
}

export function hasDemoAccessPassword() {
  return getDemoAccessPassword().length > 0;
}

function sessionSecret() {
  return process.env.GUESTLY_SESSION_SECRET || getDemoAccessPassword();
}

function encode(value: string) {
  return Buffer.from(value).toString("base64url");
}

function decode(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

async function sign(value: string) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(sessionSecret()), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return Buffer.from(signature).toString("base64url");
}

function safeEqual(left: string, right: string) {
  const leftBytes = Buffer.from(left);
  const rightBytes = Buffer.from(right);
  if (leftBytes.length !== rightBytes.length) return false;
  let result = 0;
  for (let index = 0; index < leftBytes.length; index += 1) result |= leftBytes[index] ^ rightBytes[index];
  return result === 0;
}

export async function createWorkspaceAccessToken(input?: Partial<WorkspaceSessionPayload>) {
  if (!hasDemoAccessPassword() || !sessionSecret()) throw new Error("Workspace session signing is not configured.");
  const payload: WorkspaceSessionPayload = {
    userId: input?.userId || process.env.GUESTLY_DEMO_USER_ID || "usr_demo_manager",
    organizationId: input?.organizationId || process.env.GUESTLY_DEMO_ORGANIZATION_ID || "org_guestly_demo",
    email: (input?.email || DEMO_ACCESS_EMAIL).toLowerCase(),
    expiresAt: input?.expiresAt || Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS,
  };
  const encoded = encode(JSON.stringify(payload));
  return `${encoded}.${await sign(encoded)}`;
}

export async function getWorkspaceSession(token?: string): Promise<WorkspaceSessionPayload | null> {
  if (!token || !hasDemoAccessPassword() || !sessionSecret()) return null;
  const [encoded, suppliedSignature] = token.split(".");
  if (!encoded || !suppliedSignature || !safeEqual(suppliedSignature, await sign(encoded))) return null;
  try {
    const payload = JSON.parse(decode(encoded)) as WorkspaceSessionPayload;
    if (!payload.userId || !payload.organizationId || !payload.email || payload.expiresAt <= Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function isValidWorkspaceAccessToken(token?: string) {
  return Boolean(await getWorkspaceSession(token));
}

export function workspaceSessionMaxAge() {
  return SESSION_MAX_AGE_SECONDS;
}
