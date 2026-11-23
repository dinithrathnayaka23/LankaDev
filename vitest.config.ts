import { defineConfig } from "vitest/config";

// Root config: lets `pnpm vitest` run every package from the repo root.
// Each package also has its own vitest.config.ts used by `turbo run test`.
export default defineConfig({
  test: {
    projects: ["packages/*"],
    coverage: {
      provider: "v8",
      include: ["packages/*/src/**/*.{ts,tsx}"],
      exclude: ["**/*.test.{ts,tsx}"],
      reporter: ["text", "html", "lcov"],
    },
  },
});
