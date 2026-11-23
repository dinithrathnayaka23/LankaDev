# Changesets

This folder is managed by [Changesets](https://github.com/changesets/changesets).

Add a changeset for every pull request that changes a published package under `packages/`:

```sh
pnpm changeset
```

Pick the affected packages and the bump type:

- `patch` — backward-compatible bug fix
- `minor` — backward-compatible feature
- `major` — breaking change (pre-1.0: use `minor` for breaking changes)

Write the summary for users of the package, not for reviewers. It becomes the changelog entry.

Docs-only, test-only and tooling-only PRs do not need a changeset.
