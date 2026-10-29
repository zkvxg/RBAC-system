import { z, type ZodType } from "zod";
import { PERMISSION_KEYS } from "@rbac/shared";
import * as authSchemas from "../validation/authSchemas";
import * as userSchemas from "../validation/userSchemas";
import * as roleSchemas from "../validation/roleSchemas";

type JsonSchema = Record<string, unknown>;

const schemaOf = (schema: ZodType): JsonSchema => {
  const { $schema: _dialect, ...json } = z.toJSONSchema(schema, {
    io: "input",
    unrepresentable: "any",
  }) as JsonSchema;
  return json;
};

const queryParameters = (schema: ZodType) => {
  const { properties = {}, required = [] } = schemaOf(schema) as {
    properties?: Record<string, JsonSchema>;
    required?: string[];
  };
  return Object.entries(properties).map(([name, property]) => ({
    name,
    in: "query",
    required: required.includes(name),
    schema: property,
  }));
};

const jsonBody = (schema: ZodType) => ({
  required: true,
  content: { "application/json": { schema: schemaOf(schema) } },
});

const ref = (name: string) => ({ $ref: `#/components/schemas/${name}` });

const json = (description: string, schema: JsonSchema) => ({
  description,
  content: { "application/json": { schema } },
});

const message = (description: string) => json(description, ref("Message"));

const errors = (...codes: (400 | 401 | 403 | 404 | 409 | 429)[]) => {
  const descriptions = {
    400: "Validation failed",
    401: "Missing, invalid or expired token",
    403: "Missing permission or disabled account",
    404: "Not found",
    409: "Conflicts with existing data or protected state",
    429: "Too many attempts",
  };
  return Object.fromEntries(
    codes.map((code) => [code, json(descriptions[code], ref("Error"))]),
  );
};

const idParameter = {
  name: "id",
  in: "path",
  required: true,
  schema: { type: "integer", minimum: 1 },
};

const secured = (permission: string) => ({
  security: [{ bearerAuth: [] }],
  "x-required-permission": permission,
});

export const openApiDocument = {
  openapi: "3.1.0",
  info: {
    title: "RBAC System API",
    version: "1.0.0",
    description:
      "Role-based access control: users, roles and a fixed permission " +
      "catalog. Every protected route names the permission it requires " +
      "(x-required-permission); a role holding `*` passes every check.",
  },
  servers: [{ url: "/" }],
  tags: [
    { name: "auth" },
    { name: "users" },
    { name: "roles" },
    { name: "health" },
  ],
  paths: {
    "/health": {
      get: {
        tags: ["health"],
        summary: "Liveness and database readiness",
        responses: {
          200: json("Healthy", ref("Health")),
          503: json("Database unreachable", ref("Health")),
        },
      },
    },
    "/api/auth/register": {
      post: {
        tags: ["auth"],
        summary: "Self-registration with the default employee role",
        requestBody: jsonBody(authSchemas.register.body),
        responses: {
          201: message("Registered"),
          ...errors(400, 409, 429),
        },
      },
    },
    "/api/auth/login": {
      post: {
        tags: ["auth"],
        summary: "Exchange credentials for a bearer token",
        requestBody: jsonBody(authSchemas.login.body),
        responses: {
          200: json("Signed in", ref("LoginResponse")),
          ...errors(400, 401, 403, 429),
        },
      },
    },
    "/api/auth/profile": {
      get: {
        tags: ["auth"],
        summary: "The signed-in user",
        security: [{ bearerAuth: [] }],
        responses: { 200: json("Profile", ref("User")), ...errors(401, 403) },
      },
    },
    "/api/auth/logout": {
      post: {
        tags: ["auth"],
        summary: "Acknowledge sign-out (tokens are stateless)",
        security: [{ bearerAuth: [] }],
        responses: { 200: message("Signed out"), ...errors(401) },
      },
    },
    "/api/users": {
      get: {
        tags: ["users"],
        summary: "List users with paging, search, filters and sorting",
        ...secured("users.view"),
        parameters: queryParameters(userSchemas.listUsers.query),
        responses: {
          200: json("A page of users", ref("UserPage")),
          ...errors(400, 401, 403),
        },
      },
      post: {
        tags: ["users"],
        summary: "Create a user",
        ...secured("users.create"),
        requestBody: jsonBody(userSchemas.createUser.body),
        responses: {
          201: json("Created", ref("User")),
          ...errors(400, 401, 403, 409),
        },
      },
    },
    "/api/users/{id}": {
      parameters: [idParameter],
      get: {
        tags: ["users"],
        summary: "Get one user",
        ...secured("users.view"),
        responses: { 200: json("User", ref("User")), ...errors(401, 403, 404) },
      },
      put: {
        tags: ["users"],
        summary: "Update profile fields or deactivate",
        description:
          "Refuses to deactivate the caller or the last active administrator.",
        ...secured("users.edit"),
        requestBody: jsonBody(userSchemas.updateUser.body),
        responses: {
          200: json("Updated", ref("User")),
          ...errors(400, 401, 403, 404, 409),
        },
      },
      delete: {
        tags: ["users"],
        summary: "Delete a user",
        description:
          "Refuses to delete the caller or the last active administrator.",
        ...secured("users.delete"),
        responses: {
          200: message("Deleted"),
          ...errors(400, 401, 403, 404, 409),
        },
      },
    },
    "/api/users/{id}/role": {
      parameters: [idParameter],
      put: {
        tags: ["users"],
        summary: "Assign a role",
        ...secured("users.edit"),
        requestBody: jsonBody(userSchemas.updateUserRole.body),
        responses: {
          200: message("Role assigned"),
          ...errors(400, 401, 403, 404, 409),
        },
      },
    },
    "/api/roles": {
      get: {
        tags: ["roles"],
        summary: "List roles with their permissions",
        ...secured("roles.view"),
        responses: {
          200: json("Roles", { type: "array", items: ref("Role") }),
          ...errors(401, 403),
        },
      },
      post: {
        tags: ["roles"],
        summary: "Create a role",
        description: "Only a superuser may grant `*`.",
        ...secured("roles.create"),
        requestBody: jsonBody(roleSchemas.createRole.body),
        responses: {
          201: json("Created", ref("Role")),
          ...errors(400, 401, 403, 409),
        },
      },
    },
    "/api/roles/{id}": {
      parameters: [idParameter],
      put: {
        tags: ["roles"],
        summary: "Update a role",
        description: "Superuser roles cannot be modified.",
        ...secured("roles.edit"),
        requestBody: jsonBody(roleSchemas.updateRole.body),
        responses: {
          200: json("Updated", ref("Role")),
          ...errors(400, 401, 403, 404),
        },
      },
      delete: {
        tags: ["roles"],
        summary: "Delete a role",
        description: "Superuser roles cannot be deleted.",
        ...secured("roles.delete"),
        responses: { 200: message("Deleted"), ...errors(400, 401, 403, 404) },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
    },
    schemas: {
      Permission: { type: "string", enum: [...PERMISSION_KEYS] },
      Role: {
        type: "object",
        required: ["id", "name", "description", "permissions"],
        properties: {
          id: { type: "integer" },
          name: { type: "string" },
          description: { type: "string" },
          permissions: { type: "array", items: ref("Permission") },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      User: {
        type: "object",
        required: ["id", "username", "email", "isActive"],
        properties: {
          id: { type: "integer" },
          username: { type: "string" },
          email: { type: "string", format: "email" },
          name: { type: ["string", "null"] },
          department: { type: ["string", "null"] },
          phone: { type: ["string", "null"] },
          location: { type: ["string", "null"] },
          isActive: { type: "boolean" },
          RoleId: { type: ["integer", "null"] },
          Role: {
            type: ["object", "null"],
            properties: {
              id: { type: "integer" },
              name: { type: "string" },
              permissions: { type: "array", items: ref("Permission") },
            },
          },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      UserPage: {
        type: "object",
        required: ["data", "meta"],
        properties: {
          data: { type: "array", items: ref("User") },
          meta: {
            type: "object",
            properties: {
              page: { type: "integer" },
              limit: { type: "integer" },
              total: { type: "integer" },
              totalPages: { type: "integer" },
            },
          },
        },
      },
      LoginResponse: {
        type: "object",
        required: ["token", "user"],
        properties: {
          token: { type: "string", description: "JWT carrying only `sub`" },
          user: {
            type: "object",
            properties: {
              id: { type: "integer" },
              username: { type: "string" },
              role: { type: "string" },
              permissions: { type: "array", items: ref("Permission") },
            },
          },
        },
      },
      Message: {
        type: "object",
        required: ["message"],
        properties: { message: { type: "string" } },
      },
      Error: {
        type: "object",
        required: ["message"],
        properties: {
          message: { type: "string" },
          errors: {
            type: "array",
            items: {
              type: "object",
              properties: {
                path: { type: "string", example: "body.email" },
                message: { type: "string" },
              },
            },
          },
        },
      },
      Health: {
        type: "object",
        properties: {
          status: { type: "string", enum: ["ok", "error"] },
          database: { type: "string", enum: ["up", "down"] },
          uptime: { type: "number" },
        },
      },
    },
  },
};
