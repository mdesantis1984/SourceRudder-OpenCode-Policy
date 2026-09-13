import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { lstat, readFile } from "node:fs/promises";
import { resolve } from "node:path";

const installedPath = process.argv[2];
const sourcePath = new URL(
  "../dist/sourcerudder-policy-v1.0.0.js",
  import.meta.url,
);
const tools = [
  "sourcerudder_search_web",
  "sourcerudder_search_doc_oficial",
  "sourcerudder_search_github",
  "sourcerudder_search_github_issue",
  "sourcerudder_search_github_pr",
  "sourcerudder_search_reddit",
  "sourcerudder_search_stackoverflow",
  "sourcerudder_fetch_url",
  "sourcerudder_fetch_and_extract",
];

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

async function verify() {
  assert.ok(
    installedPath,
    "usage: node scripts/verify-installed.mjs <installed-policy-path>",
  );
  const target = resolve(installedPath);
  const [sourceBytes, targetBytes, targetStats] = await Promise.all([
    readFile(sourcePath),
    readFile(target),
    lstat(target),
  ]);
  assert.equal(
    targetStats.isFile(),
    true,
    "installed bundle must be a regular file",
  );
  assert.equal(
    targetStats.isSymbolicLink(),
    false,
    "installed bundle must not be a symlink",
  );
  assert.equal(
    sha256(targetBytes),
    sha256(sourceBytes),
    "installed bundle hash must equal the validated distribution hash",
  );

  const { default: plugin } = await import(
    `data:text/javascript;base64,${targetBytes.toString("base64")}`
  );
  const hooks = await plugin({
    client: { app: { log: async () => undefined } },
  });
  assert.equal(typeof hooks["tool.execute.before"], "function");
  assert.equal(typeof hooks["tool.execute.after"], "function");

  const config = {
    permission: {
      edit: "deny",
      bash: "allow",
      websearch: "allow",
      webfetch: "ask",
    },
    agent: {
      build: {
        permission: {
          bash: "allow",
          context7_search: "allow",
          websearch: "ask",
          webfetch: "allow",
        },
      },
    },
  };
  await hooks.config(config);
  assert.equal(config.permission.edit, "deny");
  assert.equal(config.permission.bash, "allow");
  assert.equal(config.permission.websearch, "deny");
  assert.equal(config.permission.webfetch, "deny");
  assert.equal(config.agent.build.permission.bash, "allow");
  assert.equal(config.agent.build.permission.context7_search, "allow");
  assert.equal(config.agent.build.permission.websearch, "deny");
  assert.equal(config.agent.build.permission.webfetch, "deny");
  assert.equal(config.permission.doom_loop, "ask");
  const stringConfig = {
    permission: "allow",
    agent: { review: { permission: "ask" } },
  };
  await hooks.config(stringConfig);
  assert.deepEqual(stringConfig.permission, {
    "*": "allow",
    websearch: "deny",
    webfetch: "deny",
    doom_loop: "ask",
  });
  assert.deepEqual(stringConfig.agent.review.permission, {
    "*": "ask",
    websearch: "deny",
    webfetch: "deny",
    doom_loop: "ask",
  });

  const legacy = `
[IA-BUSCAR-POLICY:v0.2.2]
Research policy (IA-Buscar-first, mandatory):

1. Use the IA-Buscar MCP tools before any native OpenCode research tool. Select the
   specialized tool for the evidence: official documentation uses
   ia-buscar_search_doc_oficial; general web research uses ia-buscar_search_web;
   GitHub repositories/source uses ia-buscar_search_github; issues use
   ia-buscar_search_github_issue; pull requests use ia-buscar_search_github_pr;
   technical/community evidence uses ia-buscar_search_stackoverflow and
   ia-buscar_search_reddit; and URL retrieval/extraction uses
   ia-buscar_fetch_url or ia-buscar_fetch_and_extract.
2. These ia-buscar_* names are MCP tools and are distinct from OpenCode native
   websearch and webfetch. Never treat the native names as aliases for IA-Buscar.
3. Native websearch/webfetch fallback is eligible only after 11 consecutive,
   genuine IA-Buscar transport, timeout, protocol, or unusable-response failures.
   Valid empty results, warnings, 404/no-match responses, and structurally valid
   degraded responses do not count. Any successful IA-Buscar response resets the
   conceptual failure count.
4. Native fallback always requires explicit human approval. Do not silently use
   native tools, and do not claim that a failed MCP call was counted unless the
   host provides a reliable failure signal.
5. Do not use doom_loop to bypass this policy or to repeat research indefinitely.
`;
  const advisory = `
[SOURCERUDDER-POLICY:v1.0.0]
Research policy (SourceRudder-first, mandatory):

1. Use the SourceRudder MCP tools before any native OpenCode research tool. Select the
    specialized tool for the evidence: official documentation uses
    sourcerudder_search_doc_oficial; general web research uses sourcerudder_search_web;
    GitHub repositories/source uses sourcerudder_search_github; issues use
    sourcerudder_search_github_issue; pull requests use sourcerudder_search_github_pr;
    technical/community evidence uses sourcerudder_search_stackoverflow and
    sourcerudder_search_reddit; and URL retrieval/extraction uses
    sourcerudder_fetch_url or sourcerudder_fetch_and_extract.
2. These sourcerudder_* names are MCP tools and are distinct from OpenCode native
    websearch and webfetch. Never treat the native names as aliases for SourceRudder.
3. Native websearch/webfetch fallback is eligible only after 11 consecutive,
    genuine SourceRudder transport, timeout, protocol, or unusable-response failures.
   Valid empty results, warnings, 404/no-match responses, and structurally valid
    degraded responses do not count. Any successful SourceRudder response resets the
   conceptual failure count.
4. Native fallback always requires explicit human approval. Do not silently use
   native tools, and do not claim that a failed MCP call was counted unless the
   host provides a reliable failure signal.
5. Do not use doom_loop to bypass this policy or to repeat research indefinitely.
`;
  const canonical = [];
  await hooks["experimental.chat.system.transform"]({}, { system: canonical });
  const current = canonical[0];
  assert.doesNotMatch(current, /IA-Buscar/);
  const legacyHostBefore = "Legacy host instruction before.";
  const legacyHostAfter = "Legacy host instruction after.";
  const advisoryHostBefore = "Advisory host instruction before.";
  const advisoryHostAfter = "Advisory host instruction after.";
  const currentHostBefore = "Current host instruction before.";
  const currentHostAfter = "Current host instruction after.";
  const strictHostBefore = "Strict host instruction before.";
  const strictHostAfter = "Strict host instruction after.";
  const malformed =
    "[IA-BUSCAR-POLICY:v0.2.2]\nResearch policy (IA-Buscar-first, mandatory):\npartial host content";
  const lookalike = "[SOURCERUDDER-POLICY:v1.0.0] user quotation";
  const system = [
    "ordinary separate host entry",
    `${legacyHostBefore}${legacy}${legacyHostAfter}`,
    `${advisoryHostBefore}${advisory}${advisoryHostAfter}`,
    `${currentHostBefore}${current}${currentHostAfter}`,
    `${strictHostBefore}${current}${strictHostAfter}`,
    malformed,
    lookalike,
    `${legacy}${legacy}`,
  ];
  await hooks["experimental.chat.system.transform"]({}, { system });
  await hooks["experimental.chat.system.transform"]({}, { system });
  assert.equal(system.length, 8);
  assert.equal(system.filter((entry) => entry === current).length, 1);
  assert.equal(system.includes("ordinary separate host entry"), true);
  assert.equal(system.includes(`${legacyHostBefore}${legacyHostAfter}`), true);
  assert.equal(
    system.includes(`${advisoryHostBefore}${advisoryHostAfter}`),
    true,
  );
  assert.equal(
    system.includes(`${currentHostBefore}${currentHostAfter}`),
    true,
  );
  assert.equal(system.includes(`${strictHostBefore}${strictHostAfter}`), true);
  assert.equal(system.includes(malformed), true);
  assert.equal(system.includes(lookalike), true);
  assert.equal(
    system.some((entry) => entry.includes(legacy)),
    false,
  );
  assert.equal(
    system.some((entry) => entry.includes(advisory)),
    false,
  );

  const before = hooks["tool.execute.before"];
  const after = hooks["tool.execute.after"];
  const args = { query: "verification" };
  for (const tool of tools)
    await before({ tool, sessionID: "allowlist", callID: tool }, { args });
  for (let attempt = 1; attempt <= 11; attempt++)
    await before(
      { tool: tools[0], sessionID: "bounded", callID: String(attempt) },
      { args },
    );
  await assert.rejects(
    before({ tool: tools[0], sessionID: "bounded", callID: "12" }, { args }),
    /twelve times/,
  );
  await after(
    { tool: tools[0], sessionID: "bounded", callID: "success", args },
    { title: "ok", output: "ok", metadata: {} },
  );
  await assert.doesNotReject(
    before({ tool: tools[0], sessionID: "bounded", callID: "reset" }, { args }),
  );
  for (const tool of ["websearch", "webfetch"]) {
    await assert.rejects(
      before(
        { tool, sessionID: "native", callID: `${tool}-first` },
        { args: undefined },
      ),
      /blocks native websearch and webfetch/,
    );
    await after(
      { tool: tools[0], sessionID: "native", callID: `${tool}-success`, args },
      { title: "ok", output: "ok", metadata: {} },
    );
    await assert.rejects(
      before(
        { tool, sessionID: "native", callID: `${tool}-after-success` },
        { args: null },
      ),
      /blocks native websearch and webfetch/,
    );
    await assert.rejects(
      before(
        { tool, sessionID: "native", callID: `${tool}-retry` },
        { args: { nested: [null, true] } },
      ),
      /blocks native websearch and webfetch/,
    );
  }
  for (const tool of [
    "bash",
    "context7_search",
    "sourcerudder_search_web_extra",
  ]) {
    for (let attempt = 1; attempt <= 12; attempt++)
      await before(
        { tool, sessionID: "isolated", callID: `${tool}-${attempt}` },
        { args },
      );
  }

  console.log(
    "verify-installed: PASS hash, factory, strict native blocking, exact policy preservation, allowlist, 11/12/reset/isolation",
  );
}

verify().catch((error) => {
  console.error(
    `verify-installed: FAIL ${error instanceof Error ? error.message : "unknown error"}`,
  );
  process.exitCode = 1;
});
