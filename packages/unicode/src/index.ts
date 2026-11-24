/**
 * `@lankadev/unicode` — script detection, normalization and grapheme-aware helpers
 * for Sinhala and Tamil text.
 *
 * @packageDocumentation
 */

export { getCharScript, SCRIPT_RANGES, type Script, type ScriptRange } from "./ranges.js";
export {
  analyzeScripts,
  containsSinhala,
  containsTamil,
  detectScript,
  MIXED_SCRIPT_THRESHOLD,
  type DetectedScript,
  type ScriptBreakdown,
} from "./detect.js";
export {
  normalizeSinhalaText,
  normalizeTamilText,
  SINHALA_SEQUENCE_FIXES,
  toSearchKey,
  type SearchKeyOptions,
} from "./normalize.js";
export {
  graphemeLength,
  graphemes,
  isSegmenterSupported,
  truncate,
  words,
  type TruncateOptions,
} from "./segment.js";
