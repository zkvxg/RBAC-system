import { z } from "zod";
import { validatePassword } from "../utils/passwordPolicy";

export const required = (message: string) => ({
  error: (issue: { input?: unknown }) =>
    issue.input === undefined ? message : undefined,
});

export const idParams = z.object({
  id: z.coerce.number().int().positive("id must be a positive integer"),
});

export const email = z
  .string(required("email is required"))
  .trim()
  .toLowerCase()
  .pipe(z.email("Invalid email format"));

export const username = z
  .string(required("username is required"))
  .trim()
  .min(3, "Username must be at least 3 characters long")
  .max(50, "Username must be at most 50 characters long");

export const password = z
  .string(required("password is required"))
  .check((ctx) => {
    const message = validatePassword(ctx.value);
    if (message) ctx.issues.push({ code: "custom", message, input: ctx.value });
  });

export const optionalText = z.string().trim().max(255).nullish();

export type IdParams = z.output<typeof idParams>;
