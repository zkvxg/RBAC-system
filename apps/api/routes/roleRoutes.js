const express = require("express");
const router = express.Router();
const { asyncHandler } = require("../utils/asyncHandler");
const roleController = require("../controllers/roleController");
const { validateToken, requirePermission } = require("../middleware/auth");

router.get(
  "/",
  validateToken,
  requirePermission("roles.view"),
  asyncHandler(roleController.getAllRoles),
);
router.post(
  "/",
  validateToken,
  requirePermission("roles.create"),
  asyncHandler(roleController.createRole),
);
router.put(
  "/:id",
  validateToken,
  requirePermission("roles.edit"),
  asyncHandler(roleController.updateRole),
);
router.delete(
  "/:id",
  validateToken,
  requirePermission("roles.delete"),
  asyncHandler(roleController.deleteRole),
);

module.exports = router;
