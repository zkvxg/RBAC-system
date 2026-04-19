// factory pattern do tworzenia encji testowych w bazie danych

const jwt = require("jsonwebtoken");
const { User, Role } = require("../../models");
const { buildRole, buildUser } = require("./dataBuilders");

// factory tworzace role w bazie danych
const createRole = async (overrides = {}) => {
  const payload = buildRole(overrides);
  return Role.create(payload);
};

// factory tworzace uzytkownika w bazie danych z przypisana rola
const createUser = async (role, overrides = {}) => {
  const payload = buildUser({ RoleId: role.id, ...overrides });
  return User.create(payload);
};

// seedowanie bazy danych z adminem i zwyklym userem
const seedAdminAndUser = async () => {
  const adminRole = await createRole({
    name: "admin",
    permissions: ["read", "write", "delete", "manage_users", "manage_roles"],
    description: "Administrator role",
  });

  const userRole = await createRole({
    name: "user",
    permissions: ["read"],
    description: "Basic user role",
  });

  const adminUser = await createUser(adminRole, {
    username: "admin",
    email: "admin@test.com",
    password: "test123",
  });

  const regularUser = await createUser(userRole, {
    username: "user",
    email: "user@test.com",
    password: "test123",
  });

  // generowanie tokenow jwt dla admin i user
  const adminToken = jwt.sign(
    { userId: adminUser.id, role: "admin" },
    process.env.JWT_SECRET,
  );

  const userToken = jwt.sign(
    { userId: regularUser.id, role: "user" },
    process.env.JWT_SECRET,
  );

  return { adminRole, userRole, adminUser, regularUser, adminToken, userToken };
};

// tworzenie tokenow jwt dla istniejacych uzytkownikow
const createTokens = ({ adminUser, regularUser }) => ({
  adminToken: jwt.sign(
    { userId: adminUser.id, role: "admin" },
    process.env.JWT_SECRET,
  ),
  userToken: jwt.sign(
    { userId: regularUser.id, role: "user" },
    process.env.JWT_SECRET,
  ),
});

module.exports = {
  createRole,
  createUser,
  seedAdminAndUser,
  createTokens,
};
