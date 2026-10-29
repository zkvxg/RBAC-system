const sequelize = require("../config/database").default;

module.exports = async () => {
  if (global.__SERVER__) {
    await new Promise((resolve) => {
      global.__SERVER__.close(resolve);
    });
  }

  await sequelize.close();
};
