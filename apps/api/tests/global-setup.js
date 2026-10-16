const sequelize = require("../config/database");
const { seedAdminAndEmployee } = require("./utils/factories");
const { createMigrator, createSeeder } = require("../db/migrator");

const { startServer } = require("../server");

module.exports = async () => {
  await sequelize.getQueryInterface().dropAllTables();
  await createMigrator().up();
  await createSeeder().up();

  global.__SERVER__ = await startServer({ port: process.env.TEST_PORT });

  const { adminToken, employeeToken } = await seedAdminAndEmployee();

  process.env.ADMIN_TOKEN = adminToken;
  process.env.EMPLOYEE_TOKEN = employeeToken;
};
