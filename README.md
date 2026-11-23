# LankaDev

A Sinhala, Tamil and English developer toolkit for React and Next.js applications.

> **Status:** pre-release. The monorepo foundation is in place; package APIs land milestone by milestone — see the [implementation plan](docs/IMPLEMENTATION_PLAN.md).

LankaDev does **not** replace your i18n library. It works alongside [i18next](https://www.i18next.com/) and [next-intl](https://next-intl.dev/) and adds what they lack for Sri Lanka: `si-LK` / `ta-LK` / `en-LK` locale conventions, LKR formatting, Sinhala/Tamil Unicode utilities, and Singlish/Tanglish transliteration input.

## Packages

| Package                                                 | Purpose                                                           |
| ------------------------------------------------------- | ----------------------------------------------------------------- |
| [`@lankadev/core`](packages/core)                       | Locale types, configuration, fallback, LKR/number/date formatting |
| [`@lankadev/unicode`](packages/unicode)                 | Script detection, normalization, grapheme-aware text helpers      |
| [`@lankadev/transliteration`](packages/transliteration) | Singlish → Sinhala and Tanglish → Tamil engines                   |
| [`@lankadev/react`](packages/react)                     | Provider, hooks, language switcher, transliteration input         |
| [`@lankadev/next`](packages/next)                       | Next.js App Router helpers (server + client entries)              |

## Principles

- Works with the i18n tools you already use.
- No network calls or telemetry. All text processing runs locally.
- Small, tree-shakeable, framework-agnostic core.
- Correctness before feature count; limitations documented honestly.

## Documentation

- [Implementation plan](docs/IMPLEMENTATION_PLAN.md)
- [MVP scope and non-goals](docs/SCOPE.md)
- [Architecture decision records](docs/adr/)
- [Ecosystem audit](docs/research/competitor-audit.md)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Quick start:

```sh
corepack enable
pnpm install
pnpm build && pnpm test
```

## License

[MIT](LICENSE)
