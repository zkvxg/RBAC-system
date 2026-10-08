const jwt = require("jsonwebtoken");
const { User, Role } = require("../../models");
const { buildRole, buildUser } = require("./dataBuilders");

const createRole = async (overrides = {}) => {
  const payload = buildRole(overrides);
  return Role.create(payload);
};

const createUser = async (role, overrides = {}) => {
  const payload = buildUser({ RoleId: role.id, ...overrides });
  return User.create(payload);
};

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

  const { adminToken, employeeToken } = createTokens({
    adminUser,
    employeeUser,
  });

  return {
    adminRole,
    employeeRole,
    adminUser,
    employeeUser,
    adminToken,
    employeeToken,
  };
};

const signToken = (user) => jwt.sign({ sub: user.id }, process.env.JWT_SECRET);

const createTokens = ({ adminUser, employeeUser }) => ({
  adminToken: signToken(adminUser),
  employeeToken: signToken(employeeUser),
});

module.exports = {
  createRole,
  createUser,
  seedAdminAndEmployee,
  createTokens,
  signToken,
};
