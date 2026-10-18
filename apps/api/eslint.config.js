const js = require("@eslint/js");
const globals = require("globals");
const tseslint = require("typescript-eslint");
const prettier = require("eslint-config-prettier");

const unusedVars = [
  "error",
  { argsIgnorePattern: "^_", ignoreRestSiblings: true },
];

module.exports = tseslint.config(
  { ignores: ["node_modules", "dist", "playwright-report", "test-results"] },
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "commonjs",
      globals: globals.node,
    },
    rules: {
      ...js.configs.recommended.rules,
      "no-unused-vars": unusedVars,
      eqeqeq: ["error", "always"],
      "no-console": "off",
    },
  },
  {
    files: ["**/*.ts"],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: { globals: globals.node },
    rules: {
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": unusedVars,
      eqeqeq: ["error", "always"],
    },
  },
  prettier,
);
