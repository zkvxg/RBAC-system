const sequelize = require("../config/database");
const { Role } = require("../models");
const {
  WILDCARD,
  hasPermission,
  isSuperuserRole,
} = require("../config/permissions");
const {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
} = require("../errors");

const DEFAULT_ROLE = {
  name: "employee",
  description: "Default employee role",
  permissions: ["profile.view"],
};

const assertCanGrant = (actor, permissions) => {
  if (
    permissions?.includes(WILDCARD) &&
    !hasPermission(actor.permissions, WILDCARD)
  ) {
    throw new ForbiddenError("Only superusers can grant all permissions");
  }
};

const findOrFail = async (id) => {
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

  async create(actor, { name, description, permissions }) {
    assertCanGrant(actor, permissions);
    if (await Role.findOne({ where: { name } })) {
      throw new ConflictError("Role already exists");
    }
    return sequelize.transaction((transaction) =>
      Role.create({ name, description, permissions }, { transaction }),
    );
  },

  async update(actor, id, changes) {
    const role = await findOrFail(id);
    if (isSuperuserRole(role)) {
      throw new BadRequestError("Cannot modify a superuser role");
    }
    assertCanGrant(actor, changes.permissions);
    return sequelize.transaction((transaction) =>
      role.update(changes, { transaction }),
    );
  },

  async remove(id) {
    const role = await findOrFail(id);
    if (isSuperuserRole(role)) {
      throw new BadRequestError("Cannot delete a superuser role");
    }
    await role.destroy();
  },
};

module.exports = roleService;
