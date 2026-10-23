import type { RoleDto, UserDto } from "@rbac/shared";
import { SEED_USERS, type MockUserRow } from "./seedUsers";

const SEED_ROLES: RoleDto[] = [
  {
    id: 1,
    name: "admin",
    description: "Administrator",
    permissions: ["*"],
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
  },
  {
    id: 2,
    name: "manager",
    description: "Manager",
    permissions: [
      "users.view",
      "roles.view",
      "reports.view",
      "reports.create",
      "profile.view",
      "profile.edit",
    ],
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
  },
  {
    id: 3,
    name: "employee",
    description: "Default employee role",
    permissions: ["profile.view", "profile.edit"],
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
  },
];

const clone = <T>(value: T): T => structuredClone(value);

export const db = {
  roles: clone(SEED_ROLES),
  users: clone(SEED_USERS),
  nextRoleId: SEED_ROLES.length + 1,
  nextUserId: SEED_USERS.length + 1,
};

export const findRole = (id: number | null | undefined) =>
  db.roles.find((r) => r.id === id);

export const toUserDto = (row: MockUserRow): UserDto => {
  const { password: _password, ...user } = row;
  const role = findRole(row.RoleId);
  return {
    ...user,
    Role: role
      ? { id: role.id, name: role.name, permissions: role.permissions }
      : null,
  };
};
