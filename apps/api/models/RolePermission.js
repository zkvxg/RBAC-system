const sequelize = require("../config/database");

const RolePermission = sequelize.define("RolePermission", {});

module.exports = RolePermission;
