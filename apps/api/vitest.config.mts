import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["**/__tests__/**/*.test.ts"],
    exclude: ["node_modules", "dist"],
    env: {
      NODE_ENV: "test",
      JWT_SECRET: "unit-test-secret",
      LOG_LEVEL: "silent",
      DATABASE_URL: "",
    },
    restoreMocks: true,
    coverage: {
      provider: "v8",
      include: [
        "middleware/**",
        "services/**",
        "validation/**",
        "errors/**",
        "utils/**",
      ],
      exclude: ["**/__tests__/**", "services/authTypes.ts"],
      reporter: ["text-summary", "lcov"],
      // calibrated for vitest 5's ast-based v8 coverage; raise, never lower
      thresholds: { lines: 70, statements: 70, branches: 55, functions: 65 },
    },
  },
});
