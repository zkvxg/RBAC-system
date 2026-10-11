const express = require("express");
const router = express.Router();
const { asyncHandler } = require("../utils/asyncHandler");
const authController = require("../controllers/authController");
const { validateToken } = require("../middleware/auth");
const { createAuthLimiter } = require("../middleware/rateLimit");
const { validate } = require("../middleware/validate");
const schemas = require("../validation/authSchemas");

const authLimiter = createAuthLimiter();

router.post(
  "/register",
  authLimiter,
  validate(schemas.register),
  asyncHandler(authController.register),
);
router.post(
  "/login",
  authLimiter,
  validate(schemas.login),
  asyncHandler(authController.login),
);
router.post("/logout", validateToken, asyncHandler(authController.logout));
router.get("/profile", validateToken, asyncHandler(authController.getProfile));

module.exports = router;
