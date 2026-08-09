import { cookies } from "next/headers";
import { isValidWorkspaceAccessToken, WORKSPACE_ACCESS_COOKIE } from "@/lib/auth";

export class IntegrationAccessError extends Error {}

export async function requireIntegrationAdmin() {
  const token = (await cookies()).get(WORKSPACE_ACCESS_COOKIE)?.value;
  if (!(await isValidWorkspaceAccessToken(token))) throw new IntegrationAccessError("Workspace access is required.");

  // The current product uses a single secured demo workspace. Production auth should
  // resolve this value from the authenticated profile before these routes are enabled.
  return {
    organizationId: process.env.GUESTLY_DEMO_ORGANIZATION_ID || "org_guestly_demo",
    role: "owner" as const,
  };
}
