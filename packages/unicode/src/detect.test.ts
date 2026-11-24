import { describe, expect, it } from "vitest";
import {
  analyzeScripts,
  containsSinhala,
  containsTamil,
  detectScript,
  MIXED_SCRIPT_THRESHOLD,
} from "./detect.js";

describe("analyzeScripts", () => {
  it("counts code points per script and skips common ones", () => {
    expect(analyzeScripts("ලංකාව 2026")).toEqual({
      sinhala: 5,
      tamil: 0,
      latin: 0,
      other: 0,
      total: 5,
    });
    expect(analyzeScripts("Hi இலங்கை नम!")).toEqual({
      sinhala: 0,
      tamil: 6,
      latin: 2,
      other: 2,
      total: 10,
    });
  });

  it("does not count ZWJ, emoji or astral common characters", () => {
    expect(analyzeScripts("ක්\u{200D}ය 👍🏽").total).toBe(3);
  });

  it("counts astral Sinhala and Tamil code points once each", () => {
    expect(analyzeScripts("\u{111E1}\u{11FC0}")).toMatchObject({ sinhala: 1, tamil: 1, total: 2 });
  });

  it("returns zeros for empty text", () => {
    expect(analyzeScripts("")).toEqual({ sinhala: 0, tamil: 0, latin: 0, other: 0, total: 0 });
  });
});

describe("detectScript", () => {
  it.each([
    ["ශ්‍රී ලංකාව", "sinhala"],
    ["தமிழ் 2026", "tamil"],
    ["Sri Lanka", "latin"],
    ["नमस्ते", "other"],
    ["Hello ලංකා", "mixed"],
    ["ලංකා இலங்கை", "mixed"],
    ["", "unknown"],
    ["👍🏽 123 !?", "unknown"],
  ] as const)("%j → %s", (text, script) => {
    expect(detectScript(text)).toBe(script);
  });

  it("uses a 20 % threshold for the second script", () => {
    expect(MIXED_SCRIPT_THRESHOLD).toBe(0.2);
    // 8 Sinhala + 2 Latin: second script is exactly 20 % → mixed.
    expect(detectScript("කකකකකකකකAB")).toBe("mixed");
    // 9 Sinhala + 2 Latin: 18 % → sinhala.
    expect(detectScript("කකකකකකකකකAB")).toBe("sinhala");
  });

  it("is mixed when two scripts tie", () => {
    expect(detectScript("කක AA")).toBe("mixed");
  });

  it("ranks three scripts by count", () => {
    expect(detectScript("அஆஇஈஉஊஎஏஐஒ abc ක")).toBe("mixed");
    expect(detectScript("அஆஇஈஉஊஎஏஐஒஓஔகஙசஞ a ක")).toBe("tamil");
  });
});

describe("containsSinhala / containsTamil", () => {
  it("finds Sinhala anywhere in the text", () => {
    expect(containsSinhala("Hello ලංකා")).toBe(true);
    expect(containsSinhala("\u{111E1}")).toBe(true);
    expect(containsSinhala("இலங்கை")).toBe(false);
    expect(containsSinhala("")).toBe(false);
  });

  it("finds Tamil anywhere in the text", () => {
    expect(containsTamil("Hello இலங்கை")).toBe(true);
    expect(containsTamil("\u{11FC0}")).toBe(true);
    expect(containsTamil("ලංකා")).toBe(false);
    expect(containsTamil("")).toBe(false);
  });
});
