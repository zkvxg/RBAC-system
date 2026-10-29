"use strict";

const bcrypt = require("bcrypt");

const PASSWORD = "test123";

const USERS = [
  {
    username: "admin",
    email: "admin@test.com",
    role: "admin",
    name: "Admin Test",
    department: "IT",
    phone: "111222333",
    location: "HQ",
  },
  {
    username: "manager",
    email: "manager@test.com",
    role: "manager",
    name: "Manager Test",
    department: "Sales",
    phone: "222333444",
    location: "Warsaw",
  },
  {
    username: "employee",
    email: "employee@test.com",
    role: "employee",
    name: "Employee Test",
    department: "Marketing",
    phone: "333444555",
    location: "Krakow",
  },
];

const shouldSeed = () =>
  process.env.NODE_ENV !== "production" ||
  process.env.SEED_DEMO_USERS === "true";

module.exports = {
  async up(queryInterface) {
    if (!shouldSeed()) return;

    const db = queryInterface.sequelize;
    const select = (sql, replacements) =>
      db.query(sql, { type: db.QueryTypes.SELECT, replacements });

    const roleIds = new Map(
      (await select('SELECT id, name FROM "Roles"')).map((r) => [r.name, r.id]),
    );
    const existing = new Set(
      (
        await select('SELECT email FROM "Users" WHERE email IN (:emails)', {
          emails: USERS.map((u) => u.email),
        })
      ).map((u) => u.email),
    );

    const password = await bcrypt.hash(PASSWORD, 10);
    const now = new Date();
    const rows = USERS.filter((u) => !existing.has(u.email)).map(
      ({ role, ...user }) => ({
        ...user,
        password,
        isActive: true,
        RoleId: roleIds.get(role),
        createdAt: now,
        updatedAt: now,
      }),
    );

    if (rows.length > 0) {
      await queryInterface.bulkInsert("Users", rows);
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("Users", {
      email: USERS.map((u) => u.email),
    });
  },
};
