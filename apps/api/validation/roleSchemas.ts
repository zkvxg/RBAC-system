import { z } from "zod";
import { required, idParams } from "./common";
import { isPermission } from "../config/permissions";

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
  z.string().refine(isPermission, { message: "Unknown permission" }),
  {
    error: (issue) =>
      issue.input === undefined
        ? "permissions is required"
        : "permissions must be an array",
  },
);

export const createRole = {
  body: z.object({ name, description, permissions }),
};

export const updateRole = {
  params: idParams,
  body: z.object({
    name: name.optional(),
    description: description.optional(),
    permissions: permissions.optional(),
  }),
};

export const roleId = { params: idParams };

export type CreateRoleInput = z.output<typeof createRole.body>;
export type UpdateRoleInput = z.output<typeof updateRole.body>;
