const { User, Role } = require("../models");

const PUBLIC_ATTRS = { exclude: ["password"] };

const userController = {
  async getAllUsers(req, res) {
    try {
      // pobieramy uzytkownikow z rolami, bez hasel
      const users = await User.findAll({
        include: [{ model: Role, attributes: ["name", "permissions"] }],
        attributes: PUBLIC_ATTRS,
      });
      res.json(users);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error fetching users", error: error.message });
    }
  },

  async createUser(req, res) {
    try {
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

      if (typeof password !== "string" || password.length < 5) {
        return res
          .status(400)
          .json({ message: "Password must be at least 5 characters long" });
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
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error creating user", error: error.message });
    }
  },

  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const { username, email, name, department, phone, location, isActive } =
        req.body;

      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
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
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error updating user", error: error.message });
    }
  },

  async deleteUser(req, res) {
    try {
      const { id } = req.params;
      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      await user.destroy();
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error deleting user", error: error.message });
    }
  },

  async updateUserRole(req, res) {
    try {
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

      await user.update({ RoleId: roleId });
      res.json({ message: "User role updated successfully" });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error updating user role", error: error.message });
    }
  },
};

module.exports = userController;
