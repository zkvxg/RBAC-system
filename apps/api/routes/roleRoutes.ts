import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import roleController from "../controllers/roleController";
import { validateToken, requirePermission } from "../middleware/auth";
import { validate } from "../middleware/validate";
import * as schemas from "../validation/roleSchemas";

const router = Router();

router.use(validateToken);

router.get(
  "/",
  requirePermission("roles.view"),
  asyncHandler(roleController.getAllRoles),
);
router.post(
  "/",
  requirePermission("roles.create"),
  validate(schemas.createRole),
  asyncHandler(roleController.createRole),
);
router.put(
  "/:id",
  requirePermission("roles.edit"),
  validate(schemas.updateRole),
  asyncHandler(roleController.updateRole),
);
router.delete(
  "/:id",
  requirePermission("roles.delete"),
  validate(schemas.roleId),
  asyncHandler(roleController.deleteRole),
);

export default router;
