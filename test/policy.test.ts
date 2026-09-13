import assert from "node:assert/strict";
import test from "node:test";
import { enforceNativeResearchBlocking } from "../src/permissions.js";
import {
  SOURCERUDDER_FAILURE_THRESHOLD,
  IDENTICAL_UNRESOLVED_ATTEMPT_LIMIT,
  IdenticalAttemptGuard,
  RetryState,
  fingerprintToolAttempt,
} from "../src/retry-state.js";

test("preserves unrelated permissions and blocks native tools globally and per agent", () => {
  const config = {
    permission: {
      edit: "deny" as const,
      bash: "allow" as const,
      websearch: "allow" as const,
      webfetch: "ask" as const,
    },
    agent: {
      build: {
        permission: {
          bash: "allow" as const,
          context7_search: "allow" as const,
          webfetch: "ask" as const,
        },
      },
      review: { permission: "allow" },
      empty: {},
    },
  };
  enforceNativeResearchBlocking(config);
  assert.equal(config.permission.edit, "deny");
  assert.equal(config.permission.bash, "allow");
  assert.equal(config.permission.websearch, "deny");
  assert.equal(config.permission.webfetch, "deny");
  assert.equal(config.agent.build.permission?.bash, "allow");
  assert.equal(config.agent.build.permission?.context7_search, "allow");
  assert.equal(
    (config.agent.build.permission as Record<string, string>).websearch,
    "deny",
  );
  assert.equal(config.agent.build.permission?.webfetch, "deny");
  assert.deepEqual(config.agent.review.permission, {
    "*": "allow",
    websearch: "deny",
    webfetch: "deny",
    doom_loop: "ask",
  });
  assert.deepEqual(
    (config.agent.empty as { permission?: unknown }).permission,
    { websearch: "deny", webfetch: "deny", doom_loop: "ask" },
  );
  assert.equal((config.permission as Record<string, string>).doom_loop, "ask");
});

test("threshold is eleven and success resets the conceptual counter", () => {
  const state = new RetryState();
  for (let i = 0; i < SOURCERUDDER_FAILURE_THRESHOLD - 1; i++)
    state.recordFailure("timeout");
  assert.equal(state.fallbackEligible, false);
  state.recordFailure("protocol");
  assert.equal(state.fallbackEligible, true);
  state.recordSuccess();
  assert.equal(state.count, 0);
  assert.equal(state.fallbackEligible, false);
});

test("identical attempt fingerprints are stable and the unresolved guard permits attempts one through eleven", () => {
  const guard = new IdenticalAttemptGuard();
  const state = new RetryState();
  const first = fingerprintToolAttempt("sourcerudder_search_web", {
    z: [1, "x"],
    a: true,
  });
  const second = fingerprintToolAttempt("sourcerudder_search_web", {
    a: true,
    z: [1, "x"],
  });
  assert.equal(first, second);
  for (let i = 0; i < IDENTICAL_UNRESOLVED_ATTEMPT_LIMIT; i++)
    guard.recordBefore("session", first);
  assert.throws(() => guard.recordBefore("session", first), /twelve times/);
  guard.recordSuccess("session", first);
  assert.doesNotThrow(() => guard.recordBefore("session", first));
  assert.equal(state.count, 0);
  assert.equal(state.fallbackEligible, false);
});

test("missing after remains unresolved and does not unlock fallback", () => {
  const guard = new IdenticalAttemptGuard();
  const state = new RetryState();
  const fingerprint = fingerprintToolAttempt("sourcerudder_search_web", {
    query: "same",
  });

  for (let i = 0; i < IDENTICAL_UNRESOLVED_ATTEMPT_LIMIT; i++) {
    guard.recordBefore("missing-after", fingerprint);
  }

  assert.equal(state.count, 0);
  assert.equal(state.fallbackEligible, false);
  assert.throws(
    () => guard.recordBefore("missing-after", fingerprint),
    /twelve times/,
  );
});
