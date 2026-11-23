# Security Policy

## Supported versions

LankaDev is pre-release (0.x). Only the latest published version receives security fixes. A support policy for 1.x will be published with the 1.0 release.

## Reporting a vulnerability

**Do not open a public issue.** Report privately through GitHub:

1. Go to [Security → Report a vulnerability](https://github.com/dinithrathnayaka23/LankaDev/security/advisories/new).
2. Describe the issue, affected package and version, and steps to reproduce.

You should get an acknowledgement within 7 days. We will agree on a disclosure timeline with you and credit you in the advisory unless you prefer otherwise.

## Security design

- LankaDev packages make **no network requests** and collect **no telemetry**. All text processing runs locally.
- No `eval` or dynamic code execution.
- Translation strings and user text are treated as data, never as trusted HTML.
- Releases are published from CI with npm provenance; maintainers use 2FA.
