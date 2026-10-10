const { UniqueConstraintError, ValidationError } = require("sequelize");
const { AppError } = require("../errors");

const notFoundHandler = (req, res) => {
  res.status(404).json({ message: "Route not found" });
};

const errorHandler = (err, req, res, _next) => {
  if (err instanceof AppError) {
    return res.status(err.status).json({
      message: err.message,
      ...(err.details && { errors: err.details }),
    });
  }

  if (err instanceof UniqueConstraintError) {
    return res.status(409).json({ message: "Resource already exists" });
  }

  if (err instanceof ValidationError) {
    return res.status(400).json({
      message: "Validation failed",
      errors: err.errors.map((e) => ({ path: e.path, message: e.message })),
    });
  }

  const status = err.status || err.statusCode || 500;
  if (status < 500) {
    return res.status(status).json({ message: err.message });
  }

  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
};

module.exports = { notFoundHandler, errorHandler };
