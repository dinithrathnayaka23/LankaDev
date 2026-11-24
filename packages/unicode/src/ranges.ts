/**
 * Code point → script classification.
 *
 * Sinhala and Tamil are matched by Unicode **block** (including the few unassigned code points in
 * those blocks), so text typed with a newer Unicode version than the runtime knows is still
 * detected. Latin, Common and Inherited use the runtime's `Script` property via regex property
 * escapes.
 */

/** Script category of a single code point. */
export type Script = "sinhala" | "tamil" | "latin" | "common" | "other";

/** A Unicode block range that is classified as Sinhala or Tamil. */
export interface ScriptRange {
  readonly script: "sinhala" | "tamil";
  /** First code point (inclusive). */
  readonly start: number;
  /** Last code point (inclusive). */
  readonly end: number;
  /** Unicode block name. */
  readonly block: string;
}

/**
 * Blocks detected as Sinhala or Tamil.
 *
 * - Sinhala `U+0D80–U+0DFF`: letters, vowel signs, al-lakuna `U+0DCA`, Sinhala Lith digits
 *   `U+0DE6–U+0DEF`, kunddaliya `U+0DF4`.
 * - Sinhala Archaic Numbers `U+111E0–U+111FF`.
 * - Tamil `U+0B80–U+0BFF`: letters, vowel signs, pulli `U+0BCD`, digits and number signs.
 * - Tamil Supplement `U+11FC0–U+11FFF`: fractions and historic symbols.
 */
export const SCRIPT_RANGES: readonly ScriptRange[] = Object.freeze([
  Object.freeze({ script: "sinhala", start: 0x0d80, end: 0x0dff, block: "Sinhala" }),
  Object.freeze({
    script: "sinhala",
    start: 0x111e0,
    end: 0x111ff,
    block: "Sinhala Archaic Numbers",
  }),
  Object.freeze({ script: "tamil", start: 0x0b80, end: 0x0bff, block: "Tamil" }),
  Object.freeze({ script: "tamil", start: 0x11fc0, end: 0x11fff, block: "Tamil Supplement" }),
] as const);

function blockPattern(script: ScriptRange["script"]): RegExp {
  const ranges = SCRIPT_RANGES.filter((range) => range.script === script)
    .map((range) => `\\u{${range.start.toString(16)}}-\\u{${range.end.toString(16)}}`)
    .join("");
  return new RegExp(`[${ranges}]`, "u");
}

/** @internal Matches one code point of a Sinhala block (not global: safe to reuse with `test`). */
export const SINHALA_CHAR = blockPattern("sinhala");
/** @internal Matches one code point of a Tamil block. */
export const TAMIL_CHAR = blockPattern("tamil");
const ASCII_LETTER = /[A-Za-z]/;
const LATIN = /\p{Script=Latin}/u;
const COMMON = /[\p{Script=Common}\p{Script=Inherited}]/u;

/**
 * Script of a single code point given as a string (one `for…of` item).
 *
 * @internal Used by the text helpers; use {@link getCharScript} for numeric code points.
 */
export function scriptOfChar(char: string): Script {
  // ASCII fast path.
  if (char < "\u{80}") return ASCII_LETTER.test(char) ? "latin" : "common";
  if (SINHALA_CHAR.test(char)) return "sinhala";
  if (TAMIL_CHAR.test(char)) return "tamil";
  if (LATIN.test(char)) return "latin";
  if (COMMON.test(char)) return "common";
  return "other";
}

/**
 * Returns the script category of one code point.
 *
 * - `"sinhala"` / `"tamil"`: inside one of the {@link SCRIPT_RANGES} blocks.
 * - `"latin"`: Unicode `Script=Latin` (ASCII letters, Latin-1 letters, Latin Extended, fullwidth).
 * - `"common"`: `Script=Common` or `Script=Inherited`: digits, punctuation, spaces, symbols, emoji,
 *   ZWJ/ZWNJ and generic combining marks.
 * - `"other"`: any other script, and unassigned code points outside the Sinhala/Tamil blocks.
 *
 * Iterate text by code point (`for…of`), never by UTF-16 index:
 *
 * @example
 * ```ts
 * for (const char of "ශ්‍රී") getCharScript(char.codePointAt(0)!); // "sinhala", …, "common" (ZWJ), …
 * getCharScript(0x0b85); // "tamil" (அ)
 * getCharScript(0x41); // "latin" (A)
 * ```
 *
 * @throws {RangeError} If `codePoint` is not an integer in `0…0x10FFFF`.
 */
export function getCharScript(codePoint: number): Script {
  if (!Number.isInteger(codePoint) || codePoint < 0 || codePoint > 0x10ffff) {
    throw new RangeError(`Invalid code point: ${String(codePoint)}`);
  }
  return scriptOfChar(String.fromCodePoint(codePoint));
}
