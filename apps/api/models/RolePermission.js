const sequelize = require("../config/database").default;

const RolePermission = sequelize.define("RolePermission", {});

module.exports = RolePermission;
