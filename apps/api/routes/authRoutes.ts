import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import authController from "../controllers/authController";
import { validateToken } from "../middleware/auth";
import { createAuthLimiter } from "../middleware/rateLimit";
import { validate } from "../middleware/validate";
import * as schemas from "../validation/authSchemas";

const router = Router();
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

export default router;
