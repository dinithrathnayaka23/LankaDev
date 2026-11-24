import { describe, expect, it } from "vitest";
import type { LankaLocale } from "../locales.js";
import { formatNumber, getNumberFormatter } from "./number.js";

describe("getNumberFormatter", () => {
  it("returns an Intl.NumberFormat for the locale", () => {
    const formatter = getNumberFormatter("si-LK");
    expect(formatter).toBeInstanceOf(Intl.NumberFormat);
    expect(formatter.resolvedOptions().locale).toBe("si-LK");
  });

  it("returns the same instance for identical arguments", () => {
    expect(getNumberFormatter("ta-LK", { style: "percent" })).toBe(
      getNumberFormatter("ta-LK", { style: "percent" }),
    );
    expect(getNumberFormatter("en-LK")).toBe(getNumberFormatter("en-LK", {}));
  });

  it("ignores option key order", () => {
    expect(getNumberFormatter("si-LK", { minimumFractionDigits: 1, useGrouping: false })).toBe(
      getNumberFormatter("si-LK", { useGrouping: false, minimumFractionDigits: 1 }),
    );
  });

  it("returns different instances for different locales or options", () => {
    expect(getNumberFormatter("si-LK")).not.toBe(getNumberFormatter("ta-LK"));
    expect(getNumberFormatter("si-LK", { style: "percent" })).not.toBe(getNumberFormatter("si-LK"));
  });

  it("throws RangeError for unsupported locales", () => {
    expect(() => getNumberFormatter("fr-FR" as LankaLocale)).toThrow(RangeError);
  });
});

describe("formatNumber", () => {
  it("formats with western grouping for en-LK and si-LK", () => {
    expect(formatNumber(1234567.891, { locale: "en-LK" })).toBe("1,234,567.891");
    expect(formatNumber(1234567.891, { locale: "si-LK" })).toBe("1,234,567.891");
  });

  it("passes Intl options through", () => {
    expect(formatNumber(0.075, { locale: "en-LK", style: "percent" })).toBe("8%");
    expect(formatNumber(12n, { locale: "ta-LK", minimumIntegerDigits: 3 })).toBe("012");
    expect(formatNumber(1234.5, { locale: "si-LK", useGrouping: false })).toBe("1234.5");
  });

  it("formats bigint exactly", () => {
    expect(formatNumber(12345678901234567890n, { locale: "en-LK" })).toBe(
      "12,345,678,901,234,567,890",
    );
  });

  it("uses Latin digits for all locales", () => {
    for (const locale of ["en-LK", "si-LK", "ta-LK"] as const) {
      expect(formatNumber(1234567890, { locale })).toMatch(/^[\d,]+$/);
    }
  });

  it("formats non-finite numbers as Intl does", () => {
    expect(formatNumber(Number.NaN, { locale: "en-LK" })).toBe("NaN");
    expect(formatNumber(Number.POSITIVE_INFINITY, { locale: "en-LK" })).toBe("∞");
  });

  it("throws RangeError for unsupported locales", () => {
    expect(() => formatNumber(1, { locale: "en-US" as LankaLocale })).toThrow(RangeError);
  });
});
