# @lankadev/unicode

Script detection, normalization and grapheme-aware text helpers for Sinhala and Tamil Unicode text.
Framework-agnostic, zero dependencies, no network calls.

> **Status:** pre-release.

## Install

```sh
npm install @lankadev/unicode
```

## Quick start

```ts
import {
  detectScript,
  graphemeLength,
  normalizeSinhalaText,
  toSearchKey,
  truncate,
} from "@lankadev/unicode";

detectScript("ශ්‍රී ලංකාව"); // "sinhala"
detectScript("Hello ලංකා"); // "mixed"

normalizeSinhalaText(userInput); // NFC + safe Sinhala fixes; keeps ZWJ
graphemeLength("කොළඹ"); // 3 ("කොළඹ".length is 4)
truncate("ශ්‍රී ලංකාව", 4); // "ශ්‍රී…"

// Compare, never store:
toSearchKey(query, { stripJoiners: true }) === toSearchKey(title, { stripJoiners: true });
```

## API

### Script detection

| Function                 | Returns                                                                                    |
| ------------------------ | ------------------------------------------------------------------------------------------ |
| `getCharScript(cp)`      | `"sinhala" \| "tamil" \| "latin" \| "common" \| "other"` for one code point                |
| `detectScript(text)`     | Dominant script, `"mixed"` (second script ≥ 20 %) or `"unknown"` (no letters)              |
| `analyzeScripts(text)`   | `{ sinhala, tamil, latin, other, total }` code point counts; digits, spaces, emoji skipped |
| `containsSinhala(text)`  | `true` if any code point is in a Sinhala block                                             |
| `containsTamil(text)`    | `true` if any code point is in a Tamil block                                               |
| `SCRIPT_RANGES`          | The Sinhala and Tamil blocks used for detection                                            |
| `MIXED_SCRIPT_THRESHOLD` | `0.2`                                                                                      |

`getCharScript` throws `RangeError` for values that are not code points.

### Normalization

| Function                      | Use                                                                                     |
| ----------------------------- | --------------------------------------------------------------------------------------- |
| `normalizeSinhalaText(text)`  | Display and storage. NFC plus `SINHALA_SEQUENCE_FIXES` (e.g. `එ` + `්` → `ඒ`).           |
| `normalizeTamilText(text)`    | Display and storage. NFC (composes split vowel signs such as `ெ` + `ா`).                |
| `toSearchKey(text, options?)` | Search and comparison only. Lowercase, collapsed whitespace, optional ZWJ/ZWNJ removal. |

Both normalizers are idempotent and **never remove or reorder ZWJ/ZWNJ**, which select Sinhala
yansaya, rakaransaya, repaya and touching letters.

### Graphemes and words

| Function                        | Returns                                                                  |
| ------------------------------- | ------------------------------------------------------------------------ |
| `graphemes(text, locale?)`      | User-perceived characters (extended grapheme clusters)                   |
| `graphemeLength(text, locale?)` | Number of user-perceived characters                                      |
| `truncate(text, max, options?)` | At most `max` characters including the ellipsis (`"…"` by default)       |
| `words(text, locale?)`          | Word-like segments                                                       |
| `isSegmenterSupported()`        | `true` if `Intl.Segmenter` exists; otherwise a built-in fallback is used |

`truncate` never splits a cluster and never stops inside a ZWJ conjunct: `truncate("වාක්‍යයක්", 3)` is
`"වා…"`, not `"වාක්‍…"`. It throws `RangeError` if `max` is not a non-negative integer.

Unicode has no conjunct rule for Sinhala, so `graphemes("ක්‍ය")` is `["ක්‍", "ය"]`.

See [docs/unicode.md](../../docs/unicode.md) for every rule, the fallback's limitations and the
cases that still need native-speaker review.

## License

MIT
