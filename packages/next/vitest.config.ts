import { defineProject } from "vitest/config";

export default defineProject({
  test: {
    name: "next",
    environment: "node",
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
