export const WILDCARD = "*";

export const PERMISSION_CATALOG = [
  { key: WILDCARD, description: "All permissions" },
  { key: "users.view", description: "View users" },
  { key: "users.create", description: "Create users" },
  { key: "users.edit", description: "Edit users" },
  { key: "users.delete", description: "Delete users" },
  { key: "roles.view", description: "View roles" },
  { key: "roles.create", description: "Create roles" },
  { key: "roles.edit", description: "Edit roles" },
  { key: "roles.delete", description: "Delete roles" },
  { key: "reports.view", description: "View reports" },
  { key: "reports.create", description: "Create reports" },
  { key: "reports.export", description: "Export reports" },
  { key: "profile.view", description: "View own profile" },
  { key: "profile.edit", description: "Edit own profile" },
] as const;

export type Permission = (typeof PERMISSION_CATALOG)[number]["key"];

export const PERMISSION_KEYS: readonly Permission[] = PERMISSION_CATALOG.map(
  (p) => p.key,
);

export const isPermission = (value: string): value is Permission =>
  (PERMISSION_KEYS as readonly string[]).includes(value);

export const hasPermission = (
  permissions: readonly string[] | null | undefined,
  permission: Permission,
): boolean =>
  Array.isArray(permissions) &&
  (permissions.includes(WILDCARD) || permissions.includes(permission));

export const isSuperuserRole = (
  role: { permissions?: readonly string[] | null } | null | undefined,
): boolean =>
  Array.isArray(role?.permissions) && role.permissions.includes(WILDCARD);
