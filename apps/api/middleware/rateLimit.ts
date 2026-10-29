import rateLimit from "express-rate-limit";
import env from "../config/env";

const FIFTEEN_MINUTES = 15 * 60 * 1000;

export const createAuthLimiter = ({
  windowMs = FIFTEEN_MINUTES,
  max = env.AUTH_RATE_LIMIT_MAX,
}: { windowMs?: number; max?: number } = {}) =>
  rateLimit({
    windowMs,
    limit: max,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { message: "Too many attempts, please try again later" },
  });
