import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { execFile } from "node:child_process";
import { readFile, readdir, stat } from "node:fs/promises";
import test from "node:test";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

const root = new URL("../..", import.meta.url);
const exec = promisify(execFile);
const file = (path: string) => new URL(path, root);
const path = (value: string) => fileURLToPath(file(value));
const hash = async (path: string) => createHash("sha256").update(await readFile(file(path))).digest("hex");

test("brand manifest verifies immutable inputs and deterministic derivatives", async () => {
  const manifest = JSON.parse(await readFile(file("docs/assets/brand/manifest.json"), "utf8"));
  assert.equal(manifest.source_issue, 4);
  assert.equal(manifest.social_preview.state, "tracked-candidate-not-uploaded");
  for (const asset of [...manifest.immutable_inputs, ...manifest.derivatives, ...manifest.vector_masters]) {
    const size = await stat(file(asset.path));
    assert.equal(await hash(asset.path), asset.sha256, asset.path);
    assert.equal(typeof asset.bytes, "number", asset.path);
    assert.equal(size.size, asset.bytes, asset.path);
    if (asset.max_bytes) assert.ok(size.size <= asset.max_bytes, asset.path);
    if (asset.width) {
      const metadata = (await exec("magick", ["identify", "-format", "%w x %h %m %[colorspace]", path(asset.path)])).stdout;
      assert.match(metadata, new RegExp(`^${asset.width} x ${asset.height} PNG ${asset.mode === "RGB" ? "sRGB" : asset.mode}$`));
    }
  }
  const declared = new Set([...manifest.derivatives, ...manifest.vector_masters].map((asset: { path: string }) => asset.path.split("/").at(-1)));
  assert.deepEqual(new Set(await readdir(file("docs/assets/brand/derived"))), declared);
  for (const asset of manifest.vector_masters) {
    const svg = await readFile(file(asset.path), "utf8");
    for (const token of ["<title id=\"title\">", "<desc id=\"desc\">", "role=\"img\""]) assert.ok(svg.includes(token), asset.path);
    assert.match((await exec("magick", ["identify", "-format", "%m", path(asset.path)])).stdout, /^SVG$/);
  }
  assert.equal(manifest.derivatives[0].width, 1280);
  assert.equal(manifest.derivatives[0].height, 640);
});

test("brand exporter check mode proves tracked output is deterministic", async () => {
  const result = await exec(process.execPath, ["scripts/export-brand-assets.mjs", "--check"], { cwd: root });
  assert.equal(result.stderr, "");
  assert.match(result.stdout, /^brand-assets: PASS /);
  const internal = await exec(process.execPath, ["scripts/export-brand-assets.mjs", "--verify-determinism"], { cwd: root });
  assert.match(internal.stdout, /^brand-assets: PASS internal deterministic outputs/);
});

test("brand exporter rejects caller output and restores tracked output after failure", async () => {
  const before = Object.fromEntries(await Promise.all((await readdir(file("docs/assets/brand/derived"))).map(async (name) => [name, await hash(`docs/assets/brand/derived/${name}`)])));
  await assert.rejects(exec(process.execPath, ["scripts/export-brand-assets.mjs", "--output", "../brand-exporter-escape"], { cwd: root }));
  await assert.rejects(stat(file("docs/assets/brand-exporter-escape")));
  await assert.rejects(exec(process.execPath, ["scripts/export-brand-assets.mjs"], { cwd: root, env: { ...process.env, BRAND_ASSETS_TEST_FAIL_PUBLISH: "1" } }), /simulated publish failure/);
  const after = Object.fromEntries(await Promise.all((await readdir(file("docs/assets/brand/derived"))).map(async (name) => [name, await hash(`docs/assets/brand/derived/${name}`)])));
  assert.deepEqual(after, before);
});
