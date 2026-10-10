const { Op } = require("sequelize");
const { User, Role } = require("../models");
const { validatePassword } = require("../utils/passwordPolicy");
const { isSuperuserRole } = require("../config/permissions");

const PUBLIC_ATTRS = { exclude: ["password"] };

const LAST_SUPERUSER_MESSAGE = "Cannot remove the last active administrator";

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

const isSelf = (req, id) => String(req.user.userId) === String(id);

const userController = {
  async getAllUsers(req, res) {
    const users = await User.findAll({
      include: [{ model: Role, attributes: ["name", "permissions"] }],
      attributes: PUBLIC_ATTRS,
    });
    res.json(users);
  },

  async createUser(req, res) {
    const {
      username,
      email,
      password,
      name,
      department,
      phone,
      location,
      isActive,
      roleId,
      roleName,
    } = req.body;

    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ message: "username, email and password are required" });
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return res.status(400).json({ message: passwordError });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: "User already exists" });
    }

    let role = null;
    if (roleId) {
      role = await Role.findByPk(roleId);
    } else if (roleName) {
      role = await Role.findOne({
        where: { name: String(roleName).toLowerCase() },
      });
    }
    if (!role) {
      [role] = await Role.findOrCreate({
        where: { name: "employee" },
        defaults: {
          description: "Default employee role",
          permissions: ["profile.view"],
        },
      });
    }

    const user = await User.create({
      username,
      email,
      password,
      name,
      department,
      phone,
      location,
      isActive: isActive !== undefined ? isActive : true,
      RoleId: role.id,
    });

    const created = await User.findByPk(user.id, {
      include: [{ model: Role, attributes: ["name", "permissions"] }],
      attributes: PUBLIC_ATTRS,
    });
    res.status(201).json(created);
  },

  async updateUser(req, res) {
    const { id } = req.params;
    const { username, email, name, department, phone, location, isActive } =
      req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (isActive === false && user.isActive) {
      if (isSelf(req, id)) {
        return res
          .status(400)
          .json({ message: "You cannot deactivate your own account" });
      }
      if (await isLastActiveSuperuser(user)) {
        return res.status(409).json({ message: LAST_SUPERUSER_MESSAGE });
      }
    }

    if (email && email !== user.email) {
      const existing = await User.findOne({ where: { email } });
      if (existing) {
        return res.status(409).json({ message: "Email already in use" });
      }
    }

    await user.update({
      ...(username !== undefined && { username }),
      ...(email !== undefined && { email }),
      ...(name !== undefined && { name }),
      ...(department !== undefined && { department }),
      ...(phone !== undefined && { phone }),
      ...(location !== undefined && { location }),
      ...(isActive !== undefined && { isActive }),
    });

    const updated = await User.findByPk(id, {
      include: [{ model: Role, attributes: ["name", "permissions"] }],
      attributes: PUBLIC_ATTRS,
    });
    res.json(updated);
  },

  async deleteUser(req, res) {
    const { id } = req.params;
    if (isSelf(req, id)) {
      return res
        .status(400)
        .json({ message: "You cannot delete your own account" });
    }
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (await isLastActiveSuperuser(user)) {
      return res.status(409).json({ message: LAST_SUPERUSER_MESSAGE });
    }
    await user.destroy();
    res.json({ message: "User deleted successfully" });
  },

  async updateUserRole(req, res) {
    const { id } = req.params;
    const { roleId } = req.body;

    if (!roleId) {
      return res.status(400).json({ message: "roleId is required" });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const role = await Role.findByPk(roleId);
    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }

    if (!isSuperuserRole(role) && (await isLastActiveSuperuser(user))) {
      return res.status(409).json({ message: LAST_SUPERUSER_MESSAGE });
    }

    await user.update({ RoleId: roleId });
    res.json({ message: "User role updated successfully" });
  },
};

module.exports = userController;
