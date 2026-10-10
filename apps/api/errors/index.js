class AppError extends Error {
  constructor(status, message, details) {
    super(message);
    this.name = this.constructor.name;
    this.status = status;
    this.details = details;
  }
}

class BadRequestError extends AppError {
  constructor(message = "Bad request", details) {
    super(400, message, details);
  }
}

class UnauthorizedError extends AppError {
  constructor(message = "Not authenticated") {
    super(401, message);
  }
}

class ForbiddenError extends AppError {
  constructor(message = "Forbidden") {
    super(403, message);
  }
}

class NotFoundError extends AppError {
  constructor(message = "Not found") {
    super(404, message);
  }
}

class ConflictError extends AppError {
  constructor(message = "Conflict") {
    super(409, message);
  }
}

module.exports = {
  AppError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
};
