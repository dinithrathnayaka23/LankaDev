import { describe, expect, expectTypeOf, it } from "vitest";
import { createLankaConfig } from "./config.js";
import { parseAcceptLanguage, resolveLocale } from "./resolve.js";

const all = createLankaConfig({
  locales: ["en-LK", "si-LK", "ta-LK"],
  defaultLocale: "en-LK",
  fallbackLocale: "si-LK",
});

const sinhalaTamil = createLankaConfig({
  locales: ["si-LK", "ta-LK"],
  defaultLocale: "si-LK",
});

describe("resolveLocale", () => {
  it("returns the first supported candidate", () => {
    expect(resolveLocale(all, ["ta-LK", "si-LK"])).toBe("ta-LK");
  });

  it("normalises candidates", () => {
    expect(resolveLocale(all, ["SI_lk"])).toBe("si-LK");
    expect(resolveLocale(all, ["ta"])).toBe("ta-LK");
    expect(resolveLocale(all, [" en "])).toBe("en-LK");
  });

  it("skips null, undefined, empty and unsupported candidates", () => {
    expect(resolveLocale(all, [null, undefined, "", "   ", "*", "fr", "de-DE", "ta"])).toBe(
      "ta-LK",
    );
  });

  it("falls back to the primary language for other regions", () => {
    expect(resolveLocale(all, ["en-US"])).toBe("en-LK");
    expect(resolveLocale(all, ["ta-IN"])).toBe("ta-LK");
    expect(resolveLocale(all, ["si-LK-u-nu-latn"])).toBe("si-LK");
    expect(resolveLocale(all, ["en_GB"])).toBe("en-LK");
  });

  it("follows RFC 4647 lookup order: truncates a candidate before moving to the next", () => {
    expect(resolveLocale(all, ["ta-IN", "si-LK"])).toBe("ta-LK");
  });

  it("ignores locales LankaDev supports but the app has not enabled", () => {
    expect(resolveLocale(sinhalaTamil, ["en-LK", "en-US", "ta"])).toBe("ta-LK");
  });

  it("returns fallbackLocale when nothing matches", () => {
    expect(resolveLocale(all, [])).toBe("si-LK");
    expect(resolveLocale(all, [null, "fr-FR", "zh"])).toBe("si-LK");
    expect(resolveLocale(sinhalaTamil, ["en-LK"])).toBe("si-LK");
  });

  it("does not throw on non-string values from untyped callers", () => {
    const candidates = [42, {}, ["si-LK"]] as unknown as string[];
    expect(resolveLocale(all, candidates)).toBe("si-LK");
  });

  it("works with parseAcceptLanguage output", () => {
    const header = "fr-CH, fr;q=0.9, ta-IN;q=0.8, en;q=0.7";
    expect(resolveLocale(all, parseAcceptLanguage(header))).toBe("ta-LK");
  });

  it("returns the config's locale type", () => {
    expectTypeOf(resolveLocale(sinhalaTamil, [])).toEqualTypeOf<"si-LK" | "ta-LK">();
  });
});

describe("parseAcceptLanguage", () => {
  it("orders tags by quality", () => {
    expect(parseAcceptLanguage("ta-LK,ta;q=0.9,en;q=0.8")).toEqual(["ta-LK", "ta", "en"]);
  });

  it("re-sorts out-of-order q values", () => {
    expect(parseAcceptLanguage("en;q=0.5, si, ta;q=0.8")).toEqual(["si", "ta", "en"]);
  });

  it("keeps header order for equal quality (stable)", () => {
    expect(parseAcceptLanguage("si;q=0.7, ta;q=0.7, en;q=0.7")).toEqual(["si", "ta", "en"]);
    expect(parseAcceptLanguage("en, si, ta")).toEqual(["en", "si", "ta"]);
  });

  it("treats a missing q as 1 and accepts q=1 / q=1.000", () => {
    expect(parseAcceptLanguage("en;q=0.9, si;q=1, ta;q=1.000")).toEqual(["si", "ta", "en"]);
  });

  it("tolerates whitespace and case", () => {
    expect(parseAcceptLanguage("  si-LK ; Q=0.4 ,\tta ")).toEqual(["ta", "si-LK"]);
  });

  it("drops q=0 entries", () => {
    expect(parseAcceptLanguage("en;q=0, si;q=0.000, ta")).toEqual(["ta"]);
  });

  it("keeps the wildcard", () => {
    expect(parseAcceptLanguage("si, *;q=0.1")).toEqual(["si", "*"]);
  });

  it("returns tags as written", () => {
    expect(parseAcceptLanguage("SI-lk")).toEqual(["SI-lk"]);
  });

  it.each([null, undefined, "", "   "])("returns [] for %j", (header) => {
    expect(parseAcceptLanguage(header)).toEqual([]);
  });

  it.each([";;;", ",,,", "q=0.5", "en;q=abc", "!!!", "en_US", "en-", "1234567890abc"])(
    "returns [] for malformed header %j",
    (header) => {
      expect(parseAcceptLanguage(header)).toEqual([]);
    },
  );

  it("skips malformed entries but keeps valid ones", () => {
    expect(
      parseAcceptLanguage("si;q=2, ta;q=0.8, en;q=0.1234, x y, fr;level=1, de;q=0.5;foo=1, en"),
    ).toEqual(["en", "ta"]);
  });

  it("reads at most 64 entries", () => {
    const header = Array.from({ length: 100 }, (_, i) => `x-${String(i)}`).join(",");
    expect(parseAcceptLanguage(header)).toHaveLength(64);
  });

  it("does not throw on non-string input from untyped callers", () => {
    expect(parseAcceptLanguage(42 as unknown as string)).toEqual([]);
  });
});
