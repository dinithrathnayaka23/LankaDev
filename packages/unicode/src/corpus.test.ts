/**
 * Corpus-driven tests: every fixture in fixtures/language-corpus is checked against the public API
 * and against the built-in fallback segmenter.
 */
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { detectScript } from "./detect.js";
import { normalizeSinhalaText, normalizeTamilText } from "./normalize.js";
import { fallbackGraphemes, graphemes, truncate } from "./segment.js";

interface Fixture {
  id: string;
  input: string;
  expected: {
    script: string;
    graphemes: string[];
    nfc: string;
    normalized?: string;
  };
  notes: string;
  reviewedBy: string | null;
}

type CorpusName = "sinhala" | "tamil" | "mixed";

function load(name: CorpusName): Fixture[] {
  const url = new URL(`../../../fixtures/language-corpus/${name}.json`, import.meta.url);
  return JSON.parse(readFileSync(url, "utf8")) as Fixture[];
}

const corpus: Record<CorpusName, Fixture[]> = {
  sinhala: load("sinhala"),
  tamil: load("tamil"),
  mixed: load("mixed"),
};
const all = Object.values(corpus).flat();

const normalizers: Record<CorpusName, (text: string) => string> = {
  sinhala: normalizeSinhalaText,
  tamil: normalizeTamilText,
  mixed: (text) => normalizeTamilText(normalizeSinhalaText(text)),
};

const ZWJ = /\u{200D}/gu;
const ZWNJ = /\u{200C}/gu;
const count = (text: string, pattern: RegExp) => text.match(pattern)?.length ?? 0;

describe("language corpus", () => {
  it("meets the M4 size gate (≥ 30 Sinhala and ≥ 30 Tamil fixtures)", () => {
    expect(corpus.sinhala.length).toBeGreaterThanOrEqual(30);
    expect(corpus.tamil.length).toBeGreaterThanOrEqual(30);
  });

  it("has unique, prefixed ids and the documented shape", () => {
    const ids = all.map((f) => f.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const [name, prefix] of [
      ["sinhala", "si-"],
      ["tamil", "ta-"],
      ["mixed", "mx-"],
    ] as const) {
      for (const f of corpus[name]) {
        expect(f.id.startsWith(prefix), f.id).toBe(true);
        expect(f.notes.length, f.id).toBeGreaterThan(0);
        expect(f.reviewedBy === null || typeof f.reviewedBy === "string", f.id).toBe(true);
        expect(f.expected.graphemes.join(""), f.id).toBe(f.input);
      }
    }
  });

  for (const name of ["sinhala", "tamil", "mixed"] as const) {
    describe(name, () => {
      it.each(corpus[name].map((f) => [f.id, f] as const))("%s", (_id, f) => {
        expect(detectScript(f.input)).toBe(f.expected.script);
        expect(graphemes(f.input)).toEqual(f.expected.graphemes);
        expect(fallbackGraphemes(f.input)).toEqual(f.expected.graphemes);
        expect(f.input.normalize("NFC")).toBe(f.expected.nfc);

        const normalize = normalizers[name];
        const normalized = normalize(f.input);
        expect(normalized).toBe(f.expected.normalized ?? f.expected.nfc);
        expect(normalize(normalized)).toBe(normalized);
        expect(count(normalized, ZWJ)).toBe(count(f.input, ZWJ));
        expect(count(normalized, ZWNJ)).toBe(count(f.input, ZWNJ));

        for (let max = 0; max <= f.expected.graphemes.length; max++) {
          const result = truncate(f.input, max, { ellipsis: "" });
          // A prefix made of whole clusters (trailing whitespace may be trimmed).
          const clusters = graphemes(result);
          expect(f.expected.graphemes.slice(0, clusters.length)).toEqual(clusters);
          expect(clusters.length).toBeLessThanOrEqual(max);
        }
      });
    });
  }
});
