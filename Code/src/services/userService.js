import axios from "axios";
import { MOCK_USERS } from "../mocks/usersMock";

// url api backendu, w rzeczywistym projekcie wczytany ze zmiennych srodowiska
const API_URL = "http://localhost:3000/api";
// flaga do wyboru, mock data czy rzeczywiste wywolania api
const IS_DEVELOPMENT = true;

class UserService {
  async getUsers() {
    try {
      return Promise.resolve(MOCK_USERS);
    } catch (error) {
      this.handleError(error);
    }
  }

  async getUserById(id) {
    try {
      const user = MOCK_USERS.find((u) => u.id === id);
      return Promise.resolve(user);
    } catch (error) {
      this.handleError(error);
    }
  }

  async createUser(userData) {
    try {
      // Get the highest ID number and increment by 1
      const maxId = Math.max(
        ...MOCK_USERS.map((u) => parseInt(u.id.replace("USR", ""))),
      );
      const nextId = maxId + 1;
      // Format the ID with leading zeros
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
      if (IS_DEVELOPMENT) {
        const index = MOCK_USERS.findIndex((u) => u.id === id);
        if (index !== -1) {
          MOCK_USERS[index] = { ...MOCK_USERS[index], ...userData };
          return Promise.resolve(MOCK_USERS[index]);
        }
      }
      const response = await axios.put(`${API_URL}/users/${id}`, userData);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async deleteUser(id) {
    try {
      if (IS_DEVELOPMENT) {
        const index = MOCK_USERS.findIndex((u) => u.id === id);
        if (index !== -1) {
          MOCK_USERS.splice(index, 1);
          return Promise.resolve({ success: true });
        }
      }
      await axios.delete(`${API_URL}/users/${id}`);
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
