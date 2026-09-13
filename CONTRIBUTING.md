# Contributing

Contributions should keep the policy boundary narrow, testable, and explicit.
This repository is a companion to SourceRudder, not a fork of its upstream
project. Participation must follow the [Code of Conduct](CODE_OF_CONDUCT.md).

## Local development

1. The plugin runtime declares Node.js 20 or later. For local development, use
   Node.js 24 or a version accepted by the locked development dependency graph;
   CI runs Node.js 24. Node.js 20 is not currently tested.
2. Run `npm ci --ignore-scripts`.
3. Run `npm run check` and `npm run check:docs` before requesting review.
4. Run `npm run build` when validating the versioned deployment bundle.

The test suite uses Node's built-in test runner. The installed-bundle harness can
validate a local build without accessing a user's OpenCode configuration:

```sh
node scripts/verify-installed.mjs dist/sourcerudder-policy-v1.0.0.js
```

## Change expectations

- Keep changes focused on one observable behavior or documentation outcome.
- Preserve unrelated OpenCode permissions and host system text.
- Include tests with policy behavior changes.
- Record the exact local commands and observed results in the pull request.
- Do not add a native `websearch` or `webfetch` approval or fallback path.
- Do not add credentials, local configuration, or generated `dist/` output to
  version control.

## Intended review workflow

The intended path is:

1. Create or update an issue marked `needs-review`.
2. Obtain explicit human `status:approved` with approval provenance.
3. Start a focused `feat/*`, `fix/*`, or `docs/*` branch from `develop` and open
   a pull request to `develop`.
4. Use exactly one `type:*` label on the pull request and record verification,
   risk, and rollback evidence.
5. Use a separately authorized `release/*` pull request to `main`, then reverse
   sync to `develop`.

Hotfixes begin from `main`, merge through their intended pull-request path, then
reverse sync to `develop`.

This is a documented target workflow, not an enforced GitHub rule. Repository
administrators attempted protection after `main` and `develop` were created, but
it was unavailable on the private repository plan at the 2026-09-13 readback.
Human process and approval provenance remain required without platform
enforcement. Settings and branch protections must be re-read after the approved
public conversion in issue #4. Keep future planned reviews at or below 400 changed
lines unless a maintainer explicitly records an exception. The authorized initial
repository import is a bootstrap, not an ordinary pull request under that limit.

## License and authorization

Contributions are submitted under the repository [MIT License](LICENSE). Submit
only work you are authorized to license, preserve required third-party notices,
and identify any external material in the pull request.
