# Unicode handling (`@lankadev/unicode`)

How `@lankadev/unicode` detects scripts, normalizes text and splits it into user-perceived
characters. Every rule here is covered by tests and the
[language corpus](../fixtures/language-corpus/PROVENANCE.md).

## Script detection

| Script    | Code points                                                                                  |
| --------- | -------------------------------------------------------------------------------------------- |
| `sinhala` | Sinhala block `U+0D80–U+0DFF`, Sinhala Archaic Numbers `U+111E0–U+111FF`                     |
| `tamil`   | Tamil block `U+0B80–U+0BFF`, Tamil Supplement `U+11FC0–U+11FFF`                              |
| `latin`   | Unicode `Script=Latin`: ASCII and Latin-1 letters, Latin Extended, fullwidth Latin           |
| `common`  | `Script=Common` or `Script=Inherited`: digits, punctuation, spaces, symbols, emoji, ZWJ/ZWNJ |
| `other`   | Everything else, including unassigned code points outside the Sinhala and Tamil blocks       |

- Sinhala and Tamil are matched by **block**, so newly assigned letters are detected even on older
  runtimes. Latin uses the full `Script=Latin` property, a superset of the "Basic Latin + Latin-1"
  sketch in the plan.
- Sinhala Lith digits (`෦–෯`) and Tamil digits (`௦–௯`) are in their script blocks, so they count as
  Sinhala and Tamil. ASCII digits are `common`.
- `analyzeScripts` counts **code points**, not graphemes. Vowel signs and viramas count toward their
  script; `common` code points are not counted.
- `detectScript` returns the script with the most code points. It returns `"mixed"` when the
  second-largest script has at least **20 %** (`MIXED_SCRIPT_THRESHOLD`) of the counted code points,
  and `"unknown"` when nothing is counted (empty text, digits, punctuation or emoji only).

## Normalization

`normalizeSinhalaText` and `normalizeTamilText` are safe for display and storage. They are
idempotent and never remove or reorder ZWJ (`U+200D`) or ZWNJ (`U+200C`).

### 1. NFC (both functions)

| Script  | Typed as                    | Becomes      |
| ------- | --------------------------- | ------------ |
| Sinhala | `ෙ` `U+0DD9` + `ා` `U+0DCF` | `ො` `U+0DDC` |
| Sinhala | `ෙ` + `්` `U+0DCA`           | `ේ` `U+0DDA` |
| Sinhala | `ෙ` + `ා` + `්`              | `ෝ` `U+0DDD` |
| Sinhala | `ෙ` + `ෟ` `U+0DDF`          | `ෞ` `U+0DDE` |
| Tamil   | `ெ` `U+0BC6` + `ா` `U+0BBE` | `ொ` `U+0BCA` |
| Tamil   | `ே` `U+0BC7` + `ா`          | `ோ` `U+0BCB` |
| Tamil   | `ெ` + `ௗ` `U+0BD7`          | `ௌ` `U+0BCC` |
| Tamil   | `ஒ` `U+0B92` + `ௗ`          | `ஔ` `U+0B94` |

### 2. Sinhala sequence fixes (`normalizeSinhalaText` only)

These sequences look the same as one atomic letter but are not the encoding Unicode recommends. NFC
does not change them. An independent vowel never takes a dependent vowel sign in Sinhala, so these
replacements cannot change the meaning of valid text. Exported as `SINHALA_SEQUENCE_FIXES`.

| Sequence                 | Becomes      |
| ------------------------ | ------------ |
| `අ` + `ා`                | `ආ` `U+0D86` |
| `අ` + `ැ`                | `ඇ` `U+0D87` |
| `අ` + `ෑ`                | `ඈ` `U+0D88` |
| `උ` + `ෟ`                | `ඌ` `U+0D8C` |
| `ඍ` + `ෘ`                | `ඎ` `U+0D8E` |
| `ඏ` + `ෟ`                | `ඐ` `U+0D90` |
| `එ` + `්`                 | `ඒ` `U+0D92` |
| `එ` + `ෙ`                | `ඓ` `U+0D93` |
| `ඔ` + `්`                 | `ඕ` `U+0D95` |
| `ඔ` + `ෟ`                | `ඖ` `U+0D96` |
| `ෙ` + `ෙ` (two kombuvas) | `ෛ` `U+0DDB` |

Only exact neighbours are replaced. A ZWJ or ZWNJ between them blocks the replacement.

### 3. What is never changed

- **ZWJ/ZWNJ.** In Sinhala, the order of al-lakuna and ZWJ selects the conjunct form:

  | Form             | Encoding                               | Example |
  | ---------------- | -------------------------------------- | ------- |
  | Yansaya          | consonant + `්` + ZWJ + `ය`             | `ක්‍ය`   |
  | Rakaransaya      | consonant + `්` + ZWJ + `ර`             | `ප්‍ර`   |
  | Repaya           | `ර` + `්` + ZWJ + consonant             | `ර්‍ම`   |
  | Touching letters | consonant + ZWJ + `්` + consonant       | `ත‍්ව`   |
  | Explicit virama  | consonant + `්` + consonant (no joiner) | `ක්ෂ`    |

  Moving or removing the joiner changes the rendered word, so normalization leaves it alone.

- **Visual-order typing** (for example a kombuva typed before its consonant) is not reordered: it
  cannot be fixed without guessing.
- **Tamil grantha spellings** such as `ஸ்ரீ` and `ஶ்ரீ` are kept as typed.

### Search keys

`toSearchKey(text, { stripJoiners })` builds a comparison key. **Never store or display it.**

1. Remove soft hyphen `U+00AD`, zero-width space `U+200B`, word joiner `U+2060` and BOM `U+FEFF`.
2. With `stripJoiners: true`, also remove ZWJ and ZWNJ, so `ශ්‍රී` matches `ශ්රී`.
3. Lowercase (only cased scripts such as Latin change).
4. NFC and the Sinhala sequence fixes. This runs after the removals, because removing a joiner can
   bring two composable signs together.
5. Collapse whitespace runs to one space and trim.

## Grapheme clusters

`graphemes`, `graphemeLength` and `truncate` use `Intl.Segmenter` (extended grapheme clusters,
UAX #29). Unicode has no conjunct rule for Sinhala or Tamil, so:

| Text                | Clusters         |
| ------------------- | ---------------- |
| `කොළඹ`              | `කො` `ළ` `ඹ`     |
| `ශ්‍රී` (rakaransaya) | `ශ්‍` `රී`         |
| `වාක්‍ය` (yansaya)   | `වා` `ක්‍` `ය`    |
| `ஸ்ரீ`                | `ஸ்` `ரீ`          |
| `👍🏽` `🇱🇰` `👨‍👩‍👧`      | one cluster each |

A ZWJ conjunct is drawn as one shape but is two clusters. `truncate` therefore never stops on a
cluster that ends with ZWJ: the conjunct is kept or dropped whole (`truncate("වාක්‍යයක්", 3)` →
`"වා…"`, not `"වාක්‍…"`).

### Fallback without `Intl.Segmenter`

`isSegmenterSupported()` reports whether `Intl.Segmenter` exists (it does in every runtime in
ADR-0005). Without it, a built-in UAX #29 implementation is used. Tests check that it gives the same
clusters as `Intl.Segmenter` for the whole corpus and for emoji, flags, tag sequences and CR LF.

Fallback limitations:

- No Hangul syllable rules (GB6–GB8) and no Prepend characters (GB9b).
- No Indic conjunct rule (GB9c). That rule covers Devanagari, Bengali, Gujarati, Oriya, Telugu and
  Malayalam, not Sinhala or Tamil.
- Spacing marks follow `General_Category=Mc`; a few non-`Mc` spacing marks (Thai `ำ`, Lao `ຳ`) are
  not attached.
- The `locale` argument is ignored.

### Words

`words(text)` returns the `isWordLike` segments of `Intl.Segmenter` with `granularity: "word"`.
Sinhala and Tamil words are split at spaces and punctuation; ZWJ stays inside the word. The fallback
splits on runs of letters, marks, digits, `_`, ZWJ and ZWNJ, joined across `'`, `’` and `.`, and
across `,` between digits. It matches `Intl.Segmenter` for Sinhala, Tamil and common English, but
is not a full UAX #29 word segmenter.

## Needs native review

- Repaya and touching-letter encodings (`si-repaya`, `si-touching` in the corpus).
- Whether apps should treat ZWJ conjuncts as one character in counters (for example a 10-character
  limit). `graphemeLength` follows Unicode and counts them as two.
- Tamil `க்ஷ` and `ஸ்ரீ` are two clusters but usually drawn as one ligature.
