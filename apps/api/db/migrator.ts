import path from "path";
import { createRequire } from "node:module";
import { Sequelize, type QueryInterface } from "sequelize";
import { Umzug, SequelizeStorage, memoryStorage } from "umzug";
import sequelize from "../config/database";
import logger from "../config/logger";

interface MigrationModule {
  up(
    queryInterface: QueryInterface,
    sequelize: typeof Sequelize,
  ): Promise<void>;
  down(
    queryInterface: QueryInterface,
    sequelize: typeof Sequelize,
  ): Promise<void>;
}

const requireMigration = createRequire(__filename);

const umzugLogger = {
  info: (event: Record<string, unknown>) => logger.debug(event),
  warn: (event: Record<string, unknown>) => logger.warn(event),
  error: (event: Record<string, unknown>) => logger.error(event),
  debug: (event: Record<string, unknown>) => logger.debug(event),
};

const createRunner = (
  dir: "migrations" | "seeders",
  instance: Sequelize,
  storage: ConstructorParameters<typeof Umzug<QueryInterface>>[0]["storage"],
) =>
  new Umzug<QueryInterface>({
    migrations: {
      glob: path.join(__dirname, dir, "*.js").replace(/\\/g, "/"),
      resolve: ({ name, path: file, context }) => {
        const migration = requireMigration(file!) as MigrationModule;
        return {
          name,
          up: () => migration.up(context, Sequelize),
          down: () => migration.down(context, Sequelize),
        };
      },
    },
    context: instance.getQueryInterface(),
    storage,
    logger: umzugLogger,
  });

export const createMigrator = (instance: Sequelize = sequelize) =>
  createRunner(
    "migrations",
    instance,
    new SequelizeStorage({ sequelize: instance }),
  );

export const createSeeder = (instance: Sequelize = sequelize) =>
  createRunner("seeders", instance, memoryStorage());
