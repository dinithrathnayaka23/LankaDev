import { describe, expect, it } from "vitest";
import { getCharScript, SCRIPT_RANGES } from "./ranges.js";

const cp = (char: string) => char.codePointAt(0)!;

describe("getCharScript", () => {
  it.each([
    [0x0d85, "sinhala"], // අ
    [0x0dca, "sinhala"], // al-lakuna
    [0x0de6, "sinhala"], // Sinhala Lith digit zero
    [0x0df4, "sinhala"], // kunddaliya
    [0x0d80, "sinhala"], // first code point of the block (unassigned)
    [0x0dff, "sinhala"], // last code point of the block
    [0x111e1, "sinhala"], // Sinhala Archaic Number one
    [0x0b85, "tamil"], // அ
    [0x0bcd, "tamil"], // pulli
    [0x0be7, "tamil"], // Tamil digit one
    [0x11fc0, "tamil"], // Tamil Supplement fraction
    [0x41, "latin"], // A
    [0x7a, "latin"], // z
    [0xe9, "latin"], // é
    [0xaa, "latin"], // ª
    [0x0100, "latin"], // Latin Extended-A
    [0xff21, "latin"], // fullwidth A
    [0x30, "common"], // 0
    [0x20, "common"], // space
    [0x40, "common"], // @ (just below A)
    [0x5b, "common"], // [ (just above Z)
    [0x60, "common"], // ` (just below a)
    [0x7b, "common"], // { (just above z)
    [0xd7, "common"], // ×
    [0x200d, "common"], // ZWJ (Inherited)
    [0x0301, "common"], // combining acute (Inherited)
    [0x0964, "common"], // devanagari danda (Common)
    [0x1f44d, "common"], // 👍
    [0x0928, "other"], // न
    [0x0e01, "other"], // Thai
    [0xd800, "other"], // lone surrogate
    [0x0c80, "other"], // Kannada, just after the Tamil block's neighbour Telugu
  ] as const)("U+%s → %s", (codePoint, script) => {
    expect(getCharScript(codePoint)).toBe(script);
  });

  it("classifies every assigned Sinhala and Tamil letter by block", () => {
    for (const char of "කගචජටඩතදපබමයරලවසහළෆ") expect(getCharScript(cp(char))).toBe("sinhala");
    for (const char of "கஙசஞடணதநபமயரலவழளறனஜஷஸஹ") expect(getCharScript(cp(char))).toBe("tamil");
  });

  it.each([-1, 0x110000, 1.5, Number.NaN, Number.POSITIVE_INFINITY])(
    "throws RangeError for %s",
    (codePoint) => {
      expect(() => getCharScript(codePoint)).toThrow(RangeError);
    },
  );
});

describe("SCRIPT_RANGES", () => {
  it("lists the four documented blocks and is frozen", () => {
    expect(SCRIPT_RANGES.map((r) => [r.block, r.start, r.end])).toEqual([
      ["Sinhala", 0x0d80, 0x0dff],
      ["Sinhala Archaic Numbers", 0x111e0, 0x111ff],
      ["Tamil", 0x0b80, 0x0bff],
      ["Tamil Supplement", 0x11fc0, 0x11fff],
    ]);
    expect(Object.isFrozen(SCRIPT_RANGES)).toBe(true);
    expect(SCRIPT_RANGES.every((r) => Object.isFrozen(r))).toBe(true);
  });
});
