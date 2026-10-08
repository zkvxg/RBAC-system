const WILDCARD = "*";

const hasPermission = (permissions, permission) =>
  Array.isArray(permissions) &&
  (permissions.includes(WILDCARD) || permissions.includes(permission));

const isSuperuserRole = (role) =>
  Array.isArray(role?.permissions) && role.permissions.includes(WILDCARD);

module.exports = { WILDCARD, hasPermission, isSuperuserRole };
