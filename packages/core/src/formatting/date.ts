import type { LankaLocale } from "../locales.js";
import { formatterCache, stableKey } from "./cache.js";
import { assertLocale, DEFAULT_TIME_ZONE } from "./shared.js";

/** Options for {@link formatDate}: an explicit locale plus any `Intl.DateTimeFormatOptions`. */
export interface FormatDateOptions extends Intl.DateTimeFormatOptions {
  /** Locale to format for. Required — there is no global default. */
  readonly locale: LankaLocale;
  /**
   * IANA time zone. Defaults to `"Asia/Colombo"` (UTC+05:30) so server and browser render the
   * same calendar day. Pass the user's zone (or `"UTC"`) when that is what you mean.
   */
  readonly timeZone?: string;
}

/**
 * Formats a date/time with `Intl.DateTimeFormat` for a Sri Lankan locale, in Sri Lanka time
 * by default.
 *
 * Defaulting the time zone (instead of using the runtime's zone) keeps server-rendered and
 * client-rendered output identical, which avoids React hydration mismatches.
 *
 * Note: CLDR has no `en-LK` data, so `en-LK` uses generic English patterns (month-first numeric
 * dates such as `1/2/2026`). Prefer `dateStyle: "long"`/`"medium"` or explicit fields for
 * unambiguous English dates. See `docs/formatting.md`.
 *
 * @throws {RangeError} if the date is invalid, the locale is unsupported, or the time zone is
 * not a valid IANA zone.
 *
 * @example
 * ```ts
 * const d = new Date("2026-01-01T20:00:00Z"); // 2 Jan 01:30 in Colombo
 * formatDate(d, { locale: "si-LK", dateStyle: "long" }); // "2026 දුරුතු 2"
 * formatDate(d, { locale: "ta-LK", dateStyle: "long" }); // "2 ஜனவரி, 2026"
 * formatDate(d, { locale: "en-LK", dateStyle: "long", timeZone: "UTC" }); // "January 1, 2026"
 * ```
 */
export function formatDate(date: Date | number, options: FormatDateOptions): string {
  const { locale, timeZone = DEFAULT_TIME_ZONE, ...intlOptions } = options;
  assertLocale(locale, "formatDate");

  const time = date instanceof Date ? date.getTime() : date;
  if (typeof time !== "number" || !Number.isFinite(time)) {
    throw new RangeError(`formatDate: invalid date ${String(date)}.`);
  }

  const resolved: Intl.DateTimeFormatOptions = { ...intlOptions, timeZone };
  return formatterCache
    .get(`date|${locale}|${stableKey(resolved)}`, () => new Intl.DateTimeFormat(locale, resolved))
    .format(time);
}
