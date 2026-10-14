const path = require("path");
const env = require("./env");

const dbConfig = () => {
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
  return {
    dialect: "sqlite",
    storage: path.join(__dirname, "..", file),
  };
};

module.exports = { dbConfig };
