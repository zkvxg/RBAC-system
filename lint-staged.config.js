const eslintIn = (workspace) => (files) =>
  `npm exec -w ${workspace} -- eslint ${files.map((f) => `"${f}"`).join(" ")}`;

module.exports = {
  "apps/api/**/*.js": [eslintIn("@rbac/api"), "prettier --write"],
  "apps/web/**/*.{js,jsx}": [eslintIn("@rbac/web"), "prettier --write"],
  "*.{json,md,yml,css}": "prettier --write",
};
