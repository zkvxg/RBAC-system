import type { Permission } from "@rbac/shared";

export const SECTION_PERMISSIONS = {
  users: "users.view",
  roles: "roles.view",
  analytics: "reports.view",
  departments: "users.view",
} as const satisfies Record<string, Permission>;
