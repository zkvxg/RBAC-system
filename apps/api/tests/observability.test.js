const { test, expect } = require("@playwright/test");
const { PlaywrightApiClient } = require("./utils/playwrightApiClient");

test.describe("Observability", () => {
  let apiClient;

  test.beforeAll(async () => {
    apiClient = await new PlaywrightApiClient().init();
  });

  test.afterAll(async () => {
    await apiClient.dispose();
  });

  test.describe("Request id", () => {
    test("should generate a request id", async () => {
      const response = await apiClient.get("/api/roles");

      expect(response.headers()["x-request-id"]).toMatch(/^[0-9a-f-]{36}$/);
    });

    test("should propagate a valid incoming request id", async () => {
      const response = await apiClient.context.get("/api/roles", {
        headers: { "X-Request-Id": "trace-abc-123" },
      });

      expect(response.headers()["x-request-id"]).toBe("trace-abc-123");
    });

    test("should replace a malformed incoming request id", async () => {
      const response = await apiClient.context.get("/api/roles", {
        headers: { "X-Request-Id": "bad id with spaces" },
      });

      expect(response.headers()["x-request-id"]).not.toBe("bad id with spaces");
    });
  });

  test.describe("Health check", () => {
    test("should report healthy api and database", async () => {
      const response = await apiClient.get("/health");

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body).toMatchObject({ status: "ok", database: "up" });
    });

    test("should not require authentication", async () => {
      const response = await apiClient.context.get("/health");

      expect(response.status()).toBe(200);
    });
  });
});
