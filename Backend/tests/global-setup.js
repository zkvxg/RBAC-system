const sequelize = require("../config/database");
const { User, Role } = require("../models");
const { seedAdminAndEmployee } = require("./utils/factories");
const { seedDefaults } = require("../config/seed");

// skonfiguruj srodowisko testowe przed zaladowaniem pliku app.js, aby nie uruchamial sie on automatycznie podczas importowania
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret";

const { startServer } = require("../app");

// globalny setup: inicjalizacja bazy danych, seed danych testowych i uruchomienie serwera
module.exports = async () => {
  // uruchomienie serwera przed testami
  process.env.PORT = 5000;
  global.__SERVER__ = await startServer();

  // wymuszenie synchronizacji modeli z baza danych
  await sequelize.sync({ force: true });

  // domyslny seed (admin/manager/employee) - dostepny rowniez w trybie test/e2e
  await seedDefaults();

  const { adminToken, employeeToken } = await seedAdminAndEmployee();

  // zapisujemy tokeny globalnie dla wszystkich testow
  process.env.ADMIN_TOKEN = adminToken;
  process.env.EMPLOYEE_TOKEN = employeeToken;
};
