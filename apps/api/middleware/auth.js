const authService = require("../services/authService");
const { hasPermission } = require("../config/permissions");
const { asyncHandler } = require("../utils/asyncHandler");
const { ForbiddenError, UnauthorizedError } = require("../errors");

const auth = {
  validateToken: asyncHandler(async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      throw new UnauthorizedError("No token provided");
    }
    req.user = await authService.authenticate(token);
    next();
  }),

  requirePermission(permission) {
    return (req, res, next) => {
      if (!req.user) {
        return next(new UnauthorizedError());
      }
      if (!hasPermission(req.user.permissions, permission)) {
        return next(new ForbiddenError(`Missing permission: ${permission}`));
      }
      next();
    };
  },
};

module.exports = auth;
