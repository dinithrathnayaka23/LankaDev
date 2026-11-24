#!/usr/bin/env node
/**
 * M0 transliteration audit runner.
 *
 * Runs third-party transliteration packages against words.json and prints
 * strict (natural spelling) and best-variant exact-match scores.
 *
 * SAFETY: this executes code from npm packages. Install them in an isolated,
 * throwaway directory with lifecycle scripts disabled, then pass that
 * directory's node_modules path as the first argument:
 *
 *   mkdir /tmp/lankadev-audit && cd /tmp/lankadev-audit && npm init -y
 *   npm install --ignore-scripts sinhala-text-converters @siyabasa/singlish \
 *     @felix-tech/singlish-js singlish-pro @sinhala-typer/typing-engine \
 *     singlish-sinhala @piraisoodan/tanglish @vm75/inditrans \
 *     @indic-transliteration/sanscript indic-transliterator
 *   node <repo>/docs/research/transliteration-audit/run-audit.mjs /tmp/lankadev-audit/node_modules
 *
 * Optional: `--json out.json` writes per-word outputs for the audit report.
 */
import { createRequire } from "node:module";
import { readFile, writeFile } from "node:fs/promises";
import { pathToFileURL, fileURLToPath } from "node:url";
import path from "node:path";

const [, , nodeModules, flag, outFile] = process.argv;
if (!nodeModules) {
  console.error("usage: run-audit.mjs <path-to-node_modules> [--json out.json]");
  process.exit(1);
}

const here = path.dirname(fileURLToPath(import.meta.url));
const words = JSON.parse(await readFile(path.join(here, "words.json"), "utf8"));
const req = createRequire(path.join(path.resolve(nodeModules), "_.js"));

async function load(name) {
  try {
    return req(name);
  } catch {
    return import(pathToFileURL(req.resolve(name)).href);
  }
}

/** Each adapter returns an async factory producing (text) => string. */
const adapters = {
  sinhala: {
    "sinhala-text-converters": async () => {
      const m = await load("sinhala-text-converters");
      return (t) => m.singlishToUnicode(t);
    },
    "@siyabasa/singlish": async () => {
      const m = await load("@siyabasa/singlish");
      return (t) => m.convertSinglishToSinhala(t);
    },
    "@felix-tech/singlish-js": async () => {
      const m = await load("@felix-tech/singlish-js");
      return (t) => m.transliterate(t);
    },
    "singlish-pro": async () => {
      const m = await load("singlish-pro");
      return (t) => m.transliterate(t);
    },
    "@sinhala-typer/typing-engine": async () => {
      const m = await load("@sinhala-typer/typing-engine");
      const phonetic = m.getLanguage("si").inputMethods.find((x) => x.id === "phonetic");
      return (t) => {
        let state = phonetic.initialState();
        let text = "";
        for (const char of t) {
          const { state: next, edit } = phonetic.type(state, { char });
          state = next;
          text = text.slice(0, text.length - edit.deleteCount) + edit.insertText;
        }
        return text;
      };
    },
    "singlish-sinhala": async () => {
      const m = await load("singlish-sinhala");
      const wasm = await readFile(
        path.join(path.resolve(nodeModules), "singlish-sinhala", "singlish_core_bg.wasm"),
      );
      await m.default(wasm);
      return (t) => m.transliterate(t);
    },
    "@vm75/inditrans (itrans→sinhala)": async () => {
      const m = await load("@vm75/inditrans");
      await m.init();
      return (t) => m.transliterate(t, m.Script.itrans, m.Script.sinhala);
    },
  },
  tamil: {
    "@piraisoodan/tanglish": async () => {
      const m = await load("@piraisoodan/tanglish");
      return (t) => m.transliterate(t);
    },
    "indic-transliterator": async () => {
      const m = await load("indic-transliterator");
      return (t) => m.transliterate(t, "tamil");
    },
    "@vm75/inditrans (itrans→tamil)": async () => {
      const m = await load("@vm75/inditrans");
      await m.init();
      return (t) => m.transliterate(t, m.Script.itrans, m.Script.tamil);
    },
    "@indic-transliteration/sanscript (itrans→tamil)": async () => {
      const m = await load("@indic-transliteration/sanscript");
      const S = m.default ?? m;
      return (t) => S.t(t, "itrans", "tamil");
    },
  },
};

const nfc = (s) => (typeof s === "string" ? s.normalize("NFC") : String(s));
const noJoiners = (s) => nfc(s).replace(/[\u200c\u200d]/g, "");

const report = {};
for (const lang of ["sinhala", "tamil"]) {
  console.log(`\n=== ${lang} (${words[lang].length} words) ===`);
  console.log("package | strict | best-variant | best-variant ignoring ZWJ/ZWNJ");
  for (const [name, factory] of Object.entries(adapters[lang])) {
    let fn;
    try {
      fn = await factory();
    } catch (e) {
      console.log(`${name} | LOAD ERROR: ${e.message.slice(0, 120)}`);
      report[name] = { error: e.message };
      continue;
    }
    let strict = 0,
      best = 0,
      bestLoose = 0;
    const rows = [];
    for (const w of words[lang]) {
      const outputs = w.variants.map((v) => {
        try {
          return nfc(fn(v));
        } catch (e) {
          return `ERROR: ${e.message}`;
        }
      });
      const exp = nfc(w.expected);
      if (outputs[0] === exp) strict++;
      if (outputs.some((o) => o === exp)) best++;
      if (outputs.some((o) => noJoiners(o) === noJoiners(exp))) bestLoose++;
      rows.push({
        id: w.id,
        expected: exp,
        outputs: Object.fromEntries(w.variants.map((v, i) => [v, outputs[i]])),
      });
    }
    const n = words[lang].length;
    console.log(`${name} | ${strict}/${n} | ${best}/${n} | ${bestLoose}/${n}`);
    report[name] = { lang, strict, best, bestLoose, n, rows };
  }
}

if (flag === "--json" && outFile) {
  await writeFile(outFile, JSON.stringify(report, null, 2), "utf8");
  console.log(`\nwrote ${outFile}`);
}
