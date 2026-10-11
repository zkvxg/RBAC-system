const { z } = require("zod");
const { idParams } = require("./common");

const name = z
  .string({ required_error: "name is required" })
  .trim()
  .min(2, "Role name must be at least 2 characters long")
  .max(50, "Role name must be at most 50 characters long");

const description = z
  .string({ required_error: "description is required" })
  .trim()
  .min(1, "description is required")
  .max(255);

const permissions = z.array(z.string().trim().min(1), {
  required_error: "permissions is required",
  invalid_type_error: "permissions must be an array",
});

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
