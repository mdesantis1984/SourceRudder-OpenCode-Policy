# Configuración

[English](configuration.md) | [Español](configuration.es.md)

El complemento no tiene variables de entorno, endpoints de red ni archivos de
configuración locales del repositorio. Su hook de configuración cambia únicamente
los permisos combinados en memoria de OpenCode que le pertenecen:

| Clave | Valor | Propósito |
| --- | --- | --- |
| `websearch` | `deny` | Bloquear la herramienta de investigación nativa. |
| `webfetch` | `deny` | Bloquear la herramienta nativa de obtención. |
| `doom_loop` | `ask` | Preservar una puerta de confirmación independiente de OpenCode. |

Estos valores se aplican globalmente y a los agentes configurados, mientras se
conservan las entradas de permisos no relacionadas. El complemento no introduce
una ruta de aprobación ni fallback para las dos herramientas nativas denegadas.

La metadata de compilación está en `package.json`. Su declaración Node.js `>=20`
es el mínimo de runtime del complemento, no un rango probado para la cadena de
desarrollo. El grafo bloqueado incluye un paquete que requiere Node.js
`^22.22.2 || ^24.15.0 || >=26.0.0`; la CI utiliza Node.js 24. Node.js 20 no se
prueba actualmente.
