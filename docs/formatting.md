# Formatting (`@lankadev/core/formatting`)

Thin wrappers over `Intl` with Sri Lankan defaults: currency `LKR`, time zone `Asia/Colombo`, an explicit `locale` on every call, and cached formatter instances.

```ts
import {
  formatLKR,
  formatNumber,
  formatDate,
  formatRelativeTime,
  getNumberFormatter,
} from "@lankadev/core/formatting";

formatLKR(12500.5, { locale: "si-LK" }); // "රු. 12,500.50"
formatNumber(0.256, { locale: "ta-LK", style: "percent" }); // "26%"
formatDate(new Date(), { locale: "si-LK", dateStyle: "long" }); // "2026 දුරුතු 2"
formatRelativeTime(-1, "day", { locale: "ta-LK", numeric: "auto" }); // "நேற்று"
```

> **Formatting only — not money arithmetic.** Store and calculate amounts as integer cents (or use a decimal library), then format the result. `formatLKR(0.1 + 0.2, …)` formats the floating-point value you pass; it does not fix it. `bigint` amounts are formatted exactly.

## Defaults and behaviour

| Function             | Defaults                                                                                          | Errors (`RangeError`)                                          |
| -------------------- | ------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `formatLKR`          | `currency: "LKR"`, `display: "symbol"`, 2 fraction digits, `signDisplay: "negative"`              | `NaN`/`±Infinity`, unsupported locale, invalid fraction digits |
| `formatNumber`       | none — all `Intl.NumberFormatOptions` pass through; `NaN` → `"NaN"`, `Infinity` → `"∞"`           | unsupported locale, invalid options                            |
| `formatDate`         | `timeZone: "Asia/Colombo"`; other `Intl.DateTimeFormatOptions` pass through                       | invalid date, unknown time zone, unsupported locale            |
| `formatRelativeTime` | `numeric: "always"`, `style: "long"`                                                              | non-finite value, invalid unit, unsupported locale             |
| `getNumberFormatter` | returns a cached `Intl.NumberFormat` (same instance for the same locale + options, any key order) | unsupported locale, invalid options                            |

Notes:

- **Fraction digits:** setting only one bound adjusts the other, so `maximumFractionDigits: 0` gives whole rupees and `minimumFractionDigits: 3` gives three decimals. Rounding is half away from zero.
- **Negative zero:** `formatLKR(-0)` and amounts that round to zero (`-0.001`) never show a minus sign.
- **Time zone:** defaulting to `Asia/Colombo` (instead of the runtime's zone) keeps server and browser output identical and avoids React hydration mismatches. Locale is not time zone: pass `timeZone` when your users are elsewhere.
- **Whitespace:** currency output uses a non-breaking space (U+00A0) between symbol and number. Compare against `"\u00a0"`, not `" "`, in tests.
- **Cache:** up to 100 formatter instances are kept; the oldest is evicted first.

## Recorded output

Output comes from the runtime's ICU/CLDR data and can change between Node.js and browser versions. Each Node major has a pinned snapshot in [`packages/core/src/formatting/__snapshots__/`](../packages/core/src/formatting/__snapshots__/); CI fails if output changes on a major that has one.

Sample date: `2026-01-01T20:00:00Z` (= 2 Jan 2026, 01:30 in Colombo). `·` marks a non-breaking space.

### Node.js 24 (v24.22.1, ICU 78.3, CLDR 48.0, Unicode 17.0)

| Call                                  | `en-LK`                       | `si-LK`                     | `ta-LK`                   |
| ------------------------------------- | ----------------------------- | --------------------------- | ------------------------- |
| `formatLKR(12500.5)` (symbol)         | `LKR·12,500.50`               | `රු.·12,500.50`              | `Rs.·12,500.50`           |
| `formatLKR(12500.5, code)`            | `LKR·12,500.50`               | `LKR·12,500.50`             | `LKR·12,500.50`           |
| `formatLKR(12500.5, name)`            | `12,500.50 Sri Lankan rupees` | `ශ්‍රී ලංකා රුපියල12,500.50` ⚠️ | `12,500.50 இலங்கை ரூபாய்கள்` |
| `formatLKR(12500.5, narrowSymbol)`    | `Rs·12,500.50`                | `රු.·12,500.50`              | `Rs·12,500.50`            |
| `formatLKR(-1234.5)`                  | `-LKR·1,234.50`               | `-රු.·1,234.50`              | `-Rs.·1,234.50`           |
| `formatLKR(12345678.9)`               | `LKR·12,345,678.90`           | `රු.·12,345,678.90`          | `Rs.·1,23,45,678.90` ⚠️   |
| `formatNumber(1234567.891)`           | `1,234,567.891`               | `1,234,567.891`             | `12,34,567.891` ⚠️        |
| `formatDate()` (no options)           | `1/2/2026` ⚠️                 | `2026-1-2`                  | `2/1/2026`                |
| `formatDate({ dateStyle: "short" })`  | `1/2/26` ⚠️                   | `2026-01-02`                | `2/1/26`                  |
| `formatDate({ dateStyle: "medium" })` | `Jan 2, 2026`                 | `2026 දුරුතු 2`                | `2 ஜன., 2026`             |
| `formatDate({ dateStyle: "long" })`   | `January 2, 2026`             | `2026 දුරුතු 2`                | `2 ஜனவரி, 2026`           |
| `formatDate({ dateStyle: "full" })`   | `Friday, January 2, 2026`     | `2026 දුරුතු 2, සිකුරාදා`        | `வெள்ளி, 2 ஜனவரி, 2026`    |
| `formatDate({ timeStyle: "short" })`  | `1:30 AM`                     | `01.30`                     | `01:30`                   |
| `formatRelativeTime(-1, "day")`       | `1 day ago`                   | `දින 1කට පෙර`                | `1 நாளுக்கு முன்`           |
| `formatRelativeTime(-1, "day", auto)` | `yesterday`                   | `ඊයේ`                       | `நேற்று`                   |
| `formatRelativeTime(3, "hour")`       | `in 3 hours`                  | `පැය 3කින්`                   | `3 மணிநேரத்தில்`            |

### Node.js 22 and 26

**Not yet recorded.** No snapshot exists for these majors yet, so CI skips the snapshot test on them (the runtime-independent tests still run). To record one, on that Node version run:

```sh
pnpm --filter @lankadev/core test   # writes __snapshots__/node-<major>/formatting-output.json
```

Then add a table here and commit both.

### Browsers (manual check)

| Browser | Version | Checked by | Result  |
| ------- | ------- | ---------- | ------- |
| Chrome  | —       | —          | Pending |
| Firefox | —       | —          | Pending |
| Safari  | —       | —          | Pending |

Paste the snippet below into each browser's console and compare it with the Node table above:

```js
const d = new Date("2026-01-01T20:00:00Z");
for (const l of ["en-LK", "si-LK", "ta-LK"]) {
  console.log(
    l,
    new Intl.NumberFormat(l, { style: "currency", currency: "LKR" }).format(12500.5),
    new Intl.NumberFormat(l).format(1234567.891),
    new Intl.DateTimeFormat(l, { dateStyle: "long", timeZone: "Asia/Colombo" }).format(d),
  );
}
```

## Known CLDR quirks (⚠️ above)

These come from the Unicode CLDR data shipped with the runtime, not from LankaDev. LankaDev passes them through unchanged for now; each is an open decision in [SCOPE.md](SCOPE.md).

1. **`en-LK` has no CLDR data.** ICU falls back to generic `en` (US) patterns, so numeric dates are month-first (`1/2/2026` = 2 January). Sri Lankan readers usually expect day-first. Until this is decided, avoid numeric `en-LK` dates: use `dateStyle: "medium"`/`"long"` (month spelled out) or ISO `YYYY-MM-DD`. A locale fallback list such as `["en-LK", "en-GB"]` does **not** help, because ICU resolves `en-LK` to `en` before it tries the next entry.
2. **`ta-LK` uses Indian lakh/crore grouping** (`12,34,567`) because CLDR `ta-LK` inherits it from `ta`. `en-LK` and `si-LK` use western grouping (`1,234,567`). Needs review by Sri Lankan Tamil speakers.
3. **`si-LK` currency name has no space** before the number (`ශ්‍රී ලංකා රුපියල12,500.50`). Prefer `display: "symbol"` or `"code"` for Sinhala.
4. **Digits are Latin** (`0–9`) in all three locales. Sinhala archaic numerals and Tamil digits are not used by default `Intl` data.
