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

const listUsers = {
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().trim().min(1).max(100).optional(),
    roleId: z.coerce.number().int().positive().optional(),
    isActive: z
      .enum(["true", "false"])
      .transform((value) => value === "true")
      .optional(),
    sortBy: z
      .enum(["createdAt", "username", "email", "name"])
      .default("createdAt"),
    order: z
      .enum(["asc", "desc"])
      .default("desc")
      .transform((value) => value.toUpperCase()),
  }),
};

const updateUserRole = {
  params: idParams,
  body: z.object({
    roleId: z.coerce
      .number({ required_error: "roleId is required" })
      .int()
      .positive("roleId is required"),
  }),
};

module.exports = {
  listUsers,
  createUser,
  updateUser,
  userId,
  updateUserRole,
};
