const User = require("./User");
const Role = require("./Role");

Role.hasMany(User);
User.belongsTo(Role);

module.exports = {
  User,
  Role,
};
