# SourceRudder Policy

An upgrade-safe OpenCode policy plugin that requires SourceRudder-first research
while strictly blocking OpenCode's native `websearch` and `webfetch` tools.
It is for OpenCode operators who need a small, auditable local policy boundary.

> **Status:** implemented and locally verifiable. This private companion project
> is not a fork, release, or publication of SourceRudder.

## Relationship to SourceRudder

This plugin complements the public [SourceRudder MCP research gateway](https://github.com/mdesantis1984/SourceRudder).
It does not bundle, configure, publish, or operate that upstream project. It only
adds local OpenCode policy guidance and runtime checks around native research
tools.

## Quick start

1. The plugin runtime declares Node.js 20 or later. Local development and CI need
   a Node version accepted by the locked development dependency graph; CI uses
   Node.js 24. Node.js 20 is not currently tested.
2. Install the locked dependencies and run the full local check:

   ```sh
   npm ci --ignore-scripts
   npm run check
   npm run check:docs
   ```

3. Build the versioned plugin bundle:

   ```sh
   npm run build
   ```

4. Copy `dist/sourcerudder-policy-v1.0.0.js` to the root of your OpenCode plugin
   directory, then restart OpenCode. See the [runbook](RUNBOOK.md) for the
   complete, reversible procedure.

The expected local success signal is a passing Node test run and a loadable
`dist/index.js` package entry.

## What the policy enforces

| Area                      | Behavior                                                                                                                                |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Native research tools     | `websearch` and `webfetch` are set to `deny` in merged configuration and rejected at the tool boundary.                                 |
| SourceRudder tools        | Nine exact SourceRudder tool names are recognized for bounded unresolved-attempt tracking.                                              |
| Repeated unresolved calls | Eleven identical attempts are permitted per session; the twelfth is blocked. A successful `tool.execute.after` clears that fingerprint. |
| System guidance           | A sentinel makes policy injection idempotent and removes only complete plugin-owned legacy blocks.                                      |
| Existing configuration    | Unrelated permissions and host system text are preserved.                                                                               |

## Boundaries and limitations

- There is no approval path or fallback path for native `websearch` or `webfetch`.
- The policy does not block Bash, other MCP tools, or provider-side actions outside
  OpenCode hooks. It does not claim network exclusivity.
- A missing `tool.execute.after` hook is unresolved, not a confirmed SourceRudder
  failure; the OpenCode SDK does not provide a documented synchronous failed-MCP
  signal for the plugin to classify.
- The plugin targets `@opencode-ai/plugin` `1.18.26` and changes only in-memory
  merged configuration.

## Documentation

- [Runbook](RUNBOOK.md): build, installation, verification, and rollback.
- [Contributing guide](CONTRIBUTING.md): local development and review expectations.
- [Security policy](SECURITY.md): private vulnerability reporting guidance.
- [Repository policy](docs/repository-policy.md): intended workflow and GitHub
  administration boundaries.
- [Architecture](docs/architecture.md): plugin boundaries and runtime flow.
- [Configuration](docs/configuration.md): owned configuration changes and limits.
- [Operations](docs/operations.md): local verification and operational signals.
- [Development](docs/development.md): supported local workflow and CI baseline.
- [Release and rollback](docs/release-and-rollback.md): manual operator procedure
  and publication boundaries.

## Development

The project uses TypeScript, esbuild, and Node's built-in test runner. No external
test framework is required.

```sh
npm run typecheck
npm test
npm run check:package
npm run check:docs
```

## License status

No license is granted by this repository. Licensing remains a maintainer decision;
do not assume reuse, redistribution, or publication rights.
