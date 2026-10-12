const { Sequelize } = require("sequelize");
const path = require("path");
const { NODE_ENV } = require("./env");
const logger = require("./logger");

const dbPath =
  NODE_ENV === "test"
    ? path.join(__dirname, "../database.test.sqlite")
    : path.join(__dirname, "../database.sqlite");

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: dbPath,
  logging: NODE_ENV === "test" ? false : (sql) => logger.debug(sql),
});

module.exports = sequelize;
