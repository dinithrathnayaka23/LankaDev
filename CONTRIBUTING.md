# Contributing to LankaDev

Thanks for helping make Sinhala and Tamil support easier for web developers. Contributions of code, docs, tests, accessibility reviews and **native-speaker language reviews** are all welcome.

## Before you start

- Read [docs/SCOPE.md](docs/SCOPE.md). Translation engines, machine translation and spell-checking are out of scope for v1.
- Big changes: open an issue first so we can agree on the approach.
- Architecture decisions live in [docs/adr/](docs/adr/). Changing one means writing a new ADR.

## Development setup

Requirements: Node.js **≥ 22.18** (24 recommended, see `.nvmrc`) and **pnpm** via Corepack.

```sh
corepack enable          # once per machine; provides the pinned pnpm version
pnpm install
pnpm build
pnpm test
```

> Windows: if `corepack enable` fails with a permissions error, run your terminal as Administrator once, or use `corepack pnpm <command>` instead of `pnpm <command>`.

### Common commands

| Command                                   | What it does                                          |
| ----------------------------------------- | ----------------------------------------------------- |
| `pnpm build`                              | Build all packages (Turborepo, cached)                |
| `pnpm test`                               | Run unit tests in every package                       |
| `pnpm typecheck`                          | `tsc --noEmit` in every package                       |
| `pnpm lint`                               | ESLint (type-aware) across the repo                   |
| `pnpm format`                             | Format with Prettier                                  |
| `pnpm check:packages`                     | `publint` + `@arethetypeswrong/cli` on built packages |
| `pnpm changeset`                          | Record a release note for changed packages            |
| `pnpm --filter @lankadev/core test:watch` | Watch tests for one package                           |

Before opening a PR, run the full gate:

```sh
pnpm lint && pnpm format:check && pnpm typecheck && pnpm test && pnpm build && pnpm check:packages
```

## Repository layout

```
packages/
  core/             @lankadev/core            locale config, fallback, formatting
  unicode/          @lankadev/unicode         script detection, normalization, segmentation
  transliteration/  @lankadev/transliteration Singlish / Tanglish engines
  react/            @lankadev/react           provider, hooks, components
  next/             @lankadev/next            Next.js App Router helpers
docs/               plan, scope, ADRs, research
```

## Branches and commits

- Branch from `main`: `<type>/<short-topic>`, e.g. `feat/m2-core-locale-config`, `fix/unicode-zwj`.
- Commits follow [Conventional Commits](https://www.conventionalcommits.org/): `feat(core): …`, `fix(unicode): …`, `docs: …`, `chore: …`, `test: …`.
- PRs are squash-merged. Fill in the PR template checklist.

## Changesets

Any PR that changes the behaviour or API of a package under `packages/` needs a changeset:

```sh
pnpm changeset
```

Docs-only, test-only and tooling-only changes do not.

## Code rules

- TypeScript strict mode; no `any` in public types.
- Named exports only (no default exports).
- `core`, `unicode` and `transliteration` stay framework-agnostic: no React, no DOM globals.
- No network calls, telemetry, `eval`, or module-level access to `window`, `document`, `localStorage` or `navigator`.
- Every public function has TSDoc and tests (happy path, invalid input, edge cases).
- Iterate strings by code point or grapheme, never by UTF-16 index. Never strip ZWJ/ZWNJ without a script-specific reason.

## Linguistic data

- Schemes, fixtures and corpora must be **self-authored or synthetic**. Do not copy tables or word lists from other projects or websites.
- Add a `PROVENANCE.md` entry for every new data file (source, author, date, license, review status).
- Never include real personal data (NIC numbers, phone numbers, addresses, real people's names).

## Language reviews

Native Sinhala and Tamil speakers can help without writing code: open a **Language review** issue to report wrong output or to review fixtures.

## Code of Conduct

By participating you agree to the [Code of Conduct](CODE_OF_CONDUCT.md).
