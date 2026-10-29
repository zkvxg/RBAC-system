const { test, expect } = require("@playwright/test");
const { PlaywrightApiClient } = require("./utils/playwrightApiClient");
const { buildRole } = require("./utils/dataBuilders");
const { Role } = require("../models");

test.describe("Role Management", () => {
  let apiClient;
  let adminToken;
  let employeeToken;
  let testRoleId;

  test.beforeAll(async () => {
    apiClient = await new PlaywrightApiClient().init();

    adminToken = process.env.ADMIN_TOKEN;
    employeeToken = process.env.EMPLOYEE_TOKEN;
  });

  test.afterAll(async () => {
    await apiClient.dispose();
  });

  test.describe("Role Listing", () => {
    test("should allow admin to get all roles", async () => {
      const response = await apiClient.get("/api/roles", adminToken);

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(Array.isArray(body)).toBeTruthy();
      expect(body.length).toBeGreaterThanOrEqual(2);
    });

    test("should not allow employee to view roles", async () => {
      const response = await apiClient.get("/api/roles", employeeToken);

      expect(response.status()).toBe(403);
    });

    test("should reject roles listing without token", async () => {
      const response = await apiClient.get("/api/roles");

      expect(response.status()).toBe(401);
      const body = await response.json();
      expect(body.message).toBe("No token provided");
    });
  });

  test.describe("Role Creation", () => {
    test("should allow admin to create new role", async () => {
      const response = await apiClient.post(
        "/api/roles",
        buildRole({
          name: "moderator",
          permissions: ["reports.view", "reports.create"],
          description: "Moderator role",
        }),
        adminToken,
      );

      expect(response.status()).toBe(201);
      const body = await response.json();
      expect(body).toHaveProperty("name", "moderator");
      testRoleId = body.id;
    });

    test("should prevent duplicate role names", async () => {
      const response = await apiClient.post(
        "/api/roles",
        buildRole({
          name: "moderator",
          permissions: ["reports.view"],
          description: "Duplicate moderator role",
        }),
        adminToken,
      );

      expect(response.status()).toBe(409);
    });

    test("should not allow user to create role", async () => {
      const response = await apiClient.post(
        "/api/roles",
        buildRole({
          name: "test_role",
          permissions: ["reports.view"],
          description: "Test role",
        }),
        employeeToken,
      );

      expect(response.status()).toBe(403);
    });
  });

  test.describe("Role Updates", () => {
    test("should allow admin to update role", async () => {
      const response = await apiClient.put(
        `/api/roles/${testRoleId}`,
        buildRole({
          name: "moderator_updated",
          permissions: ["reports.view", "reports.create", "reports.export"],
          description: "Updated moderator role",
        }),
        adminToken,
      );

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body.name).toBe("moderator_updated");
    });

    test("should not allow user to update role", async () => {
      const response = await apiClient.put(
        `/api/roles/${testRoleId}`,
        buildRole({
          name: "moderator_fail",
          permissions: ["reports.view"],
          description: "Should fail",
        }),
        employeeToken,
      );

      expect(response.status()).toBe(403);
    });

    test("should return 404 when updating missing role", async () => {
      const response = await apiClient.put(
        "/api/roles/99999",
        buildRole({
          name: "missing",
          permissions: ["reports.view"],
          description: "missing role",
        }),
        adminToken,
      );

      expect(response.status()).toBe(404);
      const body = await response.json();
      expect(body.message).toBe("Role not found");
    });
  });

  test.describe("Role Deletion", () => {
    test("should not allow deletion of admin role", async () => {
      const adminRole = await Role.findOne({ where: { name: "admin" } });
      const response = await apiClient.delete(
        `/api/roles/${adminRole.id}`,
        adminToken,
      );

      expect(response.status()).toBe(400);
    });

    test("should allow admin to delete custom role", async () => {
      const response = await apiClient.delete(
        `/api/roles/${testRoleId}`,
        adminToken,
      );

      expect(response.status()).toBe(200);
    });

    test("should not allow user to delete role", async () => {
      const response = await apiClient.delete(
        `/api/roles/${testRoleId}`,
        employeeToken,
      );

      expect(response.status()).toBe(403);
    });

    test("should return 404 when deleting missing role", async () => {
      const response = await apiClient.delete("/api/roles/99999", adminToken);

      expect(response.status()).toBe(404);
      const body = await response.json();
      expect(body.message).toBe("Role not found");
    });
  });
});
