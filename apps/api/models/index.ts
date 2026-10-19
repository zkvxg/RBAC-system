import User from "./User";
import Role from "./Role";
import Permission from "./Permission";
import RolePermission from "./RolePermission";

Role.hasMany(User);
User.belongsTo(Role);

Role.belongsToMany(Permission, { through: RolePermission });
Permission.belongsToMany(Role, { through: RolePermission });

Role.addScope(
  "defaultScope",
  {
    include: [
      {
        model: Permission,
        attributes: ["id", "key"],
        through: { attributes: [] },
      },
    ],
  },
  { override: true },
);

Role.afterSave(async (role, options) => {
  const keys = role.pendingPermissions;
  if (!keys) return;

  const permissions = await Permission.findAll({
    where: { key: keys },
    transaction: options.transaction,
  });
  if (permissions.length !== keys.length) {
    const known = new Set(permissions.map((p) => p.key));
    const unknown = keys.filter((key) => !known.has(key));
    throw new Error(`Unknown permissions: ${unknown.join(", ")}`);
  }

  await role.setPermissions(permissions, { transaction: options.transaction });
  role.Permissions = permissions;
  delete role.pendingPermissions;
});

export { User, Role, Permission, RolePermission };
