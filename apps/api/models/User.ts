import bcrypt from "bcrypt";
import {
  DataTypes,
  Model,
  type CreationOptional,
  type ForeignKey,
  type InferAttributes,
  type InferCreationAttributes,
  type NonAttribute,
} from "sequelize";
import sequelize from "../config/database";
import type Role from "./Role";

class User extends Model<
  InferAttributes<User, { omit: "Role" }>,
  InferCreationAttributes<User, { omit: "Role" }>
> {
  declare id: CreationOptional<number>;
  declare username: string;
  declare email: string;
  declare password: string;
  declare name: CreationOptional<string | null>;
  declare department: CreationOptional<string | null>;
  declare phone: CreationOptional<string | null>;
  declare location: CreationOptional<string | null>;
  declare isActive: CreationOptional<boolean>;
  declare RoleId: ForeignKey<number | null>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  declare Role?: NonAttribute<Role | null>;

  override toJSON() {
    const { password: _password, ...values } = this.get({
      plain: true,
    }) as InferAttributes<User> & { Role?: Record<string, unknown> | null };
    if (values.Role) {
      const { Permissions: _links, ...role } = values.Role;
      values.Role = role;
    }
    return values;
  }
}

User.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    username: { type: DataTypes.STRING, allowNull: false, unique: true },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    password: { type: DataTypes.STRING, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: true },
    department: { type: DataTypes.STRING, allowNull: true },
    phone: { type: DataTypes.STRING, allowNull: true },
    location: { type: DataTypes.STRING, allowNull: true },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    modelName: "User",
    indexes: [
      { name: "users_role_id", fields: ["RoleId"] },
      { name: "users_created_at_id", fields: ["createdAt", "id"] },
    ],
  },
);

User.beforeCreate(async (user) => {
  user.password = await bcrypt.hash(user.password, 10);
});

User.beforeUpdate(async (user) => {
  if (user.changed("password")) {
    user.password = await bcrypt.hash(user.password, 10);
  }
});

export default User;
