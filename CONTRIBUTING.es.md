# Contribuir

[English](CONTRIBUTING.md) | [Español](CONTRIBUTING.es.md)

Las contribuciones deben mantener el límite de la política acotado, verificable
y explícito. Este repositorio complementa a SourceRudder; no es un fork del
proyecto upstream. La participación debe respetar el
[Código de Conducta](CODE_OF_CONDUCT.es.md).

## Desarrollo local

1. El runtime del complemento declara Node.js 20 o posterior. Para desarrollo
   local, utilice Node.js 24 o una versión aceptada por el grafo bloqueado de
   dependencias de desarrollo; la CI utiliza Node.js 24. Node.js 20 no se prueba
   actualmente.
2. Ejecute `npm ci --ignore-scripts`.
3. Ejecute `npm run check` y `npm run check:docs` antes de solicitar revisión.
4. Ejecute `npm run build` para validar el bundle versionado de despliegue.

La suite utiliza el test runner integrado de Node. El harness del bundle
instalado puede validar una compilación local sin acceder a la configuración de
OpenCode del usuario:

```sh
node scripts/verify-installed.mjs dist/sourcerudder-policy-v1.0.0.js
```

## Expectativas para los cambios

- Mantenga cada cambio enfocado en un comportamiento observable o resultado documental.
- Preserve los permisos de OpenCode no relacionados y el texto del sistema del host.
- Incluya pruebas con los cambios de comportamiento de la política.
- Registre en el pull request los comandos locales exactos y sus resultados.
- No agregue una ruta de aprobación o fallback para `websearch` o `webfetch` nativos.
- No agregue credenciales, configuración local ni la salida generada de `dist/` al control de versiones.

## Flujo de revisión previsto

El flujo previsto es:

1. Cree o actualice un issue marcado `needs-review`.
2. Obtenga `status:approved` humano explícito con procedencia de la aprobación.
3. Cree una rama enfocada `feat/*`, `fix/*` o `docs/*` desde `develop` y abra un pull request hacia `develop`.
4. Utilice exactamente una etiqueta `type:*` y registre verificación, riesgo y rollback.
5. Utilice un pull request `release/*` autorizado por separado hacia `main` y luego sincronice de vuelta con `develop`.

Los hotfixes parten de `main`, se fusionan mediante el pull request previsto y
luego se sincronizan de vuelta con `develop`.

Este es un flujo objetivo documentado, no una regla de GitHub aplicada. La
protección no estaba disponible para el repositorio privado en la lectura del
2026-09-13. El proceso humano y la procedencia de la aprobación siguen siendo
obligatorios. Los settings y protecciones deben releerse después de la conversión
pública aprobada en el issue #4. Mantenga las revisiones futuras en 400 líneas
cambiadas o menos, salvo que un maintainer registre una excepción explícita.
La importación inicial autorizada del repositorio es un bootstrap, no un pull
request ordinario sujeto a ese límite.

## Licencia y autorización

Las contribuciones se envían bajo la [Licencia MIT](LICENSE) del repositorio.
Envíe solo trabajo que esté autorizado a licenciar, preserve los avisos de
terceros requeridos e identifique material externo en el pull request.
