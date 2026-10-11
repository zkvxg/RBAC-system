const { User, Role } = require("../models");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const env = require("../config/env");

const authController = {
  async register(req, res) {
    const { username, email, password } = req.body;

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
  },

  async login(req, res) {
    const { email, password } = req.body;

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
    const token = jwt.sign({ sub: user.id }, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN,
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
  },

  async logout(req, res) {
    res.json({ message: "Logged out successfully" });
  },

  async getProfile(req, res) {
    const user = await User.findByPk(req.user.userId, {
      include: [{ model: Role }],
      attributes: { exclude: ["password"] },
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  },
};

module.exports = authController;
