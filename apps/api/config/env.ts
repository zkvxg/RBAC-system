import "dotenv/config";
import { z } from "zod";

const booleanString = z.enum(["true", "false"]).transform((v) => v === "true");

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
      z.url().optional(),
    ),
    DATABASE_POOL_MAX: z.coerce.number().int().positive().default(10),
    DATABASE_SSL: booleanString.default(false),
    DB_AUTO_MIGRATE: booleanString.optional(),
    API_DOCS: booleanString.optional(),
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
  )
  .transform((env) => ({
    ...env,
    LOG_LEVEL: env.LOG_LEVEL ?? (env.NODE_ENV === "test" ? "silent" : "info"),
    DB_AUTO_MIGRATE: env.DB_AUTO_MIGRATE ?? env.NODE_ENV === "development",
    API_DOCS: env.API_DOCS ?? env.NODE_ENV !== "production",
  }));

export type Env = z.infer<typeof schema>;

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
    .join("\n");
  throw new Error(`Invalid environment configuration:\n${issues}`);
}

const env: Readonly<Env> = Object.freeze(parsed.data);

export default env;
