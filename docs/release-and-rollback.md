# Release and Rollback

[English](release-and-rollback.md) | [Español](release-and-rollback.es.md)

This repository has not yet published npm packages, GitHub releases, or
deployments. The maintainer authorized the MIT License and a truthful companion
v1.0.0 release through issue #4. The npm package name was unclaimed at the
2026-09-13 registry readback. Its explicit allowlist, temporary installation test,
and public access metadata make it publication-ready without publishing it.
Creating a tag, release, package, or deployment requires separate authorization
after final `main` verification.

The unprivileged release gate accepts an internal `release/v1.0.0` pull request to
`main`, reruns repository and package checks, and uploads the versioned bundle plus
SHA-256 checksum as a seven-day workflow artifact. It repeats on the resulting
`main` push so the releasable artifact identifies the exact final commit. The gate
has no write permission and cannot create a tag, GitHub release, npm package, or
deployment.

## Operator installation

Build and verify a versioned bundle first:

```sh
npm run build
node scripts/verify-installed.mjs dist/sourcerudder-policy-v1.0.0.js
npm run release:prepare
```

An operator may then follow the copy-based procedure in the [runbook](../RUNBOOK.md).
That manual action changes the operator's OpenCode plugin directory; repository
build and test commands do not.

## Rollback

Remove the active policy bundle, restore the previously selected backup outside
auto-discovered plugin directories, and restart OpenCode. If startup fails, use
the documented OpenCode plugin-disable escape hatch and inspect the canary or
error log. Do not treat a rollback procedure as a published release.
