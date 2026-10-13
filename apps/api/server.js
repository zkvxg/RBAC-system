const env = require("./config/env");
const logger = require("./config/logger");
const sequelize = require("./config/database");
const { seedDefaults } = require("./config/seed");
const { app } = require("./app");

const SHUTDOWN_TIMEOUT_MS = 10_000;

const startServer = async ({ port = env.PORT } = {}) => {
  if (env.NODE_ENV !== "test") {
    await sequelize.sync();
    await seedDefaults();
  }

  return new Promise((resolve) => {
    const server = app.listen(port, () => {
      logger.info({ port }, "Server started");
      resolve(server);
    });
  });
};

const registerShutdown = (server) => {
  let shuttingDown = false;

  const shutdown = async (signal) => {
    if (shuttingDown) return;
    shuttingDown = true;
    logger.info({ signal }, "Shutting down");

    setTimeout(() => {
      logger.error("Graceful shutdown timed out, forcing exit");
      process.exit(1);
    }, SHUTDOWN_TIMEOUT_MS).unref();

    try {
      await new Promise((resolve, reject) =>
        server.close((err) => (err ? reject(err) : resolve())),
      );
      await sequelize.close();
      logger.info("Shutdown complete");
      process.exit(0);
    } catch (err) {
      logger.error({ err }, "Error during shutdown");
      process.exit(1);
    }
  };

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
};

if (require.main === module) {
  startServer()
    .then(registerShutdown)
    .catch((err) => {
      logger.fatal({ err }, "Server failed to start");
      process.exit(1);
    });
}

module.exports = { startServer };
