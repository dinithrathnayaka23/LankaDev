# Transliteration Engine Audit (M0)

- **Date:** 2026-11-23
- **Goal:** Answer decision D5 (source plan §3 decision gate): _wrap an existing engine, or build a new one?_
- **Status:** Static review **complete**. Hands-on accuracy run **pending** (see §4).

---

## 1. Evaluation criteria

An engine is "suitable to wrap" only if **all** hard criteria pass.

| #   | Criterion                                                                               | Type | Why                                                    |
| --- | --------------------------------------------------------------------------------------- | ---- | ------------------------------------------------------ |
| C1  | MIT / Apache-2.0 / BSD, with clear upstream data provenance                             | Hard | LankaDev is MIT; source plan §10.                      |
| C2  | Maintained: > 1 maintainer **or** ≥ 12 months of release history, public repo reachable | Hard | Avoid depending on an abandoned single-author package. |
| C3  | Deterministic, synchronous, no network, no WASM async init                              | Hard | SSR-safe, works in controlled React inputs.            |
| C4  | Exact-match ≥ 90 % (best-variant) on `words.json`                                       | Hard | Same bar as our M6 exit gate.                          |
| C5  | Incremental / stateful API (or cheap enough to re-run per word)                         | Soft | Needed for live typing (M7).                           |
| C6  | Published mapping table + test corpus                                                   | Soft | Transparency (source plan §7).                         |
| C7  | ≤ 10 KB min+gzip for one language                                                       | Soft | Bundle budget (M11).                                   |

---

## 2. Static review results

Data from [competitor-audit.md](competitor-audit.md) §4–5 plus reading each package's README, type declarations and, where relevant, source headers.

### Sinhala

| Package                            | C1 licence/provenance                                                                | C2 maintained                                         | C3 sync/SSR                     | C5 incremental                                 | C6 table+corpus               | Verdict (static)                                       |
| ---------------------------------- | ------------------------------------------------------------------------------------ | ----------------------------------------------------- | ------------------------------- | ---------------------------------------------- | ----------------------------- | ------------------------------------------------------ |
| `@siyabasa/singlish`               | Apache-2.0 ✅; convention credited to Helakuru (convention only) ⚠️                  | ❌ 4 releases over 12 days (Feb 2026), 1 org, 4 stars | ✅                              | ✅ (React hook)                                | ⚠️ table partly, no corpus    | Best Sinhala candidate; fails C2.                      |
| `@sinhala-typer/typing-engine`     | MIT; tables "ported value-for-value from the legacy engine" — origin unidentified ❌ | ❌ 1 release; repo URL 404                            | ✅                              | ✅ best-in-class `(state,key)→edit` + `resync` | ⚠️                            | Fails C1, C2. Good design reference.                   |
| `@felix-tech/singlish-js`          | MIT ✅                                                                               | ❌ 4 releases over 3 days (May 2026)                  | ✅                              | ⚠️ string→string only                          | ✅ table in README, no corpus | Fails C2.                                              |
| `sinhala-text-converters`          | MIT, but credits UCSC algorithms; upstream licence not stated ⚠️                     | ❌ 2 releases, 1 day                                  | ✅                              | ❌                                             | ❌                            | Fails C1 (unclear), C2.                                |
| `singlish-pro`                     | MIT                                                                                  | ❌ repo 404                                           | ⚠️ DOM-coupled class + function | ❌                                             | ⚠️ partial table              | Fails C2; DOM-coupled.                                 |
| `singlish-sinhala`                 | MIT                                                                                  | ❌ no repo                                            | ❌ WASM async `init()`          | ❌                                             | ❌                            | Fails C2, C3.                                          |
| `@vm75/inditrans` (ITRANS→Sinhala) | MIT ✅                                                                               | ✅ 27 releases since 2023                             | ❌ WASM async `init()`          | ❌                                             | ✅ ITRANS spec                | Fails C3; ITRANS is not how Sri Lankans type Singlish. |

### Tamil

| Package                            | C1                                                             | C2                                   | C3            | C5                 | C6  | Verdict (static)                                                                                                       |
| ---------------------------------- | -------------------------------------------------------------- | ------------------------------------ | ------------- | ------------------ | --- | ---------------------------------------------------------------------------------------------------------------------- |
| `@piraisoodan/tanglish`            | MIT, but dictionary built from scraped Wikipedia/literature ⚠️ | ❌ 3 releases over 3 days (Jan 2026) | ✅            | ⚠️ suggestions API | ⚠️  | Fails C2; 1.56 MB unpacked fails C7.                                                                                   |
| `indic-transliterator`             | Apache-2.0 ✅                                                  | ❌ no repo URL                       | ✅            | ⚠️ React hook      | ❌  | Fails C2; Devanagari-pivot loses ன/ந/ண, ழ, ற distinctions by design.                                                   |
| `@vm75/inditrans` (ITRANS→Tamil)   | MIT ✅                                                         | ✅                                   | ❌ WASM async | ❌                 | ✅  | Fails C3; scheme ≠ Tanglish.                                                                                           |
| `@indic-transliteration/sanscript` | MIT ✅                                                         | ✅ (124 stars, last release 2025-06) | ✅            | ❌                 | ✅  | Passes C1–C3, but ITRANS→Tamil is a scholarly scheme, not natural Tanglish (expected to fail C4 on natural spellings). |

### Static conclusion

**No candidate passes C1 + C2 + C3 together for natural Singlish or Tanglish input.** The only maintained, synchronous, clean-licence option (`sanscript`) targets scholarly ITRANS, not how Sri Lankan users type.

---

## 3. Decision (feeds ADR-0004)

**Build** a small deterministic, clean-room engine in `@lankadev/transliteration`, with:

- A Singlish scheme **aligned with the widely used Helakuru-style convention** (e.g. inherent `a`, `aa` = ා, `th` = ත vs `t` = ට, `d` = ද vs `D` = ඩ; exact case/digraph rules for ඇ/ඈ, ශ/ෂ, aspirates and prenasalised letters are decided and documented in `docs/transliteration/singlish-v1.md` during M6). We author and document the table ourselves; we copy no table or code.
- A Tanglish scheme designed for natural typing (context rules for ந/ன/ண, `zh` = ழ, `R`/`tr`/`ndr` = ற clusters) documented in `docs/transliteration/tanglish-v1.md` (M6).
- An **engine interface** (`Transliterator` in the implementation plan, M6) so an external engine can be wrapped later behind the same API without breaking users.
- Design cues taken (ideas only) from `@sinhala-typer/typing-engine`: pure `(state, key) → edit` steps and `resync(text, caret)` after external edits.

**Re-open condition:** if the hands-on run (§4) shows a candidate with best-variant ≥ 90 % **and** it later gains C2 (≥ 12 months of activity or multiple maintainers), revisit wrapping it in v0.2+.

---

## 4. Hands-on accuracy run — PENDING

Required by source plan §3 step 3. Not executed in M0 because it runs third-party npm code; it needs explicit maintainer approval and an isolated install.

- Word list: [transliteration-audit/words.json](transliteration-audit/words.json) — 15 Sinhala + 15 Tamil common words, each with 1–5 plausible spellings. `reviewedBy: null` (needs native-speaker check).
- Runner: [transliteration-audit/run-audit.mjs](transliteration-audit/run-audit.mjs) — install instructions in its header. Uses `--ignore-scripts` and a throwaway directory.
- Scores reported: **strict** (first/natural spelling), **best-variant** (any listed spelling), **best-variant ignoring ZWJ/ZWNJ** (shows engines that drop joiners in ශ්‍රී / විද්‍යා).

### Results

| Package             | Lang | Strict | Best-variant | Best ignoring ZWJ | Notes |
| ------------------- | ---- | ------ | ------------ | ----------------- | ----- |
| _to fill after run_ |      |        |              |                   |       |

When filled: if no package reaches ≥ 90 % best-variant, the decision in §3 stands unchanged. If one does, append a note to ADR-0004 (do not rewrite it).

---

## 5. Lessons for our own engine (from reviewing others)

1. **Publish the mapping table and the corpus**; none of the reviewed Sinhala engines publish an evaluation corpus. This is an easy differentiator.
2. **Preserve ZWJ** in rakaransaya/yansaya (`ශ්‍රී`, `විද්‍යා`). Our `words.json` checks this explicitly.
3. **Keep it synchronous and tiny.** Two candidates require WASM async init, which complicates SSR and controlled inputs.
4. **Separate engine from DOM.** DOM-coupled packages (`singlish-pro`) are hard to use in React/Next.js.
5. **Tamil needs context rules, not a Devanagari pivot.** ந (word-initial), ன (word-final/medial), ண (retroflex) cannot be recovered from a pivot.
6. **Dictionaries need provenance.** Scraped dictionaries are a licensing risk; any dictionary we add must be self-authored or clearly licensed.
