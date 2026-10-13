const { test, expect } = require("@playwright/test");
const { PlaywrightApiClient } = require("./utils/playwrightApiClient");
const { createRole, createUser } = require("./utils/factories");

test.describe("User listing", () => {
  let apiClient;
  let adminToken;
  let role;

  test.beforeAll(async () => {
    apiClient = await new PlaywrightApiClient().init();
    adminToken = process.env.ADMIN_TOKEN;

    role = await createRole({ permissions: ["profile.view"] });
    for (const name of ["Query Alpha", "Query Beta", "Query Gamma"]) {
      await createUser(role, { name });
    }
    await createUser(role, { name: "Query Inactive", isActive: false });
  });

  test.afterAll(async () => {
    await apiClient.dispose();
  });

  const list = async (query) => {
    const response = await apiClient.get(`/api/users?${query}`, adminToken);
    expect(response.status()).toBe(200);
    return response.json();
  };

  test("should paginate results with metadata", async () => {
    const page1 = await list(
      `roleId=${role.id}&limit=2&page=1&sortBy=name&order=asc`,
    );
    const page2 = await list(
      `roleId=${role.id}&limit=2&page=2&sortBy=name&order=asc`,
    );

    expect(page1.meta).toEqual({ page: 1, limit: 2, total: 4, totalPages: 2 });
    expect(page1.data.map((u) => u.name)).toEqual([
      "Query Alpha",
      "Query Beta",
    ]);
    expect(page2.data.map((u) => u.name)).toEqual([
      "Query Gamma",
      "Query Inactive",
    ]);
  });

  test("should filter by active status", async () => {
    const body = await list(`roleId=${role.id}&isActive=false`);

    expect(body.data.map((u) => u.name)).toEqual(["Query Inactive"]);
  });

  test("should search case insensitively", async () => {
    const body = await list(`roleId=${role.id}&search=gAmMa`);

    expect(body.data.map((u) => u.name)).toEqual(["Query Gamma"]);
  });

  test("should sort descending", async () => {
    const body = await list(`roleId=${role.id}&sortBy=name&order=desc&limit=1`);

    expect(body.data[0].name).toBe("Query Inactive");
  });

  test("should reject limit above maximum", async () => {
    const response = await apiClient.get("/api/users?limit=1000", adminToken);

    expect(response.status()).toBe(400);
  });

  test("should reject unknown sort field", async () => {
    const response = await apiClient.get(
      "/api/users?sortBy=password",
      adminToken,
    );

    expect(response.status()).toBe(400);
  });

  test("should get a single user without password", async () => {
    const { data } = await list(`roleId=${role.id}&limit=1`);

    const response = await apiClient.get(
      `/api/users/${data[0].id}`,
      adminToken,
    );

    expect(response.status()).toBe(200);
    const user = await response.json();
    expect(user.id).toBe(data[0].id);
    expect(user.password).toBeUndefined();
    expect(user.Role).toBeTruthy();
  });

  test("should return 404 for missing user", async () => {
    const response = await apiClient.get("/api/users/999999", adminToken);

    expect(response.status()).toBe(404);
  });
});
