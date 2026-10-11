const { Op } = require("sequelize");
const { User, Role } = require("../models");
const { isSuperuserRole } = require("../config/permissions");
const roleService = require("./roleService");
const { BadRequestError, ConflictError, NotFoundError } = require("../errors");

const PUBLIC_VIEW = {
  include: [{ model: Role, attributes: ["name", "permissions"] }],
  attributes: { exclude: ["password"] },
};

const LAST_SUPERUSER_MESSAGE = "Cannot remove the last active administrator";

const isSelf = (actor, id) => String(actor.userId) === String(id);

async function isLastActiveSuperuser(user) {
  if (!user.isActive) return false;
  const roles = await Role.findAll({ attributes: ["id", "permissions"] });
  const superuserRoleIds = roles.filter(isSuperuserRole).map((r) => r.id);
  if (!superuserRoleIds.includes(user.RoleId)) return false;
  const others = await User.count({
    where: {
      id: { [Op.ne]: user.id },
      isActive: true,
      RoleId: superuserRoleIds,
    },
  });
  return others === 0;
}

const assertNotLastSuperuser = async (user) => {
  if (await isLastActiveSuperuser(user)) {
    throw new ConflictError(LAST_SUPERUSER_MESSAGE);
  }
};

const findOrFail = async (id) => {
  const user = await User.findByPk(id);
  if (!user) throw new NotFoundError("User not found");
  return user;
};

const assertEmailFree = async (email) => {
  if (await User.findOne({ where: { email } })) {
    throw new ConflictError("User already exists");
  }
};

const resolveRole = async ({ roleId, roleName }) => {
  let role = null;
  if (roleId) {
    role = await Role.findByPk(roleId);
  } else if (roleName) {
    role = await Role.findOne({ where: { name: roleName } });
  }
  return role ?? roleService.getDefaultRole();
};

const userService = {
  assertEmailFree,

  getPublic(id) {
    return User.findByPk(id, PUBLIC_VIEW);
  },

  list() {
    return User.findAll(PUBLIC_VIEW);
  },

  async create({ roleId, roleName, isActive = true, ...fields }) {
    await assertEmailFree(fields.email);
    const role = await resolveRole({ roleId, roleName });
    const user = await User.create({ ...fields, isActive, RoleId: role.id });
    return userService.getPublic(user.id);
  },

  async update(actor, id, changes) {
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

  async remove(actor, id) {
    if (isSelf(actor, id)) {
      throw new BadRequestError("You cannot delete your own account");
    }
    const user = await findOrFail(id);
    await assertNotLastSuperuser(user);
    await user.destroy();
  },

  async changeRole(id, roleId) {
    const user = await findOrFail(id);
    const role = await roleService.findOrFail(roleId);
    if (!isSuperuserRole(role)) {
      await assertNotLastSuperuser(user);
    }
    await user.update({ RoleId: role.id });
  },
};

module.exports = userService;
