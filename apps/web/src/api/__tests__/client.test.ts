import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { AxiosAdapter, InternalAxiosRequestConfig } from "axios";
import { api } from "../client";
import { getToken, saveSession } from "../../auth/session";

const respondWith = (status: number) => {
  const seen: InternalAxiosRequestConfig[] = [];
  const adapter: AxiosAdapter = async (config) => {
    seen.push(config);
    const response = { data: {}, status, statusText: "", headers: {}, config };
    if (status >= 400) {
      throw Object.assign(new Error(`status ${status}`), {
        isAxiosError: true,
        config,
        response,
      });
    }
    return response;
  };
  api.defaults.adapter = adapter;
  return seen;
};

const signIn = () =>
  saveSession("token-123", {
    name: "x",
    email: "x@x",
    role: "Admin",
    permissions: ["*"],
  });

describe("api client", () => {
  const originalAdapter = api.defaults.adapter;
  const originalLocation = window.location;
  const assign = vi.fn();

  beforeEach(() => {
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { ...originalLocation, pathname: "/users", assign },
    });
  });

  afterEach(() => {
    api.defaults.adapter = originalAdapter;
    Object.defineProperty(window, "location", {
      configurable: true,
      value: originalLocation,
    });
  });

  it("sends the session token", async () => {
    signIn();
    const seen = respondWith(200);
    await api.get("/users");
    expect(seen[0]!.headers.get("Authorization")).toBe("Bearer token-123");
  });

  it("sends no authorization header without a session", async () => {
    const seen = respondWith(200);
    await api.get("/health");
    expect(seen[0]!.headers.get("Authorization")).toBeUndefined();
  });

  it("ends the session when the api rejects the token", async () => {
    signIn();
    respondWith(401);
    await expect(api.get("/users")).rejects.toThrow();
    expect(getToken()).toBeNull();
    expect(assign).toHaveBeenCalledWith("/login");
  });

  it("keeps the session on a failed login attempt", async () => {
    signIn();
    respondWith(401);
    await expect(api.post("/auth/login", {})).rejects.toThrow();
    expect(getToken()).toBe("token-123");
  });

  it("keeps the session on other errors", async () => {
    signIn();
    respondWith(403);
    await expect(api.get("/roles")).rejects.toThrow();
    expect(getToken()).toBe("token-123");
  });
});
