# Política del Repositorio

[English](repository-policy.md) | [Español](repository-policy.es.md)

Este documento registra el modelo operativo previsto. Distingue los artefactos
locales del repositorio de los settings de GitHub, que requieren una acción del
administrador y lectura posterior de la plataforma.

## Perfil actual

| Tema | Evidencia actual | Estado previsto |
| --- | --- | --- |
| Visibilidad | Repositorio privado, lectura del 2026-09-13 | Conversión pública aprobada en el issue #4; pendiente de la puerta de publicación. |
| Rama predeterminada | `main`; baseline de release anterior a los slices actuales de `develop` | Recibir releases autorizados mediante un pull request separado. |
| Rama de desarrollo | `develop`; rama de integración de los slices aprobados del issue #4 | Continuar como rama de integración. |
| Publicación del paquete | Allowlist mínima, prueba de instalación temporal y metadata de acceso público; nada publicado | Publicar solo después de la verificación final y autorización separada. |
| Relación upstream | El README enlaza al SourceRudder público | Complemento; no es un fork. |
| Automatización | CI, política de PR y puerta de release sin privilegios registradas en `develop` | Integrar las puertas en `main` antes de publicar y exigir resultados sobre la base actual. |
| Licencia | `LICENSE` MIT en el árbol de integración | Publicar la concesión MIT con el release final hacia `main`. |
| Reporte de seguridad | `SECURITY.md` y `SECURITY.es.md` | Utilizar reporte privado de GitHub cuando se habilite; de lo contrario, solicitar un canal privado mediante un issue público mínimo. |

## Controles de GitHub previstos

La protección clásica se intentó después de crear `main` y `develop`, pero GitHub
respondió HTTP 403 porque no estaba disponible para el plan del repositorio
privado. Los rulesets tampoco estaban disponibles. Ambas ramas estaban sin
protección en la lectura del 2026-09-13.

Los controles deseados siguen siendo revisión mediante pull request, CI
satisfactoria y restricciones para force push y eliminación de ramas. Este
documento y la CI no los habilitan ni aplican. Los settings y protecciones deben
releerse después de la conversión; este documento no demuestra su estado posterior.

## Ruta de contribución prevista

1. Cree o actualice un issue marcado `needs-review`.
2. Obtenga `status:approved` humano explícito con procedencia de la aprobación; la etiqueta por sí sola no es autorización.
3. Cree una rama enfocada `feat/*`, `fix/*` o `docs/*` desde `develop` y abra un pull request acotado hacia `develop`.
4. Aplique exactamente una etiqueta `type:*` y registre evidencia de verificación, riesgo y límite de rollback.
5. Utilice un pull request `release/*` autorizado por separado para mover trabajo revisado a `main` y luego sincronice el resultado de vuelta con `develop`.
6. Para un hotfix, cree la rama desde `main`, use su ruta de pull request prevista y luego sincronice de vuelta con `develop`.

Este flujo previsto no autoriza commits, pushes, merges, releases ni cambios de
settings de GitHub.

## Límites de revisión y automatización

La CI verifica el comportamiento de la fuente para el commit que ejecuta. No
demuestra aprobación humana, protección de ramas, elegibilidad de merge ni
autorización de release. El trabajo debe mantenerse en 400 líneas cambiadas o
menos, salvo que un maintainer registre una excepción específica. La importación
inicial autorizada es un bootstrap, no un pull request ordinario sujeto a esta
política. Una CI satisfactoria es evidencia, no una publicación o deployment.
