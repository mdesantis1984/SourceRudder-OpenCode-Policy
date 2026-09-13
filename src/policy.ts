export const SOURCERUDDER_TOOLS = [
  "sourcerudder_search_web",
  "sourcerudder_search_doc_oficial",
  "sourcerudder_search_github",
  "sourcerudder_search_github_issue",
  "sourcerudder_search_github_pr",
  "sourcerudder_search_reddit",
  "sourcerudder_search_stackoverflow",
  "sourcerudder_fetch_url",
  "sourcerudder_fetch_and_extract",
] as const;

export const NATIVE_RESEARCH_TOOLS = ["websearch", "webfetch"] as const;
export const CONTROLLED_PERMISSIONS = [
  ...NATIVE_RESEARCH_TOOLS,
  "doom_loop",
] as const;
export const POLICY_SENTINEL = "[SOURCERUDDER-POLICY:v1.0.0]";
const LEGACY_POLICY_SENTINEL = "[IA-BUSCAR-POLICY:v0.2.2]";

export const POLICY_GUIDANCE = `
${POLICY_SENTINEL}
Research policy (SourceRudder-first; native tools blocked):

1. Use the SourceRudder MCP tools before any native OpenCode research tool. Select the
    specialized tool for the evidence: official documentation uses
    sourcerudder_search_doc_oficial; general web research uses sourcerudder_search_web;
    GitHub repositories/source uses sourcerudder_search_github; issues use
    sourcerudder_search_github_issue; pull requests use sourcerudder_search_github_pr;
    technical/community evidence uses sourcerudder_search_stackoverflow and
    sourcerudder_search_reddit; and URL retrieval/extraction uses
    sourcerudder_fetch_url or sourcerudder_fetch_and_extract.
2. Native OpenCode websearch and webfetch are blocked by this policy. They have no
   approval path and no fallback path.
3. This scope blocks only native websearch and webfetch. It does not block Bash,
   other MCP tools, or provider-side actions outside these OpenCode hooks, and it
   does not claim that every request must use online research.
4. Eleven identical unresolved SourceRudder attempts are permitted; the twelfth is
   blocked. A reliable successful after hook clears that unresolved-attempt state.
   Missing after hooks remain unresolved, not confirmed failures, because the SDK
   does not expose a documented synchronous failed-MCP signal.
5. Do not use doom_loop to bypass this policy or to repeat research indefinitely.
`;

export function isSourceRudderTool(name: string): boolean {
  return (SOURCERUDDER_TOOLS as readonly string[]).includes(name);
}

export function isNativeResearchTool(name: string): boolean {
  return (NATIVE_RESEARCH_TOOLS as readonly string[]).includes(name);
}

/** Exact advisory v1.0.0 guidance, retained solely for strict-mode migration cleanup. */
export const ADVISORY_POLICY_GUIDANCE = `
${POLICY_SENTINEL}
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

/** Exact v0.2.2 plugin-owned guidance, retained solely for migration cleanup. */
export const LEGACY_POLICY_GUIDANCE = `
${LEGACY_POLICY_SENTINEL}
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

/** Removes only byte-for-byte complete plugin-owned policy blocks. */
export function removeOwnedPolicyGuidance(entry: string): string | undefined {
  const withoutLegacy = entry.split(LEGACY_POLICY_GUIDANCE).join("");
  const withoutAdvisory = withoutLegacy
    .split(ADVISORY_POLICY_GUIDANCE)
    .join("");
  const withoutCurrent = withoutAdvisory.split(POLICY_GUIDANCE).join("");
  return withoutCurrent === "" && entry !== "" ? undefined : withoutCurrent;
}
