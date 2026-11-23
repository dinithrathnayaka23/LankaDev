# 0005. Supported runtime and framework versions

- Status: Accepted
- Date: 2026-11-23

## Context

Release status on 2026-11-23 (nodejs.org `dist/index.json`, npm registry):

| Line | Latest | Status |
| ---- | ------ | ------ |
| Node.js 22 "Jod" | 22.23.5 | Maintenance LTS |
| Node.js 24 "Krypton" | 24.22.3 | LTS |
| Node.js 26 "Lithium" | 26.13.1 | Active LTS |
| React | 19.3.1 | Current; 18.3 still widely deployed |
| Next.js | 16.4.6 | Current; 15.x still widely deployed |
| next-intl | 4.15.3 | Current |
| i18next / react-i18next | 27.2.4 / 18.0.3 | Current |

The implementation plan draft said "Next.js 15+" and "Node 22/24"; both need updating to current lines.

## Decision

| Target       | Supported range                         | Tested in CI                |
| ------------ | --------------------------------------- | --------------------------- |
| Node.js      | `>=22` (`engines`)                      | 22, 24, 26                  |
| React        | `^18.3.0 \|\| ^19.0.0` (peer)           | 18.3.x, 19.x latest         |
| react-dom    | same as React                           | same                        |
| Next.js      | `^15.0.0 \|\| ^16.0.0` (peer of `@lankadev/next`) App Router only | 15.x latest, 16.x latest |
| TypeScript (consumers) | `>=5.4`                       | 5.x latest                  |
| Browsers     | Last 2 versions of Chrome, Edge, Firefox, Safari; iOS Safari ≥ 16; Android Chrome latest | Playwright: Chromium, Firefox, WebKit + mobile viewport |

Notes:

- `Intl.Segmenter` is available in all supported runtimes; a fallback still ships because some embedded WebViews lack it.
- Pages Router: not supported in v1 (source plan lists it "only if supported").
- Dev tooling uses Node 24 (`.nvmrc`) and pnpm via Corepack.

## Consequences

- CI matrix: 3 Node versions × (React 18.3, 19) for the React package; Next 15/16 for the Next example.
- Dropping a range is a breaking change after 1.0 (documented in the support policy at M13).
- When Node 22 reaches end-of-life (April 2027), drop it in the next major.
