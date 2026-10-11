const authService = require("../services/authService");

const authController = {
  async register(req, res) {
    await authService.register(req.body);
    res.status(201).json({ message: "User registered successfully" });
  },

  async login(req, res) {
    res.json(await authService.login(req.body));
  },

  async logout(req, res) {
    res.json({ message: "Logged out successfully" });
  },

  async getProfile(req, res) {
    res.json(await authService.getProfile(req.user.userId));
  },
};

module.exports = authController;
