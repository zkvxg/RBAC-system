const { User, Role } = require("../models");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const authController = {
  async register(req, res) {
    // rejestracja nowego uzytkownika, domyslnie rola employee
    try {
      const { username, email, password } = req.body;

      if (!username || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
      }

      if (typeof password !== "string" || password.length < 5) {
        return res
          .status(400)
          .json({ message: "Password must be at least 5 characters long" });
      }

      if (typeof username !== "string" || username.trim().length < 3) {
        return res
          .status(400)
          .json({ message: "Username must be at least 3 characters long" });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Invalid email format" });
      }

      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(409).json({ message: "User already exists" });
      }

      const [defaultRole] = await Role.findOrCreate({
        where: { name: "employee" },
        defaults: {
          description: "Default employee role",
          permissions: ["profile.view"],
        },
      });
      if (!defaultRole) {
        return res.status(500).json({ message: "Default role not found" });
      }

      const user = await User.create({
        username,
        email,
        password,
        RoleId: defaultRole.id,
      });

      res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error registering user", error: error.message });
    }
  },

  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res
          .status(400)
          .json({ message: "Email and password are required" });
      }

      const user = await User.findOne({
        where: { email },
        include: [{ model: Role }],
      });

      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // sprawdzenie hasla
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      if (!user.Role) {
        return res.status(500).json({ message: "User has no role assigned" });
      }

      // generowanie tokenu jwt
      const permissions = Array.isArray(user.Role.permissions)
        ? user.Role.permissions
        : [];
      const token = jwt.sign(
        { userId: user.id, role: user.Role.name, permissions },
        process.env.JWT_SECRET,
        { expiresIn: "24h" },
      );

      res.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          role: user.Role.name,
          permissions,
        },
      });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error logging in", error: error.message });
    }
  },

  async logout(req, res) {
    res.json({ message: "Logged out successfully" });
  },

  async getProfile(req, res) {
    try {
      const user = await User.findByPk(req.user.userId, {
        include: [{ model: Role }],
        attributes: { exclude: ["password"] },
      });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error fetching profile", error: error.message });
    }
  },
};

module.exports = authController;
