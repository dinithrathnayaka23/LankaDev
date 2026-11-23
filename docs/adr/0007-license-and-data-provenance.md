# 0007. License and data provenance

- Status: Accepted
- Date: 2026-11-23

## Context

The repository already contains an MIT `LICENSE` (2026). Source plan §10 requires provenance for every dictionary, font and dataset, and forbids copying linguistic tables without redistribution rights. The audit found a GPL-3.0 Sinhala package and several packages with unclear upstream provenance ([competitor-audit.md §7](../research/competitor-audit.md)).

## Decision

1. **Code license:** MIT for all packages, examples and docs code.
2. **Runtime dependencies:** only MIT, Apache-2.0, BSD-2/3-Clause, ISC or 0BSD. No GPL/LGPL/AGPL/SSPL or unlicensed packages. Enforced with `license-checker` (or equivalent) in CI at M11.
3. **Linguistic data** (schemes, fixtures, corpora) is **self-authored or synthetic** and committed under MIT. Each data directory has a `PROVENANCE.md` listing: file, author, method, date, license, review status (`reviewedBy`).
4. **No personal data in fixtures:** no real NICs, phone numbers, addresses or personal names tied to real people.
5. **Fonts are never bundled.** Docs reference Noto Sans Sinhala / Noto Sans Tamil (OFL-1.1) via Google Fonts or `@fontsource`.
6. **Third-party engines are not vendored.** If ever wrapped, they are dependencies with compatible licences, and the wrap is recorded in a new ADR.

## Consequences

- Contributors adding data must fill `PROVENANCE.md`; the PR template gets a checkbox (M1).
- Native-speaker review is tracked per fixture via `reviewedBy`.
