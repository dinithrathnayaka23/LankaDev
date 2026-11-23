# LankaDev — Milestone Implementation Plan

> Source: _LankaDev Complete Implementation Plan_ (7 Nov 2026).
> Purpose: a build-ready, milestone-by-milestone plan. Each milestone has one branch, a clear scope, files to create, tests and an exit gate.
> Work through milestones in order. Each one merges to `main` via PR before the next starts (except where noted as parallel-safe).

---

## 0. How to use this plan

1. Start a milestone: `git checkout main && git pull && git checkout -b <branch-name>`.
2. Ask Claude: _"Implement Milestone N from docs/IMPLEMENTATION_PLAN.md"_. Work task by task; tick the checkboxes in this file as part of the PR.
3. Before opening the PR, run the gate: `pnpm lint && pnpm typecheck && pnpm test && pnpm build`.
4. Add a changeset (`pnpm changeset`) for any change to a published package (from M1 onward).
5. Merge with squash. Commit messages follow Conventional Commits (`feat(core): ...`, `fix(unicode): ...`, `chore: ...`, `docs: ...`).

### Branch naming convention

```
<type>/m<N>-<short-topic>
type ∈ chore | feat | docs | release
```

### Milestone overview

| #   | Milestone                              | Branch                           | Depends on | Package(s) touched                 |
| --- | -------------------------------------- | -------------------------------- | ---------- | ---------------------------------- |
| M0  | Discovery & decision records           | `docs/m0-discovery-adrs`         | —          | none (docs only)                   |
| M1  | Monorepo foundation                    | `chore/m1-monorepo-foundation`   | M0         | workspace tooling                  |
| M2  | Core: locales, config, fallback        | `feat/m2-core-locale-config`     | M1         | `@lankadev/core`                   |
| M3  | Formatting: LKR, numbers, dates        | `feat/m3-core-formatting`        | M2         | `@lankadev/core`                   |
| M4  | Unicode utilities + corpus             | `feat/m4-unicode`                | M1         | `@lankadev/unicode`                |
| M5  | React provider, hooks, switcher        | `feat/m5-react-provider`         | M2, M3     | `@lankadev/react`                  |
| M6  | Transliteration engine (pure)          | `feat/m6-transliteration-engine` | M4         | `@lankadev/transliteration`        |
| M7  | Transliteration input component        | `feat/m7-transliteration-input`  | M5, M6     | `@lankadev/react`                  |
| M8  | i18n integrations + React/Vite example | `feat/m8-i18next-vite-example`   | M5         | examples, docs                     |
| M9  | Next.js App Router package + example   | `feat/m9-nextjs-app-router`      | M5, M7     | `@lankadev/next`, examples         |
| M10 | Typography presets + docs site         | `docs/m10-typography-docs-site`  | M8, M9     | `@lankadev/react` (CSS), apps/docs |
| M11 | Quality hardening                      | `chore/m11-quality-hardening`    | M10        | all                                |
| M12 | Beta release (0.x `beta` tag)          | `release/m12-beta`               | M11        | all                                |
| M13 | v1.0 stable release                    | `release/m13-v1`                 | M12        | all                                |

Parallel-safe pairs (if you want to go faster): **M3 ∥ M4**, **M6 ∥ M5**, **M8 ∥ M7**.

---

## 1. Up-front decisions (defaults — confirm or override in M0)

These answer Section 17 of the source plan so coding can start immediately. Each becomes an ADR in M0.

| #   | Decision                    | Default chosen                                                                                                                                                                   | Why                                                       |
| --- | --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| D1  | Name & npm scope            | `@lankadev/*` — **verify** availability on npm (`npm view @lankadev/core`) and create the npm org before M12.                                                                    | Working name from source plan.                            |
| D2  | First translation engine    | **i18next + react-i18next** for React/Vite; **next-intl** for the Next.js example. No LankaDev adapter code until a real need appears — examples + helpers first.                | Avoid duplicating i18n engines.                           |
| D3  | Who owns locale state       | **Both.** `LankaProvider` is uncontrolled by default (`defaultLocale`), and controlled when `locale` + `onLocaleChange` are passed (Next.js routing, i18next, etc.).             | Hosts with their own routing must stay in control.        |
| D4  | Transliteration conventions | Own **clean-room, documented scheme** (“LankaDev Singlish v1”, “LankaDev Tanglish v1”), authored as JSON data in-repo with provenance notes.                                     | Avoids licensing risk of copying tables.                  |
| D5  | Wrap vs build engine        | **Build** a small deterministic engine **unless** the M0 audit finds a maintained, MIT/Apache, accurate engine. Time-box the audit to 1 day.                                     | Decision gate in source plan §3.                          |
| D6  | Supported versions          | Node **22 / 24 / 26 LTS** (`>=22`); React **18.3 / 19**; Next.js **15 / 16** (App Router); evergreen browsers (last 2 Chrome/Edge/Firefox/Safari, iOS Safari 16+). See ADR-0005. | Current LTS / stable lines (checked 2026-11-23).          |
| D7  | License & data              | **MIT** (already in repo). All fixtures synthetic or self-authored; fonts referenced, never bundled.                                                                             | No redistribution obligations.                            |
| D8  | Module format               | **ESM-first + CJS** via tsup (dual output), `"sideEffects": false`, explicit `exports`.                                                                                          | Next.js/Jest users still hit CJS paths.                   |
| D9  | Package count               | 5 packages: `core` (locale + formatting), `unicode`, `transliteration`, `react`, `next`.                                                                                         | Source plan: fewer packages; formatting folded into core. |

---

## 2. Target repository layout (end state)

```
lankadev/
├─ apps/
│  └─ docs/                     # VitePress docs + live playground (M10)
├─ packages/
│  ├─ core/                     # @lankadev/core       — locales, config, fallback, formatting
│  ├─ unicode/                  # @lankadev/unicode    — script detection, normalization, segmentation
│  ├─ transliteration/          # @lankadev/transliteration — Singlish/Tanglish engines (pure)
│  ├─ react/                    # @lankadev/react      — provider, hooks, switcher, TransliterationInput
│  └─ next/                     # @lankadev/next       — App Router helpers (server + client entries)
├─ examples/
│  ├─ react-vite/               # i18next example (M8)
│  └─ next-app-router/          # next-intl example + demo routes (M9)
├─ fixtures/
│  └─ language-corpus/          # reviewed, synthetic test fixtures (JSON) + PROVENANCE.md
├─ docs/
│  ├─ IMPLEMENTATION_PLAN.md    # this file
│  └─ adr/                      # architecture decision records
├─ .changeset/
├─ .github/
│  ├─ workflows/ci.yml
│  ├─ workflows/release.yml
│  ├─ ISSUE_TEMPLATE/
│  └─ PULL_REQUEST_TEMPLATE.md
├─ package.json  pnpm-workspace.yaml  turbo.json  tsconfig.base.json
└─ eslint.config.js  .prettierrc  vitest.workspace.ts
```

### Dependency graph (must stay acyclic)

```
core ──────────────┐
unicode ───────────┼──► react ──► next
transliteration ───┘      ▲
   └── depends on unicode ┘ (react depends on all three)
```

- `core`, `unicode`, `transliteration`: **zero runtime deps**, no DOM, no React.
- `react`: `react` / `react-dom` as **peerDependencies**.
- `next`: `next`, `react` as **peerDependencies**; never imported by `react`.

---

## Global Definition of Done (applies to every milestone)

- [ ] Public functions have TSDoc comments and at least one usage example.
- [ ] Unit tests cover happy path, invalid input and edge cases; CI green.
- [ ] No `any` in public types; `pnpm typecheck` passes in strict mode.
- [ ] No network calls, telemetry, `eval`, or module-level access to `window`/`document`.
- [ ] Sinhala/Tamil behaviour that needs human judgement is flagged `needs-native-review` in the PR.
- [ ] Changeset added for published-package changes.
- [ ] Package README section updated.

---

## M0 — Discovery & decision records

**Branch:** `docs/m0-discovery-adrs`
**Goal:** Lock decisions D1–D9 in writing and run the time-boxed competitor/transliteration audit.
**Time box:** 1–2 days.

### Tasks

- [x] Check npm availability: `npm view @lankadev/core`, `npm view lankadev`; record result. → all 404 (free); org creation still manual.
- [x] Audit npm/GitHub for: `sinhala`, `tamil`, `singlish`, `tanglish`, `transliteration`, `bhasha`, `unicode sinhala`. Record for top 5–8: last publish, last commit, license, TS support, bundle size, deps, open issues. → [competitor-audit.md](research/competitor-audit.md)
- [ ] Try the 2–3 strongest transliteration packages against 30 test words (15 si, 15 ta). Record output vs expected. → word list + runner ready in `docs/research/transliteration-audit/`; **run pending** (needs approval to execute third-party npm code).
- [x] Decide D5 (wrap vs build) using the audit. → **Build** (ADR-0004), with re-open condition tied to the hands-on run.
- [x] Write ADRs (short: Context / Decision / Consequences).
- [x] Write one-page MVP scope + non-goals. → [SCOPE.md](SCOPE.md)

### Files

```
docs/adr/README.md                                  # index + template
docs/adr/0001-package-boundaries.md
docs/adr/0002-i18n-integration-strategy.md
docs/adr/0003-locale-state-ownership.md
docs/adr/0004-transliteration-scheme-and-engine.md
docs/adr/0005-supported-versions.md
docs/adr/0006-module-format-and-exports.md
docs/adr/0007-license-and-data-provenance.md
docs/research/competitor-audit.md
docs/research/transliteration-audit.md
docs/research/transliteration-audit/words.json      # 15 si + 15 ta audit words
docs/research/transliteration-audit/run-audit.mjs   # reproducible audit runner
docs/SCOPE.md
```

### Exit gate

- All ADRs merged. D5 has an explicit answer backed by the audit table.
- Hands-on results table in `transliteration-audit.md` §4 filled before M6 starts (not blocking M1–M5).

---

## M1 — Monorepo foundation

**Branch:** `chore/m1-monorepo-foundation`
**Goal:** A buildable, testable, lintable empty monorepo with CI, so every later milestone is "just add code".

### Tasks

- [x] `pnpm init`; set `"private": true`, `"packageManager": "pnpm@<current>"`, `"engines": { "node": ">=22" }`.
- [x] `pnpm-workspace.yaml` with `packages/*`, `examples/*`, `apps/*`.
- [x] Turborepo: `turbo.json` pipelines `build`, `test`, `lint`, `typecheck` (with `dependsOn: ["^build"]` for build).
- [x] `tsconfig.base.json`: `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `moduleResolution: "Bundler"`, `target: ES2022`, `lib: ["ES2022", "DOM"]`, `verbatimModuleSyntax`.
- [x] ESLint (flat config, `typescript-eslint`, `eslint-plugin-react-hooks`) + Prettier.
- [x] Vitest workspace (`vitest.workspace.ts`); `jsdom` env for `react` package only.
- [x] Scaffold the 5 packages, each with: `package.json`, `tsconfig.json`, `tsup.config.ts`, `src/index.ts` (exports a placeholder), `README.md`, one passing test.
- [x] Package `package.json` template (see below).
- [x] Changesets: `pnpm add -Dw @changesets/cli && pnpm changeset init`.
- [x] `publint` + `@arethetypeswrong/cli` script: `pnpm check:packages`.
- [x] GitHub Actions `ci.yml`: matrix Node 22/24/26 → install (frozen lockfile) → lint → typecheck → test → build → check:packages.
- [x] Repo hygiene: `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, issue templates (bug, feature, language-review), PR template with DoD checklist.
- [x] Dependabot (or Renovate) config; `.nvmrc` → `24`.

### As built (deviations from the sketch below)

| Planned                             | Actual                                                                                            | Why                                                                                                 |
| ----------------------------------- | ------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `vitest.workspace.ts`               | Root `vitest.config.ts` with `test.projects: ["packages/*"]` + one `vitest.config.ts` per package | Workspace files were removed in Vitest 4+; `projects` is the replacement (Vitest 5.1).              |
| `lint` as a Turbo task per package  | Single root `pnpm lint` (`eslint .`) with type-aware rules via `projectService`                   | One run covers root configs, docs scripts and packages; faster than 5 processes.                    |
| TypeScript "latest"                 | TypeScript **6.0.3** pinned                                                                       | `typescript-eslint` 8.73 supports `<6.1`; TS 7 (native) not yet supported.                          |
| Flat `exports` conditions           | Nested `import`/`require` blocks, each with its own `types` (`.d.ts` / `.d.cts`)                  | Correct types for both ESM and CJS consumers; `attw` passes.                                        |
| `check:packages` via `pnpm -r exec` | Turbo task `check:package` per package: `publint --strict && attw --pack . --profile node16`      | Cached; `node16` profile ignores node10 (subpath exports cannot resolve there by design, ADR-0006). |
| `changeset init`                    | `.changeset/config.json` written by hand (`access: public`)                                       | Changesets 3 `init` is interactive only.                                                            |
| —                                   | `pnpm-workspace.yaml` has `allowBuilds: { esbuild: true }`                                        | pnpm 12 fails install on unapproved build scripts.                                                  |
| tsup `treeshake: true`              | Removed                                                                                           | Rollup tree-shake pass strips the `"use client"` banner; esbuild already tree-shakes.               |
| —                                   | `@lankadev/react` and `@lankadev/next` wipe `dist/` in the `build` script, tsup `clean: false`    | `next` has two tsup configs (server / client) that would race on `clean`.                           |
| `styles.css` export (ADR-0006)      | Deferred to M10                                                                                   | No CSS exists yet; avoids a dangling export.                                                        |
| —                                   | `.gitattributes` (`eol=lf`), `.editorconfig`, `.gitignore`, `.prettierignore`                     | Stop CRLF churn on Windows.                                                                         |
| —                                   | CI pins actions by commit SHA; `TURBO_TELEMETRY_DISABLED=1`                                       | Supply-chain hygiene; no tooling telemetry in CI.                                                   |

### Package `package.json` template

```jsonc
{
  "name": "@lankadev/core",
  "version": "0.0.0",
  "description": "Locale configuration and formatting for Sinhala, Tamil and English (Sri Lanka).",
  "license": "MIT",
  "type": "module",
  "sideEffects": false,
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs",
    },
    "./package.json": "./package.json",
  },
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "files": ["dist", "README.md"],
  "engines": { "node": ">=22" },
  "repository": { "type": "git", "url": "<repo-url>", "directory": "packages/core" },
  "keywords": ["sinhala", "tamil", "sri-lanka", "i18n", "react", "nextjs"],
  "publishConfig": { "access": "public", "provenance": true },
  "scripts": {
    "build": "tsup",
    "test": "vitest run",
    "typecheck": "tsc --noEmit",
    "lint": "eslint .",
  },
}
```

### Root scripts

```json
{
  "build": "turbo run build",
  "test": "turbo run test",
  "lint": "turbo run lint",
  "typecheck": "turbo run typecheck",
  "check:packages": "turbo run build && pnpm -r --filter ./packages/* exec publint && pnpm -r --filter ./packages/* exec attw --pack .",
  "changeset": "changeset",
  "release": "turbo run build && changeset publish"
}
```

### Exit gate

- Fresh clone → `pnpm install && pnpm build && pnpm test` passes on Windows and in CI.
- `publint` and `attw` report no errors for all 5 packages.

---

## M2 — Core: locales, config, fallback

**Branch:** `feat/m2-core-locale-config`
**Package:** `@lankadev/core`
**Goal:** Typed locale identifiers, validated config, predictable fallback.

### Public API

```ts
export type LankaLocale = "en-LK" | "si-LK" | "ta-LK";
export type LankaLanguage = "en" | "si" | "ta";
export type LankaScript = "Latn" | "Sinh" | "Taml";

export const LANKA_LOCALES: readonly LankaLocale[];

export interface LocaleInfo {
  locale: LankaLocale;
  language: LankaLanguage;
  script: LankaScript;
  nativeName: string; // "සිංහල", "தமிழ்", "English"
  englishName: string; // "Sinhala", "Tamil", "English"
  dir: "ltr";
}
export function getLocaleInfo(locale: LankaLocale): LocaleInfo;

export interface LankaConfigInput<L extends LankaLocale = LankaLocale> {
  locales: readonly L[];
  defaultLocale: L;
  fallbackLocale?: L; // defaults to defaultLocale
}
export interface LankaConfig<L extends LankaLocale = LankaLocale> {
  readonly locales: readonly L[];
  readonly defaultLocale: L;
  readonly fallbackLocale: L;
}
export function createLankaConfig<L extends LankaLocale>(
  input: LankaConfigInput<L>,
): LankaConfig<L>;

export function isLankaLocale(value: unknown): value is LankaLocale;
/** Accepts "si", "si-LK", "si_LK", "SI-lk"; returns null if unknown. */
export function parseLocale(value: string): LankaLocale | null;
/** Returns the first supported locale from a candidate list, else config.fallbackLocale. */
export function resolveLocale<L extends LankaLocale>(
  config: LankaConfig<L>,
  candidates: readonly (string | null | undefined)[],
): L;
/** Parse an Accept-Language header into ordered candidates (q-values respected). */
export function parseAcceptLanguage(header: string | null | undefined): string[];

export class LankaConfigError extends Error {
  code:
    | "EMPTY_LOCALES"
    | "DEFAULT_NOT_IN_LOCALES"
    | "FALLBACK_NOT_IN_LOCALES"
    | "DUPLICATE_LOCALE"
    | "UNKNOWN_LOCALE";
}
```

### Tasks

- [ ] `src/locales.ts` — types, `LANKA_LOCALES`, `getLocaleInfo`, `isLankaLocale`, `parseLocale`.
- [ ] `src/config.ts` — `createLankaConfig` (validates, freezes, applies fallback default), `LankaConfigError`.
- [ ] `src/resolve.ts` — `resolveLocale`, `parseAcceptLanguage`.
- [ ] `src/index.ts` — named exports only (no default export).

### Tests (`src/*.test.ts`)

- [ ] Every `LankaConfigError` code thrown for the matching bad input.
- [ ] Returned config is frozen (`Object.isFrozen`).
- [ ] `parseLocale` normalises case, `_`, bare language; rejects `"fr"`, `""`.
- [ ] `resolveLocale` picks first supported candidate, skips null/unsupported, falls back.
- [ ] `parseAcceptLanguage("ta-LK,ta;q=0.9,en;q=0.8")` → ordered list; malformed header → `[]`.
- [ ] Type tests (`expectTypeOf`): `createLankaConfig({ locales: ["si-LK"], defaultLocale: "en-LK" })` is a type error.

### Exit gate

- 100 % line coverage on `core/src/{locales,config,resolve}.ts`.

---

## M3 — Formatting: LKR, numbers, dates

**Branch:** `feat/m3-core-formatting`
**Package:** `@lankadev/core` (subpath `@lankadev/core/formatting` also exported)
**Goal:** Thin, documented wrappers over `Intl` with Sri Lankan defaults.

### Public API

```ts
export interface FormatLKROptions {
  locale: LankaLocale; // explicit — no hidden global
  display?: "symbol" | "code" | "name" | "narrowSymbol"; // default "symbol"
  minimumFractionDigits?: number; // default 2
  maximumFractionDigits?: number; // default 2
}
export function formatLKR(amount: number | bigint, options: FormatLKROptions): string;

export function formatNumber(
  value: number | bigint,
  options: { locale: LankaLocale } & Intl.NumberFormatOptions,
): string;

export interface FormatDateOptions extends Intl.DateTimeFormatOptions {
  locale: LankaLocale;
  timeZone?: string; // default "Asia/Colombo"
}
export function formatDate(date: Date | number, options: FormatDateOptions): string;
export function formatRelativeTime(
  value: number,
  unit: Intl.RelativeTimeFormatUnit,
  options: { locale: LankaLocale },
): string;

/** Cached Intl formatter factory (keyed by locale+options). */
export function getNumberFormatter(
  locale: LankaLocale,
  options?: Intl.NumberFormatOptions,
): Intl.NumberFormat;
```

### Tasks

- [ ] `src/formatting/cache.ts` — `Map` cache keyed by `locale + JSON.stringify(options)`.
- [ ] `src/formatting/currency.ts` — `formatLKR` (`style: "currency", currency: "LKR"`). Reject `NaN`/`Infinity` with `RangeError`.
- [ ] `src/formatting/number.ts`, `date.ts`, `relative.ts`.
- [ ] Add `"./formatting"` entry in `exports` and `tsup` entry list.
- [ ] `docs/formatting.md` — document real output per locale per runtime, and state clearly: _formatting only; use decimal-safe arithmetic (integer cents or a decimal lib) for money_.

### Tests

- [ ] Snapshot table: `formatLKR(12500.5, { locale })` for each locale × each `display`. Snapshots are **per Node major** (ICU differs) — store under `__snapshots__/node-<major>/`.
- [ ] `formatDate` defaults to `Asia/Colombo` (UTC+5:30): `new Date("2026-01-01T20:00:00Z")` → 2 Jan.
- [ ] Bigint support; negative values; `RangeError` on `NaN`.
- [ ] Cache returns the same instance for identical args.

### Exit gate

- Output documented for Node 22, 24 and 26 plus a manual check in Chrome/Firefox/Safari (record in `docs/formatting.md`).

---

## M4 — Unicode utilities + test corpus

**Branch:** `feat/m4-unicode`
**Package:** `@lankadev/unicode`
**Goal:** Correct, non-destructive script detection, normalization and grapheme-aware text helpers.

### Reference ranges

| Script  | Block                              | Notes                                                                                                     |
| ------- | ---------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Sinhala | U+0D80–U+0DFF                      | Al-lakuna (virama) U+0DCA. ZWJ U+200D forms yansaya/rakaransaya/touching letters — **must be preserved**. |
| Sinhala | U+111E0–U+111FF (Archaic Numbers)  | Detect as Sinhala.                                                                                        |
| Tamil   | U+0B80–U+0BFF                      | Pulli (virama) U+0BCD.                                                                                    |
| Tamil   | U+11FC0–U+11FFF (Tamil Supplement) | Fractions/symbols; detect as Tamil.                                                                       |
| Latin   | Basic Latin + Latin-1 letters      |                                                                                                           |

### Public API

```ts
export type Script = "sinhala" | "tamil" | "latin" | "common" | "other";

export function getCharScript(codePoint: number): Script;
/** Dominant script by letter count, ignoring "common" (digits, punctuation, spaces, emoji). */
export function detectScript(text: string): Script | "mixed" | "unknown";
export interface ScriptBreakdown {
  sinhala: number;
  tamil: number;
  latin: number;
  other: number;
  total: number;
}
export function analyzeScripts(text: string): ScriptBreakdown;
export function containsSinhala(text: string): boolean;
export function containsTamil(text: string): boolean;

/** NFC + script-specific canonical fixes; never strips ZWJ/ZWNJ. Display-safe. */
export function normalizeSinhalaText(text: string): string;
export function normalizeTamilText(text: string): string;
/** Aggressive key for search/compare only (NFC, collapse whitespace, lowercase Latin, optional ZWJ removal). Never store or display. */
export function toSearchKey(text: string, options?: { stripJoiners?: boolean }): string;

/** Grapheme-aware helpers (Intl.Segmenter with documented fallback). */
export function graphemes(text: string, locale?: string): string[];
export function graphemeLength(text: string, locale?: string): number;
export function truncate(
  text: string,
  maxGraphemes: number,
  options?: { ellipsis?: string; locale?: string },
): string;
export function words(text: string, locale?: string): string[]; // Intl.Segmenter granularity "word", isWordLike only
export function isSegmenterSupported(): boolean;
```

### Tasks

- [ ] `src/ranges.ts` — range table + `getCharScript` (iterate by code point with `for…of`, never by UTF-16 index).
- [ ] `src/detect.ts` — `detectScript`, `analyzeScripts`, `contains*`. Rule: `mixed` when second script ≥ 20 % of letters (document threshold).
- [ ] `src/normalize.ts` — NFC; Sinhala: reorder known non-canonical vowel-sign sequences only if verified in corpus; Tamil: NFC handles split vowel signs (e.g. U+0BCA ↔ U+0BC6 U+0BBE). Document every rule.
- [ ] `src/segment.ts` — `Intl.Segmenter` path + fallback (code-point split that keeps combining marks U+0DCA–U+0DDF, U+0DF2–U+0DF3, U+0BBE–U+0BCD, U+0BD7, ZWJ/ZWNJ attached to the previous cluster).
- [ ] `fixtures/language-corpus/` — create `sinhala.json`, `tamil.json`, `mixed.json` with shape `{ id, input, expected: { script, graphemes, nfc }, notes, reviewedBy: null }` and `PROVENANCE.md` (all synthetic/self-authored).
- [ ] Corpus-driven test file reading those fixtures.

### Tests (minimum cases)

- [ ] Sinhala vowels, consonants, consonant + every vowel sign, al-lakuna, yansaya (`ය` + `්` + ZWJ), rakaransaya, repaya, touching letters.
- [ ] Tamil vowels, consonants, uyirmei, pulli, grantha letters (ஜ ஷ ஸ ஹ க்ஷ ஸ்ரீ), split vs composed vowel signs.
- [ ] Mixed: Sinhala + English, Tamil + digits, emoji (👍🏽 = 1 grapheme), Sinhala numerals.
- [ ] `truncate` never splits a grapheme; `normalize*` is idempotent and keeps ZWJ.
- [ ] Fallback segmenter produces the same graphemes as `Intl.Segmenter` for the whole corpus (run test with `Intl.Segmenter` stubbed out).

### Exit gate

- ≥ 60 reviewed-shape fixtures (30 si, 30 ta) committed; corpus test green. Mark fixtures `reviewedBy` once a native speaker confirms (can happen later, tracked as issues).

---

## M5 — React provider, hooks, language switcher

**Branch:** `feat/m5-react-provider`
**Package:** `@lankadev/react`
**Goal:** Expose locale + formatting helpers to React with controlled/uncontrolled modes; no i18n engine inside.

### Public API

```tsx
export interface LankaProviderProps<L extends LankaLocale> {
  config: LankaConfig<L>;
  children: React.ReactNode;
  /** Controlled mode */
  locale?: L;
  onLocaleChange?: (next: L) => void;
  /** Uncontrolled initial value (defaults to config.defaultLocale). Must match server render. */
  initialLocale?: L;
  /** Sets <html lang> on change. Default true. Client-only effect. */
  syncHtmlLang?: boolean;
}
export function LankaProvider<L extends LankaLocale>(props: LankaProviderProps<L>): JSX.Element;

export interface LankaContextValue<L extends LankaLocale = LankaLocale> {
  locale: L;
  setLocale: (next: L) => void;
  config: LankaConfig<L>;
  info: LocaleInfo;
  formatLKR: (amount: number | bigint, opts?: Omit<FormatLKROptions, "locale">) => string;
  formatNumber: (v: number | bigint, opts?: Intl.NumberFormatOptions) => string;
  formatDate: (d: Date | number, opts?: Omit<FormatDateOptions, "locale">) => string;
}
export function useLanka<L extends LankaLocale = LankaLocale>(): LankaContextValue<L>; // throws LankaProviderMissingError outside provider
export function useLocale(): LankaLocale;

/** Headless switcher: you render; it gives props. */
export function useLanguageSwitcher(): {
  options: { value: LankaLocale; label: string; lang: string }[];
  getSelectProps: () => React.SelectHTMLAttributes<HTMLSelectElement>;
};
/** Optional styled-free default. */
export function LanguageSwitcher(props: { label?: string; className?: string }): JSX.Element;
```

### Tasks

- [ ] `src/context.ts`, `src/LankaProvider.tsx` (memoise context value; `setLocale` validates against `config.locales`, warns in dev, ignores invalid).
- [ ] `src/hooks.ts`, `src/LanguageSwitcher.tsx` — native `<select>` with `<label>`, each `<option lang="si">සිංහල</option>`.
- [ ] `syncHtmlLang` via `useEffect` (never during render; SSR-safe).
- [ ] Mark entry with `"use client"` banner in `tsup.config.ts` (`banner: { js: '"use client";' }`).
- [ ] peerDependencies `react >=18.3`, `react-dom >=18.3`; devDeps `@testing-library/react`, `@testing-library/user-event`, `jsdom`.

### Tests

- [ ] `useLanka` outside provider throws a readable error.
- [ ] Uncontrolled: switcher changes locale; formatted output re-renders.
- [ ] Controlled: `setLocale` calls `onLocaleChange` and does **not** change locale until parent updates prop.
- [ ] Invalid locale passed to `setLocale` is ignored with dev warning.
- [ ] `renderToString` works (no `window` access); `<html lang>` updated after mount.
- [ ] Accessibility: switcher has accessible name (`getByRole("combobox", { name: /language/i })`).

### Exit gate

- Works under React 18.3 and 19 (CI matrix job installs both).

---

## M6 — Transliteration engine (pure, framework-agnostic)

**Branch:** `feat/m6-transliteration-engine`
**Package:** `@lankadev/transliteration`
**Goal:** Deterministic Singlish→Sinhala and Tanglish→Tamil conversion, plus an incremental API for live typing. **Highest-risk milestone** — if accuracy is not acceptable by its end, ship as `experimental` and continue (source plan §13).

### Engine design

1. **Scheme = data**, not code: `schemes/singlish-v1.json`, `schemes/tanglish-v1.json` with sections `vowels` (independent), `vowelSigns` (dependent), `consonants`, `specials` (e.g. anusvara `ං`, visarga `ඃ`, aytham `ஃ`), `clusters` (e.g. Sinhala `kSh`, Tamil `ksh` → க்ஷ, `sri` → ஸ்ரீ), `passthrough` rules.
2. **Tokenizer:** greedy longest-match over a trie built from scheme keys (case-sensitive: `t` vs `T`, `n` vs `N`).
3. **Composer state machine:** states `START`, `AFTER_CONSONANT`.
   - consonant after consonant → emit virama (U+0DCA / U+0BCD) between them (or ZWJ conjunct if a cluster rule matches).
   - vowel after consonant → emit vowel **sign** (inherent `a` emits nothing).
   - vowel at start → emit independent vowel.
   - word end while `AFTER_CONSONANT` → emit virama (configurable `finalConsonant: "virama" | "inherent"`).
4. **Non-scheme characters** (digits, punctuation, spaces, existing Sinhala/Tamil) pass through unchanged and reset state.
5. **Escape hatch:** text inside a configurable delimiter (default `` ` ``…`` ` ``) stays Latin.

### Public API

```ts
export type TransliterationScheme = "singlish-v1" | "tanglish-v1";
export interface TransliterateOptions {
  finalConsonant?: "virama" | "inherent";
  escapeDelimiter?: string | null;
}

export function transliterate(
  input: string,
  scheme: TransliterationScheme,
  options?: TransliterateOptions,
): string;

/** Incremental API for live typing. Pure: returns new state, never mutates. */
export interface TransliterationState {
  readonly raw: string;
  readonly output: string;
}
export interface Transliterator {
  scheme: TransliterationScheme;
  empty(): TransliterationState;
  feed(state: TransliterationState, chunk: string): TransliterationState;
  backspace(state: TransliterationState): TransliterationState; // removes last raw char, re-derives output
  convertWord(raw: string): string;
}
export function createTransliterator(
  scheme: TransliterationScheme,
  options?: TransliterateOptions,
): Transliterator;

export function getSchemeTable(
  scheme: TransliterationScheme,
): ReadonlyArray<{ input: string; output: string; kind: string }>; // for docs/cheat sheet
```

Subpath exports so users only ship the language they need: `@lankadev/transliteration/sinhala`, `@lankadev/transliteration/tamil`.

### Tasks

- [ ] Write `docs/transliteration/singlish-v1.md` and `tanglish-v1.md` **first**: full mapping table, ambiguity decisions (e.g. `th` → ත vs ථ, `d` → ද vs ඩ, Tamil `n` → ந/ன/ண rules), escape rules.
- [ ] `src/schemes/*.json` + `src/schemes/PROVENANCE.md` (self-authored, MIT).
- [ ] `src/trie.ts`, `src/tokenize.ts`, `src/compose.ts`, `src/transliterate.ts`, `src/incremental.ts`.
- [ ] Golden fixtures: `fixtures/language-corpus/transliteration/{singlish,tanglish}.json` — ≥ 150 entries each: common words, names, places, phrases, punctuation, mixed English, edge cases. Shape `{ input, expected, category, reviewedBy }`.
- [ ] `scripts/translit-report.ts` → prints exact-match rate per category (feeds the "quality measurement" table; do not publish a headline % until reviewed).
- [ ] Micro-benchmark (`vitest bench`): 1 000-char input, target p95 < 1 ms on Node.

### Tests

- [ ] Golden fixtures (exact match).
- [ ] Property tests (`fast-check`): output contains no Latin letters for pure-scheme input; non-scheme chars preserved; `feed` over chars equals `transliterate` of whole string; `backspace(feed(s, x))` equals `s`.
- [ ] Escape delimiter keeps Latin text.

### Exit gate

- Exact-match ≥ 90 % on self-authored golden set **and** native-speaker review requested (issue opened per language). If not met → label package `experimental` in README and continue.

---

## M7 — Transliteration input component

**Branch:** `feat/m7-transliteration-input`
**Package:** `@lankadev/react`
**Goal:** Controlled `<input>`/`<textarea>` that converts the word being typed, preserves cursor/selection, and never breaks native IME.

### Behaviour spec

- Conversion is **word-scoped**: the component tracks the Latin raw buffer for the word at the caret. On each keystroke inside that word, it replaces the word's output with `convertWord(raw)`.
- Word boundary (space, punctuation, Enter, caret moved by click/arrow) **commits** the word; buffer resets.
- `Escape` (while buffer active) reverts the current word to raw Latin. `Ctrl/Cmd+Z` uses native undo where possible.
- **Composition events**: while `isComposing` (between `compositionstart` and `compositionend`), do nothing — native Sinhala/Tamil keyboards and mobile IMEs pass straight through.
- **Paste**: by default pasted text is inserted as-is (`pasteMode: "raw"`); `"transliterate"` converts it.
- `enabled={false}` → plain controlled input. Toggle hotkey optional (`toggleKey="Ctrl+Space"`).
- Caret restoration done in `useLayoutEffect` with `setSelectionRange` after value change.

### Public API

```tsx
export interface UseTransliterationOptions {
  scheme: TransliterationScheme;
  value: string;
  onChange: (value: string) => void;
  enabled?: boolean; // default true
  pasteMode?: "raw" | "transliterate"; // default "raw"
}
export function useTransliteration<T extends HTMLInputElement | HTMLTextAreaElement>(
  opts: UseTransliterationOptions,
): {
  ref: React.RefObject<T>;
  inputProps: Pick<
    React.InputHTMLAttributes<T>,
    | "value"
    | "onChange"
    | "onKeyDown"
    | "onBeforeInput"
    | "onCompositionStart"
    | "onCompositionEnd"
    | "onPaste"
    | "onSelect"
    | "lang"
  >;
  enabled: boolean;
  setEnabled: (v: boolean) => void;
  pendingRaw: string; // current uncommitted Latin buffer (for hint UI)
};

export function TransliterationInput(
  props: Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> &
    UseTransliterationOptions & { as?: "input" | "textarea" },
): JSX.Element;
```

Note: the source plan's `script="sinhala" method="singlish"` maps to `scheme="singlish-v1"`; offer `script`/`method` as aliases only if users ask.

### Tasks

- [ ] `src/transliteration/editor.ts` — **pure** edit model: `(value, selection, rawBuffer, event) → (value, selection, rawBuffer)`. No DOM. This is where 90 % of tests live.
- [ ] `src/transliteration/useTransliteration.ts` — wires DOM events to the editor model.
- [ ] `src/transliteration/TransliterationInput.tsx`; sets `lang="si"`/`"ta"` and `autoCorrect="off"`, `autoCapitalize="off"`, `spellCheck={false}` by default (overridable).
- [ ] Import from `@lankadev/transliteration/sinhala|tamil` lazily per scheme to keep bundle small.

### Tests

- [ ] Editor model unit tests: type at end, type mid-string, selection replacement, backspace inside buffer, caret jump commits, Escape reverts, paste raw/transliterate.
- [ ] RTL + user-event: typing `"amma "` yields expected Sinhala + space; caret position correct after each key.
- [ ] Composition: fire `compositionstart` → input → `compositionend`; value must equal native input unchanged.
- [ ] `enabled={false}` behaves like a plain input.
- [ ] Playwright (added in M9 example): real Chromium/Firefox/WebKit typing, mobile viewport emulation.

### Exit gate

- No caret jumps in the manual test script (`docs/testing/input-manual-checklist.md`) on Chrome, Firefox, Safari, Android Chrome (Gboard), iOS Safari.

---

## M8 — i18n integration + React/Vite example

**Branch:** `feat/m8-i18next-vite-example`
**Goal:** Prove "works with the i18n tool you already use". Ships examples and docs, not a new engine.

### Tasks

- [ ] `examples/react-vite` (Vite + React + TS) using `i18next` + `react-i18next`:
  - `locales/{en-LK,si-LK,ta-LK}/common.json` with sample strings.
  - `LankaProvider` in **controlled mode** bound to `i18n.language` (`onLocaleChange={(l) => i18n.changeLanguage(l)}`).
  - Pages: home (translated UI), formatting demo, unicode demo, transliteration input demo.
- [ ] Optional helper in `@lankadev/core`: `i18nextFallbackLng(config)` → returns `{ "si-LK": ["en-LK"], "ta-LK": ["en-LK"], default: [fallback] }`. Only add if it removes real boilerplate.
- [ ] `docs/guides/i18next.md` — 5-minute quick start with copy-paste code.
- [ ] Workspace link: example consumes packages via `workspace:*`.

### Tests

- [ ] Vitest smoke test in example: renders each locale without errors.
- [ ] CI job builds the example.

### Exit gate

- A new developer can follow `docs/guides/i18next.md` from an empty Vite app to tri-lingual UI in ≤ 10 minutes (time it once).

---

## M9 — Next.js App Router package + example

**Branch:** `feat/m9-nextjs-app-router`
**Package:** `@lankadev/next`
**Goal:** SSR-safe locale handling with next-intl; zero hydration warnings.

### Package API (two entry points — server never imports client code)

```ts
// @lankadev/next/server   (no "use client"; safe in middleware / RSC)
export function getLocaleFromRequest(
  config: LankaConfig,
  req: { headers: Headers; cookies?: { get(name: string): { value: string } | undefined } },
  opts?: { cookieName?: string },
): LankaLocale;
export function createLankaMiddleware(
  config: LankaConfig,
  opts?: { cookieName?: string; localePrefix?: "always" | "as-needed" },
): (req: NextRequest) => NextResponse | undefined;
export const LANKA_LOCALE_COOKIE = "LANKA_LOCALE";

// @lankadev/next/client   ("use client")
export function LankaNextProvider(props: {
  config: LankaConfig;
  locale: LankaLocale;
  children: React.ReactNode;
}): JSX.Element;
// wraps LankaProvider in controlled mode; setLocale → router.replace to new locale segment + sets cookie
```

If next-intl's own middleware covers routing (likely), `createLankaMiddleware` is **not** needed — document composing next-intl middleware with `config` instead, and skip building it (decide during milestone; record in ADR-0002 update).

### Example: `examples/next-app-router`

```
app/
  [locale]/
    layout.tsx           # <html lang={locale}>, NextIntlClientProvider + LankaNextProvider
    page.tsx             # landing (/, /si, /ta via localePrefix "as-needed")
    demo/
      input/page.tsx       # TransliterationInput (client component)
      unicode/page.tsx     # detectScript / normalize demo (server-rendered!)
      formatting/page.tsx  # formatLKR / dates rendered on server
i18n/routing.ts  i18n/request.ts  middleware.ts
messages/{en-LK,si-LK,ta-LK}.json
```

### Tasks

- [ ] `@lankadev/next` with `server` and `client` subpath exports; `next` + `react` as peers.
- [ ] Example routes listed above (match source plan §9 demo routes).
- [ ] Fonts via `next/font/google` (Noto Sans Sinhala, Noto Sans Tamil) — referenced, not bundled.
- [ ] `docs/guides/nextjs-app-router.md` — server/client boundary rules, persistence options (URL vs cookie vs profile) and trade-offs.
- [ ] Playwright tests in example: each route loads with **no console errors and no hydration warnings** (fail test on `console.error`); locale switch updates URL + `<html lang>`; transliteration typing on `/demo/input` across Chromium/Firefox/WebKit + mobile viewport.

### Exit gate

- `next build` passes; Playwright suite green in CI; zero hydration warnings.

---

## M10 — Typography presets + documentation site

**Branch:** `docs/m10-typography-docs-site`
**Goal:** Font guidance, optional CSS, and a docs site with a live playground.

### Tasks

- [ ] `@lankadev/react/styles.css` (optional import) — CSS variables only:
  ```css
  :root {
    --lanka-font-sinhala: "Noto Sans Sinhala", "Iskoola Pota", "Nirmala UI", sans-serif;
    --lanka-font-tamil: "Noto Sans Tamil", "Latha", "Nirmala UI", sans-serif;
    --lanka-line-height-sinhala: 1.7;
    --lanka-line-height-tamil: 1.6;
  }
  :lang(si) {
    font-family: var(--lanka-font-sinhala);
    line-height: var(--lanka-line-height-sinhala);
  }
  :lang(ta) {
    font-family: var(--lanka-font-tamil);
    line-height: var(--lanka-line-height-tamil);
  }
  ```
  (Verify line-height values visually; document font licenses — Noto = OFL.)
- [ ] `apps/docs` (VitePress): Quick start, React guide, Next.js guide, i18next/next-intl guides, Transliteration guide (scheme tables auto-generated from `getSchemeTable`), Unicode guide, Typography guide, API reference (TypeDoc → markdown), Troubleshooting, FAQ, Limitations.
- [ ] Playground page: live `TransliterationInput`, `detectScript`, `formatLKR` — runs fully client-side.
- [ ] Deploy docs (GitHub Pages or Vercel) from `main`.

### Exit gate

- Docs site live; every public export appears in API reference; playground works on mobile.

---

## M11 — Quality hardening

**Branch:** `chore/m11-quality-hardening`
**Goal:** Production-grade confidence before any public release.

### Tasks

- [ ] **Bundle size:** `size-limit` per package in CI. Initial budgets (min+gzip): core ≤ 3 KB, unicode ≤ 3 KB, transliteration per language ≤ 6 KB, react (excl. peers) ≤ 5 KB.
- [ ] **Package checks:** `npm pack` each package → install tarballs into a clean Vite app and clean Next app in CI (`scripts/smoke-pack.ts`); verify ESM import, CJS require, types resolve (`attw`).
- [ ] **Tree-shaking test:** import only `formatLKR`, confirm transliteration code absent from bundle.
- [ ] **Accessibility:** `@axe-core/playwright` on all example routes; keyboard-only walkthrough.
- [ ] **Compatibility matrix:** document tested Node/React/Next/browser versions in `docs/compatibility.md`; CI matrix for React 18.3/19 and Next 15/16.
- [ ] **Security & supply chain:** `pnpm audit`, pinned devDeps, GitHub CodeQL, no `eval`/`dangerouslySetInnerHTML`; `SECURITY.md` contact.
- [ ] **License/provenance review:** every JSON scheme/fixture has `PROVENANCE.md` entry; `license-checker` on deps.
- [ ] API review pass: rename anything awkward now (pre-1.0 is the cheap time).

### Exit gate

- All CI jobs green including size, pack-smoke, axe, compatibility matrix.

---

## M12 — Beta release

**Branch:** `release/m12-beta`
**Goal:** Publish `0.1.0-beta.x` and collect real feedback.

### Tasks

- [ ] Create npm org `lankadev`; enable 2FA for all maintainers.
- [ ] Configure **npm Trusted Publishing** (OIDC) for the GitHub repo; no npm tokens in secrets if possible.
- [ ] `.github/workflows/release.yml` using `changesets/action`: on `main` → open "Version Packages" PR; on merge → `changeset publish` with provenance.
- [ ] Enter prerelease mode: `pnpm changeset pre enter beta`.
- [ ] Publish; verify on npm: provenance badge, files list, README renders.
- [ ] Recruit 10–20 testers + ≥ 1 Sinhala and ≥ 1 Tamil native-speaker reviewer; issue template `language-review`.
- [ ] Feedback window (1–2 weeks); triage into `critical` / `v1` / `later`.
- [ ] Technical launch post draft (problem, architecture, limitations).

### Exit gate

- No open `critical` issues; native-speaker review of golden fixtures recorded (`reviewedBy` filled).

---

## M13 — v1.0 stable release

**Branch:** `release/m13-v1`
**Goal:** Stable API under semver.

### Tasks

- [ ] `pnpm changeset pre exit`; major bump to `1.0.0`.
- [ ] Write `docs/semver-policy.md` and `docs/support-policy.md` (supported versions, deprecation process).
- [ ] Migration guide from beta.
- [ ] Final acceptance checklist (below) ticked in the PR.
- [ ] If transliteration accuracy is still below bar → keep `@lankadev/transliteration` on `0.x` with `experimental` label; release the rest as `1.0.0`.
- [ ] GitHub release with changelog; announce in Sri Lankan dev communities.

### Final acceptance checklist (from source plan §19)

- [ ] Quick start shows English, Sinhala and Tamil UI.
- [ ] Works in clean React app and Next.js App Router app.
- [ ] Integrates with i18next and next-intl without duplicating them.
- [ ] Native keyboards work; transliteration is optional.
- [ ] Unicode utilities documented with regression tests.
- [ ] Formatting verified in supported runtimes/browsers.
- [ ] Components accessible and mobile-usable.
- [ ] No user text sent anywhere by default.
- [ ] All code, fonts and data have reviewed licenses and provenance.
- [ ] Packages install cleanly with correct types; support policy published.
- [ ] Docs explain limitations honestly with working examples.

---

## Appendix A — Risk triggers during build

| Trigger                                 | Action                                                                                    |
| --------------------------------------- | ----------------------------------------------------------------------------------------- |
| M0 audit finds a good MIT/Apache engine | Replace M6 with "adapter around X"; keep the same public API.                             |
| M6 exact-match < 90 % after milestone   | Mark transliteration `experimental`; proceed to M7 with the toggle off by default.        |
| Caret/IME bugs on a platform in M7      | Disable transliteration on that platform (feature-detect), document; don't block release. |
| next-intl covers routing fully          | Shrink `@lankadev/next` to the client provider + `getLocaleFromRequest`.                  |
| Bundle budget exceeded                  | Split scheme JSON to lazy subpath imports before adding features.                         |

## Appendix B — Prompts to drive each milestone with Claude

- "Start M1: scaffold the monorepo exactly as in docs/IMPLEMENTATION_PLAN.md M1, then run the gate."
- "Implement M2 API and tests; stop when coverage is 100 % on core."
- "For M4, generate the first 30 Sinhala and 30 Tamil corpus fixtures and mark them `reviewedBy: null`."
- "For M6, draft docs/transliteration/singlish-v1.md mapping table first; wait for my review before coding."
- "Run the M11 checks and list failures."
