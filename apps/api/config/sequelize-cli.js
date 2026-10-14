const { dbConfig } = require("./dbConfig");

const config = dbConfig();

module.exports = {
  development: config,
  test: config,
  production: config,
};
