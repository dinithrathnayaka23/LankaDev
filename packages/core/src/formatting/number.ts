import type { LankaLocale } from "../locales.js";
import { formatterCache, stableKey } from "./cache.js";
import { assertLocale } from "./shared.js";

/**
 * Returns a cached `Intl.NumberFormat` for `locale` and `options`.
 *
 * Identical arguments (including options with keys in a different order) return the same
 * instance. Use it when formatting many values in a loop, or when you need `formatToParts`.
 *
 * @throws {RangeError} if `locale` is unsupported or `options` are invalid for `Intl`.
 *
 * @example
 * ```ts
 * const percent = getNumberFormatter("si-LK", { style: "percent" });
 * percent.format(0.25); // "25%"
 * ```
 */
export function getNumberFormatter(
  locale: LankaLocale,
  options: Intl.NumberFormatOptions = {},
): Intl.NumberFormat {
  assertLocale(locale, "getNumberFormatter");
  return formatterCache.get(
    `number|${locale}|${stableKey(options)}`,
    () => new Intl.NumberFormat(locale, options),
  );
}

/** Options for {@link formatNumber}: an explicit locale plus any `Intl.NumberFormatOptions`. */
export interface FormatNumberOptions extends Intl.NumberFormatOptions {
  /** Locale to format for. Required — there is no global default. */
  readonly locale: LankaLocale;
}

/**
 * Formats a number with `Intl.NumberFormat` for a Sri Lankan locale.
 *
 * A thin wrapper: all `Intl.NumberFormatOptions` pass through unchanged, and non-finite values
 * format as `Intl` does (`"NaN"`, `"∞"`). Grouping follows CLDR for the locale — note that
 * `ta-LK` uses Indian-style grouping (`12,34,567`); see `docs/formatting.md`.
 *
 * @throws {RangeError} if `locale` is unsupported or options are invalid for `Intl`.
 *
 * @example
 * ```ts
 * formatNumber(1234567.891, { locale: "si-LK" });                     // "1,234,567.891"
 * formatNumber(0.075, { locale: "en-LK", style: "percent" });         // "8%"
 * formatNumber(12n, { locale: "ta-LK", minimumIntegerDigits: 3 });    // "012"
 * ```
 */
export function formatNumber(value: number | bigint, options: FormatNumberOptions): string {
  const { locale, ...intlOptions } = options;
  assertLocale(locale, "formatNumber");
  return getNumberFormatter(locale, intlOptions).format(value);
}
