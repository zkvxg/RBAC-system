const { test, expect } = require("@playwright/test");
const { PlaywrightApiClient } = require("./utils/playwrightApiClient");
const { createRole } = require("./utils/factories");
const { Role, RolePermission } = require("../models");

test.describe("Permission storage", () => {
  let apiClient;
  let adminToken;

  test.beforeAll(async () => {
    apiClient = await new PlaywrightApiClient().init();
    adminToken = process.env.ADMIN_TOKEN;
  });

  test.afterAll(async () => {
    await apiClient.dispose();
  });

  test("should expose permissions as a flat list of keys", async () => {
    const response = await apiClient.get("/api/roles", adminToken);
    const roles = await response.json();
    const manager = roles.find((r) => r.name === "manager");

    expect(manager.permissions).toEqual(
      expect.arrayContaining(["users.view", "roles.view"]),
    );
    expect(manager.Permissions).toBeUndefined();
    expect(manager.legacyPermissions).toBeUndefined();
  });

  test("should expose role permissions nested in users", async () => {
    const response = await apiClient.get("/api/users?limit=100", adminToken);
    const { data } = await response.json();
    const admin = data.find((u) => u.email === "admin@test.com");

    expect(admin.Role.permissions).toEqual(["*"]);
    expect(admin.Role.Permissions).toBeUndefined();
    expect(admin.password).toBeUndefined();
  });

  test("should reject permissions outside the catalog", async () => {
    const response = await apiClient.post(
      "/api/roles",
      { name: "bogus", description: "x", permissions: ["users.fly"] },
      adminToken,
    );

    expect(response.status()).toBe(400);
    expect((await response.json()).message).toBe("Unknown permission");
  });

  test("should replace permission links on update", async () => {
    const role = await createRole({ permissions: ["users.view"] });

    const response = await apiClient.put(
      `/api/roles/${role.id}`,
      { permissions: ["roles.view", "reports.view"] },
      adminToken,
    );

    expect(response.status()).toBe(200);
    expect((await response.json()).permissions.sort()).toEqual([
      "reports.view",
      "roles.view",
    ]);
    expect(await RolePermission.count({ where: { RoleId: role.id } })).toBe(2);
  });

  test("should remove permission links with the role", async () => {
    const role = await createRole({ permissions: ["users.view"] });

    await apiClient.delete(`/api/roles/${role.id}`, adminToken);

    expect(await Role.findByPk(role.id)).toBeNull();
    expect(await RolePermission.count({ where: { RoleId: role.id } })).toBe(0);
  });
});
