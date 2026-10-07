const jwt = require("jsonwebtoken");
const { User } = require("../models");

const auth = {
  async validateToken(req, res, next) {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return res.status(401).json({ message: "Invalid token" });
    }

    try {
      const user = await User.findByPk(decoded.userId, {
        attributes: ["id", "isActive"],
      });
      if (!user) {
        return res.status(401).json({ message: "Invalid token" });
      }
      if (!user.isActive) {
        return res.status(403).json({ message: "Account is disabled" });
      }
      req.user = decoded;
      next();
    } catch (error) {
      next(error);
    }
  },

  requireAdmin(req, res, next) {
    if (!req.user || req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Access denied. Admin privileges required." });
    }
    next();
  },

  requirePermission(permission) {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      if (req.user.role === "admin") {
        return next();
      }
      const perms = Array.isArray(req.user.permissions)
        ? req.user.permissions
        : [];
      if (!perms.includes(permission)) {
        return res
          .status(403)
          .json({ message: `Missing permission: ${permission}` });
      }
      next();
    };
  },
};

module.exports = auth;
