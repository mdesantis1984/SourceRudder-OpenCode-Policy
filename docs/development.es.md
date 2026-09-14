# Desarrollo

[English](development.md) | [Español](development.es.md)

El proyecto utiliza TypeScript, esbuild y el test runner integrado de Node. El
paquete declara Node.js `>=20` como mínimo de runtime del complemento. El desarrollo
usa el grafo bloqueado, que requiere Node.js `^22.22.2 || ^24.15.0 || >=26.0.0`
para una dependencia; la CI lo verifica con Node.js 24. El entorno local histórico
utilizó Node.js 22.22.1 y pasó con una advertencia de engine. Esa evidencia local
no establece compatibilidad con Node.js 20; la ejecución CI con Node.js 24 es la
referencia de desarrollo probada actualmente.

## Comprobaciones locales

```sh
npm ci --ignore-scripts
npm run typecheck
npm test
npm run check:package
npm run check:docs
npm run check:history
npm run release:prepare
```

`npm test` compila `dist/` antes de ejecutar las pruebas compiladas. La salida
generada y las dependencias se ignoran y no deben incluirse en commits.
`check:package` crea el tarball de la allowlist en almacenamiento temporal, lo
instala sin scripts de ciclo de vida e importa su entrada predeterminada.
`release:prepare` también crea el bundle versionado y su checksum SHA-256 ignorados
en `release/`; no los publica.
`check:history` revisa el worktree rastreado y cada árbol de commit alcanzable para
detectar formatos de credenciales, email personal, rutas privadas, nombres de archivos
sensibles y URL inseguras de redes privadas sin imprimir el contenido coincidente. El workflow de
release también ejecuta `check:public` para rechazar claims privados obsoletos.
