import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from "../../errors";
import { Role } from "../../models";
import roleService from "../roleService";

vi.mock("../../models", () => ({
  Role: { findByPk: vi.fn(), findOne: vi.fn(), create: vi.fn() },
}));
vi.mock("../../config/database", () => ({
  default: {
    transaction: (work: (t: object) => unknown) => work({ id: "tx" }),
  },
}));

const manager = { userId: 2, role: "manager", permissions: ["roles.create"] };
const admin = { userId: 1, role: "admin", permissions: ["*"] };
const fakeRole = (permissions: string[]) => ({
  permissions,
  update: vi.fn((changes) => ({ ...changes })),
  destroy: vi.fn(),
});

describe("roleService", () => {
  beforeEach(() => vi.resetAllMocks());

  it("refuses to let a non-superuser grant the wildcard", async () => {
    await expect(
      roleService.create(manager, {
        name: "root",
        description: "x",
        permissions: ["*"],
      }),
    ).rejects.toBeInstanceOf(ForbiddenError);
    expect(Role.create).not.toHaveBeenCalled();
  });

  it("lets a superuser grant the wildcard inside a transaction", async () => {
    vi.mocked(Role.findOne).mockResolvedValue(null);
    await roleService.create(admin, {
      name: "root",
      description: "x",
      permissions: ["*"],
    });
    expect(Role.create).toHaveBeenCalledWith(
      { name: "root", description: "x", permissions: ["*"] },
      { transaction: { id: "tx" } },
    );
  });

  it("rejects duplicate role names", async () => {
    vi.mocked(Role.findOne).mockResolvedValue({} as never);
    await expect(
      roleService.create(admin, {
        name: "manager",
        description: "x",
        permissions: [],
      }),
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it("never modifies or deletes a superuser role", async () => {
    vi.mocked(Role.findByPk).mockResolvedValue(fakeRole(["*"]) as never);
    await expect(
      roleService.update(admin, 1, { description: "x" }),
    ).rejects.toBeInstanceOf(BadRequestError);
    await expect(roleService.remove(1)).rejects.toBeInstanceOf(BadRequestError);
  });

  it("reports a missing role", async () => {
    vi.mocked(Role.findByPk).mockResolvedValue(null);
    await expect(roleService.remove(99)).rejects.toBeInstanceOf(NotFoundError);
  });

  it("updates an ordinary role", async () => {
    const role = fakeRole(["users.view"]);
    vi.mocked(Role.findByPk).mockResolvedValue(role as never);
    await roleService.update(manager, 3, { permissions: ["roles.view"] });
    expect(role.update).toHaveBeenCalledWith(
      { permissions: ["roles.view"] },
      { transaction: { id: "tx" } },
    );
  });
});
