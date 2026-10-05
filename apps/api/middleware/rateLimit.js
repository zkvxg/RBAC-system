const rateLimit = require("express-rate-limit");

const FIFTEEN_MINUTES = 15 * 60 * 1000;

const createAuthLimiter = ({
  windowMs = FIFTEEN_MINUTES,
  max = Number(process.env.AUTH_RATE_LIMIT_MAX) || 10,
} = {}) =>
  rateLimit({
    windowMs,
    limit: max,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { message: "Too many attempts, please try again later" },
  });

module.exports = { createAuthLimiter };
