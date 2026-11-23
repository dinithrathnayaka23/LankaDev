# 0002. i18n integration strategy

- Status: Accepted
- Date: 2026-11-23

## Context

Translation resource management, message formatting and locale routing are solved by mature MIT-licensed libraries, all released within the last week of this audit ([competitor-audit.md §2](../research/competitor-audit.md)):

- `i18next` 27.2.4 / `react-i18next` 18.0.3 — dominant in React SPAs.
- `next-intl` 4.15.3 — dominant App Router solution; owns routing, middleware and server/client message loading.
- `react-intl` 12.2.0 — ICU/FormatJS.

The nearest regional competitor (`bhasha-js`) ships its own translation engine; that is the position the source plan tells us to avoid.

## Decision

1. LankaDev ships **no translation engine, no message format and no routing**.
2. First-class integrations are **examples + docs**, not adapter packages:
   - `examples/react-vite` → `i18next` + `react-i18next` (M8).
   - `examples/next-app-router` → `next-intl` (M9).
3. `LankaProvider` runs in **controlled mode** in both examples, so the i18n library stays the source of truth for the active language (see ADR-0003).
4. Small helpers are added to `@lankadev/core` only when they remove real boilerplate seen in the examples (candidate: `i18nextFallbackLng(config)`). Each helper must be pure and engine-agnostic.
5. `react-intl` gets a docs section only in v1.
6. `@lankadev/next` does **not** reimplement next-intl's middleware. It provides `getLocaleFromRequest` and a client provider; routing is composed with next-intl.

## Consequences

- Smaller API surface and lower maintenance.
- Users must install an i18n library themselves; quick start must make this a single copy-paste step.
- If a real adapter becomes necessary (e.g. shared fallback config), it ships as a subpath (`@lankadev/core/i18next`) with the i18n library as an optional peer dependency.
