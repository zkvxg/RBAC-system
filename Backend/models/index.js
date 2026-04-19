const User = require("./User");
const Role = require("./Role");

// relacja jeden do wielu, jedna rola moze miec wielu uzytkownikow
Role.hasMany(User);
User.belongsTo(Role);

module.exports = {
  User,
  Role,
};
