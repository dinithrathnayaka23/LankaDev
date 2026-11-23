/**
 * Machine-readable reason for a {@link LankaConfigError}.
 *
 * - `EMPTY_LOCALES` — `locales` is missing, not an array, or empty.
 * - `UNKNOWN_LOCALE` — a value is not one of `"en-LK" | "si-LK" | "ta-LK"`.
 * - `DUPLICATE_LOCALE` — the same locale appears more than once in `locales`.
 * - `DEFAULT_NOT_IN_LOCALES` — `defaultLocale` is not listed in `locales`.
 * - `FALLBACK_NOT_IN_LOCALES` — `fallbackLocale` is not listed in `locales`.
 */
export type LankaConfigErrorCode =
  | "EMPTY_LOCALES"
  | "UNKNOWN_LOCALE"
  | "DUPLICATE_LOCALE"
  | "DEFAULT_NOT_IN_LOCALES"
  | "FALLBACK_NOT_IN_LOCALES";

/**
 * Thrown when a LankaDev configuration or locale value is invalid.
 *
 * Check {@link LankaConfigError.code} instead of parsing the message; messages may change,
 * codes will not (within a major version).
 *
 * @example
 * ```ts
 * try {
 *   createLankaConfig({ locales: [], defaultLocale: "en-LK" });
 * } catch (error) {
 *   if (error instanceof LankaConfigError && error.code === "EMPTY_LOCALES") {
 *     // handle
 *   }
 * }
 * ```
 */
export class LankaConfigError extends Error {
  /** Machine-readable reason. */
  readonly code: LankaConfigErrorCode;

  constructor(code: LankaConfigErrorCode, message: string) {
    super(message);
    this.name = "LankaConfigError";
    this.code = code;
  }
}
