const { DataTypes } = require("sequelize");
const sequelize = require("../config/database").default;

const Role = sequelize.define("Role", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  permissions: {
    type: DataTypes.VIRTUAL,
    get() {
      if (this._pendingPermissions) return [...this._pendingPermissions];
      return this.Permissions?.map((p) => p.key);
    },
    set(keys) {
      this._pendingPermissions = [...new Set(keys ?? [])];
      this.changed("updatedAt", true);
    },
  },
});

Role.prototype.toJSON = function toJSON() {
  const { Permissions, ...values } = this.get({ plain: true });
  return values;
};

module.exports = Role;
