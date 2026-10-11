const { z } = require("zod");
const { email, username, password } = require("./common");

const register = {
  body: z.object({ username, email, password }),
};

const login = {
  body: z.object({
    email: z
      .string({ required_error: "Email and password are required" })
      .trim()
      .toLowerCase(),
    password: z
      .string({ required_error: "Email and password are required" })
      .min(1, "Email and password are required"),
  }),
};

module.exports = { register, login };
