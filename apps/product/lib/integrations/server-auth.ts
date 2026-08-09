import { AccessError, requirePermission } from "@/lib/security/server-auth";

export class IntegrationAccessError extends AccessError {}

export async function requireIntegrationAdmin() {
  try {
    return await requirePermission("manage_integrations");
  } catch (error) {
    throw new IntegrationAccessError(error instanceof Error ? error.message : "Workspace access is required.");
  }
}
