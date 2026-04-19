const sequelize = require("../config/database");

// globalny teardown: zamkniecie polaczenia z baza danych i zatrzymanie serwera po testach
module.exports = async () => {
  if (global.__SERVER__) {
    await new Promise((resolve) => {
      global.__SERVER__.close(resolve);
    });
  }

  await sequelize.close();
};
