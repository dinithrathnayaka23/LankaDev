import { afterEach, describe, expect, it, vi } from "vitest";
import {
  fallbackGraphemes,
  fallbackWords,
  graphemeLength,
  graphemes,
  isSegmenterSupported,
  truncate,
  words,
} from "./segment.js";

const ZWJ = "\u{200D}";

/** Hides Intl.Segmenter while keeping the rest of Intl. */
function withoutSegmenter() {
  vi.stubGlobal("Intl", Object.create(Intl, { Segmenter: { value: undefined } }) as typeof Intl);
}

afterEach(() => {
  vi.unstubAllGlobals();
});

/** Extra strings beyond the corpus that exercise each fallback rule. */
const RULE_CASES = [
  "a\r\nb", // GB3 CR × LF
  "a\rb", // lone CR
  "a\nb\n", // LF
  "\u{0301}a", // leading combining mark
  "a\u{0007}\u{0301}", // mark after a control starts a new cluster
  "ක\u{200B}ා", // ZWSP (control) separates
  "\u{00A9}\u{FE0F}", // © + VS16
  "\u{1F44D}\u{1F3FD}", // skin tone
  `\u{1F468}${ZWJ}\u{1F469}${ZWJ}\u{1F467}${ZWJ}\u{1F466}`, // family
  `\u{1F3F3}\u{FE0F}${ZWJ}\u{1F308}`, // rainbow flag
  `a${ZWJ}\u{1F308}`, // ZWJ after a non-pictograph does not join
  `\u{1F44D}\u{0D82}${ZWJ}\u{1F308}`, // spacing mark breaks the emoji sequence
  "\u{1F1F1}\u{1F1F0}\u{1F1EE}\u{1F1F3}\u{1F1F1}", // flags + odd indicator
  "\u{1F3F4}\u{E0067}\u{E0062}\u{E0073}\u{E0063}\u{E0074}\u{E007F}", // tag sequence (Scotland)
  "e\u{0301}\u{0302}", // stacked marks
  "क्षि", // Devanagari ksha (GB9c differs, excluded)
];

describe("fallbackGraphemes", () => {
  it("matches Intl.Segmenter for every rule case (except Indic GB9c)", () => {
    const segmenter = new Intl.Segmenter("und", { granularity: "grapheme" });
    for (const text of RULE_CASES.slice(0, -1)) {
      const expected = Array.from(segmenter.segment(text), (s) => s.segment);
      expect(fallbackGraphemes(text), JSON.stringify(text)).toEqual(expected);
    }
  });

  it("does not implement GB9c Indic conjuncts (documented limitation)", () => {
    expect(fallbackGraphemes("क्षि")).toEqual(["क्", "षि"]);
    expect(graphemes("क्षि")).toEqual(["क्षि"]);
  });

  it("returns an empty array for empty text", () => {
    expect(fallbackGraphemes("")).toEqual([]);
  });
});

describe("graphemes / graphemeLength", () => {
  it("splits Sinhala into clusters (no conjunct rule for Sinhala)", () => {
    expect(graphemes("ශ්‍රී ලංකා")).toEqual([`ශ්${ZWJ}`, "රී", " ", "ලං", "කා"]);
    expect(graphemeLength("කොළඹ")).toBe(3);
  });

  it("counts emoji as one cluster", () => {
    expect(graphemeLength("👍🏽")).toBe(1);
    expect(graphemeLength("🇱🇰")).toBe(1);
  });

  it("accepts a locale and throws RangeError for invalid ones", () => {
    expect(graphemes("කා", "si-LK")).toEqual(["කා"]);
    expect(() => graphemes("x", "not a locale!")).toThrow(RangeError);
  });

  it("keeps working after the segmenter cache is cleared", () => {
    for (let i = 0; i < 40; i++) expect(graphemes("ab", `en-x-c${i}`)).toEqual(["a", "b"]);
  });

  it("uses the fallback when Intl.Segmenter is missing", () => {
    withoutSegmenter();
    expect(isSegmenterSupported()).toBe(false);
    expect(graphemes("ශ්‍රී ලංකා")).toEqual([`ශ්${ZWJ}`, "රී", " ", "ලං", "කා"]);
    expect(graphemeLength("👍🏽")).toBe(1);
  });

  it("uses the fallback when Intl itself is missing", () => {
    vi.stubGlobal("Intl", undefined);
    expect(isSegmenterSupported()).toBe(false);
    expect(graphemes("கொ")).toEqual(["கொ"]);
  });
});

describe("isSegmenterSupported", () => {
  it("is true on supported runtimes", () => {
    expect(isSegmenterSupported()).toBe(true);
  });
});

describe("truncate", () => {
  it("returns text unchanged when it fits", () => {
    expect(truncate("ලංකා", 2)).toBe("ලංකා");
    expect(truncate("ලංකා", 5)).toBe("ලංකා");
    expect(truncate("", 0)).toBe("");
  });

  it("counts the ellipsis toward the limit", () => {
    expect(truncate("Hello world", 8, { ellipsis: "..." })).toBe("Hello...");
    expect(truncate("Hello world", 6)).toBe("Hello…");
  });

  it("trims whitespace before the ellipsis", () => {
    expect(truncate("ශ්‍රී ලංකාව", 4)).toBe("ශ්‍රී…");
  });

  it("never splits a grapheme cluster", () => {
    expect(truncate("කොළඹ නගරය", 2)).toBe("කො…");
    expect(truncate("👍🏽👍🏽👍🏽", 2)).toBe("👍🏽…");
    expect(truncate("🇱🇰🇮🇳🇱🇰", 2)).toBe("🇱🇰…");
  });

  it("does not end on a cluster ending with ZWJ (Sinhala conjuncts stay whole)", () => {
    // Clusters: වා ක්‍ ය ය ක්
    expect(truncate("වාක්‍යයක්", 3)).toBe("වා…");
    expect(truncate("වාක්‍යයක්", 4)).toBe("වාක්‍ය…");
    // Clusters: ශ්‍ රී ...: nothing left before the ellipsis.
    expect(truncate("ශ්‍රී ලංකාව", 2)).toBe("…");
  });

  it("handles limits smaller than the ellipsis", () => {
    expect(truncate("Hello", 0)).toBe("");
    expect(truncate("Hello", 2, { ellipsis: "..." })).toBe("..");
    expect(truncate("Hello", 3, { ellipsis: "..." })).toBe("...");
  });

  it("supports an empty ellipsis", () => {
    expect(truncate("Hello", 3, { ellipsis: "" })).toBe("Hel");
  });

  it("accepts a locale", () => {
    expect(truncate("தமிழ்நாடு", 3, { locale: "ta-LK" })).toBe("தமி…");
  });

  it.each([-1, 1.5, Number.NaN, Number.POSITIVE_INFINITY])(
    "throws RangeError for maxGraphemes %s",
    (max) => {
      expect(() => truncate("x", max)).toThrow(RangeError);
    },
  );

  it("works with the fallback segmenter", () => {
    withoutSegmenter();
    expect(truncate("වාක්‍යයක්", 3)).toBe("වා…");
  });
});

describe("words", () => {
  const SAMPLES = [
    "ශ්‍රී ලංකාව, Sri Lanka!",
    "நான் பள்ளிக்குச் செல்கிறேன்.",
    "මම පාසල් යමි 👍🏽",
    "don't stop: 3.14 or 1,000 e.g. a_b",
    "Helloලංකා",
    "෧෨ ௧௨ 12",
    "",
  ];

  it("returns word-like segments only", () => {
    expect(words("ශ්‍රී ලංකාව, Sri Lanka!")).toEqual(["ශ්‍රී", "ලංකාව", "Sri", "Lanka"]);
    expect(words("👍🏽 ... !")).toEqual([]);
  });

  it("accepts a locale", () => {
    expect(words("தமிழ் நாடு", "ta-LK")).toEqual(["தமிழ்", "நாடு"]);
  });

  it("fallback matches Intl.Segmenter on Sinhala, Tamil and common English", () => {
    const segmenter = new Intl.Segmenter("und", { granularity: "word" });
    for (const text of SAMPLES) {
      const expected = Array.from(segmenter.segment(text))
        .filter((s) => s.isWordLike)
        .map((s) => s.segment);
      expect(fallbackWords(text), text).toEqual(expected);
    }
  });

  it("uses the fallback when Intl.Segmenter is missing", () => {
    withoutSegmenter();
    expect(words("ශ්‍රී ලංකාව, Sri Lanka!")).toEqual(["ශ්‍රී", "ලංකාව", "Sri", "Lanka"]);
  });
});
