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
  let userToken;
  let testUserId;
  let adminRoleId;
  let userRoleId;

  test.beforeAll(async () => {
    apiClient = await new PlaywrightApiClient().init();

    // uzycie globalnych tokenow z setup
    adminToken = process.env.ADMIN_TOKEN;
    userToken = process.env.USER_TOKEN;

    // pobieranie role id z bazy danych
    const { Role } = require("../models");
    const adminRole = await Role.findOne({ where: { name: "admin" } });
    const userRole = await Role.findOne({ where: { name: "user" } });
    adminRoleId = adminRole.id;
    userRoleId = userRole.id;
  });

  test.afterAll(async () => {
    await apiClient.dispose();
  });

  test.describe("GET /api/users", () => {
    // test pobrania listy wszystkich uzytkownikow przez admina
    test("should allow admin to get all users", async () => {
      const response = await apiClient.get("/api/users", adminToken);

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(Array.isArray(body)).toBeTruthy();
      expect(body.length).toBe(2);
      expect(body[0].password).toBeUndefined();
    });

    // test blokady dostepu do listy uzytkownikow dla zwyklego usera
    test("should not allow regular user to get all users", async () => {
      const response = await apiClient.get("/api/users", userToken);

      expect(response.status()).toBe(403);
    });

    // test odrzucenia zadania bez tokenu autoryzacji
    test("should reject request without token", async () => {
      const response = await apiClient.get("/api/users");

      expect(response.status()).toBe(401);
      const body = await response.json();
      expect(body.message).toBe("No token provided");
    });

    // test odrzucenia zadania z niepoprawnym tokenem
    test("should reject request with invalid token", async () => {
      const response = await apiClient.get("/api/users", "invalid_token");

      expect(response.status()).toBe(401);
      const body = await response.json();
      expect(body.message).toBe("Invalid token");
    });
  });

  test.describe("User Registration Flow", () => {
    // test rejestracji nowego uzytkownika i zapisania go w bazie
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

    // test zapobiegania rejestracji z duplikatem emaila
    test("should prevent duplicate email registration", async () => {
      const response = await apiClient.post(
        "/api/auth/register",
        buildRegisterPayload({
          username: "duplicate",
          email: "newuser@test.com",
          password: "password123",
        }),
      );

      expect(response.status()).toBe(400);
      const body = await response.json();
      expect(body.message).toBe("User already exists");
    });
  });

  test.describe("User Role Management", () => {
    // test zmiany roli uzytkownika przez admina
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

    // test blokady zmiany roli przez zwyklego usera
    test("should not allow regular user to update roles", async () => {
      const response = await apiClient.put(
        `/api/users/${testUserId}/role`,
        { roleId: adminRoleId },
        userToken,
      );

      expect(response.status()).toBe(403);
    });

    // test zwrocenia 404 dla nieistniejacego uzytkownika
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

    // test zwrocenia 404 dla nieistniejącej roli
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
    // test udanego logowania uzytkownika z poprawnymi danymi
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

    // test odrzucenia logowania z blednym haslem
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
    // test pobrania profilu uzytkownika z poprawnym tokenem
    test("should fetch user profile with valid token", async () => {
      const response = await apiClient.get("/api/auth/profile", adminToken);

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body).toHaveProperty("username");
      expect(body).toHaveProperty("email");
    });

    // test odrzucenia pobierania profilu z niepoprawnym tokenem
    test("should reject profile fetch with invalid token", async () => {
      const response = await apiClient.get(
        "/api/auth/profile",
        "invalid_token",
      );

      expect(response.status()).toBe(401);
    });

    // test odrzucenia pobierania profilu bez tokenu
    test("should reject profile fetch without token", async () => {
      const response = await apiClient.get("/api/auth/profile");

      expect(response.status()).toBe(401);
      const body = await response.json();
      expect(body.message).toBe("No token provided");
    });
  });
});
