import { readFile } from "node:fs/promises";
import { build } from "esbuild";

const { version } = JSON.parse(
  await readFile(new URL("../package.json", import.meta.url), "utf8"),
);
const commonOptions = {
  bundle: true,
  entryPoints: ["src/index.ts"],
  format: "esm",
  platform: "node",
};

await build({ ...commonOptions, outfile: "dist/index.js" });
await build({
  ...commonOptions,
  outfile: `dist/sourcerudder-policy-v${version}.js`,
});
