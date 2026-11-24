/**
 * Small bounded cache for `Intl` formatter instances.
 *
 * Creating `Intl.*Format` objects is expensive relative to calling `format()`, so formatters are
 * reused per (kind, locale, options). The cache is bounded so apps that pass many distinct option
 * objects cannot grow memory without limit; the least recently inserted entry is evicted first.
 *
 * @internal Not part of the public API.
 */

/** Default maximum number of cached formatters per cache. */
export const DEFAULT_CACHE_LIMIT = 100;

/**
 * Serialises options with sorted keys so `{ a, b }` and `{ b, a }` share a cache entry.
 * `undefined` values are dropped (they do not change `Intl` behaviour).
 */
export function stableKey(value: unknown): string {
  if (value === null || typeof value !== "object") {
    // Quote strings so "1" and 1 differ; String() covers undefined, numbers, booleans, bigint.
    return typeof value === "string" ? JSON.stringify(value) : String(value);
  }
  if (Array.isArray(value)) return `[${value.map(stableKey).join(",")}]`;
  const entries = Object.entries(value as Record<string, unknown>)
    .filter(([, v]) => v !== undefined)
    // Object keys are unique, so the comparator never needs to return 0.
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([k, v]) => `${JSON.stringify(k)}:${stableKey(v)}`);
  return `{${entries.join(",")}}`;
}

export interface FormatterCache {
  /** Returns the cached instance for `key`, creating it with `create` on a miss. */
  get<T>(key: string, create: () => T): T;
  /** Number of cached instances. */
  readonly size: number;
}

/** Creates an independent bounded cache. A `limit` of `0` or less disables caching. */
export function createFormatterCache(limit: number = DEFAULT_CACHE_LIMIT): FormatterCache {
  const store = new Map<string, unknown>();
  return {
    get<T>(key: string, create: () => T): T {
      if (store.has(key)) return store.get(key) as T;
      const value = create();
      if (limit <= 0) return value;
      if (store.size >= limit) {
        // Maps iterate in insertion order: the first key is the oldest entry.
        for (const oldest of store.keys()) {
          store.delete(oldest);
          break;
        }
      }
      store.set(key, value);
      return value;
    },
    get size() {
      return store.size;
    },
  };
}

/** Shared cache used by all formatting helpers. */
export const formatterCache: FormatterCache = createFormatterCache();
