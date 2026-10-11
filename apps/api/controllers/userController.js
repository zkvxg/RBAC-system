const userService = require("../services/userService");

const userController = {
  async getAllUsers(req, res) {
    res.json(await userService.list());
  },

  async createUser(req, res) {
    res.status(201).json(await userService.create(req.body));
  },

  async updateUser(req, res) {
    res.json(await userService.update(req.user, req.params.id, req.body));
  },

  async deleteUser(req, res) {
    await userService.remove(req.user, req.params.id);
    res.json({ message: "User deleted successfully" });
  },

  async updateUserRole(req, res) {
    await userService.changeRole(req.params.id, req.body.roleId);
    res.json({ message: "User role updated successfully" });
  },
};

module.exports = userController;
