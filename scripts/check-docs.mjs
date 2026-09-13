import { access, readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const documentationFiles = [
  "README.md",
  "README.es.md",
  "RUNBOOK.md",
  "CONTRIBUTING.md",
  "SECURITY.md",
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
  "private companion project",
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

console.log(`check-docs: PASS ${documentationFiles.length} documentation files`);
