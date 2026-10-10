const express = require("express");
const router = express.Router();
const { asyncHandler } = require("../utils/asyncHandler");
const authController = require("../controllers/authController");
const { validateToken } = require("../middleware/auth");
const { createAuthLimiter } = require("../middleware/rateLimit");

const authLimiter = createAuthLimiter();

router.post("/register", authLimiter, asyncHandler(authController.register));
router.post("/login", authLimiter, asyncHandler(authController.login));
router.post("/logout", validateToken, asyncHandler(authController.logout));
router.get("/profile", validateToken, asyncHandler(authController.getProfile));

module.exports = router;
