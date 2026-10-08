const { Role } = require("../models");
const {
  WILDCARD,
  hasPermission,
  isSuperuserRole,
} = require("../config/permissions");

const grantsWildcardWithoutRight = (req, permissions) =>
  Array.isArray(permissions) &&
  permissions.includes(WILDCARD) &&
  !hasPermission(req.user.permissions, WILDCARD);

const roleController = {
  async getAllRoles(req, res) {
    try {
      const roles = await Role.findAll();
      res.json(roles);
    } catch (error) {
      console.error("Error fetching roles:", error);
      res.status(500).json({ message: "Error fetching roles" });
    }
  },

  async createRole(req, res) {
    try {
      const { name, permissions, description } = req.body;

      if (!name || !description || permissions === undefined) {
        return res
          .status(400)
          .json({ message: "name, description and permissions are required" });
      }

      if (!Array.isArray(permissions)) {
        return res
          .status(400)
          .json({ message: "permissions must be an array" });
      }

      if (grantsWildcardWithoutRight(req, permissions)) {
        return res
          .status(403)
          .json({ message: "Only superusers can grant all permissions" });
      }

      const existing = await Role.findOne({ where: { name } });
      if (existing) {
        return res.status(409).json({ message: "Role already exists" });
      }

      const role = await Role.create({ name, permissions, description });
      res.status(201).json(role);
    } catch (error) {
      console.error("Error creating role:", error);
      res.status(500).json({ message: "Error creating role" });
    }
  },

  async updateRole(req, res) {
    try {
      const { id } = req.params;
      const { name, permissions, description } = req.body;

      const role = await Role.findByPk(id);
      if (!role) {
        return res.status(404).json({ message: "Role not found" });
      }

      if (isSuperuserRole(role)) {
        return res
          .status(400)
          .json({ message: "Cannot modify a superuser role" });
      }

      if (grantsWildcardWithoutRight(req, permissions)) {
        return res
          .status(403)
          .json({ message: "Only superusers can grant all permissions" });
      }

      await role.update({ name, permissions, description });
      res.json(role);
    } catch (error) {
      console.error("Error updating role:", error);
      res.status(500).json({ message: "Error updating role" });
    }
  },

  async deleteRole(req, res) {
    try {
      const { id } = req.params;
      const role = await Role.findByPk(id);

      if (!role) {
        return res.status(404).json({ message: "Role not found" });
      }

      if (isSuperuserRole(role)) {
        return res
          .status(400)
          .json({ message: "Cannot delete a superuser role" });
      }

      await role.destroy();
      res.json({ message: "Role deleted successfully" });
    } catch (error) {
      console.error("Error deleting role:", error);
      res.status(500).json({ message: "Error deleting role" });
    }
  },
};

module.exports = roleController;
