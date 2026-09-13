# Manual operativo de SourceRudder Policy

[English](RUNBOOK.md) | [Español](RUNBOOK.es.md)

Este manual describe una instalación local mediante copia del bundle versionado
de la política. No publica un paquete ni modifica por sí mismo la configuración
global.

## Instalar el bundle del nivel raíz

1. Ejecute `npm ci --ignore-scripts`, `npm run check` y `npm run check:docs` en este repositorio.
2. Ejecute `npm run build`.
3. Antes de instalar, copie el bundle activo de la política en una ubicación con timestamp fuera de los directorios de complementos descubiertos automáticamente.
4. Copie atómicamente `dist/sourcerudder-policy-v1.0.0.js` a la raíz de `~/.config/opencode/plugins/`; no cree un enlace simbólico. Mantenga exactamente un bundle activo de la política SourceRudder/IA-Buscar en esa ubicación.
5. OpenCode descubre automáticamente complementos `.js` en el nivel raíz; no se requiere una entrada en la lista `plugin`.
6. Reinicie OpenCode; la configuración de runtime se carga únicamente al iniciar.

No modifique `~/.config/opencode` desde el proceso de compilación o pruebas de
este repositorio.

## Verificar

- Ejecute `node scripts/verify-installed.mjs "$HOME/.config/opencode/plugins/sourcerudder-policy-v1.0.0.js"`.
- Compruebe el canary de inicialización de SourceRudder en el log de OpenCode.
- Confirme que la orientación del sistema inyectada nombre las herramientas MCP de SourceRudder y las distinga de `websearch` y `webfetch` nativos.
- Confirme que los permisos globales y por agente configurado establezcan `websearch` y `webfetch` en `deny`, mantengan `doom_loop` en `ask` y conserven las reglas no relacionadas.
- Ejecute una operación satisfactoria de SourceRudder y confirme que el contador conceptual se reinicie.
- Llame once veces a la misma herramienta exacta de SourceRudder con argumentos canónicos sin un after hook observado; confirme que el duodécimo intento se bloquee. Un after satisfactorio coincidente limpia la protección de intentos no resueltos.
- Confirme que las transformaciones repetidas del sistema contengan una sola entrada de política, identificada por el centinela `[SOURCERUDDER-POLICY:v1.0.0]`.

## Alcance y limitaciones estrictas de herramientas nativas en v1.0

`websearch` y `webfetch` nativos se deniegan en el hook de configuración y se
rechazan en el límite de la herramienta en cada llamada; no existe una ruta de
aprobación ni fallback. La protección tiene alcance de sesión y se aplica solo al
conjunto exacto de nombres de herramientas SourceRudder supervisadas. Los intentos
del uno al once se permiten; el duodécimo se bloquea. Un `tool.execute.after`
ausente es DESCONOCIDO/no resuelto, no un fallo de transporte confirmado. Este
cambio no bloquea Bash, otras herramientas MCP ni acciones del proveedor fuera
de los hooks de OpenCode, y no afirma exclusividad de red.

## Rollback

Elimine el archivo activo `sourcerudder-policy-v1.0.0.js`, restaure el backup con
timestamp deseado en el directorio raíz de complementos y reinicie OpenCode. El
backup original v0.2.2 debe permanecer intacto. Si el inicio falla, utilice la vía
de desactivación de complementos documentada por OpenCode y revise el log del
canary o del error.

## Límites operativos

- La instalación y el rollback son acciones del operador. La compilación y las pruebas del repositorio no escriben en el directorio de configuración de OpenCode.
- El harness del bundle instalado acepta una ruta explícita. Para verificar únicamente un candidato generado localmente, ejecute:

  ```sh
  node scripts/verify-installed.mjs dist/sourcerudder-policy-v1.0.0.js
  ```

- `websearch` y `webfetch` nativos no tienen ruta de aprobación ni fallback. Otras herramientas MCP, Bash y las acciones del proveedor quedan fuera del alcance de este complemento.
