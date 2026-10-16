require("dotenv").config();
const { z } = require("zod");

const schema = z
  .object({
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
    PORT: z.coerce.number().int().positive().default(5000),
    JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),
    JWT_EXPIRES_IN: z.string().default("24h"),
    CORS_ORIGINS: z
      .string()
      .default("http://localhost:5173")
      .transform((value) =>
        value
          .split(",")
          .map((origin) => origin.trim())
          .filter(Boolean),
      ),
    AUTH_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(10),
    DATABASE_URL: z.preprocess(
      (value) => (value === "" ? undefined : value),
      z.string().url().optional(),
    ),
    DATABASE_POOL_MAX: z.coerce.number().int().positive().default(10),
    DATABASE_SSL: z
      .enum(["true", "false"])
      .default("false")
      .transform((value) => value === "true"),
    DB_AUTO_MIGRATE: z.enum(["true", "false"]).optional(),
    LOG_LEVEL: z
      .enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"])
      .optional(),
  })
  .refine(
    (env) => env.NODE_ENV !== "production" || env.JWT_SECRET.length >= 32,
    {
      message: "JWT_SECRET must be at least 32 characters in production",
      path: ["JWT_SECRET"],
    },
  );

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
    .join("\n");
  throw new Error(`Invalid environment configuration:\n${issues}`);
}

const env = parsed.data;
env.LOG_LEVEL ??= env.NODE_ENV === "test" ? "silent" : "info";
env.DB_AUTO_MIGRATE = env.DB_AUTO_MIGRATE
  ? env.DB_AUTO_MIGRATE === "true"
  : env.NODE_ENV === "development";

module.exports = Object.freeze(env);
