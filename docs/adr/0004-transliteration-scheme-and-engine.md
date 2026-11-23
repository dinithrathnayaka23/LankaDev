# 0004. Transliteration scheme and engine

- Status: Accepted (hands-on accuracy run pending; see "Re-open condition")
- Date: 2026-11-23

## Context

Source plan §3 decision gate: _do not write a new transliteration engine until the audit shows existing engines are unsuitable, unmaintained, incompatible or insufficiently accurate._

Audit ([transliteration-audit.md](../research/transliteration-audit.md), [competitor-audit.md §4–5](../research/competitor-audit.md)) found:

- ≥ 8 Sinhala engines and ≥ 6 Tamil options on npm.
- **Unmaintained / unproven:** every natural-Singlish/Tanglish engine is single-maintainer with a release history of days to weeks (most first published 2025–2026) and < 100 weekly downloads. Two have repository links that return 404.
- **Incompatible:** two engines need async WASM `init()` (bad for SSR and controlled inputs); one is DOM-coupled; one uses a Devanagari pivot that cannot represent Tamil ந/ன/ண, ழ, ற distinctions.
- **Licensing/provenance risk:** one GPL-3.0 package; others credit unlicensed upstream algorithms, "port value-for-value" from an unidentified legacy engine, or ship scraped dictionaries.
- **Not natural input:** the maintained, synchronous, MIT option (`@indic-transliteration/sanscript`) implements scholarly ITRANS, not how Sri Lankans type.
- No engine publishes an evaluation corpus or accuracy method.

## Decision

1. **Build** a deterministic, synchronous, zero-dependency engine in `@lankadev/transliteration`.
2. **Schemes are data** (JSON) authored clean-room by the project and versioned by name: `singlish-v1`, `tanglish-v1`. No table or code is copied from any other project. Each scheme file has a `PROVENANCE.md` entry.
3. **Singlish v1 aligns with the de-facto Helakuru-style convention** users already know (inherent `a`, `aa` = ා, `th` = ත, `t` = ට, `d` = ද, `D` = ඩ, …). Conventions are not code; our table is written and documented independently in `docs/transliteration/singlish-v1.md` before coding (M6).
4. **Tanglish v1** is designed for natural typing with context rules (word-initial `n` = ந, otherwise ன; `N` = ண; `zh` = ழ; `R` and `ndr`/`tr` clusters = ற) documented in `docs/transliteration/tanglish-v1.md` (M6).
5. **Engine is pluggable** behind the `Transliterator` interface (implementation plan M6): `empty`, `feed`, `backspace`, `convertWord`. An external engine can be wrapped later without breaking users.
6. **Incremental editing model** borrows the _idea_ (not code) of a pure `(state, key) → edit` step plus `resync(text, caret)` after external edits.
7. **Quality bar:** ≥ 90 % exact match on our golden fixtures plus a native-speaker review request before beta. Below the bar, the package ships labelled `experimental` and the input toggle defaults to off.
8. Dictionaries/candidate lists are **out of scope for v1**; deterministic rules only. Any later dictionary must be self-authored or clearly licensed.

## Re-open condition

The hands-on accuracy run (`docs/research/transliteration-audit/run-audit.mjs`) is pending maintainer approval to execute third-party code. If a candidate scores ≥ 90 % best-variant on `words.json` **and** gains ≥ 12 months of activity or multiple maintainers, revisit wrapping it in v0.2+ via a new ADR that supersedes this one.

## Consequences

- We own linguistic correctness → must recruit Sinhala and Tamil reviewers (tracked in SCOPE.md).
- M6 is the highest-risk milestone; schedule fallback from source plan §13 applies.
- Publishing our tables and corpus becomes a differentiator.
