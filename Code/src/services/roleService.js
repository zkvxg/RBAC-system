import { userService } from "./userService";
import { MOCK_ROLES } from "../mocks/rolesMock";
import axios from "axios";
import { API_BASE_URL, USE_MOCKS, toUiRole } from "../config/runtime";

// backend trzyma role.name malymi literami dla kanonicznych rol admin manager employee
// a dla wlasnych rol tak jak je wpisano. ui pokazuje z duzej litery tylko te 3 kanoniczne
// a wlasne nazwy zostawia bez zmian zeby mozna je bylo poprawnie zapisac przy update
const displayRoleName = (apiName) => {
  if (!apiName) return "";
  const lower = String(apiName).toLowerCase();
  if (lower === "admin" || lower === "manager" || lower === "employee") {
    return toUiRole(apiName);
  }
  return apiName;
};

const API_URL = `${API_BASE_URL}/api`;

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const mapApiRoleToUi = (role) => ({
  id: role.id,
  name: displayRoleName(role.name),
  description: role.description,
  permissions: role.permissions || [],
  status: "Active",
});

class RoleService {
  async getRoles() {
    try {
      if (!USE_MOCKS) {
        const response = await axios.get(`${API_URL}/roles`, {
          headers: getAuthHeaders(),
        });
        const roles = response.data.map(mapApiRoleToUi);
        const users = await userService.getUsers();

        return roles.map((role) => ({
          ...role,
          userCount: users.filter((user) => user.role === role.name).length,
        }));
      }

      const users = await userService.getUsers();
      const rolesWithCounts = MOCK_ROLES.map((role) => ({
        ...role,
        userCount: users.filter((user) => user.role === role.name).length,
      }));

      return Promise.resolve(rolesWithCounts);
    } catch (error) {
      this.handleError(error);
    }
  }

  async getRoleById(id) {
    try {
      if (!USE_MOCKS) {
        const roles = await this.getRoles();
        return roles.find((r) => String(r.id) === String(id));
      }

      const role = MOCK_ROLES.find((r) => r.id === id);
      return Promise.resolve(role);
    } catch (error) {
      this.handleError(error);
    }
  }

  async createRole(roleData) {
    try {
      if (!USE_MOCKS) {
        const response = await axios.post(
          `${API_URL}/roles`,
          {
            name: roleData.name,
            description: roleData.description,
            permissions: roleData.permissions || [],
          },
          { headers: getAuthHeaders() },
        );

        return mapApiRoleToUi(response.data);
      }

      const newRole = {
        id: MOCK_ROLES.length + 1,
        ...roleData,
      };
      MOCK_ROLES.push(newRole);
      return Promise.resolve(newRole);
    } catch (error) {
      this.handleError(error);
    }
  }

  async updateRole(id, roleData) {
    try {
      if (!USE_MOCKS) {
        const response = await axios.put(
          `${API_URL}/roles/${id}`,
          {
            name: roleData.name,
            description: roleData.description,
            permissions: roleData.permissions || [],
          },
          { headers: getAuthHeaders() },
        );

        return mapApiRoleToUi(response.data);
      }

      const index = MOCK_ROLES.findIndex((r) => r.id === id);
      if (index !== -1) {
        MOCK_ROLES[index] = { ...MOCK_ROLES[index], ...roleData };
        return Promise.resolve(MOCK_ROLES[index]);
      }
    } catch (error) {
      this.handleError(error);
    }
  }

  async deleteRole(id) {
    try {
      if (!USE_MOCKS) {
        await axios.delete(`${API_URL}/roles/${id}`, {
          headers: getAuthHeaders(),
        });
        return { success: true };
      }

      const index = MOCK_ROLES.findIndex((r) => r.id === id);
      if (index !== -1) {
        MOCK_ROLES.splice(index, 1);
        return Promise.resolve({ success: true });
      }
    } catch (error) {
      this.handleError(error);
    }
  }

  handleError(error) {
    console.error("API Error:", error);
    throw error;
  }
}

export const roleService = new RoleService();
