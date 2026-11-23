# 0006. Module format, exports and build

- Status: Accepted
- Date: 2026-11-23

## Context

Source plan §5: build with tsup or unbuild; *preserve ESM and CJS only if support demand requires both*; explicit `exports`; tree-shakeable transliteration; SSR-safe exports with clear client-only entry points.

Consumers include Vite (ESM), Next.js 15/16 (ESM + server bundling), and older Jest/CommonJS test setups.

## Decision

1. **Build tool:** `tsup` (esbuild) per package; `tsc --noEmit` for type checking.
2. **Formats:** ESM (`.js`) **and** CJS (`.cjs`) with `"type": "module"`. Reason: CJS consumers (Jest, older tooling) are still common; cost is low with tsup. Revisit at 2.0.
3. **Types:** `.d.ts` + `.d.cts` emitted by tsup; validated with `@arethetypeswrong/cli` and `publint` in CI.
4. **Explicit `exports` map** per package; no deep imports. `"./package.json"` exported.
5. **Subpath entries:**
   - `@lankadev/core` → `.`, `./formatting`
   - `@lankadev/transliteration` → `.`, `./sinhala`, `./tamil`
   - `@lankadev/react` → `.`, `./styles.css`
   - `@lankadev/next` → `./server`, `./client` (no root entry — forces an explicit choice)
6. **Client boundary:** `@lankadev/react` and `@lankadev/next/client` builds add a `"use client";` banner. `@lankadev/next/server` never imports client code.
7. **Tree-shaking:** `"sideEffects": false` everywhere except `["*.css"]` in `@lankadev/react`. Named exports only; no default exports.
8. **Target:** ES2022. No polyfills shipped.

## Consequences

- Two outputs per entry; `attw` must stay green in CI.
- Dual-package hazard is minimal: packages hold no module-level state (ADR-0003).
- Bundle-size budgets are enforced per entry in M11.
