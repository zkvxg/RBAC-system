const request = require("supertest");
const { app } = require("../../app");

const authHeader = (token) => ({ Authorization: `Bearer ${token}` });

const withToken = (req, token) => (token ? req.set(authHeader(token)) : req);

const api = () => request(app);

module.exports = {
  api,
  authHeader,
  withToken,
};
