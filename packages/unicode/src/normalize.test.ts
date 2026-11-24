import { describe, expect, it } from "vitest";
import {
  normalizeSinhalaText,
  normalizeTamilText,
  SINHALA_SEQUENCE_FIXES,
  toSearchKey,
} from "./normalize.js";

const ZWJ = "\u{200D}";
const ZWNJ = "\u{200C}";
const hex = (text: string) =>
  Array.from(text, (c) => c.codePointAt(0)!.toString(16).padStart(4, "0"));

/** Small deterministic PRNG so the property test is reproducible. */
function rng(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1103515245 + 12345) % 2 ** 31;
    return state / 2 ** 31;
  };
}

describe("normalizeSinhalaText", () => {
  it("composes split vowel signs (NFC)", () => {
    expect(hex(normalizeSinhalaText("\u{0D9A}\u{0DD9}\u{0DCF}"))).toEqual(["0d9a", "0ddc"]);
    expect(hex(normalizeSinhalaText("\u{0D9A}\u{0DD9}\u{0DCA}"))).toEqual(["0d9a", "0dda"]);
    expect(hex(normalizeSinhalaText("\u{0D9A}\u{0DD9}\u{0DCF}\u{0DCA}"))).toEqual(["0d9a", "0ddd"]);
    expect(hex(normalizeSinhalaText("\u{0D9A}\u{0DD9}\u{0DDF}"))).toEqual(["0d9a", "0dde"]);
  });

  it.each(SINHALA_SEQUENCE_FIXES.map(([from, to]) => [hex(from).join(" "), from, to] as const))(
    "replaces %s with its atomic letter",
    (_label, from, to) => {
      expect(normalizeSinhalaText(from)).toBe(to);
      expect(normalizeSinhalaText(`ක ${from} ක`)).toBe(`ක ${to} ක`);
    },
  );

  it("never removes or reorders ZWJ/ZWNJ", () => {
    for (const text of [
      `ක්${ZWJ}ය`, // yansaya
      `ප්${ZWJ}ර`, // rakaransaya
      `ර්${ZWJ}ම`, // repaya
      `ත${ZWJ}්ව`, // touching letters
      `ක්${ZWNJ}ෂ`,
    ]) {
      expect(normalizeSinhalaText(text)).toBe(text);
    }
  });

  it("does not replace sequences broken by a joiner", () => {
    const text = `\u{0D91}${ZWJ}\u{0DCA}`;
    expect(normalizeSinhalaText(text)).toBe(text);
  });

  it("only applies NFC to text without Sinhala", () => {
    expect(normalizeSinhalaText("Cafe\u{0301}")).toBe("Caf\u{00E9}");
    expect(normalizeSinhalaText("")).toBe("");
  });

  it("is idempotent and keeps joiners on random Sinhala sequences", () => {
    const pool = [
      ...Array.from({ length: 0x0e00 - 0x0d80 }, (_, i) => String.fromCodePoint(0x0d80 + i)),
      ZWJ,
      ZWNJ,
      " ",
    ];
    const next = rng(42);
    for (let i = 0; i < 2000; i++) {
      let text = "";
      const length = 1 + Math.floor(next() * 8);
      for (let j = 0; j < length; j++) text += pool[Math.floor(next() * pool.length)]!;
      const once = normalizeSinhalaText(text);
      expect(normalizeSinhalaText(once), hex(text).join(" ")).toBe(once);
      expect(once.split(ZWJ).length).toBe(text.split(ZWJ).length);
      expect(once.split(ZWNJ).length).toBe(text.split(ZWNJ).length);
    }
  });
});

describe("normalizeTamilText", () => {
  it("composes split two-part vowel signs (NFC)", () => {
    expect(hex(normalizeTamilText("\u{0B95}\u{0BC6}\u{0BBE}"))).toEqual(["0b95", "0bca"]);
    expect(hex(normalizeTamilText("\u{0B95}\u{0BC7}\u{0BBE}"))).toEqual(["0b95", "0bcb"]);
    expect(hex(normalizeTamilText("\u{0B95}\u{0BC6}\u{0BD7}"))).toEqual(["0b95", "0bcc"]);
    expect(hex(normalizeTamilText("\u{0B92}\u{0BD7}"))).toEqual(["0b94"]);
  });

  it("keeps grantha spellings and joiners as typed", () => {
    for (const text of ["ஸ்ரீ", "ஶ்ரீ", "க்ஷ", `க்${ZWJ}ஷ`, `க்${ZWNJ}ஷ`]) {
      expect(normalizeTamilText(text)).toBe(text);
    }
  });

  it("is idempotent on random Tamil sequences", () => {
    const pool = Array.from({ length: 0x0c00 - 0x0b80 }, (_, i) =>
      String.fromCodePoint(0x0b80 + i),
    );
    const next = rng(7);
    for (let i = 0; i < 2000; i++) {
      let text = "";
      for (let j = 0; j < 6; j++) text += pool[Math.floor(next() * pool.length)]!;
      const once = normalizeTamilText(text);
      expect(normalizeTamilText(once)).toBe(once);
    }
  });
});

describe("toSearchKey", () => {
  it("collapses whitespace, trims and lowercases Latin", () => {
    expect(toSearchKey("  Sri \t  LANKA\n")).toBe("sri lanka");
    expect(toSearchKey("Sri\u{00A0}Lanka")).toBe("sri lanka");
  });

  it("removes soft hyphens, zero-width spaces, word joiners and BOMs", () => {
    expect(toSearchKey("\u{FEFF}ලං\u{200B}කා\u{00AD}\u{2060}")).toBe("ලංකා");
  });

  it("keeps joiners by default and strips them on request", () => {
    expect(toSearchKey(`ශ්${ZWJ}රී`)).toBe(`ශ්${ZWJ}රී`);
    expect(toSearchKey(`ශ්${ZWJ}රී`, { stripJoiners: true })).toBe("ශ්රී");
    expect(toSearchKey(`ක්${ZWNJ}ෂ`, { stripJoiners: true })).toBe("ක්ෂ");
    expect(toSearchKey(`ශ්${ZWJ}රී`, { stripJoiners: false })).toBe(`ශ්${ZWJ}රී`);
  });

  it("normalizes after removing joiners so split signs still compose", () => {
    expect(hex(toSearchKey(`ක\u{0DD9}${ZWJ}\u{0DCF}`, { stripJoiners: true }))).toEqual([
      "0d9a",
      "0ddc",
    ]);
  });

  it("matches split and composed spellings", () => {
    expect(toSearchKey("\u{0B95}\u{0BC6}\u{0BBE}")).toBe(toSearchKey("\u{0B95}\u{0BCA}"));
    expect(toSearchKey("\u{0D91}\u{0DCA}")).toBe(toSearchKey("\u{0D92}"));
  });

  it("returns an empty key for blank input", () => {
    expect(toSearchKey("   ")).toBe("");
  });
});
