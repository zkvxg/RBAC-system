const { randomUUID } = require("crypto");
const pinoHttp = require("pino-http");
const logger = require("../config/logger");

const REQUEST_ID_PATTERN = /^[\w-]{1,64}$/;

const requestLogger = pinoHttp({
  logger,
  genReqId(req, res) {
    const incoming = req.headers["x-request-id"];
    const id =
      typeof incoming === "string" && REQUEST_ID_PATTERN.test(incoming)
        ? incoming
        : randomUUID();
    res.setHeader("X-Request-Id", id);
    return id;
  },
  customLogLevel(req, res, err) {
    if (err || res.statusCode >= 500) return "error";
    if (res.statusCode >= 400) return "warn";
    return "info";
  },
  autoLogging: { ignore: (req) => req.url === "/health" },
});

module.exports = { requestLogger };
