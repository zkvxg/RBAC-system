const sequelize = require("../config/database");
const { User, Role } = require("../models");
const { seedAdminAndEmployee } = require("./utils/factories");
const { seedDefaults } = require("../config/seed");

process.env.NODE_ENV = "test";
process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret";

const { startServer } = require("../app");

module.exports = async () => {
  process.env.PORT = 5000;
  global.__SERVER__ = await startServer();

  await sequelize.sync({ force: true });

  await seedDefaults();

  const { adminToken, employeeToken } = await seedAdminAndEmployee();

  process.env.ADMIN_TOKEN = adminToken;
  process.env.EMPLOYEE_TOKEN = employeeToken;
};
