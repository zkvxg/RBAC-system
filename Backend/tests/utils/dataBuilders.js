// builder pattern do tworzenia danych testowych z unikalnym id

let sequence = 1;

// generator sekwencji id dla unikalnych danych
const nextId = () => {
  sequence += 1;
  return sequence;
};

// builder do tworzenia obiektu roli z mozliwoscia nadpisania pol
const buildRole = (overrides = {}) => {
  const id = nextId();
  return {
    name: `role_${id}`,
    permissions: ["read"],
    description: "Test role",
    ...overrides,
  };
};

// builder do tworzenia obiektu uzytkownika z mozliwoscia nadpisania pol
const buildUser = (overrides = {}) => {
  const id = nextId();
  return {
    username: `user_${id}`,
    email: `user_${id}@test.com`,
    password: "test123",
    ...overrides,
  };
};

// builder payloadu rejestracji uzytkownika
const buildRegisterPayload = (overrides = {}) => buildUser(overrides);

// builder payloadu logowania uzytkownika
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
