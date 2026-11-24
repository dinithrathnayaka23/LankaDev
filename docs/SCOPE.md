# LankaDev MVP Scope (v0.1 → v1.0)

- **Date:** 2026-11-23 · **Status:** Frozen for M1–M11 (changes need an ADR or a scope note in a PR)
- **One-line goal:** A developer adds reliable Sinhala/Tamil/English support to an existing React or Next.js app in minutes, keeping control of translations, routing, styling and input.

## In scope

| Area             | v1 deliverable                                                                                                                                         | Package                            | Milestone |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------- | --------- |
| Locales          | `en-LK`, `si-LK`, `ta-LK` types, `createLankaConfig`, validation, fallback, `resolveLocale`, `parseAcceptLanguage`                                     | `@lankadev/core`                   | M2        |
| Formatting       | `formatLKR`, `formatNumber`, `formatDate` (default `Asia/Colombo`), `formatRelativeTime` over `Intl`; documented per-runtime output                    | `@lankadev/core/formatting`        | M3        |
| Unicode          | `detectScript`, `analyzeScripts`, `normalizeSinhalaText`, `normalizeTamilText`, `toSearchKey`, grapheme/word helpers, `truncate`; ≥ 60 corpus fixtures | `@lankadev/unicode`                | M4        |
| React            | `LankaProvider` (controlled + uncontrolled), `useLanka`, `useLocale`, headless `useLanguageSwitcher`, `LanguageSwitcher`                               | `@lankadev/react`                  | M5        |
| Transliteration  | Deterministic `singlish-v1` and `tanglish-v1`; `transliterate`, `createTransliterator`; ≥ 150 golden fixtures per language                             | `@lankadev/transliteration`        | M6        |
| Input            | `useTransliteration`, `TransliterationInput`; caret preservation, IME-safe, paste modes, revert, toggle                                                | `@lankadev/react`                  | M7        |
| i18n integration | i18next + react-i18next example and guide                                                                                                              | examples, docs                     | M8        |
| Next.js          | App Router example with next-intl; `@lankadev/next/server` + `/client`; zero hydration warnings                                                        | `@lankadev/next`                   | M9        |
| Typography       | Optional CSS variables + `:lang()` rules; font guidance (Noto, OFL)                                                                                    | `@lankadev/react/styles.css`, docs | M10       |
| Docs             | Docs site + client-side playground                                                                                                                     | `apps/docs`                        | M10       |

## Non-goals (v1)

- Translation engine, message format, locale routing (use i18next / next-intl — ADR-0002).
- Machine translation or any AI features.
- Hosted translation management or admin UI.
- Spell-checking, grammar correction, dictionary-based prediction or candidate lists.
- Replacing OS-native Sinhala/Tamil keyboards (they must keep working untouched).
- Wijesekara / Tamil99 keyboard layouts (possible v0.2+).
- LKR amount-in-words, cheque wording, legal/financial calculations.
- Sinhala/Tamil calendars, holidays, NIC/phone validation.
- Next.js Pages Router.
- Network calls or telemetry of any kind.

## MVP acceptance criteria (v0.1 beta)

1. `pnpm add @lankadev/core @lankadev/react` + quick start → tri-lingual switcher working in a clean Vite app.
2. Next.js App Router example builds and passes Playwright with no hydration warnings.
3. `formatLKR(12500.5, { locale })` output documented for all three locales on Node 22/24/26 and three browser engines.
4. `detectScript` and normalization pass the corpus; normalization is idempotent and preserves ZWJ/ZWNJ.
5. Transliteration ≥ 90 % exact match on self-authored golden fixtures, or ships labelled `experimental`.
6. `TransliterationInput` keeps native IME input unchanged and preserves caret in the manual checklist on 5 platforms.
7. All packages pass `publint` + `attw`; no runtime dependency outside the allowed licence list (ADR-0007).

## Open items

| Item                                                                                                                                    | Owner                                                                   | Needed by                   |
| --------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | --------------------------- |
| Create npm org `lankadev` and enable 2FA                                                                                                | Maintainer (manual on npmjs.com)                                        | M12                         |
| Trademark / domain check for "LankaDev"                                                                                                 | Maintainer                                                              | M12                         |
| Run hands-on transliteration audit (`docs/research/transliteration-audit/run-audit.mjs`) and fill results table                         | Maintainer approval to execute third-party code                         | Before M6 starts            |
| Native-speaker review of `docs/research/transliteration-audit/words.json`                                                               | Recruit ≥ 1 Sinhala, ≥ 1 Tamil reviewer                                 | Before M6 exit              |
| Developer interviews (source plan days 1–2: 5–8 React/Next.js devs)                                                                     | Maintainer                                                              | Before M5 (to validate API) |
| Decide `en-LK` date convention: keep CLDR `en` (month-first numeric dates) or map to day-first ([formatting.md](formatting.md) quirk 1) | Maintainer + developer interviews                                       | Before M5                   |
| Confirm `ta-LK` number grouping (CLDR lakh `12,34,567` vs western `1,234,567`)                                                          | ≥ 1 Sri Lankan Tamil reviewer                                           | Before beta (M12)           |
| Record Node 22 / 26 formatting snapshots and Chrome/Firefox/Safari checks in [formatting.md](formatting.md)                             | Maintainer (run `pnpm --filter @lankadev/core test` on each Node major) | Before beta (M12)           |
| Native-speaker review of `fixtures/language-corpus` (set `reviewedBy`; start with `needs-native-review` entries)                        | Recruit ≥ 1 Sinhala, ≥ 1 Tamil reviewer                                 | Before beta (M12)           |
| Decide whether character counters should treat Sinhala ZWJ conjuncts (`ක්‍ය`) as one character ([unicode.md](unicode.md))                | Maintainer + native reviewers                                           | Before M7 (input component) |
