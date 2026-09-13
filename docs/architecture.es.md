# Arquitectura

[English](architecture.md) | [Español](architecture.es.md)

El complemento es una capa local de políticas de OpenCode. Complementa la
[puerta de investigación MCP de SourceRudder](https://github.com/mdesantis1984/SourceRudder)
y no es un fork ni un despliegue de ese proyecto.

## Flujo de runtime

1. El complemento registra un canary de inicio sin permitir que un fallo de logging detenga el inicio de OpenCode.
2. El hook de configuración establece únicamente los permisos de `websearch`, `webfetch` y `doom_loop`, y preserva los permisos no relacionados.
3. La transformación del sistema agrega un bloque de política identificado por un centinela y elimina solo bloques heredados completos que pertenecen al complemento.
4. El hook previo a la ejecución rechaza las dos herramientas de investigación nativas y supervisa llamadas repetidas exactas a herramientas SourceRudder por sesión y argumentos canonicalizados.
5. Un hook posterior satisfactorio elimina la huella no resuelta coincidente.

## Límites

El complemento no puede clasificar un hook posterior ausente como una llamada
MCP fallida. No bloquea Bash, otras herramientas MCP ni acciones del proveedor
fuera de los hooks de OpenCode. Los nueve nombres exactos de herramientas
SourceRudder y los dos nombres de herramientas nativas denegadas se definen en
`src/policy.ts`.
