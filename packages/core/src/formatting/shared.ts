import { isLankaLocale, type LankaLocale } from "../locales.js";

/**
 * Default time zone for date formatting: Sri Lanka Standard Time (UTC+05:30, no DST).
 * Locale is not time zone — pass `timeZone` explicitly for users elsewhere.
 */
export const DEFAULT_TIME_ZONE = "Asia/Colombo";

/**
 * Throws a `RangeError` (the same error type `Intl` uses for bad locales) unless `locale` is a
 * supported {@link LankaLocale}. Guards untyped JavaScript callers.
 *
 * @internal
 */
export function assertLocale(locale: unknown, fn: string): asserts locale is LankaLocale {
  if (!isLankaLocale(locale)) {
    throw new RangeError(
      `${fn}: unsupported locale ${JSON.stringify(locale)}. Expected "en-LK", "si-LK" or "ta-LK".`,
    );
  }
}
