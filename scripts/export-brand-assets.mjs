import { createHash, randomUUID } from "node:crypto";
import { mkdir, mkdtemp, readFile, readdir, rename, rm, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const manifestPath = resolve(root, "docs/assets/brand/manifest.json");
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
const options = new Set(process.argv.slice(2));
if ([...options].some((option) => !["--check", "--verify-determinism"].includes(option)) || options.size > 1) throw new Error("only --check or --verify-determinism is supported");
const output = resolve(root, "docs/assets/brand/derived");
const check = options.has("--check");
const verifyDeterminism = options.has("--verify-determinism");
const source = resolve(root, manifest.immutable_inputs[0].path);
const files = manifest.derivatives.map(({ path }) => path.split("/").at(-1));

function run(...args) {
  const result = spawnSync("magick", args, { encoding: "utf8" });
  if (result.status !== 0) throw new Error(result.stderr || "ImageMagick failed");
}
async function digest(path) { return createHash("sha256").update(await readFile(path)).digest("hex"); }
async function generated(dir) { return (await readdir(dir)).sort(); }
async function stage() { return mkdtemp(resolve(root, "docs/assets/brand/.derived-stage-")); }
async function same(left, right) {
  const leftFiles = await generated(left);
  const rightFiles = await generated(right);
  return JSON.stringify(leftFiles) === JSON.stringify(rightFiles) && (await Promise.all(leftFiles.map(async (file) => await digest(resolve(left, file)) === await digest(resolve(right, file))))).every(Boolean);
}
function shield(target, size) {
  run(source, "-gravity", "center", "-crop", "809x809+0+0", "+repage", "-resize", `${size}x${size}!`, "-strip", "-colorspace", "sRGB", "-define", "png:color-type=2", target);
}
function svg(title, desc, body, viewBox) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" role="img" aria-labelledby="title desc"><title id="title">${title}</title><desc id="desc">${desc}</desc>${body}</svg>\n`;
}
async function build(dir) {
  await mkdir(dir, { recursive: true });
  run(source, "-resize", "1280x640^", "-gravity", "center", "-extent", "1280x640", "-strip", "-colorspace", "sRGB", "-quality", "85", "-define", "png:color-type=2", resolve(dir, files[0]));
  for (const [index, size] of [1024, 256, 128, 512, 180, 64, 32].entries()) shield(resolve(dir, files[index + 1]), size);
  await writeFile(resolve(dir, "mark.svg"), svg("SourceRudder Policy shield", "Compact policy shield mark.", `<rect width="100" height="100" rx="20" fill="#090A1A"/><path d="M50 12 82 25v25c0 20-14 32-32 39C32 82 18 70 18 50V25z" fill="#6366F1"/><path d="M31 51 45 65 71 37 67 33 45 57 35 47z" fill="#F8FAFC"/>`, "0 0 100 100"));
  await writeFile(resolve(dir, "lockup.svg"), svg("SourceRudder Policy", "SourceRudder bot with a separate policy shield.", `<rect width="360" height="120" rx="20" fill="#090A1A"/><circle cx="70" cy="58" r="33" fill="#F8FAFC"/><circle cx="58" cy="53" r="5" fill="#090A1A"/><circle cx="79" cy="53" r="5" fill="#090A1A"/><path d="M90 78 108 95" stroke="#F8FAFC" stroke-width="9" stroke-linecap="round"/><path d="M145 23 180 38v29c0 20-15 31-35 39-20-8-35-19-35-39V38z" fill="#6366F1"/><path d="M126 65 141 80 168 50 164 46 141 72 130 61z" fill="#F8FAFC"/><text x="205" y="67" fill="#F8FAFC" font-family="sans-serif" font-size="24" font-weight="700">Policy</text>`, "0 0 360 120"));
  const actual = await generated(dir);
  const expected = [...files, "mark.svg", "lockup.svg"].sort();
  if (JSON.stringify(actual) !== JSON.stringify(expected)) throw new Error("staged inventory is incomplete");
}

const first = await stage();
await build(first);
if (check) {
  try {
    if (!await same(first, output)) throw new Error("non-deterministic tracked output");
    console.log("brand-assets: PASS deterministic tracked outputs");
  } finally { await rm(first, { recursive: true, force: true }); }
} else if (verifyDeterminism) {
  const second = await stage();
  try {
    await build(second);
    if (!await same(first, second)) throw new Error("non-deterministic temporary output");
    console.log("brand-assets: PASS internal deterministic outputs");
  } finally {
    await rm(first, { recursive: true });
    await rm(second, { recursive: true });
  }
} else {
  const backup = `${output}.backup-${randomUUID()}`;
  let previous = false;
  try {
    try { await rename(output, backup); previous = true; } catch { /* first export */ }
    if (process.env.BRAND_ASSETS_TEST_FAIL_PUBLISH === "1") throw new Error("simulated publish failure");
    await rename(first, output);
  } catch (error) {
    if (previous) {
      try { await rename(backup, output); }
      catch (restoreError) { throw new AggregateError([error, restoreError], "publish failed and previous output could not be restored"); }
    }
    throw error;
  } finally {
    await rm(first, { recursive: true, force: true });
  }
  await rm(backup, { recursive: true, force: true });
  console.log("brand-assets: PASS transactionally published staged outputs");
}
