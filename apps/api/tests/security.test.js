const { test, expect, request } = require("@playwright/test");
const express = require("express");
const { PlaywrightApiClient } = require("./utils/playwrightApiClient");
const { createRole, createUser, signToken } = require("./utils/factories");
const { createAuthLimiter } = require("../middleware/rateLimit");
const { User, Role } = require("../models");

test.describe("Security", () => {
  let apiClient;
  let adminToken;
  let adminUser;

  test.beforeAll(async () => {
    apiClient = await new PlaywrightApiClient().init();
    adminToken = process.env.ADMIN_TOKEN;
    adminUser = await User.findOne({ where: { email: "admin@test.com" } });
  });

  test.afterAll(async () => {
    await apiClient.dispose();
  });

  const createUserWithPermissions = async (permissions, overrides = {}) => {
    const role = await createRole({ permissions });
    const user = await createUser(role, overrides);
    return { role, user, token: signToken(user) };
  };

  test.describe("HTTP hardening", () => {
    test("should send security headers", async () => {
      const response = await apiClient.get("/api/roles", adminToken);

      expect(response.headers()["x-content-type-options"]).toBe("nosniff");
      expect(response.headers()["x-powered-by"]).toBeUndefined();
    });

    test("should allow configured cors origin", async () => {
      const response = await apiClient.context.get("/api/roles", {
        headers: { Origin: "http://localhost:5173" },
      });

      expect(response.headers()["access-control-allow-origin"]).toBe(
        "http://localhost:5173",
      );
    });

    test("should not allow unknown cors origin", async () => {
      const response = await apiClient.context.get("/api/roles", {
        headers: { Origin: "https://evil.example" },
      });

      expect(response.headers()["access-control-allow-origin"]).toBeUndefined();
    });

    test("should reject oversized request body", async () => {
      const response = await apiClient.post("/api/auth/login", {
        email: "admin@test.com",
        password: "x".repeat(200 * 1024),
      });

      expect(response.status()).toBe(413);
    });

    test("should reject malformed json with 400", async () => {
      const response = await apiClient.context.post("/api/auth/login", {
        headers: { "Content-Type": "application/json" },
        data: "{not json",
      });

      expect(response.status()).toBe(400);
    });
  });

  test.describe("Rate limiting", () => {
    test("should block requests over the limit", async () => {
      const app = express();
      app.post("/login", createAuthLimiter({ max: 2 }), (req, res) =>
        res.json({ ok: true }),
      );
      const server = app.listen(0);
      const context = await request.newContext({
        baseURL: `http://localhost:${server.address().port}`,
      });

      try {
        expect((await context.post("/login")).status()).toBe(200);
        expect((await context.post("/login")).status()).toBe(200);
        const blocked = await context.post("/login");
        expect(blocked.status()).toBe(429);
        expect((await blocked.json()).message).toMatch(/too many attempts/i);
      } finally {
        await context.dispose();
        await new Promise((resolve) => server.close(resolve));
      }
    });
  });

  test.describe("Password policy", () => {
    for (const [label, password] of [
      ["too short", "abc12"],
      ["without digit", "abcdefgh"],
      ["without letter", "12345678"],
      ["over 72 bytes", `a1${"x".repeat(71)}`],
    ]) {
      test(`should reject password ${label}`, async () => {
        const response = await apiClient.post("/api/auth/register", {
          username: `weak_${label.replace(/\W/g, "_")}`,
          email: `weak.${label.replace(/\W/g, "")}@test.com`,
          password,
        });

        expect(response.status()).toBe(400);
      });
    }
  });

  test.describe("Inactive accounts", () => {
    test("should reject login of inactive user", async () => {
      const { user } = await createUserWithPermissions(["profile.view"], {
        password: "password123",
        isActive: false,
      });

      const response = await apiClient.post("/api/auth/login", {
        email: user.email,
        password: "password123",
      });

      expect(response.status()).toBe(403);
    });

    test("should reject token of user deactivated after login", async () => {
      const { user, token } = await createUserWithPermissions(["profile.view"]);
      expect((await apiClient.get("/api/auth/profile", token)).status()).toBe(
        200,
      );

      await user.update({ isActive: false });

      expect((await apiClient.get("/api/auth/profile", token)).status()).toBe(
        403,
      );
    });

    test("should reject token of deleted user", async () => {
      const { user, token } = await createUserWithPermissions(["profile.view"]);
      await user.destroy();

      const response = await apiClient.get("/api/auth/profile", token);

      expect(response.status()).toBe(401);
    });
  });

  test.describe("Permissions", () => {
    test("should not put permissions into the token", async () => {
      const { user } = await createUserWithPermissions(["profile.view"], {
        password: "password123",
      });

      const response = await apiClient.post("/api/auth/login", {
        email: user.email,
        password: "password123",
      });
      const { token } = await response.json();
      const payload = JSON.parse(
        Buffer.from(token.split(".")[1], "base64url").toString(),
      );

      expect(payload.sub).toBe(user.id);
      expect(payload.permissions).toBeUndefined();
      expect(payload.role).toBeUndefined();
    });

    test("should apply role changes to already issued tokens", async () => {
      const { role, token } = await createUserWithPermissions(["users.view"]);
      expect((await apiClient.get("/api/users", token)).status()).toBe(200);

      await role.update({ permissions: [] });

      expect((await apiClient.get("/api/users", token)).status()).toBe(403);
    });

    test("should grant everything to wildcard role", async () => {
      const { user, token } = await createUserWithPermissions(["*"]);

      try {
        expect((await apiClient.get("/api/users", token)).status()).toBe(200);
        expect((await apiClient.get("/api/roles", token)).status()).toBe(200);
      } finally {
        await user.destroy();
      }
    });

    test("should not let non-superuser grant wildcard", async () => {
      const { token } = await createUserWithPermissions([
        "roles.create",
        "roles.edit",
      ]);

      const created = await apiClient.post(
        "/api/roles",
        { name: "sneaky_root", description: "x", permissions: ["*"] },
        token,
      );
      expect(created.status()).toBe(403);

      const target = await createRole({ permissions: ["profile.view"] });
      const updated = await apiClient.put(
        `/api/roles/${target.id}`,
        { permissions: ["*"] },
        token,
      );
      expect(updated.status()).toBe(403);
    });

    test("should not allow modifying superuser role", async () => {
      const adminRole = await Role.findOne({ where: { name: "admin" } });

      const response = await apiClient.put(
        `/api/roles/${adminRole.id}`,
        { permissions: [] },
        adminToken,
      );

      expect(response.status()).toBe(400);
    });
  });

  test.describe("Administrator safeguards", () => {
    test("should not allow deleting own account", async () => {
      const response = await apiClient.delete(
        `/api/users/${adminUser.id}`,
        adminToken,
      );

      expect(response.status()).toBe(400);
    });

    test("should not allow deactivating own account", async () => {
      const response = await apiClient.put(
        `/api/users/${adminUser.id}`,
        { isActive: false },
        adminToken,
      );

      expect(response.status()).toBe(400);
    });

    test("should not allow demoting the last administrator", async () => {
      const employeeRole = await Role.findOne({ where: { name: "employee" } });

      const response = await apiClient.put(
        `/api/users/${adminUser.id}/role`,
        { roleId: employeeRole.id },
        adminToken,
      );

      expect(response.status()).toBe(409);
    });

    test("should not allow deleting or deactivating the last administrator", async () => {
      const { token } = await createUserWithPermissions([
        "users.edit",
        "users.delete",
      ]);

      const deactivated = await apiClient.put(
        `/api/users/${adminUser.id}`,
        { isActive: false },
        token,
      );
      expect(deactivated.status()).toBe(409);

      const deleted = await apiClient.delete(
        `/api/users/${adminUser.id}`,
        token,
      );
      expect(deleted.status()).toBe(409);
    });

    test("should allow removing an administrator when another remains", async () => {
      const adminRole = await Role.findOne({ where: { name: "admin" } });
      const secondAdmin = await createUser(adminRole);

      const response = await apiClient.delete(
        `/api/users/${secondAdmin.id}`,
        adminToken,
      );

      expect(response.status()).toBe(200);
    });
  });
});
