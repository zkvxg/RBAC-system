import type { Request } from "express";
import { UnauthorizedError } from "../errors";
import type { AuthUser } from "../services/authTypes";
import type { IdParams } from "../validation/common";

export const bodyOf = <T>(req: Request) => req.body as T;
export const queryOf = <T>(req: Request) => req.query as unknown as T;
export const idOf = (req: Request) => (req.params as unknown as IdParams).id;

export const actorOf = (req: Request): AuthUser => {
  if (!req.user) throw new UnauthorizedError();
  return req.user;
};
