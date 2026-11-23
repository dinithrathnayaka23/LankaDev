# 0003. Locale state ownership

- Status: Accepted
- Date: 2026-11-23

## Context

Source plan §17 asks whether LankaDev owns locale state or accepts it from the host. Hosts differ:

- Plain React apps want a provider that "just works".
- Apps using i18next already hold the language in `i18n.language`.
- Next.js App Router apps derive locale from the URL segment (`/si`, `/ta`) and must render the same locale on server and client to avoid hydration mismatch.

The source plan's API contract also requires _no hidden global state_ and _explicit locale parameters_.

## Decision

`LankaProvider` supports **both** modes, following React's controlled/uncontrolled input pattern:

- **Uncontrolled (default):** `initialLocale` (falls back to `config.defaultLocale`). The provider holds state; `setLocale` updates it.
- **Controlled:** when `locale` is passed, the provider never changes locale itself. `setLocale(next)` only calls `onLocaleChange(next)`; the host updates the prop.
- Switching between modes during a component's lifetime logs a dev warning (as React does for inputs).

Other rules:

- No module-level state. All state lives in React context or is passed explicitly.
- Non-React APIs (`formatLKR`, `detectScript`, `transliterate`) always take the locale/scheme as an argument.
- The provider never reads `window`, `localStorage`, `navigator.language` or cookies. Persistence (URL, cookie, profile) is the host's job; docs show each option.
- `syncHtmlLang` updates `<html lang>` in an effect after mount only.

## Consequences

- Works with i18next and next-intl without two sources of truth.
- SSR-safe by construction: the server passes `locale`, the client receives the same prop.
- Hosts wanting persistence write a few lines themselves; examples supply the code.
