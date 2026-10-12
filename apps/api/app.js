const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const env = require("./config/env");
const logger = require("./config/logger");
const { requestLogger } = require("./middleware/requestLogger");

const sequelize = require("./config/database");
const { seedDefaults } = require("./config/seed");
const authRoutes = require("./routes/authRoutes");
const roleRoutes = require("./routes/roleRoutes");
const userRoutes = require("./routes/userRoutes");
const { notFoundHandler, errorHandler } = require("./middleware/errorHandler");

const app = express();

app.use(requestLogger);
app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) =>
      callback(null, !origin || env.CORS_ORIGINS.includes(origin)),
  }),
);
app.use(express.json({ limit: "100kb" }));

app.use("/api/auth", authRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/users", userRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

let server;

const startServer = async ({ port = env.PORT } = {}) => {
  if (env.NODE_ENV !== "test") {
    await sequelize.sync();
    await seedDefaults();
  }

  server = app.listen(port, () => {
    logger.info({ port }, "Server started");
  });
  return server;
};

if (env.NODE_ENV !== "test") {
  startServer().catch((err) => {
    logger.fatal({ err }, "Server failed to start");
    process.exit(1);
  });
}

module.exports = { app, startServer };
