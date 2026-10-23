import type { RoleDto } from "@rbac/shared";
import { api } from "../api/client";
import { userService } from "./userService";
import { toUiRole } from "../config/runtime";
import { rethrow } from "./http";
import type { DeleteResult, RoleFormData, UiRole } from "../types";

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

const toPayload = (roleData: RoleFormData) => ({
  name: roleData.name,
  description: roleData.description,
  permissions: roleData.permissions || [],
});

class RoleService {
  async getRoles(): Promise<UiRole[]> {
    try {
      const [{ data }, users] = await Promise.all([
        api.get<RoleDto[]>("/roles"),
        userService.getUsers(),
      ]);
      return data.map(mapApiRoleToUi).map((role) => ({
        ...role,
        userCount: users.filter((user) => user.role === role.name).length,
      }));
    } catch (error) {
      return handleError(error);
    }
  }

  async createRole(roleData: RoleFormData): Promise<UiRole> {
    try {
      const { data } = await api.post<RoleDto>("/roles", toPayload(roleData));
      return mapApiRoleToUi(data);
    } catch (error) {
      return handleError(error);
    }
  }

  async updateRole(id: number, roleData: RoleFormData): Promise<UiRole> {
    try {
      const { data } = await api.put<RoleDto>(
        `/roles/${id}`,
        toPayload(roleData),
      );
      return mapApiRoleToUi(data);
    } catch (error) {
      return handleError(error);
    }
  }

  async deleteRole(id: number): Promise<DeleteResult> {
    try {
      await api.delete(`/roles/${id}`);
      return { success: true };
    } catch (error) {
      return handleError(error);
    }
  }
}

export const roleService = new RoleService();
