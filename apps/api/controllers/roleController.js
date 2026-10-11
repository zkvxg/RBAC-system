const roleService = require("../services/roleService");

const roleController = {
  async getAllRoles(req, res) {
    res.json(await roleService.list());
  },

  async createRole(req, res) {
    res.status(201).json(await roleService.create(req.user, req.body));
  },

  async updateRole(req, res) {
    res.json(await roleService.update(req.user, req.params.id, req.body));
  },

  async deleteRole(req, res) {
    await roleService.remove(req.params.id);
    res.json({ message: "Role deleted successfully" });
  },
};

module.exports = roleController;
