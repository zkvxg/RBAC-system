const path = require("path");
const { Sequelize } = require("sequelize");
const { Umzug, SequelizeStorage, memoryStorage } = require("umzug");
const sequelize = require("../config/database");
const logger = require("../config/logger");

const umzugLogger = {
  info: (event) => logger.debug(event),
  warn: (event) => logger.warn(event),
  error: (event) => logger.error(event),
  debug: (event) => logger.debug(event),
};

const filesIn = (dir) => path.join(__dirname, dir, "*.js").replace(/\\/g, "/");

const createMigrator = (instance = sequelize) =>
  new Umzug({
    migrations: {
      glob: filesIn("migrations"),
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
    logger: umzugLogger,
  });

const createSeeder = (instance = sequelize) =>
  new Umzug({
    migrations: {
      glob: filesIn("seeders"),
      resolve: ({ name, path: file, context }) => {
        const seeder = require(file);
        return {
          name,
          up: () => seeder.up(context, Sequelize),
          down: () => seeder.down(context, Sequelize),
        };
      },
    },
    context: instance.getQueryInterface(),
    storage: memoryStorage(),
    logger: umzugLogger,
  });

module.exports = { createMigrator, createSeeder };
