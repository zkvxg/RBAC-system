import path from "path";
import type { Options } from "sequelize";
import env from "./env";
import { API_ROOT } from "./paths";

export type DbConfig = Options & { url?: string };

export const dbConfig = (): DbConfig => {
  if (env.DATABASE_URL) {
    return {
      url: env.DATABASE_URL,
      dialect: "postgres",
      pool: { max: env.DATABASE_POOL_MAX, min: 0, idle: 10_000 },
      ...(env.DATABASE_SSL && {
        dialectOptions: { ssl: { require: true, rejectUnauthorized: false } },
      }),
    };
  }

  const file =
    env.NODE_ENV === "test" ? "database.test.sqlite" : "database.sqlite";
  return { dialect: "sqlite", storage: path.join(API_ROOT, file) };
};
