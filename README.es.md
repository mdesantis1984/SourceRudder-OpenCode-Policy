# Política de SourceRudder

[English](README.md) | [Español](README.es.md)

![Un bot blanco de SourceRudder con una lupa junto a un escudo de políticas luminoso y separado, con un emblema de evidencia de enrutamiento.](assets/bot-shield/hero-bot-shield-es.png)

Un complemento de políticas para OpenCode, seguro ante actualizaciones, que exige
investigación con SourceRudder primero y bloquea estrictamente las herramientas
nativas `websearch` y `webfetch` de OpenCode. Está dirigido a operadores de
OpenCode que necesitan un límite de política local, pequeño y auditable.

> **Estado:** implementado y verificable localmente. Este proyecto complementario
> privado no es un fork, una versión publicada ni una publicación de SourceRudder.

## Relación con SourceRudder

Este complemento se integra con la puerta de enlace pública de investigación MCP
de [SourceRudder](https://github.com/mdesantis1984/SourceRudder). No incluye,
configura, publica ni opera ese proyecto ascendente. Solo añade orientación de
políticas locales de OpenCode y comprobaciones en tiempo de ejecución para las
herramientas de investigación nativas.

## Inicio rápido

1. El entorno de ejecución del complemento declara Node.js 20 o posterior. El
   desarrollo local y la CI requieren una versión de Node aceptada por el grafo
   bloqueado de dependencias de desarrollo; la CI usa Node.js 24. Node.js 20 no
   se prueba actualmente.
2. Instale las dependencias bloqueadas y ejecute la comprobación local completa:

   ```sh
   npm ci --ignore-scripts
   npm run check
   npm run check:docs
   ```

3. Compile el paquete versionado del complemento:

   ```sh
   npm run build
   ```

4. Copie `dist/sourcerudder-policy-v1.0.0.js` en la raíz del directorio de
   complementos de OpenCode y reinicie OpenCode. Consulte el
   [manual operativo](RUNBOOK.md) para el procedimiento completo y reversible.

La señal local de éxito esperada es una ejecución de pruebas de Node satisfactoria
y una entrada de paquete `dist/index.js` que se pueda cargar.

## Qué aplica la política

| Área | Comportamiento |
| --- | --- |
| Herramientas de investigación nativas | `websearch` y `webfetch` se establecen en `deny` en la configuración combinada y se rechazan en el límite de la herramienta. |
| Herramientas de SourceRudder | Se reconocen nueve nombres exactos de herramientas de SourceRudder para el seguimiento acotado de intentos no resueltos. |
| Llamadas no resueltas repetidas | Se permiten once intentos idénticos por sesión; el duodécimo se bloquea. Un `tool.execute.after` satisfactorio limpia esa huella. |
| Orientación del sistema | Un centinela hace que la inyección de políticas sea idempotente y elimina solo bloques heredados completos que pertenecen al complemento. |
| Configuración existente | Se preservan los permisos no relacionados y el texto del sistema del host. |

## Límites y limitaciones

- No existe una ruta de aprobación ni una ruta alternativa para `websearch` o
  `webfetch` nativos.
- La política no bloquea Bash, otras herramientas MCP ni acciones del proveedor
  fuera de los hooks de OpenCode. No afirma exclusividad de red.
- Un hook `tool.execute.after` ausente se considera no resuelto, no un fallo de
  SourceRudder confirmado; el SDK de OpenCode no proporciona una señal síncrona
  documentada de fallo MCP para que el complemento la clasifique.
- El complemento se dirige a `@opencode-ai/plugin` `1.18.26` y modifica solo la
  configuración combinada en memoria.

## Documentación

- [Manual operativo](RUNBOOK.md): compilación, instalación, verificación y reversión.
- [Guía de contribución](CONTRIBUTING.md): desarrollo local y expectativas de revisión.
- [Política de seguridad](SECURITY.md): orientación para la notificación privada de vulnerabilidades.
- [Política del repositorio](docs/repository-policy.md): flujo de trabajo previsto y límites de administración de GitHub.
- [Arquitectura](docs/architecture.md): límites del complemento y flujo en tiempo de ejecución.
- [Configuración](docs/configuration.md): cambios de configuración propios y límites.
- [Operaciones](docs/operations.md): verificación local y señales operativas.
- [Desarrollo](docs/development.md): flujo de trabajo local compatible y referencia de CI.
- [Versión y reversión](docs/release-and-rollback.md): procedimiento manual del operador y límites de publicación.

## Desarrollo

El proyecto utiliza TypeScript, esbuild y el ejecutor de pruebas integrado de
Node. No se requiere un marco de pruebas externo.

```sh
npm run typecheck
npm test
npm run check:package
npm run check:docs
```

## Estado de la licencia

Este repositorio no concede ninguna licencia. Las licencias siguen siendo una
decisión de mantenimiento; no se deben asumir derechos de reutilización,
redistribución ni publicación.
