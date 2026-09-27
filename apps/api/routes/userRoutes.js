const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { validateToken, requirePermission } = require("../middleware/auth");

router.get(
  "/",
  validateToken,
  requirePermission("users.view"),
  userController.getAllUsers,
);
router.post(
  "/",
  validateToken,
  requirePermission("users.create"),
  userController.createUser,
);
router.put(
  "/:id",
  validateToken,
  requirePermission("users.edit"),
  userController.updateUser,
);
router.delete(
  "/:id",
  validateToken,
  requirePermission("users.delete"),
  userController.deleteUser,
);
router.put(
  "/:id/role",
  validateToken,
  requirePermission("users.edit"),
  userController.updateUserRole,
);

module.exports = router;
