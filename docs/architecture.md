# Architecture

The plugin is a local OpenCode policy layer. It complements the public
[SourceRudder MCP research gateway](https://github.com/mdesantis1984/SourceRudder)
and is not a fork or deployment of that project.

## Runtime flow

1. The plugin logs a startup canary without allowing logging failures to stop
   OpenCode startup.
2. The configuration hook sets only `websearch`, `webfetch`, and `doom_loop`
   permissions while preserving unrelated permissions.
3. The system transform appends one sentinel-marked policy block and removes only
   complete plugin-owned legacy blocks.
4. The pre-execution hook rejects the two native research tools and tracks exact,
   repeated SourceRudder tool calls by session and canonicalized arguments.
5. A successful post-execution hook clears the matching unresolved fingerprint.

## Boundaries

The plugin cannot classify a missing post-execution hook as a failed MCP call.
It does not block Bash, other MCP tools, or provider-side actions outside the
OpenCode hooks. The nine exact SourceRudder tool names and the two denied native
tool names are defined in `src/policy.ts`.
