import axios from "axios";
import { MOCK_USERS } from "../mocks/usersMock";
import {
  API_BASE_URL,
  USE_MOCKS,
  toApiRoleName,
  toUiRole,
} from "../config/runtime";

const API_URL = `${API_BASE_URL}/api`;

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const mapApiUserToUi = (user) => ({
  id: String(user.id),
  name: user.name || user.username || `User ${user.id}`,
  username: user.username,
  email: user.email,
  role: toUiRole(user.Role?.name || user.role),
  status: user.isActive === false ? "Inactive" : "Active",
  department: user.department || "N/A",
  joinDate: user.createdAt,
  lastActive: user.updatedAt,
  phone: user.phone || "",
  location: user.location || "",
});

const buildBackendPayload = (userData) => ({
  username:
    userData.username ||
    (userData.email ? userData.email.split("@")[0] : undefined),
  email: userData.email,
  name: userData.name,
  department: userData.department,
  phone: userData.phone,
  location: userData.location,
  isActive: userData.status ? userData.status !== "Inactive" : undefined,
});

async function resolveRoleId(uiRoleName) {
  const apiRole = toApiRoleName(uiRoleName);
  const { data } = await axios.get(`${API_URL}/roles`, {
    headers: getAuthHeaders(),
  });
  const match = data.find((r) => String(r.name).toLowerCase() === apiRole);
  if (!match) {
    throw new Error(`Role ${apiRole} does not exist in backend`);
  }
  return match.id;
}

class UserService {
  async getUsers() {
    try {
      if (!USE_MOCKS) {
        const response = await axios.get(`${API_URL}/users`, {
          headers: getAuthHeaders(),
        });
        return response.data.map(mapApiUserToUi);
      }

      return Promise.resolve(MOCK_USERS);
    } catch (error) {
      this.handleError(error);
    }
  }

  async getUserById(id) {
    try {
      if (!USE_MOCKS) {
        const users = await this.getUsers();
        return users.find((u) => String(u.id) === String(id));
      }

      const user = MOCK_USERS.find((u) => u.id === id);
      return Promise.resolve(user);
    } catch (error) {
      this.handleError(error);
    }
  }

  async createUser(userData) {
    try {
      if (!USE_MOCKS) {
        const roleId = await resolveRoleId(userData.role);
        const payload = {
          ...buildBackendPayload(userData),
          password: userData.password || "test123",
          roleId,
        };
        const { data } = await axios.post(`${API_URL}/users`, payload, {
          headers: getAuthHeaders(),
        });
        return mapApiUserToUi(data);
      }

      // pobierz najwiekszy ID i zwieksz o 1
      const maxId = Math.max(
        ...MOCK_USERS.map((u) => parseInt(u.id.replace("USR", ""))),
      );
      const nextId = maxId + 1;
      // wypelnij ID zerami na poczatku
      const formattedId = `USR${String(nextId).padStart(3, "0")}`;

      const newUser = {
        id: formattedId,
        ...userData,
        status: "Active",
        joinDate: new Date().toISOString().split("T")[0],
        lastActive: new Date().toISOString(),
        permissions: this.getDefaultPermissions(userData.role),
      };
      MOCK_USERS.push(newUser);
      return Promise.resolve(newUser);
    } catch (error) {
      this.handleError(error);
    }
  }

  getDefaultPermissions(role) {
    switch (role) {
      case "Admin":
        return [
          "users.manage",
          "roles.manage",
          "reports.view",
          "reports.create",
        ];
      case "Manager":
        return ["users.view", "reports.view", "reports.create"];
      default:
        return ["reports.view"];
    }
  }

  async updateUser(id, userData) {
    try {
      if (USE_MOCKS) {
        const index = MOCK_USERS.findIndex((u) => u.id === id);
        if (index !== -1) {
          MOCK_USERS[index] = { ...MOCK_USERS[index], ...userData };
          return Promise.resolve(MOCK_USERS[index]);
        }
      }

      // 1. zaktualizuj pola profilu
      const { data } = await axios.put(
        `${API_URL}/users/${id}`,
        buildBackendPayload(userData),
        { headers: getAuthHeaders() },
      );

      // 2. zaktualizuj role jesli zostala podana
      if (userData.role) {
        const roleId = await resolveRoleId(userData.role);
        await axios.put(
          `${API_URL}/users/${id}/role`,
          { roleId },
          { headers: getAuthHeaders() },
        );
      }

      return mapApiUserToUi(data);
    } catch (error) {
      this.handleError(error);
    }
  }

  async deleteUser(id) {
    try {
      if (USE_MOCKS) {
        const index = MOCK_USERS.findIndex((u) => u.id === id);
        if (index !== -1) {
          MOCK_USERS.splice(index, 1);
          return Promise.resolve({ success: true });
        }
      }

      await axios.delete(`${API_URL}/users/${id}`, {
        headers: getAuthHeaders(),
      });
      return { success: true };
    } catch (error) {
      this.handleError(error);
    }
  }

  handleError(error) {
    console.error("API Error:", error);
    throw error;
  }
}

export const userService = new UserService();
