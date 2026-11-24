import { defineConfig } from "vitest/config";

// defineConfig (not defineProject): this package also sets coverage thresholds when run on its own.
export default defineConfig({
  test: {
    name: "unicode",
    environment: "node",
    include: ["src/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      include: ["src/**/*.ts"],
      exclude: ["src/**/*.test.ts"],
      reporter: ["text", "lcov"],
      thresholds: {
        lines: 100,
        branches: 100,
        functions: 100,
        statements: 100,
      },
    },
  },
});
