import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { access } from "node:fs/promises";
import test from "node:test";
import {
  ADVISORY_POLICY_GUIDANCE,
  LEGACY_POLICY_GUIDANCE,
  POLICY_GUIDANCE,
} from "../src/policy.js";

const repositoryRoot = new URL("../..", import.meta.url);
const packageJson = JSON.parse(
  await readFile(new URL("package.json", repositoryRoot), "utf8"),
);

test("fresh build emits current package, deployment, and policy artifacts", async () => {
  assert.equal(packageJson.name, "opencode-sourcerudder-policy");
  assert.equal(packageJson.version, "1.0.0");
  assert.equal(packageJson.private, false);
  assert.equal(packageJson.publishConfig.access, "public");
  assert.deepEqual(packageJson.files, [
    "dist/index.js",
    "dist/sourcerudder-policy-v1.0.0.js",
    "README.es.md",
  ]);
  const packageEntry = new URL(packageJson.main, repositoryRoot);
  const versionedBundle = new URL(
    `dist/sourcerudder-policy-v${packageJson.version}.js`,
    repositoryRoot,
  );
  const policyModule = new URL("../src/policy.js", import.meta.url);

  await access(packageEntry);
  await access(versionedBundle);
  await access(policyModule);
  await assert.doesNotReject(import(packageEntry.href));
  await assert.doesNotReject(import(versionedBundle.href));
  const policy = await import(policyModule.href);
  assert.deepEqual(policy.NATIVE_RESEARCH_TOOLS, ["websearch", "webfetch"]);
  assert.equal(policy.POLICY_SENTINEL, "[SOURCERUDDER-POLICY:v1.0.0]");
  assert.equal(policy.isSourceRudderTool("sourcerudder_search_web"), true);
  assert.equal(policy.isNativeResearchTool("websearch"), true);
});

test("policy injection removes only complete owned blocks and preserves host instructions", async () => {
  const { default: plugin } = await import(
    new URL("../index.js", import.meta.url).href
  );
  const hooks = await plugin({
    client: { app: { log: async () => undefined } },
  } as never);
  assert.equal(typeof hooks["tool.execute.before"], "function");
  assert.equal(typeof hooks["tool.execute.after"], "function");

  const legacyHostBefore = "Legacy host instruction before.";
  const legacyHostAfter = "Legacy host instruction after.";
  const currentHostBefore = "Current host instruction before.";
  const currentHostAfter = "Current host instruction after.";
  const malformed =
    "[IA-BUSCAR-POLICY:v0.2.2]\nResearch policy (IA-Buscar-first, mandatory):\npartial host content";
  const lookalike = "[SOURCERUDDER-POLICY:v1.0.0] quoted by a user";
  const system = [
    "ordinary separate host entry",
    `${legacyHostBefore}${LEGACY_POLICY_GUIDANCE}${legacyHostAfter}`,
    `${currentHostBefore}${ADVISORY_POLICY_GUIDANCE}${currentHostAfter}`,
    `Strict host instruction before.${POLICY_GUIDANCE}Strict host instruction after.`,
    malformed,
    lookalike,
    `${LEGACY_POLICY_GUIDANCE}${LEGACY_POLICY_GUIDANCE}`,
  ];
  await hooks["experimental.chat.system.transform"]!({} as never, { system });
  await hooks["experimental.chat.system.transform"]!({} as never, { system });
  assert.equal(system.length, 7);
  assert.equal(system.filter((entry) => entry === POLICY_GUIDANCE).length, 1);
  assert.doesNotMatch(POLICY_GUIDANCE, /IA-Buscar/);
  assert.ok(system.includes("ordinary separate host entry"));
  assert.ok(system.includes(`${legacyHostBefore}${legacyHostAfter}`));
  assert.ok(system.includes(`${currentHostBefore}${currentHostAfter}`));
  assert.ok(
    system.includes(
      "Strict host instruction before.Strict host instruction after.",
    ),
  );
  assert.ok(system.includes(malformed));
  assert.ok(system.includes(lookalike));
  assert.equal(
    system.some((entry) => entry.includes(LEGACY_POLICY_GUIDANCE)),
    false,
  );
  assert.equal(
    system.some((entry) => entry.includes(ADVISORY_POLICY_GUIDANCE)),
    false,
  );

  const before = hooks["tool.execute.before"]!;
  const after = hooks["tool.execute.after"]!;
  const args = { query: "same", options: { language: "en" } };
  for (let i = 0; i < 11; i++) {
    await before(
      {
        tool: "sourcerudder_search_web",
        sessionID: "guarded",
        callID: String(i),
      },
      { args },
    );
  }
  await assert.rejects(
    before(
      { tool: "sourcerudder_search_web", sessionID: "guarded", callID: "4" },
      { args },
    ),
    /twelve times/,
  );
  await after(
    {
      tool: "sourcerudder_search_web",
      sessionID: "guarded",
      callID: "success",
      args: { options: { language: "en" }, query: "same" },
    },
    { title: "ok", output: "ok", metadata: {} },
  );
  await assert.doesNotReject(
    before(
      { tool: "sourcerudder_search_web", sessionID: "guarded", callID: "5" },
      { args },
    ),
  );
});

test("plugin factory keeps retry guard isolated to exact SourceRudder tools", async () => {
  const { default: plugin } = await import(
    new URL("../index.js", import.meta.url).href
  );
  const hooks = await plugin({
    client: { app: { log: async () => undefined } },
  } as never);
  const before = hooks["tool.execute.before"]!;
  const after = hooks["tool.execute.after"]!;
  const args = { query: "same", options: { language: "en" } };
  for (let i = 0; i < 11; i++) {
    await before(
      {
        tool: "sourcerudder_search_web",
        sessionID: "guarded",
        callID: String(i),
      },
      { args },
    );
  }
  await assert.rejects(
    before(
      { tool: "sourcerudder_search_web", sessionID: "guarded", callID: "4" },
      { args },
    ),
    /twelve times/,
  );
  await after(
    {
      tool: "sourcerudder_search_web",
      sessionID: "guarded",
      callID: "success",
      args: { options: { language: "en" }, query: "same" },
    },
    { title: "ok", output: "ok", metadata: {} },
  );
  await assert.doesNotReject(
    before(
      { tool: "sourcerudder_search_web", sessionID: "guarded", callID: "5" },
      { args },
    ),
  );

  await before(
    { tool: "sourcerudder_search_web", sessionID: "unknown", callID: "1" },
    { args },
  );
  await before(
    { tool: "sourcerudder_search_web", sessionID: "unknown", callID: "2" },
    { args },
  );
  for (const nativeTool of ["websearch", "webfetch"]) {
    await assert.rejects(
      before(
        {
          tool: nativeTool,
          sessionID: "blocked",
          callID: `${nativeTool}-first`,
        },
        { args: undefined },
      ),
      /blocks native websearch and webfetch/,
    );
    await after(
      {
        tool: "sourcerudder_search_web",
        sessionID: "blocked",
        callID: `${nativeTool}-success`,
        args,
      },
      { title: "ok", output: "ok", metadata: {} },
    );
    await assert.rejects(
      before(
        {
          tool: nativeTool,
          sessionID: "blocked",
          callID: `${nativeTool}-after-success`,
        },
        { args: null },
      ),
      /blocks native websearch and webfetch/,
    );
    await assert.rejects(
      before(
        {
          tool: nativeTool,
          sessionID: "blocked",
          callID: `${nativeTool}-retry`,
        },
        { args: { nested: [null, true] } },
      ),
      /blocks native websearch and webfetch/,
    );
  }
  for (let i = 0; i < 4; i++) {
    await before(
      {
        tool: "sourcerudder_search_web_extra",
        sessionID: "ignored",
        callID: `lookalike-${i}`,
      },
      { args },
    );
    await before(
      { tool: "bash", sessionID: "ignored", callID: `bash-${i}` },
      { args },
    );
    await before(
      { tool: "context7_search", sessionID: "ignored", callID: `mcp-${i}` },
      { args },
    );
  }
  for (let i = 0; i < 11; i++) {
    await before(
      {
        tool: "sourcerudder_search_web",
        sessionID: "ignored",
        callID: `exact-${i}`,
      },
      { args },
    );
  }
  await assert.rejects(
    before(
      {
        tool: "sourcerudder_search_web",
        sessionID: "ignored",
        callID: "exact-12",
      },
      { args },
    ),
    /twelve times/,
  );
});
