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

// seedowanie bazy danych z adminem i employee (idempotentne)
const seedAdminAndEmployee = async () => {
  const [adminRole] = await Role.findOrCreate({
    where: { name: "admin" },
    defaults: buildRole({
      name: "admin",
      permissions: ["read", "write", "delete", "manage_users", "manage_roles"],
      description: "Administrator role",
    }),
  });

  const [employeeRole] = await Role.findOrCreate({
    where: { name: "employee" },
    defaults: buildRole({
      name: "employee",
      permissions: ["roles.view"],
      description: "Basic employee role",
    }),
  });

  let adminUser = await User.findOne({ where: { email: "admin@test.com" } });
  if (!adminUser) {
    adminUser = await createUser(adminRole, {
      username: "admin",
      email: "admin@test.com",
      password: "test123",
    });
  }

  let employeeUser = await User.findOne({
    where: { email: "employee.fixture@test.com" },
  });
  if (!employeeUser) {
    employeeUser = await createUser(employeeRole, {
      username: "employee_fixture",
      email: "employee.fixture@test.com",
      password: "test123",
    });
  }

  // generowanie tokenow jwt dla admin i employee
  const adminPerms = Array.isArray(adminRole.permissions)
    ? adminRole.permissions
    : [];
  const employeePerms = Array.isArray(employeeRole.permissions)
    ? employeeRole.permissions
    : [];
  const adminToken = jwt.sign(
    { userId: adminUser.id, role: "admin", permissions: adminPerms },
    process.env.JWT_SECRET,
  );

  const employeeToken = jwt.sign(
    {
      userId: employeeUser.id,
      role: "employee",
      permissions: employeePerms,
    },
    process.env.JWT_SECRET,
  );

  return {
    adminRole,
    employeeRole,
    adminUser,
    employeeUser,
    adminToken,
    employeeToken,
  };
};

// tworzenie tokenow jwt dla istniejacych uzytkownikow
const createTokens = ({ adminUser, employeeUser }) => ({
  adminToken: jwt.sign(
    { userId: adminUser.id, role: "admin", permissions: [] },
    process.env.JWT_SECRET,
  ),
  employeeToken: jwt.sign(
    { userId: employeeUser.id, role: "employee", permissions: [] },
    process.env.JWT_SECRET,
  ),
});

module.exports = {
  createRole,
  createUser,
  seedAdminAndEmployee,
  createTokens,
};
