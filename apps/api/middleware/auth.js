const jwt = require("jsonwebtoken");
const env = require("../config/env");
const { User, Role } = require("../models");
const { hasPermission } = require("../config/permissions");

const auth = {
  async validateToken(req, res, next) {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, env.JWT_SECRET);
    } catch {
      return res.status(401).json({ message: "Invalid token" });
    }

    try {
      const user = await User.findByPk(decoded.sub, {
        attributes: ["id", "isActive"],
        include: [{ model: Role, attributes: ["name", "permissions"] }],
      });
      if (!user) {
        return res.status(401).json({ message: "Invalid token" });
      }
      if (!user.isActive) {
        return res.status(403).json({ message: "Account is disabled" });
      }
      req.user = {
        userId: user.id,
        role: user.Role?.name ?? null,
        permissions: Array.isArray(user.Role?.permissions)
          ? user.Role.permissions
          : [],
      };
      next();
    } catch (error) {
      next(error);
    }
  },

  requirePermission(permission) {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      if (!hasPermission(req.user.permissions, permission)) {
        return res
          .status(403)
          .json({ message: `Missing permission: ${permission}` });
      }
      next();
    };
  },
};

module.exports = auth;
