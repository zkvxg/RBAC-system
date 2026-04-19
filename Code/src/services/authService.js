import { AUTH_MOCK_USERS } from "../mocks/authMock";

class AuthService {
  async login(email, password) {
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
}

export const authService = new AuthService();
