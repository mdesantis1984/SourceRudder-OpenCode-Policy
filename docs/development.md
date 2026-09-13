# Development

The project uses TypeScript, esbuild, and Node's built-in test runner. The package
declares Node.js `>=20` as the plugin runtime minimum. Development uses the locked
dependency graph, which requires Node.js `^22.22.2 || ^24.15.0 || >=26.0.0` for
one dependency; CI verifies it on Node.js 24. The local historical environment
used Node.js 22.22.1 and passed with an engine warning. That evidence does not
establish compatibility for Node.js 20 or Node.js 24.

## Local checks

```sh
npm ci --ignore-scripts
npm run typecheck
npm test
npm run check:package
npm run check:docs
```

`npm test` builds `dist/` before executing compiled tests. Generated output and
dependencies are ignored and must not be committed.
