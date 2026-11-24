/**
 * Grapheme- and word-aware helpers.
 *
 * Uses `Intl.Segmenter` when available. Otherwise falls back to a built-in implementation of the
 * Unicode extended grapheme cluster rules (UAX #29) that covers Sinhala, Tamil, Latin and emoji.
 *
 * Fallback limitations (documented in docs/unicode.md): no Hangul syllable rules (GB6–GB8), no
 * Prepend characters (GB9b), no Indic conjunct rule (GB9c, used by Devanagari, Bengali, Gujarati,
 * Oriya, Telugu and Malayalam; not by Sinhala or Tamil). Word fallback is approximate.
 */

type GraphemeKind =
  | "cr"
  | "lf"
  | "control"
  | "extend"
  | "zwj"
  | "spacingMark"
  | "regionalIndicator"
  | "extPict"
  | "other";

const ZWJ = "\u{200D}";
const EXTEND = /[\p{Grapheme_Extend}\p{Emoji_Modifier}]/u;
const CONTROL = /[\p{Cc}\p{Cf}\p{Zl}\p{Zp}]/u;
const SPACING_MARK = /\p{Mc}/u;
const REGIONAL_INDICATOR = /\p{Regional_Indicator}/u;
const EXTENDED_PICTOGRAPHIC = /\p{Extended_Pictographic}/u;

function classify(char: string): GraphemeKind {
  if (char === "\r") return "cr";
  if (char === "\n") return "lf";
  if (char === ZWJ) return "zwj";
  // Before CONTROL: ZWNJ and emoji tag characters are Cf but Grapheme_Extend.
  if (EXTEND.test(char)) return "extend";
  if (CONTROL.test(char)) return "control";
  if (SPACING_MARK.test(char)) return "spacingMark";
  if (REGIONAL_INDICATOR.test(char)) return "regionalIndicator";
  if (EXTENDED_PICTOGRAPHIC.test(char)) return "extPict";
  return "other";
}

/** Emoji ZWJ sequence state for GB11: 1 = ExtPict Extend*, 2 = ExtPict Extend* ZWJ. */
type EmojiState = 0 | 1 | 2;

function isBoundary(
  previous: GraphemeKind,
  current: GraphemeKind,
  regionalOdd: boolean,
  emoji: EmojiState,
): boolean {
  if (previous === "cr" && current === "lf") return false; // GB3
  if (previous === "cr" || previous === "lf" || previous === "control") return true; // GB4
  if (current === "cr" || current === "lf" || current === "control") return true; // GB5
  if (current === "extend" || current === "zwj" || current === "spacingMark") return false; // GB9, GB9a
  if (current === "extPict" && emoji === 2) return false; // GB11
  if (current === "regionalIndicator" && regionalOdd) return false; // GB12, GB13
  return true; // GB999
}

/**
 * Splits text into extended grapheme clusters without `Intl.Segmenter`.
 *
 * @internal Exported for tests; use {@link graphemes}.
 */
export function fallbackGraphemes(text: string): string[] {
  const clusters: string[] = [];
  let cluster = "";
  let previous: GraphemeKind = "other";
  let regionalOdd = false;
  let emoji: EmojiState = 0;
  for (const char of text) {
    const kind = classify(char);
    const join: boolean = cluster !== "" && !isBoundary(previous, kind, regionalOdd, emoji);
    if (join) {
      cluster += char;
    } else {
      if (cluster !== "") clusters.push(cluster);
      cluster = char;
    }
    regionalOdd = kind === "regionalIndicator" && !join;
    emoji =
      kind === "extPict"
        ? 1
        : emoji === 1 && kind === "extend"
          ? 1
          : emoji === 1 && kind === "zwj"
            ? 2
            : 0;
    previous = kind;
  }
  if (cluster !== "") clusters.push(cluster);
  return clusters;
}

const WORD_CHAR = String.raw`[\p{L}\p{M}\p{N}\p{Pc}\u{200C}\u{200D}]`;
const WORD = new RegExp(`${WORD_CHAR}+(?:(?:['’.]|(?<=\\p{N}),(?=\\p{N}))${WORD_CHAR}+)*`, "gu");

/**
 * Splits text into words without `Intl.Segmenter`: runs of letters, marks, digits, connector
 * punctuation and ZWJ/ZWNJ, joined across `'`, `’` and `.`, and across `,` between digits.
 *
 * @internal Exported for tests; use {@link words}.
 */
export function fallbackWords(text: string): string[] {
  return Array.from(text.matchAll(WORD), (match) => match[0]);
}

/**
 * `true` if the runtime provides `Intl.Segmenter`. When `false`, the grapheme and word helpers use
 * the built-in fallback.
 *
 * @example
 * ```ts
 * if (!isSegmenterSupported()) console.warn("Using the built-in grapheme fallback");
 * ```
 */
export function isSegmenterSupported(): boolean {
  return (
    typeof Intl === "object" && typeof (Intl as { Segmenter?: unknown }).Segmenter === "function"
  );
}

const MAX_SEGMENTERS = 32;
const segmenters = new Map<string, Intl.Segmenter>();

function getSegmenter(
  granularity: "grapheme" | "word",
  locale: string | undefined,
): Intl.Segmenter {
  const key = `${granularity}|${locale ?? ""}`;
  let segmenter = segmenters.get(key);
  if (segmenter === undefined) {
    segmenter = new Intl.Segmenter(locale, { granularity });
    // Bounded: locale strings may come from user input.
    if (segmenters.size >= MAX_SEGMENTERS) segmenters.clear();
    segmenters.set(key, segmenter);
  }
  return segmenter;
}

/**
 * Splits text into user-perceived characters (extended grapheme clusters).
 *
 * Note: Unicode has no conjunct rule for Sinhala, so `ක්‍ය` (yansaya) is two clusters: `ක්‍` and `ය`.
 * {@link truncate} avoids cutting there.
 *
 * @param locale Passed to `Intl.Segmenter`; ignored by the fallback.
 * @throws {RangeError} If `locale` is not a valid BCP 47 tag (when `Intl.Segmenter` is used).
 *
 * @example
 * ```ts
 * graphemes("ශ්‍රී ලංකා"); // ["ශ්‍", "රී", " ", "ලං", "කා"]
 * graphemes("👍🏽"); // ["👍🏽"]
 * ```
 */
export function graphemes(text: string, locale?: string): string[] {
  if (!isSegmenterSupported()) return fallbackGraphemes(text);
  return Array.from(getSegmenter("grapheme", locale).segment(text), (part) => part.segment);
}

/**
 * Number of user-perceived characters (extended grapheme clusters) in `text`.
 *
 * @example
 * ```ts
 * graphemeLength("කොළඹ"); // 3
 * "කොළඹ".length; // 4
 * ```
 */
export function graphemeLength(text: string, locale?: string): number {
  return graphemes(text, locale).length;
}

/** Options for {@link truncate}. */
export interface TruncateOptions {
  /** Appended when text is shortened. Counts toward `maxGraphemes`. Default `"…"`. */
  ellipsis?: string;
  /** Passed to `Intl.Segmenter`. */
  locale?: string;
}

/**
 * Shortens `text` to at most `maxGraphemes` user-perceived characters, including the ellipsis.
 * Returns `text` unchanged when it already fits.
 *
 * Never splits a grapheme cluster. It also never ends on a cluster that ends with ZWJ, so Sinhala
 * conjuncts such as `ක්‍ය` (yansaya), `ප්‍ර` (rakaransaya) and `ර්‍ම` (repaya) are kept whole or
 * dropped whole. Trailing whitespace before the ellipsis is removed.
 *
 * @throws {RangeError} If `maxGraphemes` is not a non-negative integer.
 *
 * @example
 * ```ts
 * truncate("ශ්‍රී ලංකාව", 4); // "ශ්‍රී…" (clusters: ශ්‍ රී ␠ ලං කා ව; trailing space trimmed)
 * truncate("වාක්‍යයක්", 3); // "වා…", not "වාක්‍…" (yansaya dropped whole)
 * truncate("Hello world", 8, { ellipsis: "..." }); // "Hello..."
 * ```
 */
export function truncate(
  text: string,
  maxGraphemes: number,
  options: TruncateOptions = {},
): string {
  if (!Number.isInteger(maxGraphemes) || maxGraphemes < 0) {
    throw new RangeError(
      `maxGraphemes must be a non-negative integer, got ${String(maxGraphemes)}`,
    );
  }
  const { ellipsis = "…", locale } = options;
  const clusters = graphemes(text, locale);
  if (clusters.length <= maxGraphemes) return text;
  const marker = graphemes(ellipsis, locale);
  if (marker.length >= maxGraphemes) return marker.slice(0, maxGraphemes).join("");
  const kept = clusters.slice(0, maxGraphemes - marker.length);
  while (kept.at(-1)?.endsWith(ZWJ) === true) kept.pop();
  return kept.join("").trimEnd() + ellipsis;
}

/**
 * Splits text into words, dropping spaces, punctuation and emoji (`Intl.Segmenter` with
 * `granularity: "word"`, keeping `isWordLike` segments).
 *
 * @param locale Passed to `Intl.Segmenter`; ignored by the fallback.
 *
 * @example
 * ```ts
 * words("ශ්‍රී ලංකාව, Sri Lanka!"); // ["ශ්‍රී", "ලංකාව", "Sri", "Lanka"]
 * ```
 */
export function words(text: string, locale?: string): string[] {
  if (!isSegmenterSupported()) return fallbackWords(text);
  const result: string[] = [];
  for (const part of getSegmenter("word", locale).segment(text)) {
    if (part.isWordLike === true) result.push(part.segment);
  }
  return result;
}
