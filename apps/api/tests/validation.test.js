const { test, expect } = require("@playwright/test");
const { PlaywrightApiClient } = require("./utils/playwrightApiClient");
const { User, Role } = require("../models");

test.describe("Request validation", () => {
  let apiClient;
  let adminToken;

  test.beforeAll(async () => {
    apiClient = await new PlaywrightApiClient().init();
    adminToken = process.env.ADMIN_TOKEN;
  });

  test.afterAll(async () => {
    await apiClient.dispose();
  });

  test("should list every invalid field", async () => {
    const response = await apiClient.post("/api/auth/register", {
      username: "x",
      email: "not-an-email",
      password: "short",
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    const paths = body.errors.map((e) => e.path);
    expect(paths).toEqual(
      expect.arrayContaining(["body.username", "body.email", "body.password"]),
    );
    expect(body.message).toBe(body.errors[0].message);
  });

  test("should reject non numeric id", async () => {
    const response = await apiClient.delete("/api/users/abc", adminToken);

    expect(response.status()).toBe(400);
  });

  test("should reject permissions that are not an array", async () => {
    const response = await apiClient.post(
      "/api/roles",
      { name: "bad_perms", description: "x", permissions: "users.view" },
      adminToken,
    );

    expect(response.status()).toBe(400);
    expect((await response.json()).message).toBe(
      "permissions must be an array",
    );
  });

  test("should ignore fields outside the schema", async () => {
    const adminRole = await Role.findOne({ where: { name: "admin" } });

    const response = await apiClient.post("/api/auth/register", {
      username: "mass_assign",
      email: "Mass.Assign@Test.com",
      password: "password123",
      RoleId: adminRole.id,
      isActive: false,
    });

    expect(response.status()).toBe(201);
    const user = await User.findOne({
      where: { email: "mass.assign@test.com" },
      include: [Role],
    });
    expect(user.Role.name).toBe("employee");
    expect(user.isActive).toBe(true);
  });
});
