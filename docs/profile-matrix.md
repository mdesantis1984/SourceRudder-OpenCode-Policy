# SourceRudder Profile Matrix

[English](profile-matrix.md) | [Español](profile-matrix.es.md)

This matrix classifies the SourceRudder repository-profile families against the
companion plugin at the 2026-09-14 evidence boundary. The reference is pinned to
[`SourceRudder@1a2741b`](https://github.com/mdesantis1984/SourceRudder/tree/1a2741bfc9b4b9742f0683bd1b1e6738078df35e).

| Artifact family | Classification | Companion evidence and boundary |
| --- | --- | --- |
| Product front door | Adapted | Bilingual `README.md` and `README.es.md` describe only the OpenCode policy outcome, evidence, limits, and paths. |
| Architecture and configuration | Adapted | Bilingual `docs/architecture*` and `docs/configuration*` document the TypeScript plugin and exact OpenCode permissions. |
| SourceRudder Go runtime and 28-tool implementation | Prohibited | This repository is a companion policy layer and must not copy or claim the upstream runtime. |
| Connector and research-provider artifacts | Prohibited | The plugin routes to separately configured SourceRudder tools; it does not implement or deploy connectors. |
| CI | Adapted | `.github/workflows/ci.yml` runs the Node.js 24 repository, package, documentation, and history checks with read-only permissions. |
| Issue and PR governance | Adopted | Issue forms, contribution guides, PR template, `CODEOWNERS`, and metadata-only PR policy implement the approved-issue workflow. |
| Gitflow and release gate | Adapted | `develop`, bounded work units, `release/*`, and the unprivileged release gate fit this companion; publication remains human-authorized. |
| npm package | Adapted | `package.json` and `scripts/check-package.mjs` define and install-test a six-file public package; no package is published yet. |
| GitHub release assets | Adapted | `scripts/prepare-release.mjs` produces the versioned plugin bundle and SHA-256 checksum; no tag or release exists yet. |
| Docker, Kubernetes, systemd, and service deployment | Not applicable | The deliverable is an OpenCode plugin, not a hosted SourceRudder service. No deployment should be created without a real environment. |
| Security, community, and legal | Adopted | MIT, bilingual security and conduct guidance, contribution paths, acknowledgements, and Dependabot are tracked. |
| Public security settings | Deferred | Code scanning, private reporting, push protection, Actions policy, and branch rules require post-visibility platform readback. |
| Brand and social preview | Adapted | Companion-specific source, deterministic derivatives, provenance, and a social-preview candidate are tracked; GitHub upload is pending. |
| Bilingual durable documentation | Adopted | English is canonical, professional Spanish pairs are linked, and `check-docs` enforces inventory and navigation. |
| Changelog and migrations | Deferred | Add them only when real post-v1.0 version history or compatibility changes exist. |
| SBOMs, attestations, and deployment provenance | Deferred | Do not copy upstream evidence; add companion-specific evidence only when the actual publication policy requires it. |

`Deferred` is not an implementation claim. `Prohibited` and `Not applicable` are
deliberate boundaries, not missing work. Issue #4 remains the authority for the
public cutover and companion v1.0.0 publication.
