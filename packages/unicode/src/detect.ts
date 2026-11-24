import { scriptOfChar, SINHALA_CHAR, TAMIL_CHAR } from "./ranges.js";

/**
 * Share of letters the second most common script must reach for {@link detectScript} to return
 * `"mixed"`: `0.2` (20 %).
 */
export const MIXED_SCRIPT_THRESHOLD = 0.2;

/** Per-script code point counts. `common` code points (digits, punctuation, spaces, emoji) are not counted. */
export interface ScriptBreakdown {
  sinhala: number;
  tamil: number;
  latin: number;
  other: number;
  /** `sinhala + tamil + latin + other`. */
  total: number;
}

/**
 * Counts code points per script, ignoring `"common"` ones (digits, punctuation, whitespace, emoji,
 * ZWJ/ZWNJ). Vowel signs and viramas count toward their script.
 *
 * @example
 * ```ts
 * analyzeScripts("ලංකාව 2026"); // { sinhala: 5, tamil: 0, latin: 0, other: 0, total: 5 }
 * ```
 */
export function analyzeScripts(text: string): ScriptBreakdown {
  const counts: ScriptBreakdown = { sinhala: 0, tamil: 0, latin: 0, other: 0, total: 0 };
  for (const char of text) {
    const script = scriptOfChar(char);
    if (script === "common") continue;
    counts[script]++;
    counts.total++;
  }
  return counts;
}

/**
 * Returns the dominant script of `text` by letter count, ignoring `"common"` code points.
 *
 * - `"unknown"`: no letters at all (empty, digits, punctuation or emoji only).
 * - `"mixed"`: the second most common script has at least {@link MIXED_SCRIPT_THRESHOLD} (20 %) of
 *   the letters.
 * - Otherwise the most common script: `"sinhala"`, `"tamil"`, `"latin"` or `"other"`.
 *
 * @example
 * ```ts
 * detectScript("ශ්‍රී ලංකාව"); // "sinhala"
 * detectScript("தமிழ் 2026"); // "tamil"
 * detectScript("Hello ලංකා"); // "mixed"
 * detectScript("👍🏽 123"); // "unknown"
 * ```
 */
export function detectScript(text: string): DetectedScript {
  const counts = analyzeScripts(text);
  if (counts.total === 0) return "unknown";
  let top: LetterScript = "sinhala";
  let topCount = -1;
  let secondCount = -1;
  for (const script of LETTER_SCRIPTS) {
    const count = counts[script];
    if (count > topCount) {
      secondCount = topCount;
      topCount = count;
      top = script;
    } else if (count > secondCount) {
      secondCount = count;
    }
  }
  return secondCount / counts.total >= MIXED_SCRIPT_THRESHOLD ? "mixed" : top;
}

/** Scripts counted as letters by {@link analyzeScripts}. */
type LetterScript = "sinhala" | "tamil" | "latin" | "other";

/** Result of {@link detectScript}. */
export type DetectedScript = LetterScript | "mixed" | "unknown";

const LETTER_SCRIPTS: readonly LetterScript[] = ["sinhala", "tamil", "latin", "other"];

/**
 * `true` if `text` contains at least one code point from the Sinhala or Sinhala Archaic Numbers block.
 *
 * @example
 * ```ts
 * containsSinhala("Hello ලංකා"); // true
 * ```
 */
export function containsSinhala(text: string): boolean {
  return SINHALA_CHAR.test(text);
}

/**
 * `true` if `text` contains at least one code point from the Tamil or Tamil Supplement block.
 *
 * @example
 * ```ts
 * containsTamil("இலங்கை"); // true
 * ```
 */
export function containsTamil(text: string): boolean {
  return TAMIL_CHAR.test(text);
}
