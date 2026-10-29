"use strict";

const INDEXES = [
  { table: "Users", fields: ["RoleId"], name: "users_role_id" },
  { table: "Users", fields: ["createdAt", "id"], name: "users_created_at_id" },
  {
    table: "RolePermissions",
    fields: ["PermissionId"],
    name: "role_permissions_permission_id",
  },
];

module.exports = {
  async up(queryInterface) {
    for (const { table, fields, name } of INDEXES) {
      await queryInterface.addIndex(table, fields, { name });
    }
  },

  async down(queryInterface) {
    for (const { table, name } of INDEXES) {
      await queryInterface.removeIndex(table, name);
    }
  },
};
