import { z } from "zod";
import { isPermission } from "./permissions";
import { validatePassword } from "./password";

export const passwordSchema = z.string().check((ctx) => {
  const message = validatePassword(ctx.value);
  if (message) ctx.issues.push({ code: "custom", message, input: ctx.value });
});

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email("Invalid email format"));

export const permissionKeySchema = z
  .string()
  .refine(isPermission, { message: "Unknown permission" });

export const roleNameSchema = z
  .string()
  .trim()
  .min(2, "Role name must be at least 2 characters long")
  .max(50, "Role name must be at most 50 characters long");

export const roleDescriptionSchema = z.string().trim().min(1).max(255);
