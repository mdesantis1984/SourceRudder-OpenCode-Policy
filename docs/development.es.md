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
```

`npm test` compila `dist/` antes de ejecutar las pruebas compiladas. La salida
generada y las dependencias se ignoran y no deben incluirse en commits.
