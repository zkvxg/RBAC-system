const sequelize = require("../config/database");
const { seedAdminAndEmployee } = require("./utils/factories");
const { seedDefaults } = require("../config/seed");

process.env.NODE_ENV = "test";
process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret";

const { startServer } = require("../app");

module.exports = async () => {
  global.__SERVER__ = await startServer({ port: process.env.TEST_PORT });

  await sequelize.sync({ force: true });

  await seedDefaults();

  const { adminToken, employeeToken } = await seedAdminAndEmployee();

  process.env.ADMIN_TOKEN = adminToken;
  process.env.EMPLOYEE_TOKEN = employeeToken;
};
