"use strict";

const parse = (value) => {
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

module.exports = {
  async up(queryInterface) {
    const db = queryInterface.sequelize;

    await db.transaction(async (transaction) => {
      const select = (sql, replacements) =>
        db.query(sql, {
          type: db.QueryTypes.SELECT,
          replacements,
          transaction,
        });
      const now = new Date();

      const roles = await select('SELECT id, permissions FROM "Roles"');
      const permissionIds = new Map(
        (await select('SELECT id, key FROM "Permissions"')).map((p) => [
          p.key,
          p.id,
        ]),
      );

      const missing = [
        ...new Set(roles.flatMap((role) => parse(role.permissions))),
      ].filter((key) => typeof key === "string" && !permissionIds.has(key));

      if (missing.length > 0) {
        await queryInterface.bulkInsert(
          "Permissions",
          missing.map((key) => ({
            key,
            description: "Legacy permission",
            createdAt: now,
            updatedAt: now,
          })),
          { transaction },
        );
        const inserted = await select(
          'SELECT id, key FROM "Permissions" WHERE key IN (:missing)',
          { missing },
        );
        inserted.forEach((p) => permissionIds.set(p.key, p.id));
      }

      const linked = new Set(
        (await select('SELECT DISTINCT "RoleId" FROM "RolePermissions"')).map(
          (row) => row.RoleId,
        ),
      );

      const links = roles
        .filter((role) => !linked.has(role.id))
        .flatMap((role) =>
          [...new Set(parse(role.permissions))]
            .filter((key) => permissionIds.has(key))
            .map((key) => ({
              RoleId: role.id,
              PermissionId: permissionIds.get(key),
              createdAt: now,
              updatedAt: now,
            })),
        );

      if (links.length > 0) {
        await queryInterface.bulkInsert("RolePermissions", links, {
          transaction,
        });
      }
    });

    // plain DROP COLUMN (sqlite >= 3.35); sequelize's sqlite removeColumn
    // rebuilds the table, which would fire ON DELETE SET NULL on Users
    await db.query('ALTER TABLE "Roles" DROP COLUMN "permissions"');
  },

  async down(queryInterface, Sequelize) {
    const db = queryInterface.sequelize;

    await queryInterface.addColumn("Roles", "permissions", {
      type: Sequelize.JSON,
      allowNull: false,
      defaultValue: [],
    });

    const rows = await db.query(
      `SELECT rp."RoleId" AS "roleId", p.key AS key
         FROM "RolePermissions" rp
         JOIN "Permissions" p ON p.id = rp."PermissionId"`,
      { type: db.QueryTypes.SELECT },
    );
    const byRole = new Map();
    rows.forEach(({ roleId, key }) =>
      byRole.set(roleId, [...(byRole.get(roleId) ?? []), key]),
    );

    for (const [roleId, keys] of byRole) {
      await queryInterface.bulkUpdate(
        "Roles",
        { permissions: JSON.stringify(keys) },
        { id: roleId },
      );
    }
  },
};
