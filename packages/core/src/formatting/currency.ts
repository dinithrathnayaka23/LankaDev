import type { LankaLocale } from "../locales.js";
import { getNumberFormatter } from "./number.js";
import { assertLocale } from "./shared.js";

/** How the currency is shown. Maps to `Intl.NumberFormatOptions.currencyDisplay`. */
export type LKRDisplay = "symbol" | "code" | "name" | "narrowSymbol";

/** Options for {@link formatLKR}. */
export interface FormatLKROptions {
  /** Locale to format for. Required — there is no global default. */
  readonly locale: LankaLocale;
  /**
   * Currency display (default `"symbol"`). Output depends on the locale's CLDR data, e.g. for
   * `"symbol"`: `en-LK` → `"LKR"`, `si-LK` → `"රු."`, `ta-LK` → `"Rs."`. See `docs/formatting.md`.
   */
  readonly display?: LKRDisplay;
  /** Minimum fraction digits (default `2`, or `maximumFractionDigits` if that is smaller). */
  readonly minimumFractionDigits?: number;
  /** Maximum fraction digits (default `2`, or `minimumFractionDigits` if that is larger). */
  readonly maximumFractionDigits?: number;
}

const DEFAULT_FRACTION_DIGITS = 2;

/**
 * Formats an amount in Sri Lankan rupees (`LKR`) for a Sri Lankan locale.
 *
 * - Uses `Intl.NumberFormat` with `style: "currency"`, `currency: "LKR"`.
 * - Two fraction digits by default. Setting only one bound adjusts the other so the pair is
 *   always valid (e.g. `maximumFractionDigits: 0` → whole rupees).
 * - Negative zero and values that round to zero never show a minus sign (`signDisplay: "negative"`).
 * - `bigint` amounts are formatted exactly (no floating-point loss).
 *
 * **Formatting only.** Do money arithmetic with integer cents or a decimal library, then format
 * the result. Output contains non-breaking spaces (U+00A0) between symbol and number.
 *
 * @throws {RangeError} if `amount` is `NaN` or ±`Infinity`, the locale is unsupported, or the
 * fraction digits are out of `Intl`'s range (0–100).
 *
 * @example
 * ```ts
 * formatLKR(12500.5, { locale: "si-LK" });                    // "රු. 12,500.50"
 * formatLKR(12500.5, { locale: "en-LK", display: "name" });   // "12,500.50 Sri Lankan rupees"
 * formatLKR(12500.5, { locale: "ta-LK", maximumFractionDigits: 0 }); // "Rs. 12,501"
 * ```
 */
export function formatLKR(amount: number | bigint, options: FormatLKROptions): string {
  const { locale, display = "symbol" } = options;
  assertLocale(locale, "formatLKR");
  if (typeof amount === "number" && !Number.isFinite(amount)) {
    throw new RangeError(`formatLKR: amount must be a finite number, got ${String(amount)}.`);
  }

  const minimumFractionDigits =
    options.minimumFractionDigits ??
    Math.min(DEFAULT_FRACTION_DIGITS, options.maximumFractionDigits ?? DEFAULT_FRACTION_DIGITS);
  const maximumFractionDigits =
    options.maximumFractionDigits ?? Math.max(DEFAULT_FRACTION_DIGITS, minimumFractionDigits);

  return getNumberFormatter(locale, {
    style: "currency",
    currency: "LKR",
    currencyDisplay: display,
    minimumFractionDigits,
    maximumFractionDigits,
    signDisplay: "negative",
  }).format(amount);
}
