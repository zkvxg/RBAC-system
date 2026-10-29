import { PERMISSION_CATALOG, WILDCARD, type Permission } from "@rbac/shared";

export interface PermissionOption {
  id: Permission;
  name: string;
}

export interface PermissionGroup {
  name: string;
  permissions: PermissionOption[];
}

const GROUP_NAMES: Record<string, string> = {
  users: "User Management",
  roles: "Role Management",
  reports: "Reports",
  profile: "Profile",
};

const titleCase = (text: string) =>
  text.replace(/\b\w/g, (letter) => letter.toUpperCase());

export const PERMISSION_GROUPS: Record<string, PermissionGroup> =
  PERMISSION_CATALOG.filter((p) => p.key !== WILDCARD).reduce<
    Record<string, PermissionGroup>
  >((groups, { key, description }) => {
    const resource = key.split(".")[0] ?? key;
    const group = (groups[resource] ??= {
      name: GROUP_NAMES[resource] ?? titleCase(resource),
      permissions: [],
    });
    group.permissions.push({ id: key, name: titleCase(description) });
    return groups;
  }, {});
