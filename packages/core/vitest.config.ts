import { defineConfig } from "vitest/config";

// defineConfig (not defineProject): this package also sets coverage thresholds when run on its own.
export default defineConfig({
  test: {
    name: "core",
    environment: "node",
    include: ["src/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      include: ["src/**/*.ts"],
      exclude: ["src/**/*.test.ts"],
      reporter: ["text", "lcov"],
      // M2 exit gate: locale, config and resolve logic is fully covered.
      thresholds: {
        "src/{locales,config,resolve,errors}.ts": {
          lines: 100,
          branches: 100,
          functions: 100,
          statements: 100,
        },
      },
    },
  },
});
