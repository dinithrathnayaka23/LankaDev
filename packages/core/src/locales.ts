import { LankaConfigError } from "./errors.js";

/** A locale supported by LankaDev: English, Sinhala or Tamil as used in Sri Lanka. */
export type LankaLocale = "en-LK" | "si-LK" | "ta-LK";

/** ISO 639-1 language code of a {@link LankaLocale}. */
export type LankaLanguage = "en" | "si" | "ta";

/** ISO 15924 script code of a {@link LankaLocale}. */
export type LankaScript = "Latn" | "Sinh" | "Taml";

/** Static, display-ready facts about a {@link LankaLocale}. */
export interface LocaleInfo {
  /** BCP 47 tag, e.g. `"si-LK"`. */
  readonly locale: LankaLocale;
  /** ISO 639-1 language code, e.g. `"si"`. Use for the HTML `lang` attribute when region is not needed. */
  readonly language: LankaLanguage;
  /** ISO 15924 script code, e.g. `"Sinh"`. */
  readonly script: LankaScript;
  /** Name of the language in that language: `"English"`, `"සිංහල"`, `"தமிழ்"`. */
  readonly nativeName: string;
  /** Name of the language in English: `"English"`, `"Sinhala"`, `"Tamil"`. */
  readonly englishName: string;
  /** Text direction. All three scripts are left-to-right. */
  readonly dir: "ltr";
}

/**
 * All locales LankaDev supports, in a stable order (`en-LK`, `si-LK`, `ta-LK`).
 *
 * @example
 * ```ts
 * LANKA_LOCALES.map((locale) => getLocaleInfo(locale).nativeName);
 * // ["English", "සිංහල", "தமிழ்"]
 * ```
 */
export const LANKA_LOCALES: readonly LankaLocale[] = Object.freeze(["en-LK", "si-LK", "ta-LK"]);

const LOCALE_INFO: Readonly<Record<LankaLocale, LocaleInfo>> = Object.freeze({
  "en-LK": Object.freeze({
    locale: "en-LK",
    language: "en",
    script: "Latn",
    nativeName: "English",
    englishName: "English",
    dir: "ltr",
  }),
  "si-LK": Object.freeze({
    locale: "si-LK",
    language: "si",
    script: "Sinh",
    nativeName: "සිංහල",
    englishName: "Sinhala",
    dir: "ltr",
  }),
  "ta-LK": Object.freeze({
    locale: "ta-LK",
    language: "ta",
    script: "Taml",
    nativeName: "தமிழ்",
    englishName: "Tamil",
    dir: "ltr",
  }),
});

const LOCALE_BY_LANGUAGE: Readonly<Record<LankaLanguage, LankaLocale>> = Object.freeze({
  en: "en-LK",
  si: "si-LK",
  ta: "ta-LK",
});

/**
 * Returns `true` when `value` is exactly one of the supported locale tags
 * (`"en-LK"`, `"si-LK"`, `"ta-LK"`). Case-sensitive; use {@link parseLocale} to normalise input.
 *
 * @example
 * ```ts
 * isLankaLocale("si-LK"); // true
 * isLankaLocale("si");    // false — use parseLocale("si")
 * ```
 */
export function isLankaLocale(value: unknown): value is LankaLocale {
  return typeof value === "string" && Object.hasOwn(LOCALE_INFO, value);
}

/**
 * Returns the {@link LocaleInfo} for a supported locale.
 *
 * @throws {LankaConfigError} `UNKNOWN_LOCALE` if `locale` is not supported (only reachable from
 * untyped JavaScript or unchecked casts).
 *
 * @example
 * ```ts
 * getLocaleInfo("ta-LK").nativeName; // "தமிழ்"
 * ```
 */
export function getLocaleInfo(locale: LankaLocale): LocaleInfo {
  if (!isLankaLocale(locale)) {
    throw new LankaConfigError("UNKNOWN_LOCALE", `Unknown locale: ${JSON.stringify(locale)}.`);
  }
  return LOCALE_INFO[locale];
}

/**
 * Accepted shapes (case-insensitive, `-` or `_` as separator):
 * `lang`, `lang-LK`, `lang-Script`, `lang-Script-LK`.
 */
const LOCALE_PATTERN = /^([a-z]{2})(?:[-_]([a-z]{4}))?(?:[-_]([a-z]{2}))?$/i;

/**
 * Normalises a locale-like string to a {@link LankaLocale}, or returns `null`.
 *
 * Accepted (case-insensitive, `-` or `_` separators, surrounding whitespace ignored):
 * - bare language: `"si"`, `"TA"`, `"en"`
 * - language + Sri Lanka region: `"si-LK"`, `"si_lk"`, `"SI-lk"`
 * - with the language's own script subtag: `"si-Sinh"`, `"ta-Taml-LK"`, `"en-Latn-LK"`
 *
 * Rejected (returns `null`): other languages (`"fr"`), other regions (`"ta-IN"`, `"en-US"`),
 * mismatched scripts (`"si-Taml"`), extensions (`"si-LK-u-nu-latn"`), empty strings, non-strings.
 * {@link resolveLocale} falls back to the bare language for regional tags such as `"en-US"`.
 *
 * @example
 * ```ts
 * parseLocale("si");     // "si-LK"
 * parseLocale("ta_lk");  // "ta-LK"
 * parseLocale("en-US");  // null
 * ```
 */
export function parseLocale(value: string): LankaLocale | null {
  if (typeof value !== "string") return null;
  const match = LOCALE_PATTERN.exec(value.trim());
  if (!match) return null;

  const [, rawLanguage, rawScript, rawRegion] = match;
  const language = rawLanguage?.toLowerCase();
  if (language !== "en" && language !== "si" && language !== "ta") return null;

  const locale = LOCALE_BY_LANGUAGE[language];
  if (
    rawScript !== undefined &&
    rawScript.toLowerCase() !== LOCALE_INFO[locale].script.toLowerCase()
  ) {
    return null;
  }
  if (rawRegion !== undefined && rawRegion.toUpperCase() !== "LK") return null;

  return locale;
}
