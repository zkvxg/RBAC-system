"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const existing = (await queryInterface.showAllTables()).map((t) =>
      typeof t === "string" ? t : t.tableName,
    );

    if (!existing.includes("Roles")) {
      await queryInterface.createTable("Roles", {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        name: { type: Sequelize.STRING, allowNull: false, unique: true },
        permissions: { type: Sequelize.JSON, allowNull: false },
        description: { type: Sequelize.STRING, allowNull: false },
        createdAt: { type: Sequelize.DATE, allowNull: false },
        updatedAt: { type: Sequelize.DATE, allowNull: false },
      });
    }

    if (!existing.includes("Users")) {
      await queryInterface.createTable("Users", {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        username: { type: Sequelize.STRING, allowNull: false, unique: true },
        email: { type: Sequelize.STRING, allowNull: false, unique: true },
        password: { type: Sequelize.STRING, allowNull: false },
        name: Sequelize.STRING,
        department: Sequelize.STRING,
        phone: Sequelize.STRING,
        location: Sequelize.STRING,
        isActive: { type: Sequelize.BOOLEAN, defaultValue: true },
        RoleId: {
          type: Sequelize.INTEGER,
          references: { model: "Roles", key: "id" },
          onUpdate: "CASCADE",
          onDelete: "SET NULL",
        },
        createdAt: { type: Sequelize.DATE, allowNull: false },
        updatedAt: { type: Sequelize.DATE, allowNull: false },
      });
    }
  },

  async down(queryInterface) {
    await queryInterface.dropTable("Users");
    await queryInterface.dropTable("Roles");
  },
};
