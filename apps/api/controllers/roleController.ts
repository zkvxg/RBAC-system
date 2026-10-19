import type { Request, Response } from "express";
import roleService from "../services/roleService";
import { actorOf, bodyOf, idOf } from "./input";
import type {
  CreateRoleInput,
  UpdateRoleInput,
} from "../validation/roleSchemas";

const roleController = {
  async getAllRoles(req: Request, res: Response) {
    res.json(await roleService.list());
  },

  async createRole(req: Request, res: Response) {
    res
      .status(201)
      .json(
        await roleService.create(actorOf(req), bodyOf<CreateRoleInput>(req)),
      );
  },

  async updateRole(req: Request, res: Response) {
    res.json(
      await roleService.update(
        actorOf(req),
        idOf(req),
        bodyOf<UpdateRoleInput>(req),
      ),
    );
  },

  async deleteRole(req: Request, res: Response) {
    await roleService.remove(idOf(req));
    res.json({ message: "Role deleted successfully" });
  },
};

export default roleController;
