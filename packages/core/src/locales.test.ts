import { describe, expect, expectTypeOf, it } from "vitest";
import { LankaConfigError } from "./errors.js";
import {
  getLocaleInfo,
  isLankaLocale,
  LANKA_LOCALES,
  parseLocale,
  type LankaLocale,
  type LocaleInfo,
} from "./locales.js";

describe("LANKA_LOCALES", () => {
  it("lists the three supported locales in a stable order", () => {
    expect(LANKA_LOCALES).toEqual(["en-LK", "si-LK", "ta-LK"]);
  });

  it("is frozen", () => {
    expect(Object.isFrozen(LANKA_LOCALES)).toBe(true);
  });

  it("is typed as readonly LankaLocale[]", () => {
    expectTypeOf(LANKA_LOCALES).toEqualTypeOf<readonly LankaLocale[]>();
  });
});

describe("isLankaLocale", () => {
  it.each(["en-LK", "si-LK", "ta-LK"])("accepts %s", (value) => {
    expect(isLankaLocale(value)).toBe(true);
  });

  it.each([
    "si",
    "SI-LK",
    "si_LK",
    "si-lk",
    "en-US",
    "",
    " si-LK",
    "toString",
    "__proto__",
    "constructor",
  ])("rejects %j", (value) => {
    expect(isLankaLocale(value)).toBe(false);
  });

  it.each([null, undefined, 1, {}, ["si-LK"], Symbol("si-LK")])(
    "rejects non-strings (%s)",
    (value) => {
      expect(isLankaLocale(value)).toBe(false);
    },
  );

  it("narrows the type", () => {
    const value: unknown = "si-LK";
    if (isLankaLocale(value)) expectTypeOf(value).toEqualTypeOf<LankaLocale>();
  });
});

describe("getLocaleInfo", () => {
  it("describes en-LK", () => {
    expect(getLocaleInfo("en-LK")).toEqual({
      locale: "en-LK",
      language: "en",
      script: "Latn",
      nativeName: "English",
      englishName: "English",
      dir: "ltr",
    });
  });

  it("describes si-LK", () => {
    expect(getLocaleInfo("si-LK")).toEqual({
      locale: "si-LK",
      language: "si",
      script: "Sinh",
      nativeName: "සිංහල",
      englishName: "Sinhala",
      dir: "ltr",
    });
  });

  it("describes ta-LK", () => {
    expect(getLocaleInfo("ta-LK")).toEqual({
      locale: "ta-LK",
      language: "ta",
      script: "Taml",
      nativeName: "தமிழ்",
      englishName: "Tamil",
      dir: "ltr",
    });
  });

  it("stores native names as NFC Unicode", () => {
    for (const locale of LANKA_LOCALES) {
      const { nativeName } = getLocaleInfo(locale);
      expect(nativeName).toBe(nativeName.normalize("NFC"));
    }
  });

  it("returns frozen objects", () => {
    for (const locale of LANKA_LOCALES) {
      expect(Object.isFrozen(getLocaleInfo(locale))).toBe(true);
    }
  });

  it("throws UNKNOWN_LOCALE for unsupported input from untyped callers", () => {
    expect(() => getLocaleInfo("fr-FR" as LankaLocale)).toThrow(LankaConfigError);
    expect(() => getLocaleInfo("__proto__" as LankaLocale)).toThrow(
      expect.objectContaining({ code: "UNKNOWN_LOCALE" }),
    );
  });

  it("returns LocaleInfo", () => {
    expectTypeOf(getLocaleInfo).returns.toEqualTypeOf<LocaleInfo>();
  });
});

describe("parseLocale", () => {
  it.each([
    ["si", "si-LK"],
    ["ta", "ta-LK"],
    ["en", "en-LK"],
    ["si-LK", "si-LK"],
    ["si_LK", "si-LK"],
    ["SI-lk", "si-LK"],
    ["Ta_Lk", "ta-LK"],
    ["EN", "en-LK"],
    ["  si-LK  ", "si-LK"],
    ["si-Sinh", "si-LK"],
    ["si-Sinh-LK", "si-LK"],
    ["ta-taml-lk", "ta-LK"],
    ["en_Latn_LK", "en-LK"],
  ])("normalises %j to %s", (input, expected) => {
    expect(parseLocale(input)).toBe(expected);
  });

  it.each([
    "",
    "   ",
    "fr",
    "fr-LK",
    "en-US",
    "ta-IN",
    "si-Taml",
    "ta-Sinh-LK",
    "si-LK-u-nu-latn",
    "sin",
    "s",
    "si-",
    "-LK",
    "si--LK",
    "si LK",
    "*",
    "si-LKA",
  ])("rejects %j", (input) => {
    expect(parseLocale(input)).toBeNull();
  });

  it("returns null for non-string input from untyped callers", () => {
    expect(parseLocale(null as unknown as string)).toBeNull();
    expect(parseLocale(42 as unknown as string)).toBeNull();
  });
});
