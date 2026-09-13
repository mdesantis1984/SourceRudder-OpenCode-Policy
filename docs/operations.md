# Operations

Run local verification without changing an OpenCode installation:

```sh
npm ci --ignore-scripts
npm run check
npm run check:docs
node scripts/verify-installed.mjs dist/sourcerudder-policy-v1.0.0.js
```

The last command validates a locally generated candidate bundle when given the
explicit `dist/` path. It does not read or modify user configuration.

After an operator manually installs the bundle using the [runbook](../RUNBOOK.md),
restart OpenCode and look for the initialization canary. Confirm that native
`websearch` and `webfetch` remain denied and that `doom_loop` remains `ask`.
These are operator observations, not checks performed by this repository.
