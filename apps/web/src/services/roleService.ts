import axios from "axios";
import type { RoleDto } from "@rbac/shared";
import { userService } from "./userService";
import { MOCK_ROLES } from "../mocks/rolesMock";
import { USE_MOCKS, toUiRole } from "../config/runtime";
import { API_URL, getAuthHeaders, rethrow } from "./http";
import type { DeleteResult, RoleFormData, UiRole, UiUser } from "../types";

const handleError = rethrow("API");

const displayRoleName = (apiName: string | undefined): string => {
  if (!apiName) return "";
  const lower = String(apiName).toLowerCase();
  if (lower === "admin" || lower === "manager" || lower === "employee") {
    return toUiRole(apiName);
  }
  return apiName;
};

const mapApiRoleToUi = (role: RoleDto): UiRole => ({
  id: role.id,
  name: displayRoleName(role.name),
  description: role.description,
  permissions: role.permissions || [],
  status: "Active",
});

const withUserCounts = (roles: UiRole[], users: UiUser[]): UiRole[] =>
  roles.map((role) => ({
    ...role,
    userCount: users.filter((user) => user.role === role.name).length,
  }));

const toPayload = (roleData: RoleFormData) => ({
  name: roleData.name,
  description: roleData.description,
  permissions: roleData.permissions || [],
});

class RoleService {
  async getRoles(): Promise<UiRole[]> {
    try {
      if (!USE_MOCKS) {
        const { data } = await axios.get<RoleDto[]>(`${API_URL}/roles`, {
          headers: getAuthHeaders(),
        });
        const users = await userService.getUsers();
        return withUserCounts(data.map(mapApiRoleToUi), users);
      }
      const users = await userService.getUsers();
      return withUserCounts(MOCK_ROLES, users);
    } catch (error) {
      return handleError(error);
    }
  }

  async getRoleById(id: number): Promise<UiRole | undefined> {
    try {
      if (!USE_MOCKS) {
        const roles = await this.getRoles();
        return roles.find((r) => String(r.id) === String(id));
      }
      return MOCK_ROLES.find((r) => r.id === id);
    } catch (error) {
      return handleError(error);
    }
  }

  async createRole(roleData: RoleFormData): Promise<UiRole> {
    try {
      if (!USE_MOCKS) {
        const { data } = await axios.post<RoleDto>(
          `${API_URL}/roles`,
          toPayload(roleData),
          { headers: getAuthHeaders() },
        );
        return mapApiRoleToUi(data);
      }
      const newRole: UiRole = {
        permissions: [],
        status: "Active",
        ...roleData,
        id: MOCK_ROLES.length + 1,
      };
      MOCK_ROLES.push(newRole);
      return newRole;
    } catch (error) {
      return handleError(error);
    }
  }

  async updateRole(
    id: number,
    roleData: RoleFormData,
  ): Promise<UiRole | undefined> {
    try {
      if (!USE_MOCKS) {
        const { data } = await axios.put<RoleDto>(
          `${API_URL}/roles/${id}`,
          toPayload(roleData),
          { headers: getAuthHeaders() },
        );
        return mapApiRoleToUi(data);
      }
      const index = MOCK_ROLES.findIndex((r) => r.id === id);
      const existing = MOCK_ROLES[index];
      if (existing) {
        const updated = { ...existing, ...roleData };
        MOCK_ROLES[index] = updated;
        return updated;
      }
      return undefined;
    } catch (error) {
      return handleError(error);
    }
  }

  async deleteRole(id: number): Promise<DeleteResult | undefined> {
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
        return { success: true };
      }
      return undefined;
    } catch (error) {
      return handleError(error);
    }
  }
}

export const roleService = new RoleService();
