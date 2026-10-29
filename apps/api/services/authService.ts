import bcrypt from "bcrypt";
import jwt, { type SignOptions } from "jsonwebtoken";
import type { LoginResponse } from "@rbac/shared";
import env from "../config/env";
import { User, Role } from "../models";
import roleService from "./roleService";
import userService from "./userService";
import { ForbiddenError, UnauthorizedError } from "../errors";
import type { AuthUser } from "./authTypes";
import type { LoginInput, RegisterInput } from "../validation/authSchemas";

const permissionsOf = (role?: Role | null): string[] =>
  Array.isArray(role?.permissions) ? role.permissions : [];

const authService = {
  async register({ username, email, password }: RegisterInput) {
    await userService.assertEmailFree(email);
    const role = await roleService.getDefaultRole();
    await User.create({ username, email, password, RoleId: role.id });
  },

  async login({ email, password }: LoginInput): Promise<LoginResponse> {
    const user = await User.findOne({ where: { email }, include: [Role] });

    const isValidPassword =
      user !== null && (await bcrypt.compare(password, user.password));
    if (!user || !isValidPassword) {
      throw new UnauthorizedError("Invalid credentials");
    }

    if (!user.isActive) {
      throw new ForbiddenError("Account is disabled");
    }
    if (!user.Role) {
      throw new Error(`User ${user.id} has no role assigned`);
    }

    const token = jwt.sign({ sub: user.id }, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as NonNullable<SignOptions["expiresIn"]>,
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

  async authenticate(token: string): Promise<AuthUser> {
    let payload: string | jwt.JwtPayload;
    try {
      payload = jwt.verify(token, env.JWT_SECRET);
    } catch {
      throw new UnauthorizedError("Invalid token");
    }
    const userId = typeof payload === "object" ? Number(payload.sub) : NaN;
    if (!Number.isInteger(userId)) {
      throw new UnauthorizedError("Invalid token");
    }

    const user = await User.findByPk(userId, {
      attributes: ["id", "isActive"],
      include: [{ model: Role, attributes: ["id", "name", "permissions"] }],
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

  async getProfile(userId: number) {
    const user = await User.findByPk(userId, {
      include: [{ model: Role }],
      attributes: { exclude: ["password"] },
    });
    if (!user) throw new UnauthorizedError("Invalid token");
    return user;
  },
};

export default authService;
