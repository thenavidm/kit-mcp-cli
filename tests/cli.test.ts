/**
 * The CLI, now built by Slipway from the same tools as the MCP server.
 *
 * Parsing, help and output shapes are Slipway's and tested there. These cover
 * what this repo promises: confirmation that agent mode never grants,
 * read-only mode, the setup exit code, Kit's errors keeping their exit
 * codes, and the docs staying in step with the code.
 */

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { checkApp, cli } from "@thenavidm/slipway/testing";
import { KitClient } from "../src/api/client.js";
import { app, createApp } from "../src/app.js";
import { loadConfig } from "../src/config.js";

const key = { KIT_API_KEY: "fixture-key-not-a-provider-secret" };

/** The app with Kit answering every request with `status` and `body`, so nothing leaves the test. */
function answering(status: number, body: unknown = { message: "failure", error: "failure" }) {
  return createApp({
    context: (env) => {
      const config = loadConfig({ ...env, KIT_MIN_REQUEST_INTERVAL_MS: "0", KIT_MAX_RETRIES: "0" });
      const fetcher = async () => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
      return { config, client: new KitClient(config, fetcher as typeof fetch, async () => {}) };
    },
  });
}

describe("Kit CLI on Slipway", () => {
  it("lists 85 commands, 40 of them needing confirmation, and 38 in read-only mode", async () => {
    const all = JSON.parse((await cli(app, ["agent-context", "--brief"], { env: {} })).stdout);
    const reads = JSON.parse((await cli(app, ["agent-context", "--brief"], { env: { KIT_READ_ONLY: "1" } })).stdout);
    expect(all.commands).toHaveLength(85);
    expect(all.commands.filter((c: { requires_confirm: boolean }) => c.requires_confirm)).toHaveLength(40);
    expect(reads.commands).toHaveLength(38);
  });

  it("refuses a write without --confirm, also in agent mode, before any network", async () => {
    for (const extra of [[], ["--agent"], ["--yes"]]) {
      const run = await cli(answering(200), ["delete-broadcast", "--broadcast-id", "1", ...extra], { env: key });
      expect(run.code).toBe(2);
      expect(JSON.parse(run.stderr).code).toBe("refused");
      // 2.x's words for what the call can do, not a generic warning.
      expect(JSON.parse(run.stderr).error).toContain("may affect delivery, audience");
    }
  });

  it("hides writes in read-only mode", async () => {
    const run = await cli(app, ["delete-broadcast", "--broadcast-id", "1", "--confirm"], { env: { ...key, KIT_READ_ONLY: "1" } });
    expect(run.code).toBe(2);
    expect(run.stderr).toContain("KIT_READ_ONLY");
  });

  it("reports a missing argument by its flag", async () => {
    const run = await cli(app, ["get-broadcast-clicks"], { env: key });
    expect(run.code).toBe(2);
    expect(JSON.parse(run.stderr).error).toContain("--broadcast-id");
  });

  it("exits 10 when nothing is configured, on a call and from doctor", async () => {
    expect((await cli(app, ["get-account"], { env: {} })).code).toBe(10);
    expect((await cli(app, ["doctor", "--json"], { env: {} })).code).toBe(10);
  });

  it("keeps the exit codes scripts branch on", async () => {
    // 2.x gave 5 for 400, 410 and 422; Kit's status now picks 2, 3 and 2.
    for (const [status, code] of [[400, 2], [401, 4], [402, 5], [403, 4], [404, 3], [409, 5], [410, 3], [422, 2], [429, 7], [500, 5]]) {
      const run = await cli(answering(status), ["get-account"], { env: key });
      expect(run.code, `HTTP ${status}`).toBe(code);
    }
    const unknown = await cli(app, ["get-account", "--account", "absent"], { env: key });
    expect(unknown.code).toBe(10);
  });

  it("passes slipway check in both policy modes", async () => {
    for (const env of [{}, { KIT_READ_ONLY: "1" }]) {
      const report = await checkApp(app, { env });
      expect(report.findings.filter((finding) => finding.level === "error")).toEqual([]);
    }
  });
});

describe("documentation stays in step with the code", () => {
  const read = (p: string): string => readFileSync(new URL(p, import.meta.url), "utf-8");
  const names = (text: string): Set<string> => new Set((text.match(/KIT_[A-Z_]+/g) ?? []).filter((name) => !name.endsWith("_")));
  const source = (dir: string): string =>
    readdirSync(new URL(dir, import.meta.url), { withFileTypes: true })
      .map((entry) => (entry.isDirectory() ? source(`${dir}${entry.name}/`) : entry.name.endsWith(".ts") ? read(`${dir}${entry.name}`) : ""))
      .join("\n");

  /** Every variable the server reads: this repo's code, and Slipway's as agent-context lists them. */
  const used = async (): Promise<Set<string>> => {
    const context = JSON.parse((await cli(app, ["agent-context"], { env: {} })).stdout);
    return new Set([...names(source("../src/")), ...context.settings.map((setting: { env: string }) => setting.env)]);
  };

  it("documents every environment variable the code reads", async () => {
    const documented = names(read("../README.md"));
    expect([...(await used())].filter((v) => !documented.has(v))).toEqual([]);
  });

  it.each(["../README.md", "../INSTALL.md"])("has no dead in-page anchors in %s", (file) => {
    if (!existsSync(new URL(file, import.meta.url))) return; // repo may ship one doc
    const md = read(file).replace(/```[\s\S]*?```/g, "");
    // GitHub's slug keeps letters, marks, numbers and connector punctuation, so an
    // emoji's variation selector (U+FE0F) stays in the anchor and a link has to carry it.
    const slugs = new Set(
      [...md.matchAll(/^#{1,6} (.+)$/gm)].map(([, heading]) =>
        (heading as string).trim().toLowerCase().replace(/[^\p{L}\p{M}\p{N}\p{Pc}\s-]/gu, "").replace(/ /g, "-"),
      ),
    );
    const dead = [...md.matchAll(/\[[^\]]+\]\(#([^)]+)\)/g)]
      .map((m) => decodeURIComponent(m[1] as string))
      .filter((a) => !slugs.has(a));
    expect(dead).toEqual([]);
  });
});
