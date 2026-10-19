import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import userController from "../controllers/userController";
import { validateToken, requirePermission } from "../middleware/auth";
import { validate } from "../middleware/validate";
import * as schemas from "../validation/userSchemas";

const router = Router();

router.use(validateToken);

router.get(
  "/",
  requirePermission("users.view"),
  validate(schemas.listUsers),
  asyncHandler(userController.getAllUsers),
);
router.get(
  "/:id",
  requirePermission("users.view"),
  validate(schemas.userId),
  asyncHandler(userController.getUser),
);
router.post(
  "/",
  requirePermission("users.create"),
  validate(schemas.createUser),
  asyncHandler(userController.createUser),
);
router.put(
  "/:id",
  requirePermission("users.edit"),
  validate(schemas.updateUser),
  asyncHandler(userController.updateUser),
);
router.delete(
  "/:id",
  requirePermission("users.delete"),
  validate(schemas.userId),
  asyncHandler(userController.deleteUser),
);
router.put(
  "/:id/role",
  requirePermission("users.edit"),
  validate(schemas.updateUserRole),
  asyncHandler(userController.updateUserRole),
);

export default router;
