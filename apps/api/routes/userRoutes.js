const express = require("express");
const router = express.Router();
const { asyncHandler } = require("../utils/asyncHandler");
const userController = require("../controllers/userController");
const { validateToken, requirePermission } = require("../middleware/auth");
const { validate } = require("../middleware/validate");
const schemas = require("../validation/userSchemas");

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

module.exports = router;
