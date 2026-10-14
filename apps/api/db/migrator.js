const path = require("path");
const { Sequelize } = require("sequelize");
const { Umzug, SequelizeStorage } = require("umzug");
const sequelize = require("../config/database");
const logger = require("../config/logger");

const createMigrator = (instance = sequelize) =>
  new Umzug({
    migrations: {
      glob: path.join(__dirname, "migrations/*.js").replace(/\\/g, "/"),
      resolve: ({ name, path: file, context }) => {
        const migration = require(file);
        return {
          name,
          up: () => migration.up(context, Sequelize),
          down: () => migration.down(context, Sequelize),
        };
      },
    },
    context: instance.getQueryInterface(),
    storage: new SequelizeStorage({ sequelize: instance }),
    logger: {
      info: (event) => logger.debug(event),
      warn: (event) => logger.warn(event),
      error: (event) => logger.error(event),
      debug: (event) => logger.debug(event),
    },
  });

module.exports = { createMigrator };
