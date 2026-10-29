import type { ErrorRequestHandler, RequestHandler } from "express";
import { UniqueConstraintError, ValidationError } from "sequelize";
import { AppError } from "../errors";

export const notFoundHandler: RequestHandler = (req, res) => {
  res.status(404).json({ message: "Route not found" });
};

const httpStatusOf = (err: unknown): number | undefined => {
  if (typeof err !== "object" || err === null) return undefined;
  const { status, statusCode } = err as {
    status?: unknown;
    statusCode?: unknown;
  };
  const value = status ?? statusCode;
  return typeof value === "number" ? value : undefined;
};

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  if (err instanceof AppError) {
    res.status(err.status).json({
      message: err.message,
      ...(err.details && { errors: err.details }),
    });
    return;
  }

  if (err instanceof UniqueConstraintError) {
    res.status(409).json({ message: "Resource already exists" });
    return;
  }

  if (err instanceof ValidationError) {
    res.status(400).json({
      message: "Validation failed",
      errors: err.errors.map((e) => ({ path: e.path, message: e.message })),
    });
    return;
  }

  const status = httpStatusOf(err) ?? 500;
  if (status < 500) {
    res.status(status).json({ message: (err as Error).message });
    return;
  }

  req.log.error({ err }, "Unhandled error");
  res.status(500).json({ message: "Something went wrong!" });
};
