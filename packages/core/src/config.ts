import { LankaConfigError } from "./errors.js";
import { isLankaLocale, type LankaLocale } from "./locales.js";

/**
 * Input to {@link createLankaConfig}.
 *
 * `defaultLocale` and `fallbackLocale` must be members of `locales`; TypeScript enforces this
 * (they do not widen the inferred locale union).
 */
export interface LankaConfigInput<L extends LankaLocale = LankaLocale> {
  /** Locales the application supports. Non-empty, no duplicates. Order is preserved. */
  readonly locales: readonly L[];
  /** Locale used when nothing else is known (first visit, no preference). */
  readonly defaultLocale: NoInfer<L>;
  /** Locale used when a requested locale is unavailable. Defaults to `defaultLocale`. */
  readonly fallbackLocale?: NoInfer<L>;
}

/** Validated, frozen LankaDev configuration. Create with {@link createLankaConfig}. */
export interface LankaConfig<L extends LankaLocale = LankaLocale> {
  /** Supported locales in the order given. Frozen copy of the input array. */
  readonly locales: readonly L[];
  /** Locale used when nothing else is known. */
  readonly defaultLocale: L;
  /** Locale used when a requested locale is unavailable. */
  readonly fallbackLocale: L;
}

/**
 * Validates input and returns a frozen {@link LankaConfig}. The input is not mutated or retained.
 *
 * @throws {LankaConfigError}
 * - `EMPTY_LOCALES` — `locales` is missing, not an array, or empty
 * - `UNKNOWN_LOCALE` — an entry in `locales` is not a supported locale
 * - `DUPLICATE_LOCALE` — an entry appears twice
 * - `DEFAULT_NOT_IN_LOCALES` — `defaultLocale` is not in `locales`
 * - `FALLBACK_NOT_IN_LOCALES` — `fallbackLocale` is given but not in `locales`
 *
 * @example
 * ```ts
 * export const lankaConfig = createLankaConfig({
 *   locales: ["en-LK", "si-LK", "ta-LK"],
 *   defaultLocale: "en-LK",
 * });
 * lankaConfig.fallbackLocale; // "en-LK"
 * ```
 */
export function createLankaConfig<L extends LankaLocale>(
  input: LankaConfigInput<L>,
): LankaConfig<L> {
  const locales: unknown = (input as Partial<LankaConfigInput<L>> | null | undefined)?.locales;
  if (!Array.isArray(locales) || locales.length === 0) {
    throw new LankaConfigError("EMPTY_LOCALES", "`locales` must be a non-empty array.");
  }

  const seen = new Set<LankaLocale>();
  for (const locale of locales as readonly unknown[]) {
    if (!isLankaLocale(locale)) {
      throw new LankaConfigError(
        "UNKNOWN_LOCALE",
        `Unknown locale ${JSON.stringify(locale)} in \`locales\`. Supported: "en-LK", "si-LK", "ta-LK".`,
      );
    }
    if (seen.has(locale)) {
      throw new LankaConfigError(
        "DUPLICATE_LOCALE",
        `Locale "${locale}" appears more than once in \`locales\`.`,
      );
    }
    seen.add(locale);
  }

  const { defaultLocale } = input;
  if (!seen.has(defaultLocale)) {
    throw new LankaConfigError(
      "DEFAULT_NOT_IN_LOCALES",
      `\`defaultLocale\` ${JSON.stringify(defaultLocale)} is not listed in \`locales\`.`,
    );
  }

  const fallbackLocale = input.fallbackLocale ?? defaultLocale;
  if (!seen.has(fallbackLocale)) {
    throw new LankaConfigError(
      "FALLBACK_NOT_IN_LOCALES",
      `\`fallbackLocale\` ${JSON.stringify(fallbackLocale)} is not listed in \`locales\`.`,
    );
  }

  return Object.freeze({
    locales: Object.freeze([...(locales as readonly L[])]),
    defaultLocale,
    fallbackLocale,
  });
}

/**
 * Returns `true` when `value` is one of the locales enabled in `config`.
 *
 * @example
 * ```ts
 * const config = createLankaConfig({ locales: ["en-LK", "si-LK"], defaultLocale: "en-LK" });
 * isConfiguredLocale(config, "si-LK"); // true
 * isConfiguredLocale(config, "ta-LK"); // false — supported by LankaDev, not by this app
 * ```
 */
export function isConfiguredLocale<L extends LankaLocale>(
  config: LankaConfig<L>,
  value: unknown,
): value is L {
  return typeof value === "string" && (config.locales as readonly string[]).includes(value);
}
