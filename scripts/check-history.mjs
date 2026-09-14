import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(new URL("../package.json", import.meta.url)));
const options = new Set(process.argv.slice(2));
assert.deepEqual([...options], options.has("--public") ? ["--public"] : [], "only --public is supported");

function git(args, allowedStatuses = [0]) {
  const result = spawnSync("git", args, {
    cwd: root,
    encoding: "utf8",
    maxBuffer: 16 * 1024 * 1024,
  });
  if (result.error) throw result.error;
  if (!allowedStatuses.includes(result.status)) {
    throw new Error(result.stderr.trim() || `git ${args[0]} failed with status ${result.status}`);
  }
  return result;
}

const commits = git(["rev-list", "--all"]).stdout.trim().split("\n").filter(Boolean);
assert.ok(commits.length > 0, "repository history is required");

const allowedCommitEmail = /^(?:noreply@github\.com|[^@\s]+@users\.noreply\.github\.com)$/;
const prohibitedPath = /(^|\/)(?:\.env(?:\..*)?|\.npmrc|id_(?:rsa|dsa|ecdsa|ed25519)(?:\.pub)?|[^/]+\.(?:pem|key|p12|pfx))$/i;
const contentRules = [
  ["email address", ["[A-Za-z0-9._%+-]+", "@", "[A-Za-z0-9.-]+", "\\.[A-Za-z]{2,}"].join("")],
  ["private key", "-----BEGIN (RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----"],
  ["GitHub token", ["gh[pousr]_", "[A-Za-z0-9_]{32,}", "|github", "_pat_[A-Za-z0-9_]{40,}"].join("")],
  ["npm token", ["npm", "_[A-Za-z0-9]{30,}"].join("")],
  ["AWS access key", "(AKIA|ASIA)[A-Z0-9]{16}"],
  ["Google API key", ["AI", "za[0-9A-Za-z_-]{35}"].join("")],
  ["Slack token", ["xox", "[baprs]-[0-9A-Za-z-]{20,}"].join("")],
  ["credentialed URL", "https?://[^/@[:space:]]+:[^/@[:space:]]+@"],
  ["absolute user path", ["(/ho", "me/|/Us", "ers/|[A-Za-z]:\\\\Us", "ers\\\\|/m", "nt/)[^[:space:]\\\"'`]+"].join("")],
  ["private network URL", ["https?://(local", "host|127\\.0\\.0\\.1|10\\.[0-9.]+|192\\.168\\.[0-9.]+)"].join("")],
];

for (const commit of commits) {
  const metadata = git(["show", "-s", "--format=%ae%n%ce", commit]).stdout.trim().split("\n");
  for (const email of metadata) {
    assert.match(email, allowedCommitEmail, `disallowed commit email in ${commit}`);
  }
}

for (const tree of [{ name: "worktree" }, ...commits.map((commit) => ({ name: commit, commit }))]) {
  const paths = tree.commit
    ? git(["ls-tree", "-r", "--name-only", tree.commit]).stdout.trim().split("\n").filter(Boolean)
    : git(["ls-files"]).stdout.trim().split("\n").filter(Boolean);

  for (const path of paths) {
    assert.doesNotMatch(path, prohibitedPath, `prohibited sensitive path in ${tree.name}`);
  }

  for (const [name, pattern] of contentRules) {
    const args = ["grep", "-I", "-n", "-E", "-e", pattern];
    if (tree.commit) args.push(tree.commit);
    args.push("--");
    const result = git(args, [0, 1]);
    if (result.status === 0) {
      const fields = result.stdout.split("\n", 1)[0].split(":");
      const offset = tree.commit ? 1 : 0;
      throw new Error(`${name} detected at ${fields[offset]}:${fields[offset + 1]} in ${tree.name}`);
    }
  }
}

if (options.has("--public")) {
  const readme = await readFile(join(root, "README.md"), "utf8");
  const spanishReadme = await readFile(join(root, "README.es.md"), "utf8");
  const policy = await readFile(join(root, "docs/repository-policy.md"), "utf8");
  const spanishPolicy = await readFile(join(root, "docs/repository-policy.es.md"), "utf8");
  const packageMetadata = JSON.parse(await readFile(join(root, "package.json"), "utf8"));

  const staleClaims = [
    [readme, /Public visibility is approved|pending its publication gate/i, "README.md has pre-publication status"],
    [spanishReadme, /La visibilidad pública está aprobada|pendiente de su puerta de publicación/i, "README.es.md has pre-publication status"],
    [policy, /\|\s*Visibility\s*\|\s*Private repository/i, "repository policy still declares private visibility"],
    [spanishPolicy, /\|\s*Visibilidad\s*\|\s*Repositorio privado/i, "Spanish repository policy still declares private visibility"],
  ];
  for (const [content, pattern, message] of staleClaims) {
    if (pattern.test(content)) throw new Error(message);
  }
  assert.equal(packageMetadata.private, false, "public package metadata must remain publishable");
}

console.log(`check-history: PASS ${commits.length} commits and worktree${options.has("--public") ? ", public claims" : ""}`);
