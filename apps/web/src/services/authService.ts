import { api } from "../api/client";
import {
  hasPermission,
  type LoginResponse,
  type Permission,
} from "@rbac/shared";
import { AUTH_MOCK_USERS } from "../mocks/authMock";
import { USE_MOCKS, toUiRole } from "../config/runtime";
import {
  clearSession,
  getSessionUser,
  getToken,
  saveSession,
} from "../auth/session";
import type { SessionUiUser } from "../types";

class AuthService {
  async login(email: string, password: string): Promise<SessionUiUser> {
    if (!USE_MOCKS) {
      const { data } = await api.post<LoginResponse>("/auth/login", {
        email,
        password,
      });
      const userForUi: SessionUiUser = {
        id: String(data.user.id),
        name: data.user.username || "User",
        email,
        role: toUiRole(data.user.role),
        status: "Active",
        permissions: Array.isArray(data.user.permissions)
          ? data.user.permissions
          : [],
      };
      saveSession(data.token, userForUi);
      return userForUi;
    }

    const user = AUTH_MOCK_USERS.find(
      (u) => u.email === email && u.password === password,
    );
    if (!user) {
      throw new Error("Invalid email or password");
    }
    const { password: _password, ...userWithoutPassword } = user;
    const token = `mock-jwt-token-${user.role.toLowerCase()}`;
    saveSession(token, userWithoutPassword);
    return userWithoutPassword;
  }

  logout() {
    clearSession();
  }

  getCurrentUser(): SessionUiUser | null {
    return getSessionUser();
  }

  isAuthenticated(): boolean {
    return !!getToken() && !!this.getCurrentUser();
  }

  hasRole(roles: string[]): boolean {
    const user = this.getCurrentUser();
    return !!user && roles.includes(user.role);
  }

  hasPermission(permission: Permission): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    if (user.role.toLowerCase() === "admin") return true;
    return hasPermission(user.permissions, permission);
  }
}

export const authService = new AuthService();
