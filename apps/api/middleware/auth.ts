import type { RequestHandler } from "express";
import authService from "../services/authService";
import { hasPermission, type Permission } from "../config/permissions";
import { asyncHandler } from "../utils/asyncHandler";
import { ForbiddenError, UnauthorizedError } from "../errors";

export const validateToken = asyncHandler(async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    throw new UnauthorizedError("No token provided");
  }
  req.user = await authService.authenticate(token);
  next();
});

export const requirePermission =
  (permission: Permission): RequestHandler =>
  (req, res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError());
    }
    if (!hasPermission(req.user.permissions, permission)) {
      return next(new ForbiddenError(`Missing permission: ${permission}`));
    }
    next();
  };
