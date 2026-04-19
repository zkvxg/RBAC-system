process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-secret";

beforeAll(() => {
  // ustawienia globalne dla testow
});

afterAll(() => {
  if (global.server) {
    return new Promise((resolve) => {
      global.server.close(resolve);
    });
  }
  return Promise.resolve();
});
