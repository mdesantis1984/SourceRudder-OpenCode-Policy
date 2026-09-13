import { access, readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const documentationFiles = [
  "README.md",
  "README.es.md",
  "RUNBOOK.md",
  "CONTRIBUTING.md",
  "SECURITY.md",
  "SECURITY.es.md",
  "docs/repository-policy.md",
  "docs/architecture.md",
  "docs/configuration.md",
  "docs/operations.md",
  "docs/development.md",
  "docs/release-and-rollback.md",
  "docs/brand.md",
  "docs/brand.es.md",
];
const localLinkPattern = /(?<!!)\[[^\]]+\]\(([^)]+)\)/g;
const htmlTargetPattern = /\b(?:href|src)="([^"]+)"/g;
const readmeRequirements = {
  "README.md": [
    "https://github.com/mdesantis1984/SourceRudder",
    "not a fork",
    "Public visibility is approved",
    "docs/assets/brand/derived/social-preview-1280x640.png",
    "actions/workflows/ci.yml/badge.svg?branch=main",
    "## Why this policy",
    "## How it works",
    "## Choose your path",
    "](README.es.md)",
  ],
  "README.es.md": [
    "https://github.com/mdesantis1984/SourceRudder",
    "no es un fork",
    "La visibilidad pública está aprobada",
    "docs/assets/brand/derived/social-preview-1280x640.png",
    "actions/workflows/ci.yml/badge.svg?branch=main",
    "## Por qué esta política",
    "## Cómo funciona",
    "## Elija su ruta",
    "](README.md)",
  ],
};

for (const file of documentationFiles) {
  const content = await readFile(file, "utf8");
  for (const match of content.matchAll(localLinkPattern)) {
    const target = match[1];
    if (/^(https?:|#|mailto:)/.test(target)) continue;
    await access(resolve(dirname(file), target.split("#")[0]));
  }
  for (const match of content.matchAll(htmlTargetPattern)) {
    const target = match[1];
    if (/^(https?:|mailto:)/.test(target)) continue;
    if (target.startsWith("#")) {
      if (!content.includes(`id="${target.slice(1)}"`)) {
        throw new Error(`${file} contains an unresolved HTML fragment: ${target}`);
      }
      continue;
    }
    await access(resolve(dirname(file), target.split("#")[0]));
  }
}

for (const [file, requirements] of Object.entries(readmeRequirements)) {
  const content = await readFile(file, "utf8");
  for (const text of requirements) {
    if (!content.includes(text)) {
      throw new Error(`${file} must include required product-front-door text: ${text}`);
    }
  }
}

const security = await readFile("SECURITY.md", "utf8");
const securitySpanish = await readFile("SECURITY.es.md", "utf8");
for (const [file, content, counterpart] of [
  ["SECURITY.md", security, "SECURITY.es.md"],
  ["SECURITY.es.md", securitySpanish, "SECURITY.md"],
]) {
  if (!content.includes(`](${counterpart})`)) {
    throw new Error(`${file} must link to ${counterpart}`);
  }
}

console.log(`check-docs: PASS ${documentationFiles.length} documentation files`);
