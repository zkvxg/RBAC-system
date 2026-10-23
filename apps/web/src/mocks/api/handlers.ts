import { http, HttpResponse, type DefaultBodyType, type PathParams } from "msw";
import {
  WILDCARD,
  hasPermission,
  isPermission,
  isSuperuserRole,
  type ListUsersQuery,
  type Permission,
} from "@rbac/shared";
import { API_BASE_URL } from "../../config/runtime";
import { db, findRole, toUserDto } from "./db";
import type { MockUserRow } from "./seedUsers";

const url = (path: string) => `${API_BASE_URL}/api${path}`;
const now = () => new Date().toISOString();
const error = (status: number, message: string) =>
  HttpResponse.json({ message }, { status });

const TOKEN_PREFIX = "mock-token-";

const currentUser = (request: Request): MockUserRow | undefined => {
  const token = request.headers.get("Authorization")?.replace("Bearer ", "");
  const id = Number(token?.replace(TOKEN_PREFIX, ""));
  return db.users.find((u) => u.id === id && u.isActive);
};

const permissionsOf = (user: MockUserRow) =>
  findRole(user.RoleId)?.permissions ?? [];

const authorize = (request: Request, permission?: Permission) => {
  const user = currentUser(request);
  if (!user) return { denied: error(401, "Invalid token") };
  if (permission && !hasPermission(permissionsOf(user), permission)) {
    return { denied: error(403, `Missing permission: ${permission}`) };
  }
  return { user };
};

const isLastActiveSuperuser = (user: MockUserRow) => {
  if (!user.isActive || !isSuperuserRole(findRole(user.RoleId))) return false;
  return !db.users.some(
    (u) =>
      u.id !== user.id && u.isActive && isSuperuserRole(findRole(u.RoleId)),
  );
};

type Json = Record<string, unknown>;
type IdParams = PathParams<"id">;

export const handlers = [
  http.post<never, { email?: string; password?: string }>(
    url("/auth/login"),
    async ({ request }) => {
      const { email = "", password = "" } = await request.json();
      const user = db.users.find((u) => u.email === email.trim().toLowerCase());
      if (!user || user.password !== password) {
        return error(401, "Invalid credentials");
      }
      if (!user.isActive) return error(403, "Account is disabled");
      const role = findRole(user.RoleId);
      return HttpResponse.json({
        token: `${TOKEN_PREFIX}${user.id}`,
        user: {
          id: user.id,
          username: user.username,
          role: role?.name ?? "employee",
          permissions: role?.permissions ?? [],
        },
      });
    },
  ),

  http.get(url("/users"), ({ request }) => {
    const { denied } = authorize(request, "users.view");
    if (denied) return denied;

    const params = new URL(request.url).searchParams;
    const query: ListUsersQuery = {
      page: Number(params.get("page") ?? 1),
      limit: Math.min(Number(params.get("limit") ?? 20), 100),
      search: params.get("search") ?? undefined,
    };
    const search = query.search?.toLowerCase();
    const matches = db.users.filter(
      (u) =>
        !search ||
        [u.username, u.email, u.name].some((field) =>
          field?.toLowerCase().includes(search),
        ),
    );
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    return HttpResponse.json({
      data: matches.slice((page - 1) * limit, page * limit).map(toUserDto),
      meta: {
        page,
        limit,
        total: matches.length,
        totalPages: Math.ceil(matches.length / limit),
      },
    });
  }),

  http.get<IdParams>(url("/users/:id"), ({ request, params }) => {
    const { denied } = authorize(request, "users.view");
    if (denied) return denied;
    const user = db.users.find((u) => u.id === Number(params.id));
    return user
      ? HttpResponse.json(toUserDto(user))
      : error(404, "User not found");
  }),

  http.post<never, Json>(url("/users"), async ({ request }) => {
    const { denied } = authorize(request, "users.create");
    if (denied) return denied;
    const body = await request.json();
    const email = String(body.email ?? "").toLowerCase();
    if (db.users.some((u) => u.email === email)) {
      return error(409, "User already exists");
    }
    const role = findRole(Number(body.roleId)) ?? findRole(3);
    const row: MockUserRow = {
      id: db.nextUserId++,
      username: String(body.username ?? email.split("@")[0]),
      email,
      password: String(body.password ?? ""),
      name: (body.name as string) ?? null,
      department: (body.department as string) ?? null,
      phone: (body.phone as string) ?? null,
      location: (body.location as string) ?? null,
      isActive: body.isActive !== false,
      RoleId: role!.id,
      createdAt: now(),
      updatedAt: now(),
    };
    db.users.push(row);
    return HttpResponse.json(toUserDto(row), { status: 201 });
  }),

  http.put<IdParams, Json>(url("/users/:id"), async ({ request, params }) => {
    const { denied, user: actor } = authorize(request, "users.edit");
    if (denied) return denied;
    const user = db.users.find((u) => u.id === Number(params.id));
    if (!user) return error(404, "User not found");
    const changes = await request.json();

    if (changes.isActive === false && user.isActive) {
      if (actor.id === user.id) {
        return error(400, "You cannot deactivate your own account");
      }
      if (isLastActiveSuperuser(user)) {
        return error(409, "Cannot remove the last active administrator");
      }
    }
    const email = changes.email ? String(changes.email).toLowerCase() : null;
    if (
      email &&
      email !== user.email &&
      db.users.some((u) => u.email === email)
    ) {
      return error(409, "Email already in use");
    }

    for (const key of [
      "username",
      "name",
      "department",
      "phone",
      "location",
      "isActive",
    ] as const) {
      if (changes[key] !== undefined) {
        Object.assign(user, { [key]: changes[key] });
      }
    }
    if (email) user.email = email;
    user.updatedAt = now();
    return HttpResponse.json(toUserDto(user));
  }),

  http.delete<IdParams>(url("/users/:id"), ({ request, params }) => {
    const { denied, user: actor } = authorize(request, "users.delete");
    if (denied) return denied;
    const id = Number(params.id);
    if (actor.id === id) {
      return error(400, "You cannot delete your own account");
    }
    const user = db.users.find((u) => u.id === id);
    if (!user) return error(404, "User not found");
    if (isLastActiveSuperuser(user)) {
      return error(409, "Cannot remove the last active administrator");
    }
    db.users = db.users.filter((u) => u.id !== id);
    return HttpResponse.json({ message: "User deleted successfully" });
  }),

  http.put<IdParams, { roleId?: number }>(
    url("/users/:id/role"),
    async ({ request, params }) => {
      const { denied } = authorize(request, "users.edit");
      if (denied) return denied;
      const user = db.users.find((u) => u.id === Number(params.id));
      if (!user) return error(404, "User not found");
      const { roleId } = await request.json();
      const role = findRole(roleId);
      if (!role) return error(404, "Role not found");
      if (!isSuperuserRole(role) && isLastActiveSuperuser(user)) {
        return error(409, "Cannot remove the last active administrator");
      }
      user.RoleId = role.id;
      user.updatedAt = now();
      return HttpResponse.json({ message: "User role updated successfully" });
    },
  ),

  http.get(url("/roles"), ({ request }) => {
    const { denied } = authorize(request, "roles.view");
    if (denied) return denied;
    return HttpResponse.json(db.roles);
  }),

  http.post<never, Json>(url("/roles"), async ({ request }) => {
    const { denied, user } = authorize(request, "roles.create");
    if (denied) return denied;
    const body = await request.json();
    const permissions = (body.permissions as string[]) ?? [];
    if (!permissions.every(isPermission)) {
      return error(400, "Unknown permission");
    }
    if (
      permissions.includes(WILDCARD) &&
      !hasPermission(permissionsOf(user), WILDCARD)
    ) {
      return error(403, "Only superusers can grant all permissions");
    }
    if (db.roles.some((r) => r.name === body.name)) {
      return error(409, "Role already exists");
    }
    const role = {
      id: db.nextRoleId++,
      name: String(body.name),
      description: String(body.description ?? ""),
      permissions,
      createdAt: now(),
      updatedAt: now(),
    };
    db.roles.push(role);
    return HttpResponse.json(role, { status: 201 });
  }),

  http.put<IdParams, Json>(url("/roles/:id"), async ({ request, params }) => {
    const { denied, user } = authorize(request, "roles.edit");
    if (denied) return denied;
    const role = findRole(Number(params.id));
    if (!role) return error(404, "Role not found");
    if (isSuperuserRole(role)) {
      return error(400, "Cannot modify a superuser role");
    }
    const changes = await request.json();
    const permissions = changes.permissions as string[] | undefined;
    if (permissions && !permissions.every(isPermission)) {
      return error(400, "Unknown permission");
    }
    if (
      permissions?.includes(WILDCARD) &&
      !hasPermission(permissionsOf(user), WILDCARD)
    ) {
      return error(403, "Only superusers can grant all permissions");
    }
    Object.assign(role, {
      ...(changes.name !== undefined && { name: String(changes.name) }),
      ...(changes.description !== undefined && {
        description: String(changes.description),
      }),
      ...(permissions && { permissions }),
      updatedAt: now(),
    });
    return HttpResponse.json(role);
  }),

  http.delete<IdParams, DefaultBodyType>(
    url("/roles/:id"),
    ({ request, params }) => {
      const { denied } = authorize(request, "roles.delete");
      if (denied) return denied;
      const role = findRole(Number(params.id));
      if (!role) return error(404, "Role not found");
      if (isSuperuserRole(role)) {
        return error(400, "Cannot delete a superuser role");
      }
      db.roles = db.roles.filter((r) => r.id !== role.id);
      db.users.forEach((u) => {
        if (u.RoleId === role.id) Object.assign(u, { RoleId: null });
      });
      return HttpResponse.json({ message: "Role deleted successfully" });
    },
  ),
];
