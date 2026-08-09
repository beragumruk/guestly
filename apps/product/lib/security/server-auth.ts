import { cookies } from "next/headers";
import { getWorkspaceSession, WORKSPACE_ACCESS_COOKIE } from "@/lib/auth";
import { can, type Permission } from "./permissions";
import type { UserRole } from "@/lib/types";

export class AccessError extends Error {}

export type ServerActor = {
  userId: string;
  organizationId: string;
  email: string;
  role: UserRole;
};

function databaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return url && key ? { url: url.replace(/\/$/, ""), key } : null;
}

async function roleFromProfile(userId: string, organizationId: string): Promise<UserRole | null> {
  const config = databaseConfig();
  if (!config) return null;
  const response = await fetch(`${config.url}/rest/v1/profiles?id=eq.${encodeURIComponent(userId)}&organization_id=eq.${encodeURIComponent(organizationId)}&select=role,status&limit=1`, {
    headers: { apikey: config.key, Authorization: `Bearer ${config.key}` },
    cache: "no-store",
  });
  if (!response.ok) throw new AccessError("Unable to verify workspace membership.");
  const rows = (await response.json()) as Array<{ role?: string; status?: string }>;
  if (rows[0]?.status !== "active") return null;
  const role = rows[0]?.role;
  return role === "owner" || role === "admin" || role === "manager" || role === "viewer" ? role : null;
}

export async function requireWorkspaceActor() {
  const token = (await cookies()).get(WORKSPACE_ACCESS_COOKIE)?.value;
  const session = await getWorkspaceSession(token);
  if (!session) throw new AccessError("Workspace access is required.");
  const role = (await roleFromProfile(session.userId, session.organizationId)) || (session.userId === (process.env.GUESTLY_DEMO_USER_ID || "usr_demo_manager") ? "owner" : null);
  if (!role) throw new AccessError("Workspace membership is unavailable.");
  return { userId: session.userId, organizationId: session.organizationId, email: session.email, role } satisfies ServerActor;
}

export async function requirePermission(permission: Permission) {
  const actor = await requireWorkspaceActor();
  if (!can(actor.role, permission)) throw new AccessError("You do not have permission to perform this action.");
  return actor;
}
