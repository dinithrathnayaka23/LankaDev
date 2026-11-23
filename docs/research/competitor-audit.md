# Competitor & Ecosystem Audit (M0)

- **Date:** 2026-11-23
- **Method:** npm registry search API (`/-/v1/search`) for `sinhala`, `tamil`, `singlish`, `tanglish`, `sinhala transliteration`, `tamil transliteration`, `bhasha`, `sri lanka i18n`, `scope:lankadev`; npm package metadata (`registry.npmjs.org/<pkg>`) for latest version, publish dates, license, dependencies, types, unpacked size; npm downloads API (last week); GitHub REST API for stars, open issues, last push.
- **Limits:** figures are a snapshot on the date above. Downloads are a weak signal. No package code was executed during this audit (see [transliteration-audit.md](transliteration-audit.md) for the pending hands-on run).

---

## 1. Name availability

| Name              | npm registry result | Notes                                                                 |
| ----------------- | ------------------- | --------------------------------------------------------------------- |
| `@lankadev/core`  | 404 — not published | Available as a package name.                                          |
| `@lankadev/react` | 404 — not published | Available as a package name.                                          |
| `lankadev`        | 404 — not published | Available. Consider reserving as a placeholder that points to docs.   |
| `lanka-dev`       | 404 — not published | Available.                                                            |
| `scope:lankadev`  | 0 search results    | No public packages under the scope.                                   |
| npm org `lankadev`| Not verifiable from CLI (web page returned 403 to automated request) | **Action:** sign in to npmjs.com → *Add Organization* → `lankadev`. Do this before M12. |

Similar-sounding names already in use (avoid confusion in branding/docs): `lanka-kit`, `lanka-validations`.

Trademark/domain check is manual and **not done** — tracked as an open item in [../SCOPE.md](../SCOPE.md).

---

## 2. General i18n engines (integrate, do not replace)

| Package         | Latest  | Last publish | License      | Weekly downloads | LankaDev strategy                                          |
| --------------- | ------- | ------------ | ------------ | ---------------- | ---------------------------------------------------------- |
| `i18next`       | 27.2.4  | 2026-11-22   | MIT          | ~37.3 M          | First React integration target (example + docs).           |
| `react-i18next` | 18.0.3  | 2026-11-19   | MIT          | ~27.8 M          | Used in `examples/react-vite`.                             |
| `next-intl`     | 4.15.3  | 2026-11-19   | MIT          | ~10.2 M          | Used in `examples/next-app-router`; owns routing.          |
| `react-intl`    | 12.2.0  | 2026-11-18   | BSD-3-Clause | ~4.8 M           | Docs mention only; no example in v1.                       |
| `next`          | 16.4.6  | 2026-11-09   | MIT          | ~98 M            | Peer dep of `@lankadev/next`; support 15.x and 16.x.       |
| `react`         | 19.3.1  | 2026-10-14   | MIT          | ~276 M           | Peer dep; support 18.3 and 19.x.                           |

Conclusion: mature, actively released, permissively licensed. Matches the source plan — LankaDev must not ship a translation engine.

---

## 3. Regional / Sri Lankan developer toolkits (closest overlap)

| Package             | Latest | First → last publish   | License | Types | Unpacked | dl/wk | What it does                                                                                       | Overlap with LankaDev |
| ------------------- | ------ | ---------------------- | ------- | ----- | -------- | ----- | -------------------------------------------------------------------------------------------------- | --------------------- |
| `bhasha-js`         | 0.4.0  | 2026-03-20 → 06-10     | MIT     | yes   | 854 KB   | 15    | React i18n for 14 South Asian languages incl. Sinhala & Tamil; own provider/`useTranslation`, fonts, CLDR plurals, `formatCurrency(…, "ta", "LK")`. | **High** on React provider + currency. It *is* a translation engine (competes with i18next); India-first; no transliteration input. |
| `lanka-kit`         | 1.2.0  | 2026-10-28 → 10-29     | MIT     | yes   | 694 KB   | 18    | NIC/licence validation, LKR amount-in-words (incl. Sinhala), Sinhala ZWJ normalizer/search sanitizer, postcodes. | **Medium** on Unicode normalization; LKR words is out of LankaDev v1 scope. No repo URL in metadata. |
| `lanka-validations` | 2.1.0  | 2026-10-06 → 10-14     | MIT     | yes   | 1.48 MB  | 74    | Sri Lankan data validation (NIC, phone, etc.).                                                     | None (out of scope).  |
| `selakata`          | 0.1.2  | 2026-08-18 → 08-19     | MIT     | yes   | 606 KB   | 5     | i18n for Southeast Asia (React peer).                                                              | Low.                  |
| `sl-date-utils-v1`  | 1.1.1  | → 2026-07-07           | —       | —     | —        | —     | Sri Lankan holidays, working days, Sinhala calendar.                                               | None (dates/calendar out of v1 scope). |

Conclusion: no package combines *(a)* integration with existing i18n engines, *(b)* Sinhala **and** Tamil input, *(c)* tested Unicode utilities, *(d)* Next.js App Router guidance. `bhasha-js` is the nearest React competitor; differentiate by **not** owning translations and by Sri Lanka-specific depth (transliteration input, si/ta Unicode corpus, LKR in all three locales).

---

## 4. Sinhala transliteration / input packages

| Package                       | Latest | First → last publish | Versions | License    | Types | Unpacked | dl/wk | GitHub (stars / open issues / last push) | Approach (from README/source) |
| ----------------------------- | ------ | -------------------- | -------- | ---------- | ----- | -------- | ----- | ---------------------------------------- | ----------------------------- |
| `@siyabasa/singlish`          | 1.0.4  | 2026-02-13 → 02-25   | 4        | Apache-2.0 | yes   | 76 KB    | 28    | 4 / 0 / 2026-02-25                       | Trie tokenizer (400+ patterns) + state-machine renderer; React hook `useSinglishConverter` (cursor, history, IME claims). Mapping "inspired by" Helakuru convention. |
| `@sinhala-typer/typing-engine`| 0.1.0  | 2026-07-06           | 1        | MIT        | yes   | 125 KB   | 2     | repo URL returns 404                     | Pure `(state, keystroke) → { state, edit }` engine, phonetic + Wijesekara, `resync()` after external edits. Tables "ported value-for-value from the legacy engine" (origin not identified). |
| `@felix-tech/singlish-js`     | 0.1.3  | 2026-05-23 → 05-25   | 4        | MIT        | yes   | 36 KB    | 40    | 3 / 0 / 2026-05-25                       | Stateless `transliterate()`; dual CJS/ESM; full mapping table documented in README; `a` = inherent, `aa` = ා. |
| `sinhala-text-converters`     | 1.0.5  | 2025-12-13           | 2        | MIT        | yes   | 44 KB    | 65    | 0 / 0 / 2025-12-13                       | Singlish↔Unicode, legacy formats. Credits "conversion algorithms" to UCSC authors (upstream licence not stated). |
| `singlish-pro`                | 1.2.2  | 2026-05-04 → 06-01   | 5        | MIT        | yes   | 264 KB   | 2     | repo URL returns 404                     | DOM-attaching IME with built-in toggle UI; own "hybrid" mapping (`t`→ට, `th`→ත). |
| `singlish-sinhala`            | 0.3.1  | 2026-08-07           | 3        | MIT        | yes   | 66 KB    | 3     | no repo URL                              | Rust → WASM; ~100-word dictionary + candidates; requires async `init()`. |
| `@pnfo/singlish-search`       | 1.4.2  | 2022-12-26 → 2026-10-31 | 14    | MIT        | no    | 84 KB    | 25    | 2 / 0 / 2026-10-31                       | Search Sinhala text with Singlish queries (not an input engine). Relevant to `toSearchKey` ideas. |
| `@_000407/singlish.js`        | 1.0.5  | 2021-01-01           | 5        | MIT (npm)  | no    | 22 KB    | 108   | 1 / 0 / 2021-01-01, no repo licence      | Simple parser; unmaintained since 2021. |
| `sinhala-unicode`             | 2.0.0  | 2022-06-29           | 3        | MIT        | no    | 128 KB   | 52    | —                                        | Unmaintained since 2022. |
| `@suhasdissa/singlish`        | 2.0.0  | 2025-11-25 → 2026-07-11 | 2     | **GPL-3.0-or-later** | yes | 115 KB | 5 | —                                  | Sinhala → Singlish (reverse direction). **GPL: cannot be bundled in an MIT package.** |
| `sinhala-orthography`         | 0.2.0  | 2026-10-08           | 2        | MIT        | yes   | 38 KB    | 5     | —                                        | Orthographic rules, letter inventory, romanization. Possible reference for docs. |

---

## 5. Tamil transliteration / input packages

| Package                           | Latest | First → last publish   | Versions | License    | Types | Unpacked | dl/wk  | GitHub (stars / open issues / last push) | Approach |
| --------------------------------- | ------ | ---------------------- | -------- | ---------- | ----- | -------- | ------ | ---------------------------------------- | -------- |
| `@piraisoodan/tanglish`           | 0.1.2  | 2026-01-09 → 01-12     | 3        | MIT        | yes   | **1.56 MB** | 24  | 2 / 0 / 2026-01-13                       | Dictionary (`ta_common.json`) + phonetic trie (600+ rules); `getSuggestions`. Dictionary built from scraped Wikipedia/literature — data provenance must be checked before reuse. Tamil Nadu colloquial focus. |
| `@vm75/inditrans`                 | 0.18.0 | 2023-03-11 → 2026-11-18| 27       | MIT (no LICENSE file in tarball) | yes | 595 KB | 230 | 5 / 9 / 2026-11-18                  | C++23 → WASM; scheme converter (ITRANS, IAST, ISO 15919) for 16 scripts incl. **Sinhala and Tamil**. Actively maintained. Scheme-based, not a "Tanglish as people type it" IME. Async `init()`. |
| `@indic-transliteration/sanscript`| 1.3.3  | 2022-07-23 → 2025-06-08| 7        | MIT        | yes   | 264 KB   | ~15 k  | 124 / 24 / 2025-06-08                    | Mature scheme converter (ITRANS/HK/IAST); deps `toml`, `common_maps`. Sanskrit-oriented; Tamil output from ITRANS is not natural Tanglish. |
| `indic-transliterator`            | 1.3.1  | 2026-03-26 → 04-09     | 5        | Apache-2.0 | no    | 66 KB    | 493    | no repo URL                              | Roman → Devanagari pivot → Tamil exception map; React hook. **No Sinhala.** Pivot design loses Tamil-specific distinctions (ன/ந/ண, ழ, ற). |
| `@bhashaime/core`                 | 1.0.8  | 2025-07-10 → 07-11     | 8        | MIT (npm), no repo licence | yes | 267 KB | 121 | 2 / 0 / 2025-07-12              | React IME plugin; Gujarati/Hindi focus. |
| `tamil-toolkit`                   | 0.1.0-alpha.10 | 2026-10-31 → 11-22 | 11  | Apache-2.0 | yes   | **7.4 MB** | 203  | —                                        | Rust/WASM Tamil linguistic engine; alpha; too heavy for an input dependency. |
| `transliterationkit`              | 1.0.1  | 2026-10-08             | 2        | MIT        | no    | 19 KB    | 6      | —                                        | Brahmic phonetic transliteration (Malayalam, Tamil…). |
| `@learn-tamil/script`             | 0.9.1  | 2020-04-16 → 2026-10-23| 26       | MIT        | yes   | 40 KB    | 18     | —                                        | Tamil script utilities; Tamil → Latin (romanization/ISO/IPA). Not an input engine; possible reference for Tamil Unicode tests. |

---

## 6. Fonts

| Package / source                        | License | Notes                                                       |
| --------------------------------------- | ------- | ----------------------------------------------------------- |
| `@fontsource/noto-sans-sinhala` 5.3.0   | OFL-1.1 | Self-host option, updated 2026-07-19.                       |
| `@fontsource/noto-sans-tamil`           | OFL-1.1 | Same family.                                                |
| Google Fonts (`next/font/google`)       | OFL-1.1 | Default recommendation in docs/examples. Never bundle fonts in LankaDev packages. |

---

## 7. Findings summary

1. **Name `@lankadev/*` is free** on the registry. Org creation is the remaining manual step.
2. **Translation engines are solved** (i18next, next-intl). Integrate only.
3. **Many Sinhala engines exist (≥ 8), all young** (most first published 2025–2026), single-maintainer, < 100 weekly downloads, **none publish an evaluation corpus or accuracy method**. Two (`singlish-pro`, `@sinhala-typer/typing-engine`) point to repos that return 404.
4. **Tamil options split in two**: scheme converters (`inditrans`, `sanscript`) that are maintained but not natural Tanglish, and Tanglish IMEs (`@piraisoodan/tanglish`) that are young, large, and dictionary-based with scraped data.
5. **No single package covers Sinhala + Tamil with one API**, a controlled React input with IME handling, and Next.js SSR guidance. This is LankaDev's gap.
6. **Licence hazards found**: one GPL package (`@suhasdissa/singlish`), and several with unclear upstream provenance (UCSC-credited algorithms, "ported from legacy engine", scraped dictionaries). Reinforces the clean-room scheme decision (ADR-0004).

## 8. Reuse / wrap / improve / skip

| Item                                  | Decision      | Reason                                                                 |
| ------------------------------------- | ------------- | ---------------------------------------------------------------------- |
| i18next / react-i18next / next-intl   | **Integrate** | Mature, MIT. Examples + docs.                                          |
| Noto Sans Sinhala / Tamil             | **Reference** | OFL; document, never bundle.                                           |
| Sinhala transliteration packages      | **Do not depend (yet)** | Young, single-maintainer, no corpus; provenance unclear on several. Re-evaluate after hands-on run. |
| `@sinhala-typer/typing-engine` design | **Learn from** | Its `(state, key) → edit` + `resync()` API matches our M6/M7 design; confirms approach. No code reuse. |
| Helakuru-style Singlish convention    | **Align with** | De-facto convention users know; we document our own table independently (conventions, not code). |
| Tamil scheme converters               | **Do not depend** | Not natural Tanglish; WASM async init complicates SSR/input.     |
| `@piraisoodan/tanglish`               | **Do not depend** | 1.56 MB; scraped-data dictionary provenance.                     |
| `bhasha-js`                           | **Differentiate** | It owns translations; we integrate with i18next/next-intl.        |
| Sinhala ZWJ search normalization (`lanka-kit`, `@pnfo/singlish-search`) | **Implement our own** | Small, well-defined; we need it tested against our corpus. |
| LKR amount-in-words / cheque wording  | **Skip in v1** | Source plan: separate feature requiring local validation.             |
