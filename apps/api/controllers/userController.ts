import type { Request, Response } from "express";
import userService from "../services/userService";
import { actorOf, bodyOf, idOf, queryOf } from "./input";
import type {
  CreateUserInput,
  ListUsersInput,
  UpdateUserInput,
  UpdateUserRoleInput,
} from "../validation/userSchemas";

const userController = {
  async getAllUsers(req: Request, res: Response) {
    res.json(await userService.list(queryOf<ListUsersInput>(req)));
  },

  async getUser(req: Request, res: Response) {
    res.json(await userService.getById(idOf(req)));
  },

  async createUser(req: Request, res: Response) {
    res
      .status(201)
      .json(await userService.create(bodyOf<CreateUserInput>(req)));
  },

  async updateUser(req: Request, res: Response) {
    res.json(
      await userService.update(
        actorOf(req),
        idOf(req),
        bodyOf<UpdateUserInput>(req),
      ),
    );
  },

  async deleteUser(req: Request, res: Response) {
    await userService.remove(actorOf(req), idOf(req));
    res.json({ message: "User deleted successfully" });
  },

  async updateUserRole(req: Request, res: Response) {
    const { roleId } = bodyOf<UpdateUserRoleInput>(req);
    await userService.changeRole(idOf(req), roleId);
    res.json({ message: "User role updated successfully" });
  },
};

export default userController;
