import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { cp, mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const repositoryRoot = dirname(fileURLToPath(new URL("../../package.json", import.meta.url)));

function run(cwd: string, command: string, args: string[]) {
  return spawnSync(command, args, { cwd, encoding: "utf8" });
}

test("history gate detects worktree personal data without printing it", async () => {
  const fixture = await mkdtemp(join(tmpdir(), "history-gate-"));
  const personalEmail = ["person", "@", "example", ".com"].join("");
  const commitEmail = ["test", "@", "users.noreply.github.com"].join("");

  try {
    await mkdir(join(fixture, "scripts"));
    await cp(join(repositoryRoot, "scripts/check-history.mjs"), join(fixture, "scripts/check-history.mjs"));
    await writeFile(join(fixture, "package.json"), '{"private":false}\n');
    await writeFile(join(fixture, "README.md"), "Public repository.\n");
    await writeFile(join(fixture, "README.es.md"), "Repositorio público.\n");
    await mkdir(join(fixture, "docs"));
    await writeFile(join(fixture, "docs/repository-policy.md"), "Public visibility.\n");
    await writeFile(join(fixture, "docs/repository-policy.es.md"), "Visibilidad pública.\n");

    assert.equal(run(fixture, "git", ["init", "-q"]).status, 0);
    assert.equal(run(fixture, "git", ["add", "."]).status, 0);
    assert.equal(
      run(fixture, "git", ["-c", "user.name=Test", "-c", `user.email=${commitEmail}`, "commit", "-qm", "test: fixture"]).status,
      0,
    );

    await writeFile(join(fixture, "personal.txt"), `${personalEmail}\n`);
    assert.equal(run(fixture, "git", ["add", "personal.txt"]).status, 0);
    const result = run(fixture, process.execPath, ["scripts/check-history.mjs"]);

    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /email address detected at personal\.txt:1 in worktree/);
    assert.doesNotMatch(result.stderr, new RegExp(personalEmail.replace(".", "\\.")));
  } finally {
    await rm(fixture, { recursive: true, force: true });
  }
});
