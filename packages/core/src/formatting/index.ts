/**
 * `@lankadev/core/formatting` — LKR, number, date and relative-time formatting over `Intl`
 * with Sri Lankan defaults (LKR currency, `Asia/Colombo` time zone).
 *
 * Every function takes an explicit `locale`; there is no global state. Formatter instances are
 * cached internally. Output follows the runtime's ICU/CLDR data and can differ slightly between
 * Node.js and browser versions — see `docs/formatting.md`.
 *
 * @packageDocumentation
 */

export { formatLKR } from "./currency.js";
export type { FormatLKROptions, LKRDisplay } from "./currency.js";
export { formatDate } from "./date.js";
export type { FormatDateOptions } from "./date.js";
export { formatNumber, getNumberFormatter } from "./number.js";
export type { FormatNumberOptions } from "./number.js";
export { formatRelativeTime } from "./relative.js";
export type { FormatRelativeTimeOptions } from "./relative.js";
export { DEFAULT_TIME_ZONE } from "./shared.js";
