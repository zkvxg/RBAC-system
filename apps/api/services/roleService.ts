import sequelize from "../config/database";
import { Role } from "../models";
import {
  WILDCARD,
  hasPermission,
  isSuperuserRole,
} from "../config/permissions";
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from "../errors";
import type { AuthUser } from "./authTypes";
import type {
  CreateRoleInput,
  UpdateRoleInput,
} from "../validation/roleSchemas";

const DEFAULT_ROLE = {
  name: "employee",
  description: "Default employee role",
  permissions: ["profile.view"],
};

const assertCanGrant = (actor: AuthUser, permissions?: string[]) => {
  if (
    permissions?.includes(WILDCARD) &&
    !hasPermission(actor.permissions, WILDCARD)
  ) {
    throw new ForbiddenError("Only superusers can grant all permissions");
  }
};

const findOrFail = async (id: number) => {
  const role = await Role.findByPk(id);
  if (!role) throw new NotFoundError("Role not found");
  return role;
};

const roleService = {
  findOrFail,

  list() {
    return Role.findAll();
  },

  async getDefaultRole() {
    const [role] = await Role.findOrCreate({
      where: { name: DEFAULT_ROLE.name },
      defaults: DEFAULT_ROLE,
    });
    return role;
  },

  async create(
    actor: AuthUser,
    { name, description, permissions }: CreateRoleInput,
  ) {
    assertCanGrant(actor, permissions);
    if (await Role.findOne({ where: { name } })) {
      throw new ConflictError("Role already exists");
    }
    return sequelize.transaction((transaction) =>
      Role.create({ name, description, permissions }, { transaction }),
    );
  },

  async update(actor: AuthUser, id: number, changes: UpdateRoleInput) {
    const role = await findOrFail(id);
    if (isSuperuserRole(role)) {
      throw new BadRequestError("Cannot modify a superuser role");
    }
    assertCanGrant(actor, changes.permissions);
    return sequelize.transaction((transaction) =>
      role.update(changes, { transaction }),
    );
  },

  async remove(id: number) {
    const role = await findOrFail(id);
    if (isSuperuserRole(role)) {
      throw new BadRequestError("Cannot delete a superuser role");
    }
    await role.destroy();
  },
};

export default roleService;
