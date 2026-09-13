# Release y Rollback

[English](release-and-rollback.md) | [Español](release-and-rollback.es.md)

Este repositorio todavía no publicó paquetes npm, releases de GitHub ni
deployments. El maintainer autorizó la Licencia MIT y un release real del
companion v1.0.0 mediante el issue #4. El paquete permanece privado hasta que una
allowlist verificada elimine material heredado y de revisión de su tarball. Crear
un tag, release, paquete o deployment requiere autorización separada después de
verificar el estado final de `main`.

## Instalación del operador

Compile y verifique primero un bundle versionado:

```sh
npm run build
node scripts/verify-installed.mjs dist/sourcerudder-policy-v1.0.0.js
```

Luego un operador puede seguir el procedimiento de copia del
[manual operativo](../RUNBOOK.es.md). Esa acción manual modifica el directorio de
complementos de OpenCode del operador; los comandos de compilación y pruebas del
repositorio no lo hacen.

## Rollback

Elimine el bundle activo de la política, restaure el backup seleccionado fuera de
los directorios de complementos descubiertos automáticamente y reinicie OpenCode.
Si el inicio falla, utilice la vía documentada para desactivar complementos y
revise el canary o log del error. No considere un procedimiento de rollback como
un release publicado.
