import { beforeEach, describe, expect, it, vi } from "vitest";
import { BadRequestError, ConflictError, NotFoundError } from "../../errors";
import { Role, User } from "../../models";
import userService from "../userService";

vi.mock("../../models", () => ({
  User: {
    findByPk: vi.fn(),
    findOne: vi.fn(),
    count: vi.fn(),
    create: vi.fn(),
    findAndCountAll: vi.fn(),
    sequelize: { getDialect: () => "sqlite" },
  },
  Role: { findAll: vi.fn(), findByPk: vi.fn(), findOne: vi.fn() },
}));
vi.mock("../roleService", () => ({
  default: { findOrFail: vi.fn(), getDefaultRole: vi.fn() },
}));

const ADMIN_ROLE = { id: 1, permissions: ["*"] };
const EMPLOYEE_ROLE = { id: 3, permissions: ["profile.view"] };
const admin = { userId: 1, role: "admin", permissions: ["*"] };

const fakeUser = (fields: Record<string, unknown>) => ({
  isActive: true,
  update: vi.fn(),
  destroy: vi.fn(),
  ...fields,
});

describe("userService", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(Role.findAll).mockResolvedValue([
      ADMIN_ROLE,
      EMPLOYEE_ROLE,
    ] as never);
  });

  it("does not let users delete themselves", async () => {
    await expect(userService.remove(admin, 1)).rejects.toBeInstanceOf(
      BadRequestError,
    );
    expect(User.findByPk).not.toHaveBeenCalled();
  });

  it("refuses to delete the last active administrator", async () => {
    const target = fakeUser({ id: 2, RoleId: 1 });
    vi.mocked(User.findByPk).mockResolvedValue(target as never);
    vi.mocked(User.count).mockResolvedValue(0);

    await expect(userService.remove(admin, 2)).rejects.toBeInstanceOf(
      ConflictError,
    );
    expect(target.destroy).not.toHaveBeenCalled();
  });

  it("deletes an administrator while another one remains", async () => {
    const target = fakeUser({ id: 2, RoleId: 1 });
    vi.mocked(User.findByPk).mockResolvedValue(target as never);
    vi.mocked(User.count).mockResolvedValue(1);

    await userService.remove(admin, 2);
    expect(target.destroy).toHaveBeenCalled();
  });

  it("ignores the administrator rule for ordinary users", async () => {
    const target = fakeUser({ id: 5, RoleId: 3 });
    vi.mocked(User.findByPk).mockResolvedValue(target as never);

    await userService.remove(admin, 5);
    expect(User.count).not.toHaveBeenCalled();
    expect(target.destroy).toHaveBeenCalled();
  });

  it("does not let users deactivate themselves", async () => {
    vi.mocked(User.findByPk).mockResolvedValue(
      fakeUser({ id: 1, RoleId: 1 }) as never,
    );
    await expect(
      userService.update(admin, 1, { isActive: false }),
    ).rejects.toBeInstanceOf(BadRequestError);
  });

  it("rejects an email that belongs to someone else", async () => {
    vi.mocked(User.findByPk).mockResolvedValue(
      fakeUser({ id: 5, email: "a@x.com" }) as never,
    );
    vi.mocked(User.findOne).mockResolvedValue({ id: 6 } as never);
    await expect(
      userService.update(admin, 5, { email: "b@x.com" }),
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it("reports a missing user", async () => {
    vi.mocked(User.findByPk).mockResolvedValue(null);
    await expect(userService.getById(99)).rejects.toBeInstanceOf(NotFoundError);
  });

  it("builds pagination metadata", async () => {
    vi.mocked(User.findAndCountAll).mockResolvedValue({
      rows: [],
      count: 41,
    } as never);
    const result = await userService.list({
      page: 3,
      limit: 20,
      sortBy: "createdAt",
      order: "DESC",
    });
    expect(result.meta).toEqual({
      page: 3,
      limit: 20,
      total: 41,
      totalPages: 3,
    });
    expect(User.findAndCountAll).toHaveBeenCalledWith(
      expect.objectContaining({ limit: 20, offset: 40 }),
    );
  });
});
