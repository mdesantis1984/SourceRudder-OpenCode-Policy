# Matriz del Perfil de SourceRudder

[English](profile-matrix.md) | [Español](profile-matrix.es.md)

Esta matriz clasifica las familias del perfil de repositorio de SourceRudder
frente al complemento en el límite de evidencia del 2026-09-14. La referencia
está fijada en
[`SourceRudder@1a2741b`](https://github.com/mdesantis1984/SourceRudder/tree/1a2741bfc9b4b9742f0683bd1b1e6738078df35e).

| Familia de artefactos | Clasificación | Evidencia y límite del complemento |
| --- | --- | --- |
| Presentación del producto | Adaptada | `README.md` y `README.es.md` bilingües describen solo el resultado, evidencia, límites y rutas de la política de OpenCode. |
| Arquitectura y configuración | Adaptada | `docs/architecture*` y `docs/configuration*` bilingües documentan el complemento TypeScript y los permisos exactos de OpenCode. |
| Runtime Go y 28 herramientas de SourceRudder | Prohibida | Este repositorio es una capa complementaria de política y no debe copiar ni atribuirse el runtime ascendente. |
| Conectores y proveedores de investigación | Prohibida | El complemento dirige hacia herramientas SourceRudder configuradas por separado; no implementa ni despliega conectores. |
| CI | Adaptada | `.github/workflows/ci.yml` ejecuta con Node.js 24 las comprobaciones de repositorio, paquete, documentación e historial y permisos de solo lectura. |
| Gobierno de issues y PR | Adoptada | Formularios, guías de contribución, plantilla de PR, `CODEOWNERS` y política de metadata implementan el flujo de issues aprobados. |
| Gitflow y puerta de release | Adaptada | `develop`, work units acotados, `release/*` y la puerta sin privilegios corresponden al complemento; la publicación conserva autorización humana. |
| Paquete npm | Adaptada | `package.json` y `scripts/check-package.mjs` definen y prueban la instalación de un paquete público de seis archivos; todavía no está publicado. |
| Assets del release de GitHub | Adaptada | `scripts/prepare-release.mjs` produce el bundle versionado y su checksum SHA-256; todavía no existen tag ni release. |
| Docker, Kubernetes, systemd y deployment de servicio | No aplicable | El entregable es un complemento de OpenCode, no un servicio SourceRudder alojado. No debe crearse un deployment sin un entorno real. |
| Seguridad, comunidad y legal | Adoptada | MIT, seguridad y conducta bilingües, contribución, reconocimientos y Dependabot están registrados. |
| Settings públicos de seguridad | Diferida | Code scanning, reporte privado, push protection, política de Actions y reglas de ramas requieren lectura posterior a la visibilidad. |
| Marca y social preview | Adaptada | Se registran fuente propia, derivados deterministas, procedencia y candidato de social preview; falta subirlo a GitHub. |
| Documentación durable bilingüe | Adoptada | Inglés es canónico, los pares en español profesional están enlazados y `check-docs` verifica inventario y navegación. |
| Changelog y migraciones | Diferida | Deben agregarse únicamente cuando exista historial real posterior a v1.0 o cambios de compatibilidad. |
| SBOM, attestations y procedencia de deployment | Diferida | No se copia evidencia ascendente; se agrega evidencia propia solo cuando la política de publicación real la requiera. |

`Diferida` no es una afirmación de implementación. `Prohibida` y `No aplicable`
son límites deliberados, no trabajo faltante. El issue #4 mantiene la autoridad
sobre la exposición pública y publicación del companion v1.0.0.
