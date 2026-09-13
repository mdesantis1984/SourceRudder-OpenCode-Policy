import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import test from "node:test";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const repositoryRoot = new URL("../..", import.meta.url);

test("installed-bundle harness validates the versioned SourceRudder distribution", async () => {
  const { stdout, stderr } = await execFileAsync(
    process.execPath,
    ["scripts/verify-installed.mjs", "dist/sourcerudder-policy-v1.0.0.js"],
    {
      cwd: repositoryRoot,
    },
  );
  assert.equal(stderr, "");
  assert.match(stdout, /^verify-installed: PASS /);
});
