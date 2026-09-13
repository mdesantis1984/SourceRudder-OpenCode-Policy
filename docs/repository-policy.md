# Repository Policy

This document records the intended operating model. It distinguishes local
repository artifacts from GitHub settings, which require administrator action and
platform readback.

## Current profile

| Topic                 | Current evidence                    | Intended state                                   |
| --------------------- | ----------------------------------- | ------------------------------------------------ |
| Visibility            | Private repository, read 2026-09-13 | Public conversion approved in issue #4; pending publication gate. |
| Default branch        | `main` at `033512c`                 | Use `main` for authorized releases.              |
| Development branch    | `develop` at `033512c`              | Use as the integration branch.                   |
| Package publication   | `private: true` in `package.json`   | No npm publication.                              |
| Upstream relationship | README links to public SourceRudder | Companion plugin; not a fork.                    |
| Automation            | `.github/workflows/ci.yml`          | Run verification for pushes and pull requests.   |
| Licensing             | No license file                     | No license granted; maintainer decision pending. |
| Security reporting    | `SECURITY.md`                       | Use GitHub private reporting when enabled; otherwise request a private channel through a minimal public issue. |

## Intended GitHub controls

Classic protection was attempted after `main` and `develop` were created, but
GitHub returned HTTP 403 because private branch protection is unavailable on the
current plan. Rulesets are also unavailable under that plan. Both branches were
unprotected at the 2026-09-13 readback.

The desired controls remain pull-request review, passing CI, restricted force
pushes, and restricted branch deletions. They are not enabled or enforced by this
document or CI. GitHub settings and branch protections must be re-read after
conversion; this document does not prove their post-conversion state.

## Intended contribution path

1. Create or update an issue marked `needs-review`.
2. Obtain explicit human `status:approved` with approval provenance; the label by
   itself is not authorization.
3. Start a focused `feat/*`, `fix/*`, or `docs/*` branch from `develop` and open
   a bounded pull request to `develop`.
4. Apply exactly one `type:*` label and record verification evidence, risk, and
   rollback boundary in the pull request.
5. Use a separately authorized `release/*` pull request to move reviewed work to
   `main`, then reverse-sync the result to `develop`.
6. For a hotfix, branch from `main`, use its intended pull-request path, then
   reverse-sync the result to `develop`.

This intended workflow does not authorize commits, pushes, merges, releases, or
GitHub setting changes.

## Review and automation boundaries

CI verifies source behavior for the commit it runs against. It does not prove
human approval, branch protection, merge eligibility, or release authorization.
Work should remain at or below 400 changed lines unless a maintainer records a
specific exception. The authorized initial repository import is a bootstrap, not
an ordinary pull request under this future-work policy. A passing CI run is
evidence, not a publication or deployment.
