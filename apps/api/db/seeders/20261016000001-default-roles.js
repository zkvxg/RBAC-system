"use strict";

const ROLES = [
  { name: "admin", description: "Administrator", permissions: ["*"] },
  {
    name: "manager",
    description: "Manager",
    permissions: [
      "users.view",
      "roles.view",
      "reports.view",
      "reports.create",
      "profile.view",
      "profile.edit",
    ],
  },
  {
    name: "employee",
    description: "Default employee role",
    permissions: ["profile.view", "profile.edit"],
  },
];

module.exports = {
  async up(queryInterface) {
    const db = queryInterface.sequelize;
    const select = (sql, replacements) =>
      db.query(sql, { type: db.QueryTypes.SELECT, replacements });
    const now = new Date();

    const permissionIds = new Map(
      (await select('SELECT id, key FROM "Permissions"')).map((p) => [
        p.key,
        p.id,
      ]),
    );

    for (const role of ROLES) {
      let [existing] = await select(
        'SELECT id FROM "Roles" WHERE name = :name',
        {
          name: role.name,
        },
      );
      const isNew = !existing;

      if (isNew) {
        await queryInterface.bulkInsert("Roles", [
          {
            name: role.name,
            description: role.description,
            createdAt: now,
            updatedAt: now,
          },
        ]);
        [existing] = await select('SELECT id FROM "Roles" WHERE name = :name', {
          name: role.name,
        });
      }

      if (!isNew && role.name !== "admin") continue;

      const linked = new Set(
        (
          await select(
            'SELECT "PermissionId" FROM "RolePermissions" WHERE "RoleId" = :id',
            { id: existing.id },
          )
        ).map((row) => row.PermissionId),
      );
      const links = role.permissions
        .map((key) => permissionIds.get(key))
        .filter((id) => !linked.has(id))
        .map((PermissionId) => ({
          RoleId: existing.id,
          PermissionId,
          createdAt: now,
          updatedAt: now,
        }));
      if (links.length > 0) {
        await queryInterface.bulkInsert("RolePermissions", links);
      }
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("Roles", {
      name: ROLES.map((role) => role.name),
    });
  },
};
