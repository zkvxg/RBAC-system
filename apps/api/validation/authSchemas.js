const { z } = require("zod");
const { required, email, username, password } = require("./common");

const register = {
  body: z.object({ username, email, password }),
};

const login = {
  body: z.object({
    email: z
      .string(required("Email and password are required"))
      .trim()
      .toLowerCase(),
    password: z
      .string(required("Email and password are required"))
      .min(1, "Email and password are required"),
  }),
};

module.exports = { register, login };
