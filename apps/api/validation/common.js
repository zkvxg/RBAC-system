const { z } = require("zod");
const { validatePassword } = require("../utils/passwordPolicy");

const idParams = z.object({
  id: z.coerce.number().int().positive("id must be a positive integer"),
});

const email = z
  .string({ required_error: "email is required" })
  .trim()
  .toLowerCase()
  .email("Invalid email format");

const username = z
  .string({ required_error: "username is required" })
  .trim()
  .min(3, "Username must be at least 3 characters long")
  .max(50, "Username must be at most 50 characters long");

const password = z
  .string({ required_error: "password is required" })
  .superRefine((value, ctx) => {
    const message = validatePassword(value);
    if (message) ctx.addIssue({ code: z.ZodIssueCode.custom, message });
  });

const optionalText = z.string().trim().max(255).nullish();

module.exports = { idParams, email, username, password, optionalText };
