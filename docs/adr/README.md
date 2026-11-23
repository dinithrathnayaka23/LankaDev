# Architecture Decision Records

Short records of decisions that shape LankaDev. One decision per file. Never rewrite an accepted ADR — supersede it with a new one and link both ways.

| ADR                                               | Title                                    | Status                            |
| ------------------------------------------------- | ---------------------------------------- | --------------------------------- |
| [0001](0001-package-boundaries.md)                | Package boundaries and naming            | Accepted                          |
| [0002](0002-i18n-integration-strategy.md)         | i18n integration strategy                | Accepted                          |
| [0003](0003-locale-state-ownership.md)            | Locale state ownership                   | Accepted                          |
| [0004](0004-transliteration-scheme-and-engine.md) | Transliteration scheme and engine        | Accepted (hands-on audit pending) |
| [0005](0005-supported-versions.md)                | Supported runtime and framework versions | Accepted                          |
| [0006](0006-module-format-and-exports.md)         | Module format, exports and build         | Accepted                          |
| [0007](0007-license-and-data-provenance.md)       | License and data provenance              | Accepted                          |

## Template

```md
# NNNN. Title

- Status: Proposed | Accepted | Superseded by NNNN
- Date: YYYY-MM-DD

## Context

What forces are at play? Link research.

## Decision

What we will do. Be specific.

## Consequences

What becomes easier, harder, or must be done next.
```
