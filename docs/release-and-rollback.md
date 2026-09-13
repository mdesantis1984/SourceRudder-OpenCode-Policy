# Release and Rollback

[English](release-and-rollback.md) | [Español](release-and-rollback.es.md)

This repository has not yet published npm packages, GitHub releases, or
deployments. The maintainer authorized the MIT License and a truthful companion
v1.0.0 release through issue #4. The package remains private until a verified
allowlist removes legacy and review-only material from its tarball. Creating a
tag, release, package, or deployment requires separate authorization after final
`main` verification.

## Operator installation

Build and verify a versioned bundle first:

```sh
npm run build
node scripts/verify-installed.mjs dist/sourcerudder-policy-v1.0.0.js
```

An operator may then follow the copy-based procedure in the [runbook](../RUNBOOK.md).
That manual action changes the operator's OpenCode plugin directory; repository
build and test commands do not.

## Rollback

Remove the active policy bundle, restore the previously selected backup outside
auto-discovered plugin directories, and restart OpenCode. If startup fails, use
the documented OpenCode plugin-disable escape hatch and inspect the canary or
error log. Do not treat a rollback procedure as a published release.
