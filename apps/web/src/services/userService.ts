import type { Paginated, RoleDto, UserDto } from "@rbac/shared";
import { api } from "../api/client";
import { toApiRoleName, toUiRole } from "../config/runtime";
import { rethrow } from "./http";
import type { DeleteResult, UiUser, UserFormData } from "../types";

const handleError = rethrow("API");

const mapApiUserToUi = (user: UserDto): UiUser => ({
  id: String(user.id),
  name: user.name || user.username || `User ${user.id}`,
  username: user.username,
  email: user.email,
  role: toUiRole(user.Role?.name),
  status: user.isActive === false ? "Inactive" : "Active",
  department: user.department || "N/A",
  joinDate: user.createdAt,
  lastActive: user.updatedAt,
  phone: user.phone || "",
  location: user.location || "",
});

const buildBackendPayload = (userData: UserFormData) => ({
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

async function resolveRoleId(uiRoleName: string | undefined): Promise<number> {
  const apiRole = toApiRoleName(uiRoleName);
  const { data } = await api.get<RoleDto[]>("/roles");
  const match = data.find((r) => String(r.name).toLowerCase() === apiRole);
  if (!match) {
    throw new Error(`Role ${apiRole} does not exist in backend`);
  }
  return match.id;
}

class UserService {
  async getUsers(): Promise<UiUser[]> {
    try {
      const { data } = await api.get<Paginated<UserDto>>("/users", {
        params: { limit: 100 },
      });
      return data.data.map(mapApiUserToUi);
    } catch (error) {
      return handleError(error);
    }
  }

  async getUserById(id: string): Promise<UiUser> {
    try {
      const { data } = await api.get<UserDto>(`/users/${id}`);
      return mapApiUserToUi(data);
    } catch (error) {
      return handleError(error);
    }
  }

  async createUser(userData: UserFormData): Promise<UiUser> {
    try {
      const roleId = await resolveRoleId(userData.role);
      const { data } = await api.post<UserDto>("/users", {
        ...buildBackendPayload(userData),
        password: userData.password,
        roleId,
      });
      return mapApiUserToUi(data);
    } catch (error) {
      return handleError(error);
    }
  }

  async updateUser(id: string, userData: UserFormData): Promise<UiUser> {
    try {
      const { data } = await api.put<UserDto>(
        `/users/${id}`,
        buildBackendPayload(userData),
      );

      if (userData.role) {
        const roleId = await resolveRoleId(userData.role);
        await api.put(`/users/${id}/role`, { roleId });
      }

      return mapApiUserToUi(data);
    } catch (error) {
      return handleError(error);
    }
  }

  async deleteUser(id: string): Promise<DeleteResult> {
    try {
      await api.delete(`/users/${id}`);
      return { success: true };
    } catch (error) {
      return handleError(error);
    }
  }
}

export const userService = new UserService();
