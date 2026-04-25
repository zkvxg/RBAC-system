const express = require("express");
const cors = require("cors");
require("dotenv").config();

const sequelize = require("./config/database");
const { seedDefaults } = require("./config/seed");
const authRoutes = require("./routes/authRoutes");
const roleRoutes = require("./routes/roleRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/users", userRoutes);

// eslint-disable-next-line no-unused-vars
app.use((req, res, _next) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

let server;

const startServer = async () => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET environment variable is required");
  }

  // synchronizacja bazy danych tylko w srodowisku non-test
  // w testach global-setup robi sync({force:true}) i seedDefaults samodzielnie
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
