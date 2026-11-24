import { describe, expect, it } from "vitest";
import { LANKA_LOCALES, type LankaLocale } from "../locales.js";
import { formatDate } from "./date.js";
import { DEFAULT_TIME_ZONE } from "./shared.js";

// 20:00 UTC on 1 Jan is 01:30 on 2 Jan in Colombo (UTC+05:30).
const NEW_YEAR_EVENING_UTC = new Date("2026-01-01T20:00:00Z");

describe("formatDate", () => {
  it("defaults to Asia/Colombo", () => {
    expect(DEFAULT_TIME_ZONE).toBe("Asia/Colombo");
    for (const locale of LANKA_LOCALES) {
      expect(formatDate(NEW_YEAR_EVENING_UTC, { locale, day: "numeric" })).toBe("2");
    }
  });

  it("respects an explicit time zone", () => {
    for (const locale of LANKA_LOCALES) {
      expect(formatDate(NEW_YEAR_EVENING_UTC, { locale, day: "numeric", timeZone: "UTC" })).toBe(
        "1",
      );
    }
  });

  // Exact long-date strings are pinned per Node major in output.snapshot.test.ts.
  it("formats long dates on the Colombo calendar day in each locale", () => {
    for (const locale of LANKA_LOCALES) {
      const text = formatDate(NEW_YEAR_EVENING_UTC, { locale, dateStyle: "long" });
      expect(text).toContain("2026");
      expect(text).toMatch(/(^|\D)2(\D|$)/);
    }
    expect(formatDate(NEW_YEAR_EVENING_UTC, { locale: "en-LK", dateStyle: "long" })).toBe(
      "January 2, 2026",
    );
  });

  it("accepts epoch milliseconds", () => {
    expect(formatDate(NEW_YEAR_EVENING_UTC.getTime(), { locale: "en-LK", year: "numeric" })).toBe(
      "2026",
    );
  });

  it("formats times in Sri Lanka time", () => {
    expect(
      formatDate(NEW_YEAR_EVENING_UTC, {
        locale: "ta-LK",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
      }),
    ).toBe("01:30");
  });

  it("reuses formatters for identical options", () => {
    const options = { locale: "si-LK", month: "long" } as const;
    expect(formatDate(NEW_YEAR_EVENING_UTC, options)).toBe(
      formatDate(NEW_YEAR_EVENING_UTC, options),
    );
  });

  describe("errors", () => {
    it("throws RangeError for an invalid Date", () => {
      expect(() => formatDate(new Date("not a date"), { locale: "en-LK" })).toThrow(RangeError);
    });

    it.each([Number.NaN, Number.POSITIVE_INFINITY])("throws RangeError for %s", (value) => {
      expect(() => formatDate(value, { locale: "en-LK" })).toThrow(RangeError);
    });

    it("throws RangeError for non-date input from untyped callers", () => {
      expect(() => formatDate("2026-01-01" as unknown as Date, { locale: "en-LK" })).toThrow(
        RangeError,
      );
    });

    it("throws RangeError for an unknown time zone", () => {
      expect(() =>
        formatDate(NEW_YEAR_EVENING_UTC, { locale: "si-LK", timeZone: "Mars/Olympus" }),
      ).toThrow(RangeError);
    });

    it("throws RangeError for unsupported locales", () => {
      expect(() => formatDate(0, { locale: "ta" as LankaLocale })).toThrow(RangeError);
    });
  });
});
