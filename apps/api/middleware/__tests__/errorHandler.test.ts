import { describe, expect, it } from "vitest";
import { UniqueConstraintError } from "sequelize";
import { BadRequestError, NotFoundError } from "../../errors";
import { errorHandler, notFoundHandler } from "../errorHandler";
import { mockNext, mockRequest, mockResponse } from "./helpers";

const handle = (err: unknown) => {
  const req = mockRequest();
  const res = mockResponse();
  errorHandler(err, req, res, mockNext());
  return { req, res };
};

describe("errorHandler", () => {
  it("uses the status and message of application errors", () => {
    const { res } = handle(new NotFoundError("User not found"));
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
  });

  it("includes validation details when present", () => {
    const details = [{ path: "body.email", message: "Invalid email format" }];
    const { res } = handle(
      new BadRequestError("Invalid email format", details),
    );
    expect(res.json).toHaveBeenCalledWith({
      message: "Invalid email format",
      errors: details,
    });
  });

  it("maps unique constraint violations to 409", () => {
    const { res } = handle(new UniqueConstraintError({}));
    expect(res.status).toHaveBeenCalledWith(409);
  });

  it("passes through client errors raised by express middleware", () => {
    const tooLarge = Object.assign(new Error("request entity too large"), {
      status: 413,
    });
    const { res } = handle(tooLarge);
    expect(res.status).toHaveBeenCalledWith(413);
    expect(res.json).toHaveBeenCalledWith({
      message: "request entity too large",
    });
  });

  it("hides unexpected errors behind a generic 500 and logs them", () => {
    const crash = new Error("SQLITE_CANTOPEN: secret path");
    const { req, res } = handle(crash);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Something went wrong!" });
    expect(req.log.error).toHaveBeenCalledWith(
      { err: crash },
      "Unhandled error",
    );
  });
});

describe("notFoundHandler", () => {
  it("answers 404", () => {
    const res = mockResponse();
    notFoundHandler(mockRequest(), res, mockNext());
    expect(res.status).toHaveBeenCalledWith(404);
  });
});
