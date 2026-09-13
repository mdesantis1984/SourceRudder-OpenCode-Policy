# Repository Policy

This document records the intended operating model for this private repository.
It distinguishes local repository artifacts from GitHub settings, which require
administrator action and platform readback.

## Current profile

| Topic                 | Current evidence                    | Intended state                                   |
| --------------------- | ----------------------------------- | ------------------------------------------------ |
| Visibility            | Private repository target           | Remain private.                                  |
| Package publication   | `private: true` in `package.json`   | No npm publication.                              |
| Upstream relationship | README links to public SourceRudder | Companion plugin; not a fork.                    |
| Automation            | `.github/workflows/ci.yml`          | Run verification for pushes and pull requests.   |
| Licensing             | No license file                     | No license granted; maintainer decision pending. |
| Security reporting    | `SECURITY.md`                       | Use existing private collaboration channels.     |

## Intended GitHub controls

After `main` and `develop` exist, an administrator should attempt classic branch
protection and read back the actual result. The desired controls are required
pull-request review, passing CI, restricted force pushes, and restricted branch
deletions. These controls are not enabled or enforced by this document or CI.

Repository rulesets are unavailable for this private target under the current
GitHub plan limitation. The repository must remain private; do not change
visibility merely to enable rulesets.

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
