import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: {
      server: "src/server/index.ts",
    },
    format: ["esm", "cjs"],
    dts: true,
    sourcemap: true,
    clean: false, // dist is wiped by the "build" script; parallel configs must not race on it
    target: "es2022",
    platform: "neutral",
  },
  {
    // Client entries: keep the "use client" directive at the top of every output file
    // so React Server Components treat them as client modules (ADR-0006).
    entry: {
      client: "src/client/index.ts",
    },
    format: ["esm", "cjs"],
    dts: true,
    sourcemap: true,
    clean: false, // dist is wiped by the "build" script; parallel configs must not race on it
    target: "es2022",
    platform: "neutral",
    banner: { js: '"use client";' },
  },
]);
