const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const env = require("../config/env");
const { User, Role } = require("../models");
const roleService = require("./roleService");
const userService = require("./userService");
const { ForbiddenError, UnauthorizedError } = require("../errors");

const permissionsOf = (role) =>
  Array.isArray(role?.permissions) ? role.permissions : [];

const authService = {
  async register({ username, email, password }) {
    await userService.assertEmailFree(email);
    const role = await roleService.getDefaultRole();
    await User.create({ username, email, password, RoleId: role.id });
  },

  async login({ email, password }) {
    const user = await User.findOne({ where: { email }, include: [Role] });

    const isValidPassword =
      user && (await bcrypt.compare(password, user.password));
    if (!isValidPassword) {
      throw new UnauthorizedError("Invalid credentials");
    }

    if (!user.isActive) {
      throw new ForbiddenError("Account is disabled");
    }
    if (!user.Role) {
      throw new Error(`User ${user.id} has no role assigned`);
    }

    const token = jwt.sign({ sub: user.id }, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN,
    });

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.Role.name,
        permissions: permissionsOf(user.Role),
      },
    };
  },

  async authenticate(token) {
    let payload;
    try {
      payload = jwt.verify(token, env.JWT_SECRET);
    } catch {
      throw new UnauthorizedError("Invalid token");
    }

    const user = await User.findByPk(payload.sub, {
      attributes: ["id", "isActive"],
      include: [{ model: Role, attributes: ["name", "permissions"] }],
    });
    if (!user) {
      throw new UnauthorizedError("Invalid token");
    }
    if (!user.isActive) {
      throw new ForbiddenError("Account is disabled");
    }

    return {
      userId: user.id,
      role: user.Role?.name ?? null,
      permissions: permissionsOf(user.Role),
    };
  },

  async getProfile(userId) {
    const user = await User.findByPk(userId, {
      include: [{ model: Role }],
      attributes: { exclude: ["password"] },
    });
    if (!user) throw new UnauthorizedError("Invalid token");
    return user;
  },
};

module.exports = authService;
