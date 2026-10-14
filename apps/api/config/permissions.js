const WILDCARD = "*";

const PERMISSION_CATALOG = [
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
];

const PERMISSION_KEYS = PERMISSION_CATALOG.map((p) => p.key);

const hasPermission = (permissions, permission) =>
  Array.isArray(permissions) &&
  (permissions.includes(WILDCARD) || permissions.includes(permission));

const isSuperuserRole = (role) =>
  Array.isArray(role?.permissions) && role.permissions.includes(WILDCARD);

module.exports = {
  WILDCARD,
  PERMISSION_CATALOG,
  PERMISSION_KEYS,
  hasPermission,
  isSuperuserRole,
};
