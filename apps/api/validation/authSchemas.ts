import { z } from "zod";
import { required, email, username, password } from "./common";

export const register = {
  body: z.object({ username, email, password }),
};

export const login = {
  body: z.object({
    email: z
      .string(required("Email and password are required"))
      .trim()
      .toLowerCase(),
    password: z
      .string(required("Email and password are required"))
      .min(1, "Email and password are required"),
  }),
};

export type RegisterInput = z.output<typeof register.body>;
export type LoginInput = z.output<typeof login.body>;
