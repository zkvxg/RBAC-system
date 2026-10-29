const eslintIn = (workspace) => (files) =>
  `npm exec -w ${workspace} -- eslint ${files.map((f) => `"${f}"`).join(" ")}`;

module.exports = {
  "apps/api/**/*.{js,ts}": [eslintIn("@rbac/api"), "prettier --write"],
  "apps/web/**/*.{js,jsx,ts,tsx}": [eslintIn("@rbac/web"), "prettier --write"],
  "packages/**/*.ts": "prettier --write",
  "*.{json,md,yml,css}": "prettier --write",
};
