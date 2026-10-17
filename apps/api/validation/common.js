const { z } = require("zod");
const { validatePassword } = require("../utils/passwordPolicy");

const required = (message) => ({
  error: (issue) => (issue.input === undefined ? message : undefined),
});

const idParams = z.object({
  id: z.coerce.number().int().positive("id must be a positive integer"),
});

const email = z
  .string(required("email is required"))
  .trim()
  .toLowerCase()
  .pipe(z.email("Invalid email format"));

const username = z
  .string(required("username is required"))
  .trim()
  .min(3, "Username must be at least 3 characters long")
  .max(50, "Username must be at most 50 characters long");

const password = z.string(required("password is required")).check((ctx) => {
  const message = validatePassword(ctx.value);
  if (message) ctx.issues.push({ code: "custom", message, input: ctx.value });
});

const optionalText = z.string().trim().max(255).nullish();

module.exports = {
  required,
  idParams,
  email,
  username,
  password,
  optionalText,
};
