# Contributing

Contributions should keep the policy boundary narrow, testable, and explicit.
This repository is a private companion to SourceRudder, not a fork of its public
upstream project.

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
administrators must configure and read back branch protection separately after
the branches exist. Keep future planned reviews at or below 400 changed lines
unless a maintainer explicitly records an exception. The authorized initial
repository import is a bootstrap, not an ordinary pull request under that limit.

## License and authorization

No license is granted by this repository. Do not submit third-party material or
assume that contribution or reuse rights have been established without maintainer
authorization.
