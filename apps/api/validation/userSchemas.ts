import { z } from "zod";
import {
  required,
  idParams,
  email,
  username,
  password,
  optionalText,
} from "./common";

const profileFields = {
  name: optionalText,
  department: optionalText,
  phone: optionalText,
  location: optionalText,
  isActive: z.boolean().optional(),
};

export const listUsers = {
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
      .transform((value) => value.toUpperCase() as "ASC" | "DESC"),
  }),
};

export const createUser = {
  body: z.object({
    username,
    email,
    password,
    ...profileFields,
    roleId: z.number().int().positive().optional(),
    roleName: z.string().trim().toLowerCase().optional(),
  }),
};

export const updateUser = {
  params: idParams,
  body: z.object({
    username: username.optional(),
    email: email.optional(),
    ...profileFields,
  }),
};

export const userId = { params: idParams };

export const updateUserRole = {
  params: idParams,
  body: z.object({
    roleId: z
      .number(required("roleId is required"))
      .int()
      .positive("roleId is required"),
  }),
};

export type ListUsersInput = z.output<typeof listUsers.query>;
export type CreateUserInput = z.output<typeof createUser.body>;
export type UpdateUserInput = z.output<typeof updateUser.body>;
export type UpdateUserRoleInput = z.output<typeof updateUserRole.body>;
