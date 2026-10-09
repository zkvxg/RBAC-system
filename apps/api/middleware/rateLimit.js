const rateLimit = require("express-rate-limit");
const env = require("../config/env");

const FIFTEEN_MINUTES = 15 * 60 * 1000;

const createAuthLimiter = ({
  windowMs = FIFTEEN_MINUTES,
  max = env.AUTH_RATE_LIMIT_MAX,
} = {}) =>
  rateLimit({
    windowMs,
    limit: max,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { message: "Too many attempts, please try again later" },
  });

module.exports = { createAuthLimiter };
