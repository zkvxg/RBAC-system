const express = require("express");
const router = express.Router();
const roleController = require("../controllers/roleController");
const { validateToken, requirePermission } = require("../middleware/auth");

router.get(
  "/",
  validateToken,
  requirePermission("roles.view"),
  roleController.getAllRoles,
);
router.post(
  "/",
  validateToken,
  requirePermission("roles.create"),
  roleController.createRole,
);
router.put(
  "/:id",
  validateToken,
  requirePermission("roles.edit"),
  roleController.updateRole,
);
router.delete(
  "/:id",
  validateToken,
  requirePermission("roles.delete"),
  roleController.deleteRole,
);

module.exports = router;
