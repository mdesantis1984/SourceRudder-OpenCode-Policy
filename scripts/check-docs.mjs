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
];
const localLinkPattern = /(?<!!)\[[^\]]+\]\(([^)]+)\)/g;
const requiredReadmeText = [
  "https://github.com/mdesantis1984/SourceRudder",
  "not a fork",
  "Public visibility is approved",
];

for (const file of documentationFiles) {
  const content = await readFile(file, "utf8");
  for (const match of content.matchAll(localLinkPattern)) {
    const target = match[1];
    if (/^(https?:|#|mailto:)/.test(target)) continue;
    await access(resolve(dirname(file), target.split("#")[0]));
  }
}

const readme = await readFile("README.md", "utf8");
for (const text of requiredReadmeText) {
  if (!readme.includes(text)) {
    throw new Error(`README.md must include required project relationship text: ${text}`);
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
