# SourceRudder Policy Runbook

[English](RUNBOOK.md) | [Español](RUNBOOK.es.md)

This runbook describes a local, copy-based installation of the versioned policy
bundle. It does not publish a package or change global configuration by itself.

## Install the root-level bundle

1. Run `npm ci --ignore-scripts`, `npm run check`, and `npm run check:docs` in
   this repository.
2. Run `npm run build`.
3. Before installation, copy the active policy bundle to a timestamped location
   outside auto-discovered plugin directories.
4. Copy `dist/sourcerudder-policy-v1.0.0.js` atomically to the root of
   `~/.config/opencode/plugins/`; do not create a symlink. Keep exactly one active
   SourceRudder/IA-Buscar policy bundle there.
5. OpenCode discovers root-level `.js` plugins automatically; no `plugin` list
   entry is required.
6. Restart OpenCode; runtime configuration is loaded only at startup.

Do not modify `~/.config/opencode` from this repository's build or test process.

## Verify

- Run `node scripts/verify-installed.mjs "$HOME/.config/opencode/plugins/sourcerudder-policy-v1.0.0.js"`.
- Check the OpenCode log for the SourceRudder initialization canary.
- Confirm the injected system guidance names the SourceRudder MCP tools and
  distinguishes them from native `websearch`/`webfetch`.
- Confirm global and configured per-agent permissions set `websearch` and
  `webfetch` to `deny` while `doom_loop` remains `ask` and unrelated rules remain
  intact.
- Exercise a SourceRudder success and confirm the conceptual counter resets.
- Call the same exact SourceRudder tool and canonical args eleven times without an
  observed after hook; confirm the twelfth is blocked. A matching successful after
  clears the unresolved-attempt guard.
- Confirm repeated system transforms contain one policy entry, identified by the
  `[SOURCERUDDER-POLICY:v1.0.0]` sentinel.

## v1.0 strict native-tool scope and limitations

Native `websearch` and `webfetch` are denied in the config hook and rejected at
the tool boundary on every call; no approval or fallback path exists. The guard is
session-scoped and applies only to the exact tracked SourceRudder tool-name set. Attempts one
through eleven are allowed; attempt twelve is blocked. Missing
`tool.execute.after` is UNKNOWN/unresolved, not a confirmed transport failure.
This change does not block Bash, other MCP tools, or provider-side actions outside
OpenCode hooks, and it does not claim network exclusivity.

## Rollback

Remove the active `sourcerudder-policy-v1.0.0.js`, restore the desired timestamped
backup to the root-level plugin directory, and restart OpenCode. The original
v0.2.2 backup must remain untouched. If startup fails, use the documented OpenCode
plugin-disable escape hatch and inspect the canary/error log.

## Operational boundaries

- Installation and rollback are operator actions. The repository build and tests
  do not write to the OpenCode configuration directory.
- The installed-bundle harness accepts an explicit bundle path. To verify only a
  locally generated candidate, run:

  ```sh
  node scripts/verify-installed.mjs dist/sourcerudder-policy-v1.0.0.js
  ```

- Native `websearch` and `webfetch` have no approval or fallback path. Other MCP
  tools, Bash, and provider-side actions remain outside this plugin's scope.
