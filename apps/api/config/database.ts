import { Sequelize } from "sequelize";
import env from "./env";
import { dbConfig } from "./dbConfig";
import logger from "./logger";

const { url, ...options } = dbConfig();
options.logging =
  env.NODE_ENV === "test" ? false : (sql: string) => logger.debug(sql);

const sequelize = url ? new Sequelize(url, options) : new Sequelize(options);

export default sequelize;
