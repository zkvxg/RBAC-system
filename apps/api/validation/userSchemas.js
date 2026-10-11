const { z } = require("zod");
const {
  idParams,
  email,
  username,
  password,
  optionalText,
} = require("./common");

const profileFields = {
  name: optionalText,
  department: optionalText,
  phone: optionalText,
  location: optionalText,
  isActive: z.boolean().optional(),
};

const createUser = {
  body: z.object({
    username,
    email,
    password,
    ...profileFields,
    roleId: z.coerce.number().int().positive().optional(),
    roleName: z.string().trim().toLowerCase().optional(),
  }),
};

const updateUser = {
  params: idParams,
  body: z.object({
    username: username.optional(),
    email: email.optional(),
    ...profileFields,
  }),
};

const userId = { params: idParams };

const updateUserRole = {
  params: idParams,
  body: z.object({
    roleId: z.coerce
      .number({ required_error: "roleId is required" })
      .int()
      .positive("roleId is required"),
  }),
};

module.exports = { createUser, updateUser, userId, updateUserRole };
