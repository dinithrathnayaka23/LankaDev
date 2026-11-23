import { defineProject } from "vitest/config";

export default defineProject({
  test: {
    name: "unicode",
    environment: "node",
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
