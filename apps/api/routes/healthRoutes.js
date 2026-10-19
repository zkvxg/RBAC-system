const express = require("express");
const router = express.Router();
const sequelize = require("../config/database").default;

router.get("/", async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ status: "ok", database: "up", uptime: process.uptime() });
  } catch (err) {
    req.log.error({ err }, "Health check failed");
    res.status(503).json({ status: "error", database: "down" });
  }
});

module.exports = router;
