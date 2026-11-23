## What and why

<!-- What does this PR change, and why? Link the issue or milestone (e.g. "M2"). -->

## How to verify

<!-- Commands or steps a reviewer can run. -->

## Checklist (Definition of Done)

- [ ] `pnpm lint && pnpm typecheck && pnpm test && pnpm build` pass locally
- [ ] Public functions have TSDoc comments and at least one usage example
- [ ] Tests cover the happy path, invalid input and edge cases
- [ ] No `any` in public types
- [ ] No network calls, telemetry, `eval`, or module-level access to `window`/`document`
- [ ] Changeset added (`pnpm changeset`) if a published package changed
- [ ] Package README updated if the public API changed
- [ ] New linguistic data (schemes, fixtures) has a `PROVENANCE.md` entry and contains no real personal data
- [ ] Sinhala/Tamil behaviour that needs human judgement is labelled `needs-native-review`
