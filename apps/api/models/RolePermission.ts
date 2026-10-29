import { Model } from "sequelize";
import sequelize from "../config/database";

class RolePermission extends Model {}

RolePermission.init({}, { sequelize, modelName: "RolePermission" });

export default RolePermission;
