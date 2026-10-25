import { beforeEach, describe, expect, it, vi } from "vitest";
import { ForbiddenError, UnauthorizedError } from "../../errors";
import { mockNext, mockRequest, mockResponse } from "./helpers";
import { requirePermission, validateToken } from "../auth";

const authenticate = {
  calls: [] as string[],
  impl: async (_token: string): Promise<unknown> => undefined,
};
vi.mock("../../services/authService", () => ({
  default: {
    authenticate: (token: string) => {
      authenticate.calls.push(token);
      return authenticate.impl(token);
    },
  },
}));

const flush = () => new Promise((resolve) => setImmediate(resolve));

describe("requirePermission", () => {
  it("rejects an unauthenticated request", () => {
    const next = mockNext();
    requirePermission("users.view")(mockRequest(), mockResponse(), next);
    expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
  });

  it("rejects a user without the permission", () => {
    const next = mockNext();
    const req = mockRequest({
      user: { userId: 1, role: "employee", permissions: ["profile.view"] },
    });
    requirePermission("users.delete")(req, mockResponse(), next);
    const [error] = next.mock.calls[0]!;
    expect(error).toBeInstanceOf(ForbiddenError);
    expect(error.message).toBe("Missing permission: users.delete");
  });

  it("lets a user with the permission through", () => {
    const next = mockNext();
    const req = mockRequest({
      user: { userId: 1, role: "manager", permissions: ["users.view"] },
    });
    requirePermission("users.view")(req, mockResponse(), next);
    expect(next).toHaveBeenCalledWith();
  });

  it("lets a wildcard role through for any permission", () => {
    const next = mockNext();
    const req = mockRequest({
      user: { userId: 1, role: "admin", permissions: ["*"] },
    });
    requirePermission("roles.delete")(req, mockResponse(), next);
    expect(next).toHaveBeenCalledWith();
  });
});

describe("validateToken", () => {
  beforeEach(() => {
    authenticate.calls = [];
  });

  it("rejects a request without a bearer token", async () => {
    const next = mockNext();
    validateToken(mockRequest(), mockResponse(), next);
    await flush();
    const [error] = next.mock.calls[0]!;
    expect(error).toBeInstanceOf(UnauthorizedError);
    expect(error.message).toBe("No token provided");
    expect(authenticate.calls).toEqual([]);
  });

  it("attaches the authenticated user", async () => {
    const user = { userId: 7, role: "manager", permissions: ["users.view"] };
    authenticate.impl = async () => user;
    const req = mockRequest({ headers: { authorization: "Bearer abc" } });
    const next = mockNext();

    validateToken(req, mockResponse(), next);
    await flush();

    expect(authenticate.calls).toEqual(["abc"]);
    expect(req.user).toEqual(user);
    expect(next).toHaveBeenCalledWith();
  });

  it("forwards authentication failures", async () => {
    const failure = new ForbiddenError("Account is disabled");
    authenticate.impl = async () => {
      throw failure;
    };
    const next = mockNext();

    validateToken(
      mockRequest({ headers: { authorization: "Bearer abc" } }),
      mockResponse(),
      next,
    );
    await flush();

    expect(next.mock.calls[0]?.[0]).toBe(failure);
  });
});
