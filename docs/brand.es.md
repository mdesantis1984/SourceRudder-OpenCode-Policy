[English](brand.md) | [Español](brand.es.md)

# Sistema de marca de SourceRudder Policy

Este complemento mantiene visibles juntos al bot de SourceRudder y al escudo de políticas separado en assets de presentación. No afirma afiliación, adopción, respaldo ni una configuración de GitHub cargada.

## Uso y jerarquía de assets

| Asset | Uso previsto |
| --- | --- |
| `assets/brand/derived/social-preview-1280x640.png` | Candidato versionado para GitHub Social Preview; la carga sigue siendo una acción del mantenedor. |
| `assets/brand/derived/avatar-*.png` | Clases de avatar para repositorio y redes sociales. |
| `assets/brand/derived/icon-*.png` | Clases para complemento, icono táctil y favicon. |
| `assets/brand/derived/{mark,lockup}.svg` | Masters vectoriales editables y accesibles. |

Usa el lockup de bot y escudo para hero y presentación social. Usa la marca de solo escudo en iconos compactos: forzar ambas identidades en tamaños pequeños las volvería ilegibles.

## Paleta

`#EEF2FF` `#E0E7FF` `#C7D2FE` `#A5B4FC` `#818CF8` `#6366F1` `#4F46E5` `#4338CA` `#3730A3` `#312E81` `#1E1B4B`; fondo `#090A1A`; primer plano `#F8FAFC`.

## Reconstrucción y verificación

Requisitos: Node.js 20+ e ImageMagick 7 `magick` **o** ImageMagick 6 `convert` más `identify`; no se requiere red, secretos, configuración global ni paquetes npm.

```sh
node scripts/export-brand-assets.mjs
node scripts/export-brand-assets.mjs --check
```

El exportador no acepta una ruta de salida, prepara cada derivado en espacio temporal controlado por el propietario, lo valida y publica de forma transaccional con restauración automática del árbol anterior si la publicación falla. `--check` compara un equivalente temporal con los resultados versionados; `--verify-determinism` compara dos compilaciones temporales.

## Procedencia y límite

`assets/bot-shield/` es una entrada inmutable. El arte clave original generado por IA permite verificar su integridad, pero no reproducirlo: el modelo no fue registrado y la referencia local del bot no estaba disponible. Solo los derivados de `assets/brand/manifest.json` son deterministas y reproducibles. El archivo social-preview es un candidato versionado, **no** evidencia de que se haya cargado metadata de GitHub Social Preview.
