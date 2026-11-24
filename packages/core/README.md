# @lankadev/core

Locale configuration, fallback and LKR/number/date formatting for English (`en-LK`), Sinhala (`si-LK`) and Tamil (`ta-LK`).
Framework-agnostic, zero dependencies, no global state, no network calls.

> **Status:** pre-release.

## Install

```sh
npm install @lankadev/core
```

## Quick start

```ts
import { createLankaConfig, parseAcceptLanguage, resolveLocale } from "@lankadev/core";

export const lankaConfig = createLankaConfig({
  locales: ["en-LK", "si-LK", "ta-LK"],
  defaultLocale: "en-LK",
  // fallbackLocale defaults to defaultLocale
});

// Pick a locale from what you know, in priority order.
const locale = resolveLocale(lankaConfig, [
  urlSegment, // e.g. "si"
  cookieValue, // e.g. "ta-LK"
  ...parseAcceptLanguage(request.headers.get("accept-language")),
]);
```

## API

### Types

| Type                   | Values                                                                                                     |
| ---------------------- | ---------------------------------------------------------------------------------------------------------- |
| `LankaLocale`          | `"en-LK" \| "si-LK" \| "ta-LK"`                                                                            |
| `LankaLanguage`        | `"en" \| "si" \| "ta"`                                                                                     |
| `LankaScript`          | `"Latn" \| "Sinh" \| "Taml"`                                                                               |
| `LocaleInfo`           | `{ locale, language, script, nativeName, englishName, dir }`                                               |
| `LankaConfig<L>`       | `{ locales, defaultLocale, fallbackLocale }` (frozen)                                                      |
| `LankaConfigErrorCode` | `EMPTY_LOCALES`, `UNKNOWN_LOCALE`, `DUPLICATE_LOCALE`, `DEFAULT_NOT_IN_LOCALES`, `FALLBACK_NOT_IN_LOCALES` |

### `createLankaConfig(input)`

Validates and returns a frozen config. Throws `LankaConfigError` with a `code` on invalid input.
TypeScript rejects a `defaultLocale` or `fallbackLocale` that is not in `locales`:

```ts
createLankaConfig({ locales: ["si-LK"], defaultLocale: "en-LK" }); // type error + DEFAULT_NOT_IN_LOCALES
```

The returned config's locale type is narrowed to the locales you passed, e.g. `LankaConfig<"si-LK" | "ta-LK">`.

### `resolveLocale(config, candidates)`

Returns the first candidate the app supports, else `config.fallbackLocale`. Never throws.

- Candidates are normalised: `"si"`, `"si_lk"`, `"SI-LK"` → `"si-LK"`.
- Other regions fall back to their language (RFC 4647 lookup): `"en-US"` → `"en-LK"`, `"ta-IN"` → `"ta-LK"`.
- `null`, `undefined`, `""`, `"*"` and other languages are skipped.
- Locales LankaDev supports but your config does not enable are skipped.

### `parseAcceptLanguage(header)`

Parses an `Accept-Language` header into tags ordered by `q` (stable for ties). Drops `q=0`, skips malformed entries, reads at most 64 entries, returns `[]` for empty or invalid headers. Never throws.

```ts
parseAcceptLanguage("ta-LK,ta;q=0.9,en;q=0.8"); // ["ta-LK", "ta", "en"]
```

### `parseLocale(value)`

Normalises one locale-like string, or returns `null`. Accepts `lang`, `lang-LK`, `lang-Script`, `lang-Script-LK` (case-insensitive, `-` or `_`). Other regions return `null` here; use `resolveLocale` for regional fallback.

```ts
parseLocale("SI_lk"); // "si-LK"
parseLocale("ta-Taml-LK"); // "ta-LK"
parseLocale("en-US"); // null
```

### Other helpers

| Function                            | Description                                                    |
| ----------------------------------- | -------------------------------------------------------------- |
| `LANKA_LOCALES`                     | `["en-LK", "si-LK", "ta-LK"]` (frozen)                         |
| `isLankaLocale(value)`              | Exact, case-sensitive check; type guard                        |
| `isConfiguredLocale(config, value)` | `true` if enabled in `config`; narrows to the config's locales |
| `getLocaleInfo(locale)`             | e.g. `getLocaleInfo("si-LK").nativeName === "සිංහල"`            |

## Formatting (`@lankadev/core/formatting`)

Thin `Intl` wrappers with Sri Lankan defaults (`LKR`, `Asia/Colombo`). Every call takes an explicit `locale`.

```ts
import { formatDate, formatLKR, formatNumber, formatRelativeTime } from "@lankadev/core/formatting";

formatLKR(12500.5, { locale: "si-LK" }); // "රු. 12,500.50"
formatLKR(12500.5, { locale: "en-LK", display: "code" }); // "LKR 12,500.50"
formatLKR(-0.001, { locale: "ta-LK" }); // "Rs. 0.00" (no "-0")
formatNumber(0.256, { locale: "si-LK", style: "percent" }); // "26%"
formatDate(new Date("2026-01-01T20:00:00Z"), { locale: "ta-LK", dateStyle: "long" }); // "2 ஜனவரி, 2026" (Colombo time)
formatRelativeTime(-1, "day", { locale: "si-LK", numeric: "auto" }); // "ඊයේ"
```

| Function                                   | Notes                                                                   |
| ------------------------------------------ | ----------------------------------------------------------------------- |
| `formatLKR(amount, { locale, display? })`  | 2 decimals by default; `bigint` exact; `RangeError` on `NaN`/`Infinity` |
| `formatNumber(value, { locale, ...intl })` | All `Intl.NumberFormatOptions` pass through                             |
| `formatDate(date, { locale, ...intl })`    | `timeZone` defaults to `"Asia/Colombo"`                                 |
| `formatRelativeTime(value, unit, opts)`    | `numeric` and `style` options                                           |
| `getNumberFormatter(locale, options?)`     | Cached `Intl.NumberFormat` (same instance for same arguments)           |
| `DEFAULT_TIME_ZONE`                        | `"Asia/Colombo"`                                                        |

**Formatting only:** do money arithmetic with integer cents or a decimal library. Output follows the runtime's CLDR data and has known quirks (`en-LK` numeric dates are month-first; `ta-LK` uses lakh grouping). See [docs/formatting.md](../../docs/formatting.md) for recorded output per runtime.

## License

MIT
