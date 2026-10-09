const { Sequelize } = require("sequelize");
const path = require("path");
const { NODE_ENV } = require("./env");

const dbPath =
  NODE_ENV === "test"
    ? path.join(__dirname, "../database.test.sqlite")
    : path.join(__dirname, "../database.sqlite");

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: dbPath,
  logging: NODE_ENV === "test" ? false : console.log,
});

module.exports = sequelize;
