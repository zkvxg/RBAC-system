const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { validateToken } = require("../middleware/auth");
const { createAuthLimiter } = require("../middleware/rateLimit");

const authLimiter = createAuthLimiter();

router.post("/register", authLimiter, authController.register);
router.post("/login", authLimiter, authController.login);
router.post("/logout", validateToken, authController.logout);
router.get("/profile", validateToken, authController.getProfile);

module.exports = router;
