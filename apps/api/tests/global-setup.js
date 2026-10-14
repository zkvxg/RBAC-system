const sequelize = require("../config/database");
const { seedAdminAndEmployee } = require("./utils/factories");
const { seedDefaults } = require("../config/seed");
const { createMigrator } = require("../db/migrator");

const { startServer } = require("../server");

module.exports = async () => {
  await sequelize.getQueryInterface().dropAllTables();
  await createMigrator().up();

  global.__SERVER__ = await startServer({ port: process.env.TEST_PORT });

  await seedDefaults();

  const { adminToken, employeeToken } = await seedAdminAndEmployee();

  process.env.ADMIN_TOKEN = adminToken;
  process.env.EMPLOYEE_TOKEN = employeeToken;
};
