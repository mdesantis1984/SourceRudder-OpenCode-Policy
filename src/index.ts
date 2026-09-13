import type { Plugin } from "@opencode-ai/plugin";
import { enforceNativeResearchBlocking } from "./permissions.js";
import {
  isNativeResearchTool,
  isSourceRudderTool,
  POLICY_GUIDANCE,
  removeOwnedPolicyGuidance,
} from "./policy.js";
import {
  IdenticalAttemptGuard,
  RetryState,
  fingerprintToolAttempt,
} from "./retry-state.js";

const plugin: Plugin = async ({ client }) => {
  const retryState = new RetryState();
  const identicalAttemptGuard = new IdenticalAttemptGuard();

  const logCanary = async (): Promise<void> => {
    try {
      await client.app.log({
        body: {
          level: "info",
          service: "sourcerudder-policy",
          message:
            "SourceRudder-first policy plugin initialized (OpenCode 1.18.26 target)",
        },
      });
    } catch {
      // Logging must never prevent OpenCode startup.
    }
  };

  await logCanary();

  return {
    async config(config) {
      enforceNativeResearchBlocking(config);
    },

    "experimental.chat.system.transform": async (_input, output) => {
      const preservedSystem = output.system.flatMap((entry) => {
        const preserved = removeOwnedPolicyGuidance(entry);
        return preserved === undefined ? [] : [preserved];
      });
      output.system.splice(0, output.system.length, ...preservedSystem);
      output.system.push(POLICY_GUIDANCE);
    },

    "tool.execute.before": async (input, _output) => {
      if (isNativeResearchTool(input.tool)) {
        throw new Error(
          "SourceRudder Policy blocks native websearch and webfetch. Use an allowed SourceRudder tool or another permitted tool.",
        );
      }
      // This plugin bound is independent from OpenCode's doom_loop: ask gate.
      if (isSourceRudderTool(input.tool)) {
        identicalAttemptGuard.recordBefore(
          input.sessionID,
          fingerprintToolAttempt(input.tool, _output.args),
        );
      }
    },

    "tool.execute.after": async (input) => {
      // Missing after hooks are unknown/unresolved, not confirmed failures. This
      // success-only hook is used only for the reliable half: success resets.
      if (isSourceRudderTool(input.tool)) {
        const fingerprint = fingerprintToolAttempt(input.tool, input.args);
        identicalAttemptGuard.recordSuccess(input.sessionID, fingerprint);
        retryState.recordSuccess();
      }
    },

    async event() {
      // Deliberately no failure inference: event payloads do not guarantee a
      // synchronous failed-MCP signal in OpenCode 1.18.26.
    },
  };
};

export default plugin;
