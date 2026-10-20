import axios from "axios";
import type { Paginated, RoleDto, UserDto } from "@rbac/shared";
import { MOCK_USERS } from "../mocks/usersMock";
import { USE_MOCKS, toApiRoleName, toUiRole } from "../config/runtime";
import { API_URL, getAuthHeaders, rethrow } from "./http";
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
  const { data } = await axios.get<RoleDto[]>(`${API_URL}/roles`, {
    headers: getAuthHeaders(),
  });
  const match = data.find((r) => String(r.name).toLowerCase() === apiRole);
  if (!match) {
    throw new Error(`Role ${apiRole} does not exist in backend`);
  }
  return match.id;
}

const DEFAULT_PERMISSIONS: Record<string, string[]> = {
  Admin: ["users.manage", "roles.manage", "reports.view", "reports.create"],
  Manager: ["users.view", "reports.view", "reports.create"],
};

class UserService {
  async getUsers(): Promise<UiUser[]> {
    try {
      if (!USE_MOCKS) {
        const { data } = await axios.get<Paginated<UserDto>>(
          `${API_URL}/users`,
          { headers: getAuthHeaders(), params: { limit: 100 } },
        );
        return data.data.map(mapApiUserToUi);
      }
      return MOCK_USERS;
    } catch (error) {
      return handleError(error);
    }
  }

  async getUserById(id: string): Promise<UiUser | undefined> {
    try {
      if (!USE_MOCKS) {
        const { data } = await axios.get<UserDto>(`${API_URL}/users/${id}`, {
          headers: getAuthHeaders(),
        });
        return mapApiUserToUi(data);
      }
      return MOCK_USERS.find((u) => u.id === id);
    } catch (error) {
      return handleError(error);
    }
  }

  async createUser(userData: UserFormData): Promise<UiUser> {
    try {
      if (!USE_MOCKS) {
        const roleId = await resolveRoleId(userData.role);
        const payload = {
          ...buildBackendPayload(userData),
          password: userData.password || "test123",
          roleId,
        };
        const { data } = await axios.post<UserDto>(
          `${API_URL}/users`,
          payload,
          { headers: getAuthHeaders() },
        );
        return mapApiUserToUi(data);
      }

      const maxId = Math.max(
        ...MOCK_USERS.map((u) => parseInt(u.id.replace("USR", ""))),
      );
      const formattedId = `USR${String(maxId + 1).padStart(3, "0")}`;
      const newUser: UiUser = {
        name: "",
        email: "",
        role: "Employee",
        department: "",
        phone: "",
        location: "",
        ...userData,
        id: formattedId,
        status: "Active",
        joinDate: new Date().toISOString().split("T")[0],
        lastActive: new Date().toISOString(),
        permissions: this.getDefaultPermissions(userData.role),
      };
      MOCK_USERS.push(newUser);
      return newUser;
    } catch (error) {
      return handleError(error);
    }
  }

  getDefaultPermissions(role: string | undefined): string[] {
    return DEFAULT_PERMISSIONS[role ?? ""] ?? ["reports.view"];
  }

  async updateUser(
    id: string,
    userData: UserFormData,
  ): Promise<UiUser | undefined> {
    try {
      if (USE_MOCKS) {
        const index = MOCK_USERS.findIndex((u) => u.id === id);
        const existing = MOCK_USERS[index];
        if (existing) {
          const updated = { ...existing, ...userData };
          MOCK_USERS[index] = updated;
          return updated;
        }
      }

      const { data } = await axios.put<UserDto>(
        `${API_URL}/users/${id}`,
        buildBackendPayload(userData),
        { headers: getAuthHeaders() },
      );

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
      return handleError(error);
    }
  }

  async deleteUser(id: string): Promise<DeleteResult> {
    try {
      if (USE_MOCKS) {
        const index = MOCK_USERS.findIndex((u) => u.id === id);
        if (index !== -1) {
          MOCK_USERS.splice(index, 1);
          return { success: true };
        }
      }

      await axios.delete(`${API_URL}/users/${id}`, {
        headers: getAuthHeaders(),
      });
      return { success: true };
    } catch (error) {
      return handleError(error);
    }
  }
}

export const userService = new UserService();
