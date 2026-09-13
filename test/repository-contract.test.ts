import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const repositoryRoot = new URL("../..", import.meta.url);

async function repositoryFile(path: string): Promise<string> {
  return readFile(new URL(path, repositoryRoot), "utf8");
}

test("PR policy validates metadata without executing pull request code", async () => {
  const workflow = await repositoryFile(".github/workflows/pr-policy.yml");

  assert.match(workflow, /pull_request_target:/);
  assert.match(workflow, /issues: read/);
  assert.match(workflow, /pull-requests: read/);
  assert.doesNotMatch(workflow, /contents:/);
  assert.doesNotMatch(workflow, /actions\/checkout/);
  assert.match(workflow, /actions\/github-script@ed597411d8f924073f98dfc5c65a23a2325f34cd # v8/);
  assert.match(workflow, /Closes #N, Fixes #N, or Resolves #N/);
  assert.match(workflow, /status:approved/);
  assert.match(workflow, /exactly one type:\* label/);
  assert.match(workflow, /Branch .*type\/description naming/);
  assert.match(workflow, /PR title must follow Conventional Commits/);
});

test("PR policy rejects a multiline suffix after a Conventional Commit title", async () => {
  const workflow = await repositoryFile(".github/workflows/pr-policy.yml");
  const match = workflow.match(/const titlePattern = \/(.+)\/;/);
  if (!match) throw new Error("PR policy title pattern is missing");

  const titlePattern = new RegExp(match[1]);
  assert.equal(titlePattern.test("ci: enforce metadata"), true);
  assert.equal(titlePattern.test("ci: enforce metadata\nnon-conforming suffix"), false);
});

test("security policies are checked, linked, and available from both READMEs", async () => {
  const [english, spanish, checker, readme, spanishReadme] = await Promise.all([
    repositoryFile("SECURITY.md"),
    repositoryFile("SECURITY.es.md"),
    repositoryFile("scripts/check-docs.mjs"),
    repositoryFile("README.md"),
    repositoryFile("README.es.md"),
  ]);

  assert.match(checker, /"SECURITY\.es\.md"/);
  assert.match(readme, /\]\(SECURITY\.md\)/);
  assert.match(spanishReadme, /\]\(SECURITY\.es\.md\)/);
  for (const [content, counterpart] of [
    [english, "SECURITY.es.md"],
    [spanish, "SECURITY.md"],
  ]) {
    assert.match(content, new RegExp(`\\]\\(${counterpart.replace(".", "\\.")}\\)`));
    assert.match(content, /security\/advisories\/new/);
    assert.match(content, /private (reporting )?channel|canal privado/i);
  }
});
