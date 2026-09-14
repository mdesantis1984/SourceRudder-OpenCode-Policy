# Configuration

[English](configuration.md) | [Español](configuration.es.md)

The plugin has no environment variables, network endpoints, or repository-local
configuration files. Its configuration hook changes only the in-memory merged
OpenCode permissions it owns:

| Key | Value | Purpose |
| --- | --- | --- |
| `websearch` | `deny` | Block the native research tool. |
| `webfetch` | `deny` | Block the native fetch tool. |
| `doom_loop` | `ask` | Preserve an independent OpenCode confirmation gate. |

These values apply globally and to configured agents while unrelated permission
entries are retained. The plugin does not introduce an approval or fallback path
for the two denied native tools.

Build metadata is in `package.json`. Its Node.js `>=20` declaration is the plugin
runtime minimum, not a tested development-toolchain range. The locked development
dependency graph includes a package that requires Node.js
`^22.22.2 || ^24.15.0 || >=26.0.0`; CI therefore uses Node.js 24. Node.js 20 is
not currently tested.
