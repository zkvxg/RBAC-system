const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config();

const sequelize = require("./config/database");
const { seedDefaults } = require("./config/seed");
const authRoutes = require("./routes/authRoutes");
const roleRoutes = require("./routes/roleRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();

const DEFAULT_CORS_ORIGINS = ["http://localhost:5173"];

const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",").map((origin) => origin.trim())
  : DEFAULT_CORS_ORIGINS;

app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) =>
      callback(null, !origin || allowedOrigins.includes(origin)),
  }),
);
app.use(express.json({ limit: "100kb" }));

app.use("/api/auth", authRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/users", userRoutes);

app.use((req, res, _next) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, _next) => {
  const status = err.status || err.statusCode || 500;
  if (status < 500) {
    return res.status(status).json({ message: err.message });
  }
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

let server;

const startServer = async () => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET environment variable is required");
  }

  if (process.env.NODE_ENV !== "test") {
    await sequelize.sync();
    await seedDefaults();
  }

  const PORT = process.env.PORT || 5000;
  server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
  return server;
};

if (process.env.NODE_ENV !== "test") {
  startServer().catch((err) => console.error("Server start error:", err));
}

module.exports = { app, startServer };
