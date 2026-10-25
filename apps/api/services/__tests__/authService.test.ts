import { beforeEach, describe, expect, it, vi } from "vitest";
import jwt from "jsonwebtoken";
import { ForbiddenError, UnauthorizedError } from "../../errors";
import { User } from "../../models";
import authService from "../authService";

vi.mock("../../models", () => ({
  User: { findByPk: vi.fn(), findOne: vi.fn() },
  Role: {},
}));

const sign = (payload: object) =>
  jwt.sign(payload, process.env.JWT_SECRET as string);

describe("authService.authenticate", () => {
  beforeEach(() => vi.mocked(User.findByPk).mockReset());

  it("rejects a token signed with another secret", async () => {
    const forged = jwt.sign({ sub: 1 }, "someone-elses-secret");
    await expect(authService.authenticate(forged)).rejects.toBeInstanceOf(
      UnauthorizedError,
    );
  });

  it("rejects a token without a numeric subject", async () => {
    await expect(
      authService.authenticate(sign({ sub: "admin" })),
    ).rejects.toBeInstanceOf(UnauthorizedError);
    expect(User.findByPk).not.toHaveBeenCalled();
  });

  it("rejects a token of a deleted user", async () => {
    vi.mocked(User.findByPk).mockResolvedValue(null);
    await expect(
      authService.authenticate(sign({ sub: 5 })),
    ).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it("rejects a token of a deactivated user", async () => {
    vi.mocked(User.findByPk).mockResolvedValue({
      id: 5,
      isActive: false,
    } as never);
    await expect(
      authService.authenticate(sign({ sub: 5 })),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("reads role and permissions from the database, not the token", async () => {
    vi.mocked(User.findByPk).mockResolvedValue({
      id: 5,
      isActive: true,
      Role: { name: "manager", permissions: ["users.view"] },
    } as never);

    const user = await authService.authenticate(
      sign({ sub: 5, role: "admin", permissions: ["*"] }),
    );

    expect(user).toEqual({
      userId: 5,
      role: "manager",
      permissions: ["users.view"],
    });
  });
});
