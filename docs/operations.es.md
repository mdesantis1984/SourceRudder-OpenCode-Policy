# Operaciones

[English](operations.md) | [Español](operations.es.md)

Ejecute la verificación local sin modificar una instalación de OpenCode:

```sh
npm ci --ignore-scripts
npm run check
npm run check:docs
node scripts/verify-installed.mjs dist/sourcerudder-policy-v1.0.0.js
```

El último comando valida un bundle candidato generado localmente cuando recibe
la ruta explícita de `dist/`. No lee ni modifica la configuración del usuario.

Después de que un operador instale manualmente el bundle mediante el
[manual operativo](../RUNBOOK.es.md), reinicie OpenCode y busque el canary de
inicialización. Confirme que `websearch` y `webfetch` nativos permanezcan denegados
y que `doom_loop` permanezca en `ask`. Son observaciones del operador, no
comprobaciones realizadas por este repositorio.
