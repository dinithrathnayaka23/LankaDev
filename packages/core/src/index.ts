/**
 * `@lankadev/core` — locale types, configuration and fallback helpers for
 * English (`en-LK`), Sinhala (`si-LK`) and Tamil (`ta-LK`).
 *
 * Framework-agnostic, zero dependencies, no global state. Formatting helpers live in the
 * `@lankadev/core/formatting` entry point.
 *
 * @packageDocumentation
 */

export { createLankaConfig, isConfiguredLocale } from "./config.js";
export type { LankaConfig, LankaConfigInput } from "./config.js";
export { LankaConfigError } from "./errors.js";
export type { LankaConfigErrorCode } from "./errors.js";
export { getLocaleInfo, isLankaLocale, LANKA_LOCALES, parseLocale } from "./locales.js";
export type { LankaLanguage, LankaLocale, LankaScript, LocaleInfo } from "./locales.js";
export { parseAcceptLanguage, resolveLocale } from "./resolve.js";
