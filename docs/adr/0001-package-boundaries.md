# 0001. Package boundaries and naming

- Status: Accepted
- Date: 2026-11-23

## Context

The source plan proposes up to six packages (`core`, `react`, `next`, `transliteration`, `unicode`, `formatting`) but also warns: *start with fewer packages if maintenance capacity is limited*. The project has one primary maintainer.

Name check ([competitor-audit.md §1](../research/competitor-audit.md)): `@lankadev/core`, `@lankadev/react`, `lankadev`, `lanka-dev` all return 404 on the npm registry; no packages exist under `scope:lankadev`. The npm org itself still has to be created. Similar names in use: `lanka-kit`, `lanka-validations`.

## Decision

Publish **five** packages under the `@lankadev` scope:

| Package                     | Contents                                                   | Runtime deps        | Peer deps          |
| --------------------------- | ---------------------------------------------------------- | ------------------- | ------------------ |
| `@lankadev/core`            | Locale types, config, fallback, Accept-Language parsing, **formatting** (LKR, number, date, relative time) via subpath `@lankadev/core/formatting` | none | none |
| `@lankadev/unicode`         | Script detection, normalization, search keys, grapheme/word segmentation | none | none |
| `@lankadev/transliteration` | Singlish/Tanglish engines; subpaths `/sinhala`, `/tamil`    | `@lankadev/unicode` (only if needed) | none |
| `@lankadev/react`           | Provider, hooks, language switcher, `TransliterationInput`, optional CSS | `@lankadev/core`, `@lankadev/unicode`, `@lankadev/transliteration` | `react`, `react-dom` |
| `@lankadev/next`            | App Router helpers; subpaths `/server`, `/client`          | `@lankadev/core`, `@lankadev/react` | `next`, `react`, `react-dom` |

Rules:

- Formatting is folded into `core` (no separate `@lankadev/formatting`) because it is small and shares the locale types.
- `core`, `unicode`, `transliteration` are framework-agnostic: no DOM globals, no React.
- Dependency graph is acyclic: `core | unicode → transliteration → react → next`.
- Reserve the unscoped `lankadev` name with a placeholder package pointing to docs at M12 (prevents squatting).

## Consequences

- Fewer packages to version and release; Changesets handles the five together.
- A future split of `formatting` out of `core` would be a breaking change — acceptable before 1.0 only.
- **Action before M12:** create the `lankadev` npm org (manual, npmjs.com), enable 2FA. Trademark/domain check remains a manual open item in [SCOPE.md](../SCOPE.md).
