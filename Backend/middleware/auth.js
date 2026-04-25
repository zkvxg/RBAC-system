const jwt = require("jsonwebtoken");

// middleware do weryfikacji i ochrony tras, sprawdza token jwt i role uzytkownika
const auth = {
  validateToken(req, res, next) {
    // token w headerze, bearer token
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (error) {
      res.status(401).json({ message: "Invalid token" });
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

  // sprawdza czy uzytkownik ma konkretne uprawnienie z listy permissions w jwt.
  // admin zawsze ma wszystkie uprawnienia.
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
