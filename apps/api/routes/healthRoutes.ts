import { Router } from "express";
import sequelize from "../config/database";

const router = Router();

router.get("/", async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ status: "ok", database: "up", uptime: process.uptime() });
  } catch (err) {
    req.log.error({ err }, "Health check failed");
    res.status(503).json({ status: "error", database: "down" });
  }
});

export default router;
