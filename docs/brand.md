[English](brand.md) | [Español](brand.es.md)

# SourceRudder Policy brand system

This companion keeps the SourceRudder bot and the separate policy shield visible together in presentation assets. It does not assert affiliation, adoption, endorsement, or an uploaded GitHub setting.

## Asset use and hierarchy

| Asset | Intended use |
| --- | --- |
| `assets/brand/derived/social-preview-1280x640.png` | Tracked candidate for GitHub Social Preview; upload remains a maintainer action. |
| `assets/brand/derived/avatar-*.png` | Repository and social avatar classes. |
| `assets/brand/derived/icon-*.png` | Plugin, touch, and favicon classes. |
| `assets/brand/derived/{mark,lockup}.svg` | Accessible editable vector masters. |

Use the bot plus shield lockup for hero and social presentation. Use the shield-only mark for compact icons: forcing both identities into tiny sizes would make both illegible.

## Palette

`#EEF2FF` `#E0E7FF` `#C7D2FE` `#A5B4FC` `#818CF8` `#6366F1` `#4F46E5` `#4338CA` `#3730A3` `#312E81` `#1E1B4B`; background `#090A1A`; foreground `#F8FAFC`.

## Rebuild and verify

Prerequisites: Node.js 20+ and ImageMagick `magick` (verified locally); no network, secrets, global configuration, or npm package is required.

```sh
node scripts/export-brand-assets.mjs
node scripts/export-brand-assets.mjs --check
```

The exporter accepts no output path, stages every derivative in owner-controlled temporary space, validates it, and publishes transactionally with automatic restoration of the previous tree if publication fails. `--check` compares a temporary equivalent with tracked outputs; `--verify-determinism` compares two temporary builds.

## Provenance and boundary

`assets/bot-shield/` is immutable input. The original AI-generated key art is integrity-verifiable but not reproducible: its model was not recorded and the local bot reference was unavailable. Only the derivatives listed in `assets/brand/manifest.json` are deterministic and reproducible. The social-preview file is a tracked candidate, **not** evidence that GitHub Social Preview metadata has been uploaded.
