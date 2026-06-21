export const DEMO_ACCESS_EMAIL = process.env.GUESTLY_DEMO_EMAIL || "demo@getguestly.com";
export const WORKSPACE_ACCESS_COOKIE = "guestly_workspace_access";

export function getDemoAccessPassword() {
  return process.env.GUESTLY_DEMO_PASSWORD || "";
}

export function hasDemoAccessPassword() {
  return getDemoAccessPassword().length > 0;
}

export async function createWorkspaceAccessToken() {
  const payload = `${DEMO_ACCESS_EMAIL.toLowerCase()}:${getDemoAccessPassword()}`;
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(payload));
  return Array.from(new Uint8Array(bytes))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function isValidWorkspaceAccessToken(token?: string) {
  if (!token || !hasDemoAccessPassword()) return false;
  return token === (await createWorkspaceAccessToken());
}
