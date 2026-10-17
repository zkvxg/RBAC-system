const { z } = require("zod");
const { required, idParams } = require("./common");
const { PERMISSION_KEYS } = require("../config/permissions");

const name = z
  .string(required("name is required"))
  .trim()
  .min(2, "Role name must be at least 2 characters long")
  .max(50, "Role name must be at most 50 characters long");

const description = z
  .string(required("description is required"))
  .trim()
  .min(1, "description is required")
  .max(255);

const permissions = z.array(
  z.string().refine((key) => PERMISSION_KEYS.includes(key), {
    message: "Unknown permission",
  }),
  {
    error: (issue) =>
      issue.input === undefined
        ? "permissions is required"
        : "permissions must be an array",
  },
);

const createRole = {
  body: z.object({ name, description, permissions }),
};

const updateRole = {
  params: idParams,
  body: z.object({
    name: name.optional(),
    description: description.optional(),
    permissions: permissions.optional(),
  }),
};

const roleId = { params: idParams };

module.exports = { createRole, updateRole, roleId };
