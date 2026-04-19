const sequelize = require("../config/database");
const { User, Role } = require("../models");
const { seedAdminAndUser } = require("./utils/factories");
const { startServer } = require("../app");

// globalny setup: inicjalizacja bazy danych, seed danych testowych i uruchomienie serwera
module.exports = async () => {
  // uruchomienie serwera przed testami
  process.env.PORT = 5000;
  global.__SERVER__ = await startServer();

  // wymuszenie synchronizacji modeli z baza danych
  await sequelize.sync({ force: true });

  const { adminToken, userToken } = await seedAdminAndUser();

  // zapisujemy tokeny globalnie dla wszystkich testow
  process.env.ADMIN_TOKEN = adminToken;
  process.env.USER_TOKEN = userToken;
};
