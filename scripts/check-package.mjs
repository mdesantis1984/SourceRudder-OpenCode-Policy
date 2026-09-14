import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { access, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const execute = promisify(execFile);
const root = dirname(fileURLToPath(new URL("../package.json", import.meta.url)));
const packageMetadata = JSON.parse(await readFile(join(root, "package.json"), "utf8"));
const versionedBundle = `dist/sourcerudder-policy-v${packageMetadata.version}.js`;
const expectedFiles = [
  "LICENSE",
  "README.es.md",
  "README.md",
  "dist/index.js",
  versionedBundle,
  "package.json",
];
const npm = process.platform === "win32" ? "npm.cmd" : "npm";
const temporaryRoot = await mkdtemp(join(tmpdir(), "sourcerudder-package-"));

assert.equal(packageMetadata.private, false, "package must be publishable only after its gate passes");
assert.equal(packageMetadata.license, "MIT");
assert.equal(packageMetadata.main, "dist/index.js");
assert.deepEqual(packageMetadata.files, [
  "dist/index.js",
  versionedBundle,
  "README.es.md",
]);
assert.equal(packageMetadata.publishConfig?.access, "public");

try {
  const { stdout } = await execute(
    npm,
    ["pack", "--ignore-scripts", "--json", "--pack-destination", temporaryRoot],
    { cwd: root, maxBuffer: 1024 * 1024 },
  );
  const manifests = JSON.parse(stdout);
  assert.equal(manifests.length, 1, "npm pack must produce exactly one manifest");
  const [manifest] = manifests;
  const packedFiles = manifest.files.map(({ path }) => path).sort();

  assert.deepEqual(packedFiles, expectedFiles, "npm tarball must match the minimal allowlist");
  assert.equal(manifest.entryCount, expectedFiles.length);
  assert.ok(manifest.unpackedSize <= 128 * 1024, "npm tarball must stay below 128 KiB unpacked");

  const installRoot = join(temporaryRoot, "install");
  await mkdir(installRoot);
  await writeFile(join(installRoot, "package.json"), '{"private":true,"type":"module"}\n');
  await execute(
    npm,
    [
      "install",
      "--ignore-scripts",
      "--no-audit",
      "--no-fund",
      "--package-lock=false",
      join(temporaryRoot, manifest.filename),
    ],
    { cwd: installRoot, maxBuffer: 1024 * 1024 },
  );
  await writeFile(
    join(installRoot, "verify.mjs"),
    `import plugin from ${JSON.stringify(packageMetadata.name)};\nif (typeof plugin !== "function") throw new Error("package default export must be a function");\n`,
  );
  await execute(process.execPath, ["verify.mjs"], { cwd: installRoot });
  await access(join(installRoot, "node_modules", packageMetadata.name, versionedBundle));

  console.log(
    `check-package: PASS ${manifest.entryCount} files, ${manifest.unpackedSize} bytes unpacked`,
  );
} finally {
  await rm(temporaryRoot, { recursive: true, force: true });
}
