/**
 * Shared write guard, following the current Bluesky/Substack implementation.
 * Audience, delivery, deletion and signing-secret changes need confirmation.
 * Reversible account configuration is a write. Account reads do not mutate Kit.
 * Read-only mode hides writes and also refuses direct calls to hidden tools.
 */

import { appendFileSync } from "node:fs";

import { WriteBlockedError } from "./api/errors.js";
import type { Config } from "./config.js";

export type Risk = "read" | "write" | "destructive";

/**
 * How the caller reached us, so a refusal names what they can actually type.
 * A model reads `confirm: true`; a person at a terminal reads `--confirm`.
 */
export type Surface = "mcp" | "cli";

export function needsConfirm(risk: Risk): boolean {
  return risk === "destructive";
}

export class WriteGuard {
  private readonly config: Config;
  private readonly surface: Surface;

  constructor(config: Config, surface: Surface = "mcp") {
    this.config = config;
    this.surface = surface;
  }

  private get confirmFlag(): string {
    return this.surface === "cli" ? "--confirm" : "confirm: true";
  }

  get readOnly(): boolean {
    return this.config.readOnly;
  }

  check(tool: string, risk: Risk, confirm: boolean | undefined, summary: string): void {
    if (risk === "read") return;

    if (this.config.readOnly) {
      this.audit(tool, risk, summary, "blocked: read-only");
      throw new WriteBlockedError(
        `${tool} is unavailable: this server is running with KIT_READ_ONLY=1.`,
      );
    }

    if (needsConfirm(risk)) {
      if (!this.config.allowDestructive) {
        this.audit(tool, risk, summary, "blocked: writes disabled");
        throw new WriteBlockedError(
          `${tool} is unavailable: this server is running with KIT_ALLOW_DESTRUCTIVE=0.`,
        );
      }
      if (confirm !== true) {
        this.audit(tool, risk, summary, "blocked: no confirm");
        const why = "may affect delivery, audience membership or irreversible state";
        throw new WriteBlockedError(
          `${tool} ${why}, so it will not run without ${this.confirmFlag}. About to: ${summary}. Call again with ${this.confirmFlag} if that is what was asked for.`,
        );
      }
    }

    this.audit(tool, risk, summary, "allowed");
  }

  /** Append-only record of write guard decisions, when KIT_AUDIT_LOG is set. */
  private audit(tool: string, risk: Risk, summary: string, outcome: string): void {
    if (!this.config.auditPath) return;
    const line = JSON.stringify({
      at: new Date().toISOString(),
      surface: this.surface,
      tool,
      risk,
      summary,
      outcome,
    });
    try {
      appendFileSync(this.config.auditPath, `${line}\n`, { mode: 0o600 });
    } catch {
      // A failing audit log must never take the tool call down with it.
    }
  }
}

/**
 * MCP annotations for a risk level.
 *
 * Clients use these to decide what to auto-approve, so they have to be honest.
 * `openWorldHint` is true throughout because every call leaves the machine, and
 * a write may not be idempotent: calling it twice can duplicate its effects on
 * the account.
 */
export function annotationsFor(
  risk: Risk,
  options: { idempotent?: boolean } = {},
): Record<string, boolean> {
  return {
    readOnlyHint: risk === "read",
    destructiveHint: risk === "destructive",
    idempotentHint: options.idempotent ?? risk === "read",
    openWorldHint: true,
  };
}
