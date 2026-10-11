const express = require("express");
const router = express.Router();
const { asyncHandler } = require("../utils/asyncHandler");
const roleController = require("../controllers/roleController");
const { validateToken, requirePermission } = require("../middleware/auth");
const { validate } = require("../middleware/validate");
const schemas = require("../validation/roleSchemas");

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

module.exports = router;
