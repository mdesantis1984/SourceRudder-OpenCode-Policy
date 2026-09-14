import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(new URL("../package.json", import.meta.url)));
const packageMetadata = JSON.parse(await readFile(join(root, "package.json"), "utf8"));
assert.match(packageMetadata.version, /^\d+\.\d+\.\d+$/, "release version must be stable semver");

const expectedBranch = `release/v${packageMetadata.version}`;
if (process.env.RELEASE_BRANCH) {
  assert.equal(process.env.RELEASE_BRANCH, expectedBranch, `release branch must be ${expectedBranch}`);
}

const filename = `sourcerudder-policy-v${packageMetadata.version}.js`;
const bundle = await readFile(join(root, "dist", filename));
const digest = createHash("sha256").update(bundle).digest("hex");
const output = join(root, "release");

await rm(output, { recursive: true, force: true });
await mkdir(output);
await writeFile(join(output, filename), bundle);
await writeFile(join(output, `${filename}.sha256`), `${digest}  ${filename}\n`);

console.log(`prepare-release: PASS ${filename} sha256 ${digest}`);
