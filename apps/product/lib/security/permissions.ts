import type { UserRole } from "@/lib/types";

export type Permission =
  | "view_analytics"
  | "manage_feedback"
  | "manage_locations"
  | "manage_team"
  | "manage_integrations"
  | "manage_billing"
  | "manage_organization"
  | "manage_privacy";

const permissions: Record<UserRole, Permission[]> = {
  owner: ["view_analytics", "manage_feedback", "manage_locations", "manage_team", "manage_integrations", "manage_billing", "manage_organization", "manage_privacy"],
  admin: ["view_analytics", "manage_feedback", "manage_locations", "manage_team", "manage_integrations", "manage_organization", "manage_privacy"],
  manager: ["view_analytics", "manage_feedback"],
  viewer: ["view_analytics"],
};

export function can(role: UserRole, permission: Permission) {
  return permissions[role].includes(permission);
}

export function roleLabel(role: UserRole) {
  return role.charAt(0).toUpperCase() + role.slice(1);
}
