import type { NextFunction, Request, Response } from "express";
import { vi } from "vitest";

export const mockRequest = (overrides: Partial<Request> = {}) =>
  ({
    headers: {},
    params: {},
    query: {},
    body: {},
    log: { error: vi.fn() },
    ...overrides,
  }) as unknown as Request;

export const mockResponse = () => {
  const res = { status: vi.fn(), json: vi.fn() };
  res.status.mockReturnValue(res);
  res.json.mockReturnValue(res);
  return res as unknown as Response & typeof res;
};

export const mockNext = () =>
  vi.fn() as unknown as NextFunction & ReturnType<typeof vi.fn>;
