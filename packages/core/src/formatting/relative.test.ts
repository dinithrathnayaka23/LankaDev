import { describe, expect, it } from "vitest";
import type { LankaLocale } from "../locales.js";
import { formatRelativeTime } from "./relative.js";

describe("formatRelativeTime", () => {
  it("formats past and future values", () => {
    expect(formatRelativeTime(-1, "day", { locale: "en-LK" })).toBe("1 day ago");
    expect(formatRelativeTime(3, "hour", { locale: "en-LK" })).toBe("in 3 hours");
  });

  it("supports numeric: auto", () => {
    expect(formatRelativeTime(-1, "day", { locale: "en-LK", numeric: "auto" })).toBe("yesterday");
    // Sinhala/Tamil words are pinned per Node major in output.snapshot.test.ts.
    for (const locale of ["si-LK", "ta-LK"] as const) {
      const word = formatRelativeTime(-1, "day", { locale, numeric: "auto" });
      expect(word).not.toMatch(/\d/);
      expect(word).not.toBe(formatRelativeTime(-1, "day", { locale }));
    }
  });

  it("supports style", () => {
    expect(formatRelativeTime(-2, "month", { locale: "en-LK", style: "short" })).toBe("2 mo. ago");
  });

  it("throws RangeError for non-finite values", () => {
    expect(() => formatRelativeTime(Number.NaN, "day", { locale: "en-LK" })).toThrow(RangeError);
  });

  it("throws RangeError for invalid units", () => {
    expect(() =>
      formatRelativeTime(1, "fortnight" as Intl.RelativeTimeFormatUnit, { locale: "en-LK" }),
    ).toThrow(RangeError);
  });

  it("throws RangeError for unsupported locales", () => {
    expect(() => formatRelativeTime(1, "day", { locale: "en-GB" as LankaLocale })).toThrow(
      RangeError,
    );
  });
});
