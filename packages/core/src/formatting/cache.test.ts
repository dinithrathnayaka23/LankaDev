import { describe, expect, it } from "vitest";
import { createFormatterCache, DEFAULT_CACHE_LIMIT, formatterCache, stableKey } from "./cache.js";

describe("stableKey", () => {
  it("ignores key order", () => {
    expect(stableKey({ a: 1, b: "x" })).toBe(stableKey({ b: "x", a: 1 }));
  });

  it("drops undefined values", () => {
    expect(stableKey({ a: 1, b: undefined })).toBe(stableKey({ a: 1 }));
  });

  it("distinguishes different values and types", () => {
    expect(stableKey({ a: 1 })).not.toBe(stableKey({ a: "1" }));
    expect(stableKey({ a: 1 })).not.toBe(stableKey({ a: 2 }));
  });

  it("handles nested objects, arrays and primitives", () => {
    expect(stableKey({ z: [1, { y: 2, x: 1 }], n: null })).toBe('{"n":null,"z":[1,{"x":1,"y":2}]}');
    expect(stableKey("s")).toBe('"s"');
    expect(stableKey(undefined)).toBe("undefined");
  });
});

describe("createFormatterCache", () => {
  it("creates once per key and reuses the instance", () => {
    const cache = createFormatterCache();
    let calls = 0;
    const create = () => ({ id: ++calls });
    const first = cache.get("k", create);
    const second = cache.get("k", create);
    expect(second).toBe(first);
    expect(calls).toBe(1);
    expect(cache.size).toBe(1);
  });

  it("evicts the oldest entry when full", () => {
    const cache = createFormatterCache(2);
    const a = cache.get("a", () => ({ key: "a" }));
    cache.get("b", () => ({ key: "b" }));
    cache.get("c", () => ({ key: "c" }));
    expect(cache.size).toBe(2);
    expect(cache.get("a", () => ({ key: "a" }))).not.toBe(a);
  });

  it("does not retain entries when the limit is 0", () => {
    const cache = createFormatterCache(0);
    const first = cache.get("k", () => ({}));
    expect(cache.get("k", () => ({}))).not.toBe(first);
    expect(cache.size).toBe(0);
  });

  it("defaults to a bounded limit", () => {
    const cache = createFormatterCache();
    for (let i = 0; i < DEFAULT_CACHE_LIMIT + 10; i++) cache.get(String(i), () => i);
    expect(cache.size).toBe(DEFAULT_CACHE_LIMIT);
  });

  it("exposes a shared cache", () => {
    expect(formatterCache.get("shared-test", () => 1)).toBe(1);
  });
});
