import type { RequestHandler } from "express";
import type { ZodType, core } from "zod";
import type { ApiErrorDetail } from "@rbac/shared";
import { BadRequestError } from "../errors";

const LOCATIONS = ["params", "query", "body"] as const;
type Location = (typeof LOCATIONS)[number];

export type RequestSchemas = Partial<Record<Location, ZodType>>;

const toDetails = (
  issues: core.$ZodIssue[],
  location: Location,
): ApiErrorDetail[] =>
  issues.map((issue) => ({
    path: [location, ...issue.path.map(String)].join("."),
    message: issue.message,
  }));

export const validate =
  (schemas: RequestSchemas): RequestHandler =>
  (req, res, next) => {
    const details: ApiErrorDetail[] = [];
    const parts = req as unknown as Record<Location, unknown>;

    for (const location of LOCATIONS) {
      const schema = schemas[location];
      if (!schema) continue;

      const result = schema.safeParse(parts[location] ?? {});
      if (result.success) {
        parts[location] = result.data;
      } else {
        details.push(...toDetails(result.error.issues, location));
      }
    }

    const [first] = details;
    if (first) {
      return next(new BadRequestError(first.message, details));
    }
    next();
  };
