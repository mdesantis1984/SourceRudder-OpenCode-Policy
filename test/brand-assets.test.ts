import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { execFile, spawnSync } from "node:child_process";
import { chmod, mkdtemp, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import test from "node:test";
import { promisify } from "node:util";

const root = new URL("../..", import.meta.url);
const exec = promisify(execFile);
const file = (path: string) => new URL(path, root);
const hash = async (path: string) => createHash("sha256").update(await readFile(file(path))).digest("hex");
const available = (command: string) => {
  const result = spawnSync(command, ["-version"], { stdio: "ignore" });
  return !result.error && result.status === 0;
};
const modernImageMagick = available("magick");
const legacyImageMagick = available("convert") && available("identify");
const imageMagickTest = modernImageMagick || legacyImageMagick ? test : test.skip;
const legacyImageMagickTest = legacyImageMagick ? test : test.skip;
async function png(path: string) {
  const bytes = await readFile(file(path));
  assert.deepEqual(bytes.subarray(0, 8), Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), path);
  assert.equal(bytes.toString("ascii", 12, 16), "IHDR", path);
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20), colorType: bytes[25] };
}
function rgbReceipt(metadata: { colorType: number }, path: string) {
  assert.equal(metadata.colorType, 2, `${path} must use truecolor PNG IHDR type 2`);
}

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
      const metadata = await png(asset.path);
      assert.equal(metadata.width, asset.width, asset.path);
      assert.equal(metadata.height, asset.height, asset.path);
      if (asset.mode === "RGB") rgbReceipt(metadata, asset.path);
    }
  }
  const declared = new Set([...manifest.derivatives, ...manifest.vector_masters].map((asset: { path: string }) => asset.path.split("/").at(-1)));
  assert.deepEqual(new Set(await readdir(file("docs/assets/brand/derived"))), declared);
  for (const asset of manifest.vector_masters) {
    const svg = await readFile(file(asset.path), "utf8");
    assert.match(svg, /^<svg\b[^>]*>.*<\/svg>\n?$/s);
    for (const token of ["<title id=\"title\">", "<desc id=\"desc\">", "role=\"img\""]) assert.ok(svg.includes(token), asset.path);
  }
  assert.equal(manifest.derivatives[0].width, 1280);
  assert.equal(manifest.derivatives[0].height, 640);
});

test("RGB PNG receipts reject indexed palette color type", () => {
  assert.throws(() => rgbReceipt({ colorType: 3 }, "fixture.png"), /truecolor PNG IHDR type 2/);
});

imageMagickTest("brand exporter check mode proves tracked output is deterministic", async () => {
  const result = await exec(process.execPath, ["scripts/export-brand-assets.mjs", "--check"], { cwd: root });
  assert.equal(result.stderr, "");
  assert.match(result.stdout, /^brand-assets: PASS /);
  const internal = await exec(process.execPath, ["scripts/export-brand-assets.mjs", "--verify-determinism"], { cwd: root });
  assert.match(internal.stdout, /^brand-assets: PASS internal deterministic outputs/);
});

test("brand exporter rejects caller-controlled output", async () => {
  await assert.rejects(exec(process.execPath, ["scripts/export-brand-assets.mjs", "--output", "../brand-exporter-escape"], { cwd: root }));
  await assert.rejects(stat(file("docs/assets/brand-exporter-escape")));
});

imageMagickTest("brand exporter restores tracked output after failure", async () => {
  const before = Object.fromEntries(await Promise.all((await readdir(file("docs/assets/brand/derived"))).map(async (name) => [name, await hash(`docs/assets/brand/derived/${name}`)])));
  await assert.rejects(exec(process.execPath, ["scripts/export-brand-assets.mjs"], { cwd: root, env: { ...process.env, BRAND_ASSETS_TEST_FAIL_PUBLISH: "1" } }), /simulated publish failure/);
  const after = Object.fromEntries(await Promise.all((await readdir(file("docs/assets/brand/derived"))).map(async (name) => [name, await hash(`docs/assets/brand/derived/${name}`)])));
  assert.deepEqual(after, before);
});

legacyImageMagickTest("brand exporter uses ImageMagick 6 when magick is unavailable", async () => {
  const shim = await mkdtemp(join(tmpdir(), "brand-imagemagick-"));
  try {
    const magick = join(shim, "magick");
    await writeFile(magick, "#!/bin/sh\nexit 127\n");
    await chmod(magick, 0o755);
    const result = await exec(process.execPath, ["scripts/export-brand-assets.mjs", "--check"], { cwd: root, env: { ...process.env, PATH: `${shim}:${process.env.PATH}` } });
    assert.match(result.stdout, /^brand-assets: PASS deterministic tracked outputs/);
  } finally { await rm(shim, { recursive: true, force: true }); }
});
