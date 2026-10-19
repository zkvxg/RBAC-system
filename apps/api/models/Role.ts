import {
  DataTypes,
  Model,
  type BelongsToManySetAssociationsMixin,
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes,
  type NonAttribute,
} from "sequelize";
import sequelize from "../config/database";
import type Permission from "./Permission";

class Role extends Model<
  InferAttributes<Role, { omit: "Permissions" | "pendingPermissions" }>,
  InferCreationAttributes<Role, { omit: "Permissions" | "pendingPermissions" }>
> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare description: string;
  declare permissions: CreationOptional<string[]>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  declare Permissions?: NonAttribute<Permission[]>;
  declare pendingPermissions?: NonAttribute<string[]>;
  declare setPermissions: BelongsToManySetAssociationsMixin<Permission, number>;

  override toJSON() {
    const { Permissions: _links, ...values } = this.get({
      plain: true,
    }) as InferAttributes<Role> & { Permissions?: unknown };
    return values;
  }
}

Role.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false, unique: true },
    description: { type: DataTypes.STRING, allowNull: false },
    permissions: {
      type: DataTypes.VIRTUAL,
      get(this: Role): string[] | undefined {
        if (this.pendingPermissions) return [...this.pendingPermissions];
        return this.Permissions?.map((p) => p.key);
      },
      set(this: Role, keys: string[] | null | undefined) {
        this.pendingPermissions = [...new Set(keys ?? [])];
        this.changed("updatedAt", true);
      },
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { sequelize, modelName: "Role" },
);

export default Role;
