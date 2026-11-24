import { describe, expect, it } from "vitest";
import { LANKA_LOCALES, type LankaLocale } from "../locales.js";
import { formatLKR } from "./currency.js";

// Exact per-locale strings depend on the runtime's ICU/CLDR data and are pinned per Node major
// in output.snapshot.test.ts. These tests assert behaviour that must hold on every runtime.

const NBSP = "\u00a0";

describe("formatLKR", () => {
  it("formats two fraction digits with western grouping below one lakh", () => {
    for (const locale of LANKA_LOCALES) {
      expect(formatLKR(12500.5, { locale })).toContain("12,500.50");
    }
  });

  it("uses the locale's currency symbol by default", () => {
    expect(formatLKR(12500.5, { locale: "en-LK" })).toBe(`LKR${NBSP}12,500.50`);
    expect(formatLKR(12500.5, { locale: "si-LK" })).toContain("රු");
    expect(formatLKR(12500.5, { locale: "ta-LK" })).toContain("Rs");
  });

  it("supports the ISO code display in every locale", () => {
    for (const locale of LANKA_LOCALES) {
      expect(formatLKR(12500.5, { locale, display: "code" })).toBe(`LKR${NBSP}12,500.50`);
    }
  });

  it("supports name display", () => {
    expect(formatLKR(12500.5, { locale: "en-LK", display: "name" })).toBe(
      "12,500.50 Sri Lankan rupees",
    );
  });

  it("formats bigint amounts exactly", () => {
    expect(formatLKR(12345678901234567890n, { locale: "en-LK", display: "code" })).toBe(
      `LKR${NBSP}12,345,678,901,234,567,890.00`,
    );
  });

  it("shows a minus sign for negative amounts", () => {
    for (const locale of LANKA_LOCALES) {
      expect(formatLKR(-1234.5, { locale })).toMatch(/^-/);
    }
    expect(formatLKR(-1234.5, { locale: "en-LK" })).toBe(`-LKR${NBSP}1,234.50`);
    expect(formatLKR(-5n, { locale: "en-LK" })).toBe(`-LKR${NBSP}5.00`);
  });

  it("never shows a minus sign for zero or values that round to zero", () => {
    for (const locale of LANKA_LOCALES) {
      expect(formatLKR(-0, { locale })).not.toMatch(/-/);
      expect(formatLKR(-0.001, { locale })).not.toMatch(/-/);
    }
    expect(formatLKR(-0, { locale: "en-LK" })).toBe(`LKR${NBSP}0.00`);
  });

  it("rounds half away from zero on the decimal value", () => {
    expect(formatLKR(0.125, { locale: "en-LK" })).toBe(`LKR${NBSP}0.13`);
    expect(formatLKR(-0.125, { locale: "en-LK" })).toBe(`-LKR${NBSP}0.13`);
  });

  describe("fraction digits", () => {
    it("whole rupees when only maximumFractionDigits: 0 is set", () => {
      expect(formatLKR(12500.5, { locale: "en-LK", maximumFractionDigits: 0 })).toBe(
        `LKR${NBSP}12,501`,
      );
    });

    it("raises the maximum when only a larger minimum is set", () => {
      expect(formatLKR(1, { locale: "en-LK", minimumFractionDigits: 3 })).toBe(`LKR${NBSP}1.000`);
    });

    it("respects both bounds when given", () => {
      expect(
        formatLKR(1.5, { locale: "en-LK", minimumFractionDigits: 0, maximumFractionDigits: 1 }),
      ).toBe(`LKR${NBSP}1.5`);
    });

    it("throws RangeError when bounds conflict", () => {
      expect(() =>
        formatLKR(1, { locale: "en-LK", minimumFractionDigits: 3, maximumFractionDigits: 1 }),
      ).toThrow(RangeError);
    });
  });

  describe("errors", () => {
    it.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
      "throws RangeError for %s",
      (amount) => {
        expect(() => formatLKR(amount, { locale: "en-LK" })).toThrow(RangeError);
      },
    );

    it("throws RangeError for unsupported locales", () => {
      expect(() => formatLKR(1, { locale: "si" as LankaLocale })).toThrow(RangeError);
    });
  });
});
