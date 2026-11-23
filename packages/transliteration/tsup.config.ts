import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    sinhala: "src/sinhala/index.ts",
    tamil: "src/tamil/index.ts",
  },
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  clean: true,
  target: "es2022",
  platform: "neutral",
});
