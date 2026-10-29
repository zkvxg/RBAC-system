import { describe, expect, it } from "vitest";
import { z } from "zod";
import { BadRequestError } from "../../errors";
import { validate } from "../validate";
import { mockNext, mockRequest, mockResponse } from "./helpers";

const schemas = {
  params: z.object({ id: z.coerce.number().int().positive() }),
  body: z.object({ name: z.string().min(2, "name too short") }),
};

describe("validate", () => {
  it("replaces request parts with parsed values and strips unknown fields", () => {
    const req = mockRequest({
      params: { id: "42" } as never,
      body: { name: "Ada", RoleId: 1 },
    });
    const next = mockNext();

    validate(schemas)(req, mockResponse(), next);

    expect(next).toHaveBeenCalledWith();
    expect(req.params).toEqual({ id: 42 });
    expect(req.body).toEqual({ name: "Ada" });
  });

  it("reports every invalid field with its location", () => {
    const req = mockRequest({
      params: { id: "abc" } as never,
      body: { name: "A" },
    });
    const next = mockNext();

    validate(schemas)(req, mockResponse(), next);

    const [error] = next.mock.calls[0]!;
    expect(error).toBeInstanceOf(BadRequestError);
    expect(error.details.map((d: { path: string }) => d.path)).toEqual([
      "params.id",
      "body.name",
    ]);
    expect(error.message).toBe(error.details[0].message);
  });

  it("treats a missing part as an empty object", () => {
    const req = mockRequest({ body: undefined });
    const next = mockNext();

    validate({ body: z.object({ name: z.string().optional() }) })(
      req,
      mockResponse(),
      next,
    );

    expect(next).toHaveBeenCalledWith();
    expect(req.body).toEqual({});
  });
});
