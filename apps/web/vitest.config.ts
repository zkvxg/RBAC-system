import { fileURLToPath } from "url";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@rbac/shared": fileURLToPath(
        new URL("../../packages/shared/src/index.ts", import.meta.url),
      ),
    },
  },
  test: {
    environment: "jsdom",
    include: ["src/**/*.test.{ts,tsx}"],
    setupFiles: ["src/test/setup.ts"],
    restoreMocks: true,
    coverage: {
      provider: "v8",
      include: [
        "src/api/**",
        "src/auth/**",
        "src/components/**",
        "src/config/**",
        "src/hooks/**",
        "src/utils/**",
      ],
      exclude: ["src/**/*.test.{ts,tsx}", "src/test/**"],
      reporter: ["text-summary", "lcov"],
      // calibrated for vitest 5's ast-based v8 coverage; raise, never lower
      thresholds: { lines: 50, statements: 50, branches: 50, functions: 40 },
    },
  },
});
