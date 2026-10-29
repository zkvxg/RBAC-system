import { Op, type FindOptions, type WhereOptions } from "sequelize";
import type { Paginated } from "@rbac/shared";
import { User, Role } from "../models";
import { isSuperuserRole } from "../config/permissions";
import roleService from "./roleService";
import { BadRequestError, ConflictError, NotFoundError } from "../errors";
import type { AuthUser } from "./authTypes";
import type {
  CreateUserInput,
  ListUsersInput,
  UpdateUserInput,
} from "../validation/userSchemas";

const PUBLIC_VIEW: FindOptions = {
  include: [{ model: Role, attributes: ["id", "name", "permissions"] }],
  attributes: { exclude: ["password"] },
};

const LAST_SUPERUSER_MESSAGE = "Cannot remove the last active administrator";

const isSelf = (actor: AuthUser, id: number) => actor.userId === id;

async function isLastActiveSuperuser(user: User): Promise<boolean> {
  if (!user.isActive) return false;
  const roles = await Role.findAll();
  const superuserRoleIds = roles.filter(isSuperuserRole).map((r) => r.id);
  if (user.RoleId === null || !superuserRoleIds.includes(user.RoleId)) {
    return false;
  }
  const others = await User.count({
    where: {
      id: { [Op.ne]: user.id },
      isActive: true,
      RoleId: superuserRoleIds,
    },
  });
  return others === 0;
}

const assertNotLastSuperuser = async (user: User) => {
  if (await isLastActiveSuperuser(user)) {
    throw new ConflictError(LAST_SUPERUSER_MESSAGE);
  }
};

const findOrFail = async (id: number) => {
  const user = await User.findByPk(id);
  if (!user) throw new NotFoundError("User not found");
  return user;
};

const assertEmailFree = async (email: string) => {
  if (await User.findOne({ where: { email } })) {
    throw new ConflictError("User already exists");
  }
};

const resolveRole = async ({
  roleId,
  roleName,
}: Pick<CreateUserInput, "roleId" | "roleName">) => {
  let role: Role | null = null;
  if (roleId) {
    role = await Role.findByPk(roleId);
  } else if (roleName) {
    role = await Role.findOne({ where: { name: roleName } });
  }
  return role ?? roleService.getDefaultRole();
};

const userService = {
  assertEmailFree,

  getPublic(id: number) {
    return User.findByPk(id, PUBLIC_VIEW);
  },

  async getById(id: number) {
    const user = await userService.getPublic(id);
    if (!user) throw new NotFoundError("User not found");
    return user;
  },

  async list({
    page,
    limit,
    search,
    roleId,
    isActive,
    sortBy,
    order,
  }: ListUsersInput): Promise<Paginated<User>> {
    const like =
      User.sequelize?.getDialect() === "postgres" ? Op.iLike : Op.like;
    const where: WhereOptions = {
      ...(search && {
        [Op.or]: ["username", "email", "name"].map((field) => ({
          [field]: { [like]: `%${search}%` },
        })),
      }),
      ...(roleId !== undefined && { RoleId: roleId }),
      ...(isActive !== undefined && { isActive }),
    };

    const { rows, count } = await User.findAndCountAll({
      ...PUBLIC_VIEW,
      where,
      order: [
        [sortBy, order],
        ["id", order],
      ],
      limit,
      offset: (page - 1) * limit,
      distinct: true,
    });

    return {
      data: rows,
      meta: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    };
  },

  async create({
    roleId,
    roleName,
    isActive = true,
    ...fields
  }: CreateUserInput) {
    await assertEmailFree(fields.email);
    const role = await resolveRole({ roleId, roleName });
    const user = await User.create({ ...fields, isActive, RoleId: role.id });
    return userService.getPublic(user.id);
  },

  async update(actor: AuthUser, id: number, changes: UpdateUserInput) {
    const user = await findOrFail(id);

    if (changes.isActive === false && user.isActive) {
      if (isSelf(actor, id)) {
        throw new BadRequestError("You cannot deactivate your own account");
      }
      await assertNotLastSuperuser(user);
    }

    if (changes.email && changes.email !== user.email) {
      if (await User.findOne({ where: { email: changes.email } })) {
        throw new ConflictError("Email already in use");
      }
    }

    await user.update(changes);
    return userService.getPublic(id);
  },

  async remove(actor: AuthUser, id: number) {
    if (isSelf(actor, id)) {
      throw new BadRequestError("You cannot delete your own account");
    }
    const user = await findOrFail(id);
    await assertNotLastSuperuser(user);
    await user.destroy();
  },

  async changeRole(id: number, roleId: number) {
    const user = await findOrFail(id);
    const role = await roleService.findOrFail(roleId);
    if (!isSuperuserRole(role)) {
      await assertNotLastSuperuser(user);
    }
    await user.update({ RoleId: role.id });
  },
};

export default userService;
