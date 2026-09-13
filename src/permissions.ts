type PermissionAction = "allow" | "ask" | "deny";
type PermissionValue =
  | PermissionAction
  | Record<string, PermissionAction | Record<string, PermissionAction>>;
type ConfigLike = {
  permission?: unknown;
  agent?: Record<string, { permission?: unknown } | undefined>;
};

function enforce(value: unknown): PermissionValue {
  const preserved =
    typeof value === "string"
      ? { "*": value as PermissionAction }
      : ((value ?? {}) as Record<
          string,
          PermissionAction | Record<string, PermissionAction>
        >);
  return {
    ...preserved,
    websearch: "deny",
    webfetch: "deny",
    doom_loop: "ask",
  };
}

/** Mutates only permission keys owned by this policy; all other config survives unchanged. */
export function enforceNativeResearchBlocking(config: ConfigLike): void {
  config.permission = enforce(config.permission);
  for (const agent of Object.values(config.agent ?? {})) {
    if (agent) agent.permission = enforce(agent.permission);
  }
}
