---
"@lankadev/unicode": minor
---

Add script detection (`getCharScript`, `detectScript`, `analyzeScripts`, `containsSinhala`, `containsTamil`), display-safe normalization that keeps ZWJ/ZWNJ (`normalizeSinhalaText`, `normalizeTamilText`), `toSearchKey` for search, and grapheme-aware helpers (`graphemes`, `graphemeLength`, `truncate`, `words`, `isSegmenterSupported`) with a built-in fallback when `Intl.Segmenter` is missing. Removes the `PACKAGE_NAME` placeholder export.
