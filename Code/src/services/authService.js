import { AUTH_MOCK_USERS } from "../mocks/authMock";
import axios from "axios";
import { API_BASE_URL, USE_MOCKS, toUiRole } from "../config/runtime";

class AuthService {
  async login(email, password) {
    if (!USE_MOCKS) {
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email,
        password,
      });

      const { token, user } = response.data;
      const userForUi = {
        id: String(user.id),
        name: user.username || "User",
        email,
        role: toUiRole(user.role),
        status: "Active",
        permissions: Array.isArray(user.permissions) ? user.permissions : [],
      };

      localStorage.setItem("user", JSON.stringify(userForUi));
      localStorage.setItem("token", token);

      return userForUi;
    }

    // mock serwis dla frontendu, w praktyce sprawdzasz przez backend api
    return new Promise((resolve, reject) => {
      const user = AUTH_MOCK_USERS.find(
        (u) => u.email === email && u.password === password,
      );

      if (user) {
        // nie wysylamy hasla do frontendu
        const userWithoutPassword = {
          ...user,
          password: undefined,
          permissions: user.permissions || [],
        };
        // token do kolejnych requestow, w praktyce prawdziwy jwt
        const token = `mock-jwt-token-${user.role.toLowerCase()}`;

        localStorage.setItem("user", JSON.stringify(userWithoutPassword));
        localStorage.setItem("token", token);

        resolve(userWithoutPassword);
      } else {
        reject(new Error("Invalid email or password"));
      }
    });
  }

  logout() {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  }

  getCurrentUser() {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  }

  isAuthenticated() {
    const token = localStorage.getItem("token");
    const user = this.getCurrentUser();
    return !!token && !!user;
  }

  hasRole(roles) {
    const user = this.getCurrentUser();
    return user && roles.includes(user.role);
  }

  hasPermission(permission) {
    const user = this.getCurrentUser();
    if (!user) return false;
    // admin zawsze ma dostep do wszystkiego
    if (user.role === "Admin" || user.role === "admin") return true;
    const perms = Array.isArray(user.permissions) ? user.permissions : [];
    return perms.includes(permission);
  }
}

export const authService = new AuthService();
