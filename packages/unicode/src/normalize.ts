/**
 * Display-safe normalization for Sinhala and Tamil text, plus a search key helper.
 *
 * Rules (see docs/unicode.md):
 *
 * 1. NFC for all text. This composes split vowel signs, e.g. Sinhala `ෙ + ා` → `ො` (U+0DDC),
 *    `ෙ + ්` → `ේ`, `ෙ + ෟ` → `ෞ`; Tamil `ெ + ா` → `ொ` (U+0BCA), `ே + ா` → `ோ`, `ெ + ௗ` → `ௌ`,
 *    `ஒ + ௗ` → `ஔ`.
 * 2. Sinhala only: replace sequences that render the same as an atomic letter but are not the
 *    encoding Unicode recommends ({@link SINHALA_SEQUENCE_FIXES}). An independent vowel never takes
 *    a dependent vowel sign, so these replacements cannot change the meaning of valid text.
 * 3. ZWJ (U+200D) and ZWNJ (U+200C) are never removed or reordered. In Sinhala they select
 *    yansaya, rakaransaya, repaya and touching letters, so moving them changes the rendered word.
 */

/**
 * Sinhala sequences replaced by {@link normalizeSinhalaText}: `[from, to]`.
 * Only exact adjacent sequences are replaced; a ZWJ/ZWNJ between them prevents the replacement.
 */
export const SINHALA_SEQUENCE_FIXES: readonly (readonly [from: string, to: string])[] =
  Object.freeze([
    ["\u{0D85}\u{0DCF}", "\u{0D86}"], // අ + ා → ආ
    ["\u{0D85}\u{0DD0}", "\u{0D87}"], // අ + ැ → ඇ
    ["\u{0D85}\u{0DD1}", "\u{0D88}"], // අ + ෑ → ඈ
    ["\u{0D8B}\u{0DDF}", "\u{0D8C}"], // උ + ෟ → ඌ
    ["\u{0D8D}\u{0DD8}", "\u{0D8E}"], // ඍ + ෘ → ඎ
    ["\u{0D8F}\u{0DDF}", "\u{0D90}"], // ඏ + ෟ → ඐ
    ["\u{0D91}\u{0DCA}", "\u{0D92}"], // එ + ් → ඒ
    ["\u{0D91}\u{0DD9}", "\u{0D93}"], // එ + ෙ → ඓ
    ["\u{0D94}\u{0DCA}", "\u{0D95}"], // ඔ + ් → ඕ
    ["\u{0D94}\u{0DDF}", "\u{0D96}"], // ඔ + ෟ → ඖ
    ["\u{0DD9}\u{0DD9}", "\u{0DDB}"], // ෙ + ෙ → ෛ (kombu deka)
  ] as const);

const SINHALA_BLOCK = /[\u{0D80}-\u{0DFF}]/u;

/**
 * Normalizes Sinhala text for display and storage: NFC plus {@link SINHALA_SEQUENCE_FIXES}.
 * Never removes or reorders ZWJ/ZWNJ. Idempotent. Non-Sinhala text only gets NFC.
 *
 * @example
 * ```ts
 * normalizeSinhalaText("ක\u{0DD9}\u{0DCF}"); // "කො" (U+0D9A U+0DDC)
 * normalizeSinhalaText("එ\u{0DCA}"); // "ඒ"
 * normalizeSinhalaText("ශ්‍රී"); // unchanged, ZWJ kept
 * ```
 */
export function normalizeSinhalaText(text: string): string {
  let result = text.normalize("NFC");
  if (!SINHALA_BLOCK.test(result)) return result;
  for (const [from, to] of SINHALA_SEQUENCE_FIXES) result = result.replaceAll(from, to);
  return result;
}

/**
 * Normalizes Tamil text for display and storage: NFC, which composes split two-part vowel signs
 * (`ெ + ா` → `ொ`, `ே + ா` → `ோ`, `ெ + ௗ` → `ௌ`, `ஒ + ௗ` → `ஔ`). No other changes: ZWJ/ZWNJ and
 * grantha spellings such as `ஸ்ரீ` are kept as typed. Idempotent.
 *
 * @example
 * ```ts
 * normalizeTamilText("க\u{0BC6}\u{0BBE}"); // "கொ" (U+0B95 U+0BCA)
 * ```
 */
export function normalizeTamilText(text: string): string {
  return text.normalize("NFC");
}

/** Options for {@link toSearchKey}. */
export interface SearchKeyOptions {
  /** Also remove ZWJ (U+200D) and ZWNJ (U+200C), so `ශ්‍රී` matches `ශ්රී`. Default `false`. */
  stripJoiners?: boolean;
}

const IGNORABLE = /[\u{00AD}\u{200B}\u{2060}\u{FEFF}]/gu;
const JOINERS = /[\u{200C}\u{200D}]/gu;
const WHITESPACE = /\s+/gu;

/**
 * Builds an aggressive comparison key for search and matching. **Never store or display it.**
 *
 * Steps: remove soft hyphen, zero-width space, word joiner and BOM; optionally remove ZWJ/ZWNJ;
 * lowercase (affects cased scripts such as Latin only); NFC plus Sinhala sequence fixes; collapse
 * whitespace runs to one space; trim.
 *
 * @example
 * ```ts
 * toSearchKey("  Sri   LANKA ") === toSearchKey("sri lanka"); // true
 * toSearchKey("ශ්‍රී", { stripJoiners: true }) === toSearchKey("ශ්රී", { stripJoiners: true }); // true
 * ```
 */
export function toSearchKey(text: string, options: SearchKeyOptions = {}): string {
  let key = text.replace(IGNORABLE, "");
  if (options.stripJoiners === true) key = key.replace(JOINERS, "");
  // NFC runs after removals: removing a joiner can bring two composable signs together.
  return normalizeSinhalaText(key.toLowerCase()).replace(WHITESPACE, " ").trim();
}
