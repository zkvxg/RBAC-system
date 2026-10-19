import type { Request, Response } from "express";
import authService from "../services/authService";
import { actorOf, bodyOf } from "./input";
import type { LoginInput, RegisterInput } from "../validation/authSchemas";

const authController = {
  async register(req: Request, res: Response) {
    await authService.register(bodyOf<RegisterInput>(req));
    res.status(201).json({ message: "User registered successfully" });
  },

  async login(req: Request, res: Response) {
    res.json(await authService.login(bodyOf<LoginInput>(req)));
  },

  async logout(req: Request, res: Response) {
    res.json({ message: "Logged out successfully" });
  },

  async getProfile(req: Request, res: Response) {
    res.json(await authService.getProfile(actorOf(req).userId));
  },
};

export default authController;
