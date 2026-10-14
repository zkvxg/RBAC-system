const { Sequelize } = require("sequelize");
const { NODE_ENV } = require("./env");
const { dbConfig } = require("./dbConfig");
const logger = require("./logger");

const { url, ...options } = dbConfig();
options.logging = NODE_ENV === "test" ? false : (sql) => logger.debug(sql);

const sequelize = url ? new Sequelize(url, options) : new Sequelize(options);

module.exports = sequelize;
