import { userService } from "./userService";
import { MOCK_ROLES } from "../mocks/rolesMock";

class RoleService {
  async getRoles() {
    try {
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
      const role = MOCK_ROLES.find((r) => r.id === id);
      return Promise.resolve(role);
    } catch (error) {
      this.handleError(error);
    }
  }

  async createRole(roleData) {
    try {
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
