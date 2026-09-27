const { test, expect } = require("@playwright/test");
const { PlaywrightApiClient } = require("./utils/playwrightApiClient");
const {
  buildRegisterPayload,
  buildLoginPayload,
} = require("./utils/dataBuilders");
const { User } = require("../models");

test.describe("User Management", () => {
  let apiClient;
  let adminToken;
  let employeeToken;
  let testUserId;
  let adminRoleId;
  let employeeRoleId;

  test.beforeAll(async () => {
    apiClient = await new PlaywrightApiClient().init();

    adminToken = process.env.ADMIN_TOKEN;
    employeeToken = process.env.EMPLOYEE_TOKEN;

    const { Role } = require("../models");
    const adminRole = await Role.findOne({ where: { name: "admin" } });
    const employeeRole = await Role.findOne({ where: { name: "employee" } });
    adminRoleId = adminRole.id;
    employeeRoleId = employeeRole.id;
  });

  test.afterAll(async () => {
    await apiClient.dispose();
  });

  test.describe("GET /api/users", () => {
    test("should allow admin to get all users", async () => {
      const response = await apiClient.get("/api/users", adminToken);

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(Array.isArray(body)).toBeTruthy();
      expect(body.length).toBeGreaterThanOrEqual(2);
      body.forEach((user) => {
        expect(user.password).toBeUndefined();
      });
    });

    test("should not allow regular user to get all users", async () => {
      const response = await apiClient.get("/api/users", employeeToken);

      expect(response.status()).toBe(403);
    });

    test("should reject request without token", async () => {
      const response = await apiClient.get("/api/users");

      expect(response.status()).toBe(401);
      const body = await response.json();
      expect(body.message).toBe("No token provided");
    });

    test("should reject request with invalid token", async () => {
      const response = await apiClient.get("/api/users", "invalid_token");

      expect(response.status()).toBe(401);
      const body = await response.json();
      expect(body.message).toBe("Invalid token");
    });
  });

  test.describe("User Registration Flow", () => {
    test("should register a new user", async () => {
      const response = await apiClient.post(
        "/api/auth/register",
        buildRegisterPayload({
          username: "newuser",
          email: "newuser@test.com",
          password: "password123",
        }),
      );

      expect(response.status()).toBe(201);
      const body = await response.json();
      expect(body.message).toBe("User registered successfully");

      const user = await User.findOne({ where: { email: "newuser@test.com" } });
      testUserId = user.id;
    });

    test("should prevent duplicate email registration", async () => {
      const response = await apiClient.post(
        "/api/auth/register",
        buildRegisterPayload({
          username: "duplicate",
          email: "newuser@test.com",
          password: "password123",
        }),
      );

      expect(response.status()).toBe(409);
      const body = await response.json();
      expect(body.message).toBe("User already exists");
    });
  });

  test.describe("User Role Management", () => {
    test("should allow admin to update user role", async () => {
      const response = await apiClient.put(
        `/api/users/${testUserId}/role`,
        { roleId: adminRoleId },
        adminToken,
      );

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body.message).toBe("User role updated successfully");
    });

    test("should not allow regular user to update roles", async () => {
      const response = await apiClient.put(
        `/api/users/${testUserId}/role`,
        { roleId: adminRoleId },
        employeeToken,
      );

      expect(response.status()).toBe(403);
    });

    test("should return 404 for non existing user", async () => {
      const response = await apiClient.put(
        "/api/users/99999/role",
        { roleId: adminRoleId },
        adminToken,
      );

      expect(response.status()).toBe(404);
      const body = await response.json();
      expect(body.message).toBe("User not found");
    });

    test("should return 404 for non existing role", async () => {
      const response = await apiClient.put(
        `/api/users/${testUserId}/role`,
        { roleId: 99999 },
        adminToken,
      );

      expect(response.status()).toBe(404);
      const body = await response.json();
      expect(body.message).toBe("Role not found");
    });
  });

  test.describe("User Authentication", () => {
    test("should login successfully with correct credentials", async () => {
      const response = await apiClient.post(
        "/api/auth/login",
        buildLoginPayload({
          email: "newuser@test.com",
          password: "password123",
        }),
      );

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body).toHaveProperty("token");
      expect(body).toHaveProperty("user");
    });

    test("should reject login with incorrect password", async () => {
      const response = await apiClient.post(
        "/api/auth/login",
        buildLoginPayload({
          email: "newuser@test.com",
          password: "wrongpassword",
        }),
      );

      expect(response.status()).toBe(401);
      const body = await response.json();
      expect(body.message).toBe("Invalid credentials");
    });
  });

  test.describe("User Profile", () => {
    test("should fetch user profile with valid token", async () => {
      const response = await apiClient.get("/api/auth/profile", adminToken);

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body).toHaveProperty("username");
      expect(body).toHaveProperty("email");
    });

    test("should reject profile fetch with invalid token", async () => {
      const response = await apiClient.get(
        "/api/auth/profile",
        "invalid_token",
      );

      expect(response.status()).toBe(401);
    });

    test("should reject profile fetch without token", async () => {
      const response = await apiClient.get("/api/auth/profile");

      expect(response.status()).toBe(401);
      const body = await response.json();
      expect(body.message).toBe("No token provided");
    });
  });
});
