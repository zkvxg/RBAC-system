let sequence = 1;

const nextId = () => {
  sequence += 1;
  return sequence;
};

const buildRole = (overrides = {}) => {
  const id = nextId();
  return {
    name: `role_${id}`,
    permissions: ["read"],
    description: "Test role",
    ...overrides,
  };
};

const buildUser = (overrides = {}) => {
  const id = nextId();
  return {
    username: `user_${id}`,
    email: `user_${id}@test.com`,
    password: "test123",
    ...overrides,
  };
};

const buildRegisterPayload = (overrides = {}) => buildUser(overrides);

const buildLoginPayload = (overrides = {}) => ({
  email: overrides.email || "employee.fixture@test.com",
  password: overrides.password || "test123",
});

module.exports = {
  buildRole,
  buildUser,
  buildRegisterPayload,
  buildLoginPayload,
};
