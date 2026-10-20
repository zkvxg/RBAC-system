import axios from "axios";
import {
  hasPermission,
  type LoginResponse,
  type Permission,
} from "@rbac/shared";
import { AUTH_MOCK_USERS } from "../mocks/authMock";
import { API_BASE_URL, USE_MOCKS, toUiRole } from "../config/runtime";
import type { SessionUiUser } from "../types";

class AuthService {
  async login(email: string, password: string): Promise<SessionUiUser> {
    if (!USE_MOCKS) {
      const { data } = await axios.post<LoginResponse>(
        `${API_BASE_URL}/api/auth/login`,
        { email, password },
      );
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
      localStorage.setItem("user", JSON.stringify(userForUi));
      localStorage.setItem("token", data.token);
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
    localStorage.setItem("user", JSON.stringify(userWithoutPassword));
    localStorage.setItem("token", token);
    return userWithoutPassword;
  }

  logout() {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  }

  getCurrentUser(): SessionUiUser | null {
    const user = localStorage.getItem("user");
    return user ? (JSON.parse(user) as SessionUiUser) : null;
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem("token") && !!this.getCurrentUser();
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
