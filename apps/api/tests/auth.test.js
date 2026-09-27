const { test, expect } = require("@playwright/test");
const { PlaywrightApiClient } = require("./utils/playwrightApiClient");
const {
  buildRegisterPayload,
  buildLoginPayload,
} = require("./utils/dataBuilders");
const { User, Role } = require("../models");
const jwt = require("jsonwebtoken");

test.describe("Authentication System", () => {
  let apiClient;
  let validToken;

  test.beforeAll(async () => {
    apiClient = await new PlaywrightApiClient().init();
  });

  test.afterAll(async () => {
    await apiClient.dispose();
  });

  test.describe("User Registration", () => {
    test("should validate required fields", async () => {
      const response = await apiClient.post("/api/auth/register", {
        email: "test@test.com",
      });

      expect(response.status()).toBe(400);
    });

    test("should validate email format", async () => {
      const response = await apiClient.post(
        "/api/auth/register",
        buildRegisterPayload({
          username: "testuser",
          email: "invalid-email",
          password: "password123",
        }),
      );

      expect(response.status()).toBe(400);
    });

    test("should successfully register valid user", async () => {
      const response = await apiClient.post(
        "/api/auth/register",
        buildRegisterPayload({
          username: "testuser",
          email: "test@test.com",
          password: "password123",
        }),
      );

      expect(response.status()).toBe(201);
    });

    test("should assign default user role", async () => {
      const user = await User.findOne({
        where: { email: "test@test.com" },
        include: [{ model: Role }],
      });

      expect(user.Role.name).toBe("employee");
    });
  });

  test.describe("User Login", () => {
    test("should validate login credentials", async () => {
      const response = await apiClient.post("/api/auth/login", {
        email: "test@test.com",
      });

      expect(response.status()).toBe(400);
    });

    test("should reject invalid email", async () => {
      const response = await apiClient.post(
        "/api/auth/login",
        buildLoginPayload({
          email: "nonexistent@test.com",
          password: "password123",
        }),
      );

      expect(response.status()).toBe(401);
    });

    test("should reject wrong password", async () => {
      const response = await apiClient.post(
        "/api/auth/login",
        buildLoginPayload({
          email: "test@test.com",
          password: "wrongpassword",
        }),
      );

      expect(response.status()).toBe(401);
    });

    test("should login successfully with correct credentials", async () => {
      const response = await apiClient.post(
        "/api/auth/login",
        buildLoginPayload({
          email: "test@test.com",
          password: "password123",
        }),
      );

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body).toHaveProperty("token");
      expect(body).toHaveProperty("user");
    });
  });

  test.describe("Token Validation", () => {
    test.beforeAll(async () => {
      await apiClient.post(
        "/api/auth/register",
        buildRegisterPayload({
          username: "tokentest",
          email: "token@test.com",
          password: "password123",
        }),
      );

      const loginRes = await apiClient.post(
        "/api/auth/login",
        buildLoginPayload({
          email: "token@test.com",
          password: "password123",
        }),
      );
      const loginBody = await loginRes.json();
      validToken = loginBody.token;
    });

    test("should accept valid token", async () => {
      const response = await apiClient.get("/api/auth/profile", validToken);

      expect(response.status()).toBe(200);
    });

    test("should reject expired token", async () => {
      const expiredToken = jwt.sign(
        { userId: 1, role: "employee" },
        process.env.JWT_SECRET,
        { expiresIn: "0s" },
      );

      const response = await apiClient.get("/api/auth/profile", expiredToken);

      expect(response.status()).toBe(401);
    });

    test("should reject invalid token format", async () => {
      const response = await apiClient.get(
        "/api/auth/profile",
        "invalid-token-format",
      );

      expect(response.status()).toBe(401);
    });
  });

  test.describe("Logout", () => {
    test("should successfully logout", async () => {
      const response = await apiClient.post("/api/auth/logout", {}, validToken);

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body.message).toBe("Logged out successfully");
    });

    test("should reject logout without token", async () => {
      const response = await apiClient.post("/api/auth/logout", {});

      expect(response.status()).toBe(401);
      const body = await response.json();
      expect(body.message).toBe("No token provided");
    });
  });
});
