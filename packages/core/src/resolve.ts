import { isConfiguredLocale, type LankaConfig } from "./config.js";
import { parseLocale, type LankaLocale } from "./locales.js";

/** Leading language subtag of a tag such as `"en-US"` or `"ta_IN"`. */
const PRIMARY_LANGUAGE = /^\s*([a-z]{2,3})(?:[-_]|\s*$)/i;

/**
 * Picks the best locale for the app from a list of candidates, in priority order.
 *
 * For each candidate (first to last), following RFC 4647 "lookup":
 * 1. Normalise it with {@link parseLocale} (`"si"`, `"si_lk"` → `"si-LK"`) and use it if enabled.
 * 2. Otherwise retry with only its primary language subtag (`"en-US"` → `"en"` → `"en-LK"`,
 *    `"ta-IN"` → `"ta-LK"`) and use it if enabled.
 *
 * `null`, `undefined`, empty strings, `"*"` and unsupported languages are skipped.
 * If nothing matches, returns `config.fallbackLocale`. Never throws.
 *
 * Typical candidate order: URL segment, cookie, user profile, then {@link parseAcceptLanguage}.
 *
 * @example
 * ```ts
 * resolveLocale(config, [params.locale, cookies.get("LANKA_LOCALE")?.value,
 *   ...parseAcceptLanguage(headers.get("accept-language"))]);
 *
 * resolveLocale(config, ["fr-FR", "ta-IN"]); // "ta-LK"
 * resolveLocale(config, [null, "de"]);      // config.fallbackLocale
 * ```
 */
export function resolveLocale<L extends LankaLocale>(
  config: LankaConfig<L>,
  candidates: readonly (string | null | undefined)[],
): L {
  for (const candidate of candidates) {
    if (typeof candidate !== "string") continue;

    const exact = parseLocale(candidate);
    if (isConfiguredLocale(config, exact)) return exact;

    const primaryLanguage = PRIMARY_LANGUAGE.exec(candidate)?.[1];
    if (primaryLanguage === undefined) continue;
    const byLanguage = parseLocale(primaryLanguage);
    if (isConfiguredLocale(config, byLanguage)) return byLanguage;
  }
  return config.fallbackLocale;
}

/** RFC 9110 language range (`*` or BCP 47-like tag) and quality value. */
const LANGUAGE_RANGE = /^(?:\*|[a-z]{1,8}(?:-[a-z0-9]{1,8})*)$/i;
const QUALITY = /^q=(0(?:\.\d{0,3})?|1(?:\.0{0,3})?)$/i;

/** Upper bound on entries read from one header, to keep work bounded on hostile input. */
const MAX_ENTRIES = 64;

/**
 * Parses an HTTP `Accept-Language` header into language tags ordered by preference.
 *
 * - Sorted by quality (`q`) descending; equal `q` keeps header order. Missing `q` means `1`.
 * - Entries with `q=0` ("not acceptable") are dropped.
 * - Malformed entries (bad tag, bad `q`, extra parameters) are skipped; a header with no valid
 *   entries returns `[]`. `null`/`undefined` returns `[]`. Never throws.
 * - Tags are returned as written (not normalised); pass them to {@link resolveLocale}.
 * - At most 64 entries are read.
 *
 * @example
 * ```ts
 * parseAcceptLanguage("ta-LK,ta;q=0.9,en;q=0.8"); // ["ta-LK", "ta", "en"]
 * parseAcceptLanguage("en;q=0.5, si");            // ["si", "en"]
 * parseAcceptLanguage(";;;");                     // []
 * ```
 */
export function parseAcceptLanguage(header: string | null | undefined): string[] {
  if (typeof header !== "string" || header.trim() === "") return [];

  const entries: { tag: string; quality: number; index: number }[] = [];
  const parts = header.split(",", MAX_ENTRIES);

  parts.forEach((part, index) => {
    // `split` always returns at least one element, so the tuple cast is sound.
    const [rawTag, qualityParam, ...extraParams] = part.split(";").map((piece) => piece.trim()) as [
      string,
      ...string[],
    ];
    if (!LANGUAGE_RANGE.test(rawTag) || extraParams.length > 0) return;

    let quality = 1;
    if (qualityParam !== undefined) {
      const match = QUALITY.exec(qualityParam);
      if (!match) return;
      quality = Number(match[1]);
    }
    if (quality === 0) return;

    entries.push({ tag: rawTag, quality, index });
  });

  return entries
    .sort((a, b) => b.quality - a.quality || a.index - b.index)
    .map((entry) => entry.tag);
}
