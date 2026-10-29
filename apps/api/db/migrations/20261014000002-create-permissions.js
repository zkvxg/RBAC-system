"use strict";

// the catalog is copied here instead of imported: a migration must keep
// producing the same result even after config/permissions.js changes
const CATALOG = [
  ["*", "All permissions"],
  ["users.view", "View users"],
  ["users.create", "Create users"],
  ["users.edit", "Edit users"],
  ["users.delete", "Delete users"],
  ["roles.view", "View roles"],
  ["roles.create", "Create roles"],
  ["roles.edit", "Edit roles"],
  ["roles.delete", "Delete roles"],
  ["reports.view", "View reports"],
  ["reports.create", "Create reports"],
  ["reports.export", "Export reports"],
  ["profile.view", "View own profile"],
  ["profile.edit", "Edit own profile"],
];

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Permissions", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      key: { type: Sequelize.STRING(100), allowNull: false, unique: true },
      description: { type: Sequelize.STRING, allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.createTable("RolePermissions", {
      RoleId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: { model: "Roles", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      PermissionId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: { model: "Permissions", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });

    const now = new Date();
    await queryInterface.bulkInsert(
      "Permissions",
      CATALOG.map(([key, description]) => ({
        key,
        description,
        createdAt: now,
        updatedAt: now,
      })),
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable("RolePermissions");
    await queryInterface.dropTable("Permissions");
  },
};
