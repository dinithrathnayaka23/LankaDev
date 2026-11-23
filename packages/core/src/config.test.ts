import { describe, expect, expectTypeOf, it } from "vitest";
import {
  createLankaConfig,
  isConfiguredLocale,
  type LankaConfig,
  type LankaConfigInput,
} from "./config.js";
import { LankaConfigError, type LankaConfigErrorCode } from "./errors.js";
import type { LankaLocale } from "./locales.js";

/** Calls createLankaConfig with untyped input, as a JavaScript caller could. */
function createUnchecked(input: unknown): LankaConfig {
  return createLankaConfig(input as LankaConfigInput);
}

function expectConfigError(fn: () => unknown, code: LankaConfigErrorCode): void {
  let caught: unknown;
  try {
    fn();
  } catch (error) {
    caught = error;
  }
  expect(caught).toBeInstanceOf(LankaConfigError);
  expect(caught).toBeInstanceOf(Error);
  expect((caught as LankaConfigError).code).toBe(code);
  expect((caught as LankaConfigError).name).toBe("LankaConfigError");
  expect((caught as LankaConfigError).message).not.toBe("");
}

describe("createLankaConfig", () => {
  it("creates a config for all three locales", () => {
    const config = createLankaConfig({
      locales: ["en-LK", "si-LK", "ta-LK"],
      defaultLocale: "en-LK",
      fallbackLocale: "si-LK",
    });
    expect(config).toEqual({
      locales: ["en-LK", "si-LK", "ta-LK"],
      defaultLocale: "en-LK",
      fallbackLocale: "si-LK",
    });
  });

  it("defaults fallbackLocale to defaultLocale", () => {
    const config = createLankaConfig({ locales: ["si-LK", "ta-LK"], defaultLocale: "ta-LK" });
    expect(config.fallbackLocale).toBe("ta-LK");
  });

  it("preserves locale order", () => {
    const config = createLankaConfig({
      locales: ["ta-LK", "en-LK", "si-LK"],
      defaultLocale: "si-LK",
    });
    expect(config.locales).toEqual(["ta-LK", "en-LK", "si-LK"]);
  });

  it("returns a deeply frozen config", () => {
    const config = createLankaConfig({ locales: ["en-LK", "si-LK"], defaultLocale: "en-LK" });
    expect(Object.isFrozen(config)).toBe(true);
    expect(Object.isFrozen(config.locales)).toBe(true);
  });

  it("copies the locales array instead of retaining the caller's array", () => {
    const locales: LankaLocale[] = ["en-LK", "si-LK"];
    const config = createLankaConfig({ locales, defaultLocale: "en-LK" });
    locales.push("ta-LK");
    expect(config.locales).toEqual(["en-LK", "si-LK"]);
    expect(config.locales).not.toBe(locales);
  });

  it("does not mutate the input", () => {
    const input = { locales: ["en-LK", "ta-LK"] as const, defaultLocale: "ta-LK" as const };
    createLankaConfig(input);
    expect(input).toEqual({ locales: ["en-LK", "ta-LK"], defaultLocale: "ta-LK" });
    expect(Object.isFrozen(input)).toBe(false);
  });

  describe("errors", () => {
    it("EMPTY_LOCALES for an empty array", () => {
      expectConfigError(
        () => createUnchecked({ locales: [], defaultLocale: "en-LK" }),
        "EMPTY_LOCALES",
      );
    });

    it.each([undefined, null, "en-LK", {}, 3])("EMPTY_LOCALES when locales is %j", (locales) => {
      expectConfigError(
        () => createUnchecked({ locales, defaultLocale: "en-LK" }),
        "EMPTY_LOCALES",
      );
    });

    it.each([undefined, null])("EMPTY_LOCALES when the input itself is %j", (input) => {
      expectConfigError(() => createUnchecked(input), "EMPTY_LOCALES");
    });

    it.each(["fr-FR", "si", "SI-LK", "", null, 1])("UNKNOWN_LOCALE for %j in locales", (bad) => {
      expectConfigError(
        () => createUnchecked({ locales: ["en-LK", bad], defaultLocale: "en-LK" }),
        "UNKNOWN_LOCALE",
      );
    });

    it("DUPLICATE_LOCALE when a locale repeats", () => {
      expectConfigError(
        () => createUnchecked({ locales: ["en-LK", "si-LK", "en-LK"], defaultLocale: "en-LK" }),
        "DUPLICATE_LOCALE",
      );
    });

    it("DEFAULT_NOT_IN_LOCALES when defaultLocale is supported but not enabled", () => {
      expectConfigError(
        () => createUnchecked({ locales: ["si-LK"], defaultLocale: "en-LK" }),
        "DEFAULT_NOT_IN_LOCALES",
      );
    });

    it.each([undefined, "fr-FR", "si"])(
      "DEFAULT_NOT_IN_LOCALES when defaultLocale is %j",
      (bad) => {
        expectConfigError(
          () => createUnchecked({ locales: ["si-LK"], defaultLocale: bad }),
          "DEFAULT_NOT_IN_LOCALES",
        );
      },
    );

    it("FALLBACK_NOT_IN_LOCALES when fallbackLocale is not enabled", () => {
      expectConfigError(
        () =>
          createUnchecked({
            locales: ["si-LK", "ta-LK"],
            defaultLocale: "si-LK",
            fallbackLocale: "en-LK",
          }),
        "FALLBACK_NOT_IN_LOCALES",
      );
    });

    it("validates locales before defaultLocale", () => {
      expectConfigError(
        () => createUnchecked({ locales: ["xx"], defaultLocale: "yy" }),
        "UNKNOWN_LOCALE",
      );
    });
  });

  describe("types", () => {
    it("infers the locale union from `locales`", () => {
      const config = createLankaConfig({ locales: ["en-LK", "si-LK"], defaultLocale: "en-LK" });
      expectTypeOf(config).toEqualTypeOf<LankaConfig<"en-LK" | "si-LK">>();
      expectTypeOf(config.defaultLocale).toEqualTypeOf<"en-LK" | "si-LK">();
    });

    it("rejects a defaultLocale outside `locales` at compile time", () => {
      expect(() =>
        // @ts-expect-error -- "en-LK" is not in locales; NoInfer stops it widening L.
        createLankaConfig({ locales: ["si-LK"], defaultLocale: "en-LK" }),
      ).toThrow(LankaConfigError);
    });

    it("rejects a fallbackLocale outside `locales` at compile time", () => {
      expect(() =>
        createLankaConfig({
          locales: ["si-LK", "ta-LK"],
          defaultLocale: "si-LK",
          // @ts-expect-error -- "en-LK" is not in locales.
          fallbackLocale: "en-LK",
        }),
      ).toThrow(LankaConfigError);
    });

    it("rejects unsupported locale strings at compile time", () => {
      expect(() =>
        // @ts-expect-error -- "fr-FR" is not a LankaLocale.
        createLankaConfig({ locales: ["fr-FR"], defaultLocale: "fr-FR" }),
      ).toThrow(LankaConfigError);
    });
  });
});

describe("isConfiguredLocale", () => {
  const config = createLankaConfig({ locales: ["en-LK", "si-LK"], defaultLocale: "en-LK" });

  it("accepts enabled locales", () => {
    expect(isConfiguredLocale(config, "en-LK")).toBe(true);
    expect(isConfiguredLocale(config, "si-LK")).toBe(true);
  });

  it("rejects supported-but-disabled locales and other values", () => {
    for (const value of ["ta-LK", "si", "", null, undefined, 1]) {
      expect(isConfiguredLocale(config, value)).toBe(false);
    }
  });

  it("narrows to the config's locale union", () => {
    const value: unknown = "si-LK";
    if (isConfiguredLocale(config, value)) {
      expectTypeOf(value).toEqualTypeOf<"en-LK" | "si-LK">();
    }
  });
});
