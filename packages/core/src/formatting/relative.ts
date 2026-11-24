import type { LankaLocale } from "../locales.js";
import { formatterCache, stableKey } from "./cache.js";
import { assertLocale } from "./shared.js";

/** Options for {@link formatRelativeTime}. */
export interface FormatRelativeTimeOptions {
  /** Locale to format for. Required — there is no global default. */
  readonly locale: LankaLocale;
  /** `"always"` (default): "1 day ago". `"auto"`: "yesterday" where the locale has a word for it. */
  readonly numeric?: Intl.RelativeTimeFormatNumeric;
  /** `"long"` (default), `"short"` or `"narrow"`. */
  readonly style?: Intl.RelativeTimeFormatStyle;
}

/**
 * Formats a relative time ("3 days ago", "in 2 hours") with `Intl.RelativeTimeFormat`.
 *
 * Negative values are in the past, positive values in the future. The caller chooses the unit;
 * this function does not compute differences between dates.
 *
 * @throws {RangeError} if `value` is not finite, `unit` is invalid, or the locale is unsupported.
 *
 * @example
 * ```ts
 * formatRelativeTime(-1, "day", { locale: "en-LK" });                  // "1 day ago"
 * formatRelativeTime(-1, "day", { locale: "si-LK", numeric: "auto" }); // "ඊයේ"
 * formatRelativeTime(2, "hour", { locale: "ta-LK" });                  // "2 மணிநேரத்தில்"
 * ```
 */
export function formatRelativeTime(
  value: number,
  unit: Intl.RelativeTimeFormatUnit,
  options: FormatRelativeTimeOptions,
): string {
  const { locale, ...intlOptions } = options;
  assertLocale(locale, "formatRelativeTime");
  if (!Number.isFinite(value)) {
    throw new RangeError(
      `formatRelativeTime: value must be a finite number, got ${String(value)}.`,
    );
  }
  return formatterCache
    .get(
      `relative|${locale}|${stableKey(intlOptions)}`,
      () => new Intl.RelativeTimeFormat(locale, intlOptions),
    )
    .format(value, unit);
}
