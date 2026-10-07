const { User, Role } = require("../models");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { validatePassword } = require("../utils/passwordPolicy");

const authController = {
  async register(req, res) {
    try {
      const { username, email, password } = req.body;

      if (!username || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
      }

      const passwordError = validatePassword(password);
      if (passwordError) {
        return res.status(400).json({ message: passwordError });
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

      await User.create({
        username,
        email,
        password,
        RoleId: defaultRole.id,
      });

      res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
      console.error("Error registering user:", error);
      res.status(500).json({ message: "Error registering user" });
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

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      if (!user.isActive) {
        return res.status(403).json({ message: "Account is disabled" });
      }

      if (!user.Role) {
        return res.status(500).json({ message: "User has no role assigned" });
      }

      const permissions = Array.isArray(user.Role.permissions)
        ? user.Role.permissions
        : [];
      const token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || "24h",
      });

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
      console.error("Error logging in:", error);
      res.status(500).json({ message: "Error logging in" });
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
      console.error("Error fetching profile:", error);
      res.status(500).json({ message: "Error fetching profile" });
    }
  },
};

module.exports = authController;
