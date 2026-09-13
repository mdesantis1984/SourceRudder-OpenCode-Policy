import { access, readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const documentationFiles = [
  "README.md",
  "README.es.md",
  "RUNBOOK.md",
  "RUNBOOK.es.md",
  "CONTRIBUTING.md",
  "CONTRIBUTING.es.md",
  "ACKNOWLEDGEMENTS.md",
  "ACKNOWLEDGEMENTS.es.md",
  "CODE_OF_CONDUCT.md",
  "CODE_OF_CONDUCT.es.md",
  "LICENSE",
  "SECURITY.md",
  "SECURITY.es.md",
  "docs/repository-policy.md",
  "docs/repository-policy.es.md",
  "docs/architecture.md",
  "docs/architecture.es.md",
  "docs/configuration.md",
  "docs/configuration.es.md",
  "docs/operations.md",
  "docs/operations.es.md",
  "docs/development.md",
  "docs/development.es.md",
  "docs/release-and-rollback.md",
  "docs/release-and-rollback.es.md",
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
    "img.shields.io/badge/license-MIT-334155",
    "## Why this policy",
    "## How it works",
    "## Choose your path",
    "## License",
    "ACKNOWLEDGEMENTS.md",
    "](README.es.md)",
  ],
  "README.es.md": [
    "https://github.com/mdesantis1984/SourceRudder",
    "no es un fork",
    "La visibilidad pública está aprobada",
    "docs/assets/brand/derived/social-preview-1280x640.png",
    "actions/workflows/ci.yml/badge.svg?branch=main",
    "img.shields.io/badge/license-MIT-334155",
    "## Por qué esta política",
    "## Cómo funciona",
    "## Elija su ruta",
    "## Licencia",
    "ACKNOWLEDGEMENTS.es.md",
    "CONTRIBUTING.es.md",
    "RUNBOOK.es.md",
    "docs/architecture.es.md",
    "docs/configuration.es.md",
    "docs/development.es.md",
    "docs/operations.es.md",
    "docs/release-and-rollback.es.md",
    "docs/repository-policy.es.md",
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
const conduct = await readFile("CODE_OF_CONDUCT.md", "utf8");
const conductSpanish = await readFile("CODE_OF_CONDUCT.es.md", "utf8");
for (const [file, content, counterpart] of [
  ["SECURITY.md", security, "SECURITY.es.md"],
  ["SECURITY.es.md", securitySpanish, "SECURITY.md"],
  ["CODE_OF_CONDUCT.md", conduct, "CODE_OF_CONDUCT.es.md"],
  ["CODE_OF_CONDUCT.es.md", conductSpanish, "CODE_OF_CONDUCT.md"],
  ["CONTRIBUTING.md", await readFile("CONTRIBUTING.md", "utf8"), "CONTRIBUTING.es.md"],
  ["CONTRIBUTING.es.md", await readFile("CONTRIBUTING.es.md", "utf8"), "CONTRIBUTING.md"],
  ["RUNBOOK.md", await readFile("RUNBOOK.md", "utf8"), "RUNBOOK.es.md"],
  ["RUNBOOK.es.md", await readFile("RUNBOOK.es.md", "utf8"), "RUNBOOK.md"],
  ["ACKNOWLEDGEMENTS.md", await readFile("ACKNOWLEDGEMENTS.md", "utf8"), "ACKNOWLEDGEMENTS.es.md"],
  ["ACKNOWLEDGEMENTS.es.md", await readFile("ACKNOWLEDGEMENTS.es.md", "utf8"), "ACKNOWLEDGEMENTS.md"],
  ["docs/architecture.md", await readFile("docs/architecture.md", "utf8"), "architecture.es.md"],
  ["docs/architecture.es.md", await readFile("docs/architecture.es.md", "utf8"), "architecture.md"],
  ["docs/configuration.md", await readFile("docs/configuration.md", "utf8"), "configuration.es.md"],
  ["docs/configuration.es.md", await readFile("docs/configuration.es.md", "utf8"), "configuration.md"],
  ["docs/development.md", await readFile("docs/development.md", "utf8"), "development.es.md"],
  ["docs/development.es.md", await readFile("docs/development.es.md", "utf8"), "development.md"],
  ["docs/operations.md", await readFile("docs/operations.md", "utf8"), "operations.es.md"],
  ["docs/operations.es.md", await readFile("docs/operations.es.md", "utf8"), "operations.md"],
  ["docs/release-and-rollback.md", await readFile("docs/release-and-rollback.md", "utf8"), "release-and-rollback.es.md"],
  ["docs/release-and-rollback.es.md", await readFile("docs/release-and-rollback.es.md", "utf8"), "release-and-rollback.md"],
  ["docs/repository-policy.md", await readFile("docs/repository-policy.md", "utf8"), "repository-policy.es.md"],
  ["docs/repository-policy.es.md", await readFile("docs/repository-policy.es.md", "utf8"), "repository-policy.md"],
]) {
  if (!content.includes(`](${counterpart})`)) {
    throw new Error(`${file} must link to ${counterpart}`);
  }
}

const license = await readFile("LICENSE", "utf8");
for (const text of [
  "MIT License",
  "Copyright (c) 2026 ThisCloud Services",
  "Permission is hereby granted, free of charge",
  'THE SOFTWARE IS PROVIDED "AS IS"',
]) {
  if (!license.includes(text)) throw new Error(`LICENSE is missing required MIT text: ${text}`);
}
const packageMetadata = JSON.parse(await readFile("package.json", "utf8"));
if (packageMetadata.license !== "MIT") throw new Error("package.json must declare the MIT license");
const packageLock = JSON.parse(await readFile("package-lock.json", "utf8"));
if (packageLock.packages?.[""]?.license !== "MIT") throw new Error("package-lock.json must declare the MIT license");

console.log(`check-docs: PASS ${documentationFiles.length} documentation files`);
