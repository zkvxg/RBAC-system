import type { LoginResponse, Permission } from "@rbac/shared";
import { hasPermission } from "@rbac/shared";
import { api } from "../api/client";
import { toUiRole } from "../config/runtime";
import {
  clearSession,
  getSessionUser,
  getToken,
  saveSession,
} from "../auth/session";
import type { SessionUiUser } from "../types";

class AuthService {
  async login(email: string, password: string): Promise<SessionUiUser> {
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
    return hasPermission(user.permissions, permission);
  }
}

export const authService = new AuthService();
