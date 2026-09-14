# Release y Rollback

[English](release-and-rollback.md) | [Español](release-and-rollback.es.md)

Este repositorio todavía no publicó paquetes npm, releases de GitHub ni
deployments. El maintainer autorizó la Licencia MIT y un release real del
companion v1.0.0 mediante el issue #4. El nombre del paquete npm estaba disponible
en la lectura del registro del 2026-09-13. Su allowlist explícita, prueba de
instalación temporal y metadata de acceso público lo dejan listo para publicación
sin publicarlo. Crear un tag, release, paquete o deployment requiere autorización
separada después de verificar el estado final de `main`.

El candidato de release aprobó sus puertas locales y de `develop` el 2026-09-14. El
repositorio permanece privado hasta que GitHub Support confirme la eliminación de
refs reescritas de pull requests; este estado de candidato no es disponibilidad pública.

La puerta de release sin privilegios acepta un pull request interno
`release/v1.0.0` hacia `main`, repite las comprobaciones del repositorio y del
paquete, y sube el bundle versionado más su checksum SHA-256 como artefacto por
siete días. Se repite con el push resultante a `main` para que el artefacto
publicable identifique el commit final exacto. La puerta no tiene permisos de
escritura y no puede crear un tag, release de GitHub, paquete npm ni deployment.

## Instalación del operador

Compile y verifique primero un bundle versionado:

```sh
npm run build
node scripts/verify-installed.mjs dist/sourcerudder-policy-v1.0.0.js
npm run release:prepare
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
