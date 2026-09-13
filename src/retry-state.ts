export const SOURCERUDDER_FAILURE_THRESHOLD = 11;
/** The approved plugin hard bound; OpenCode's independent doom_loop gate remains separate. */
export const IDENTICAL_UNRESOLVED_ATTEMPT_LIMIT = 11;
const MAX_TRACKED_SESSIONS = 32;
const MAX_TRACKED_FINGERPRINTS_PER_SESSION = 64;

export type FailureKind =
  "transport" | "timeout" | "protocol" | "unusable-response";

/**
 * A small, deterministic conceptual counter. OpenCode 1.18.26 exposes a
 * success output from tool.execute.after, but no documented synchronous
 * failure object for failed MCP calls. The plugin records successes but cannot
 * honestly infer or enforce failures it cannot observe.
 */
export class RetryState {
  private consecutiveFailures = 0;

  recordFailure(kind: FailureKind): void {
    void kind;
    this.consecutiveFailures += 1;
  }

  recordSuccess(): void {
    this.consecutiveFailures = 0;
  }

  get count(): number {
    return this.consecutiveFailures;
  }

  get fallbackEligible(): boolean {
    return this.consecutiveFailures >= SOURCERUDDER_FAILURE_THRESHOLD;
  }
}

function stableSerialize(value: unknown): string {
  if (value === null) return "null";
  if (typeof value === "string") return JSON.stringify(value);
  if (typeof value === "number" || typeof value === "boolean")
    return String(value);
  if (typeof value === "undefined") return "undefined";
  if (Array.isArray(value)) return `[${value.map(stableSerialize).join(",")}]`;
  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => (left < right ? -1 : left > right ? 1 : 0))
      .map(
        ([key, entry]) => `${JSON.stringify(key)}:${stableSerialize(entry)}`,
      );
    return `{${entries.join(",")}}`;
  }
  return `${typeof value}:${String(value)}`;
}

export function fingerprintToolAttempt(tool: string, args: unknown): string {
  return `${tool}\u0000${stableSerialize(args)}`;
}

/** Tracks only unresolved, identical SourceRudder attempts, bounded per session. */
export class IdenticalAttemptGuard {
  private readonly sessions = new Map<string, Map<string, number>>();

  recordBefore(sessionID: string, fingerprint: string): void {
    let session = this.sessions.get(sessionID);
    if (!session) {
      if (this.sessions.size >= MAX_TRACKED_SESSIONS) {
        const oldestSession = this.sessions.keys().next().value;
        if (oldestSession !== undefined) this.sessions.delete(oldestSession);
      }
      session = new Map();
      this.sessions.set(sessionID, session);
    }
    if (
      !session.has(fingerprint) &&
      session.size >= MAX_TRACKED_FINGERPRINTS_PER_SESSION
    ) {
      const oldestFingerprint = session.keys().next().value;
      if (oldestFingerprint !== undefined) session.delete(oldestFingerprint);
    }
    const attempts = (session.get(fingerprint) ?? 0) + 1;
    if (attempts > IDENTICAL_UNRESOLVED_ATTEMPT_LIMIT) {
      throw new Error(
        "SourceRudder repeated the same unresolved attempt twelve times. Check the MCP connection or arguments, then retry with a different request.",
      );
    }
    session.set(fingerprint, attempts);
  }

  recordSuccess(sessionID: string, fingerprint: string): void {
    const session = this.sessions.get(sessionID);
    if (!session) return;
    session.delete(fingerprint);
    if (session.size === 0) this.sessions.delete(sessionID);
  }
}
