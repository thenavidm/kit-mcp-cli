# Changelog

## 3.0.0, 2026-10-05

Built on [Slipway](https://github.com/thenavidm/slipway) 0.1.20. The 85 tools keep their names and arguments, and every difference below was measured against 2.0.3, the last version on npm, before release.

- **A person approves each confirmed operation over MCP.** All 40 still need confirmation. Claude Code (2.1.246 and later) shows its own prompt, and a client that can show forms asks with an approval form whose one box starts unticked. Approvals are signed, bound to the exact call and work once. Where a client can do neither, the model's `confirm: true` still counts, and `KIT_CONFIRM=model` makes it enough everywhere. The refusal and the approval form both say what 2.0 said, that the call may affect delivery, audience membership or irreversible state, and the audit log records who approved each one.
- **`KIT_ALLOW_DESTRUCTIVE=0` still refuses all 40**, confirmed or not, and `KIT_READ_ONLY=1` still leaves only the 38 reads.
- **Kit's status picks the exit code.** A request Kit rejects (400 or 422) exits 2 instead of 5, and a removed resource (410) 3 instead of 5. 401 and 403 still exit 4, 404 3, 429 7, a server error 5, and an unknown profile or nothing configured 10. 1 now means an unexpected error.
- **`which <words>` finds a command**, and `agent-context` describes every command, flag and setting as JSON. In Codex 0.159.3, finding the command that tags a subscriber and its flags took a median of 83,147 input tokens over the CLI instead of 84,497 (five runs each): every 2.0.3 run read the general help, the 6,245-character command list and the command's help. Every 3.0.0 run asked `which` instead, a 568-character answer, then read the help of `tag-subscriber`, and four of them also read `tag-subscriber-by-id`'s, since both tag a subscriber.
- **`install <client>`** adds the server to Claude Code, Codex, Claude Desktop, Cursor, VS Code or Gemini CLI in each one's own format, and **`kit-mcp --http`** serves the same tools over Streamable HTTP, on 127.0.0.1:8787 unless told otherwise.
- **A smaller tool list.** Parts that several tools repeated, such as a broadcast's subscriber filter and content, are written once and referred to, so the list is 33,794 o200k tokens instead of 39,470. With every tool loaded, Claude Code 2.1.286 spends 46,158 tokens a message on the list instead of 55,242.
- **Less work to start.** Each input and body schema now compiles on its first use rather than at load, and the entry turns on Node's compile cache. The server spends 188 ms of CPU before its first answer where 2.0.3 spent 346, and answers in 130 ms of wall time instead of 193 (median of 21 runs, taking turns on one Mac). npx installs 10 dependencies instead of 94. A test still compiles every schema.
- **`doctor --network` reads the account**, as 2.0's did.
- **Docs.** README section 7 has the measured Claude Code and Codex costs, where 2.0 said none had been measured, and the exit codes include 1.

### Upgrading

Over MCP, expect an approval prompt or form before any confirmed operation; a headless agent that should run them with `confirm: true` alone needs `KIT_CONFIRM=model`. A script that read exit 5 as a rejected request should read 2, and as a removed resource 3. An error is now one JSON object with `error`, Slipway's `code` (`usage`, `refused`, `auth`, `not_found`, `rate_limited`, `api`, `not_configured`) and a `hint`, plus Kit's `status` when it answered; 2.0.3 printed the tool's JSON inside the `error` string. Over MCP, an argument that fails the schema comes back as the MCP SDK's own message, "Input validation error: …", instead of JSON. With `KIT_READ_ONLY=1`, a client that calls a hidden tool gets "tool not found" instead of a refusal naming `KIT_READ_ONLY`, and that call is not in the audit log; the CLI still names the setting. The audit log's lines gain `confirmed_by`, and each allowed call is followed by a `done` or `failed` line. A script that pipes JSON-RPC into the server must keep stdin open until it reads the answer: the server now stops when its input ends, as the MCP stdio binding asks. `--http` refuses a page from another site unless `KIT_HTTP_ALLOWED_ORIGINS` lists it. Some terminal screens grew: the general help by 44 tokens, for `which`, `install`, what each setting is for and the exit codes; the command list by 16; and a missing argument's error by 16, for its code and a hint. Over MCP, Codex prints only the start and the end of a tool list this long, and 3.0.0's kept part takes a few more tokens to say, so the median run read 77,462 input tokens instead of 77,336; two 3.0.0 runs answered from a shorter printout, against one 2.0.3 run, so the average fell from 70,923 to 64,738. `SKILL.md` is 136 tokens longer in Claude Code, because it says how approval works over MCP and how `which` finds a command, and lists every exit code.

## 2.0.3, 2026-10-04

- **`npx -y @thenavidm/kit-mcp-cli` always starts the MCP server.** npx starts whichever binary the npm registry lists first when they share one file, and the registry does not keep the published order, so an MCP client set up with this README's install line could get `kit-cli` and its command list instead of a server. A third binary named after the package now always starts the server, and npx picks it by name.

Use the native terminal capture at 1040 source pixels with lossless GIF optimization, displayed at 520 pixels, matching the Bluesky/Substack reference. Original assets remain available.

Versions follow semantic versioning. Release tags are annotated v<version> and desktop archives track the npm package version. Dates are UTC.

## 2.0.2 - 2026-10-02

- Match the established Bluesky/Firefly README structure: two surfaces, feature table, numbered contents, setup and verification, updates/removal, dependencies and questions.
- Render all 20 FAQs as expandable details/summary accordions.
- Preserve the complete 85-tool argument reference and current official/community comparisons.
- Return documented exit code 10 for invalid private configuration through doctor and the CLI router; add four real-binary regression checks.
- Align npm, desktop manifest and documented bundle version. API tool behavior is unchanged from 2.0.1.

## 2.0.1 - 2026-10-02

- Fix the rendered full argument catalog: table rows now stay contiguous Markdown instead of being separated by blank paragraphs.
- Runtime/API behavior is unchanged from 2.0.0.
- Ship the fixed README in npm and the matching desktop bundle; the current release is 2.0.1.

## 2.0.0 - 2026-10-02

### Added

- Public sanitized Kit API v4 implementation: all 83 operations in the pinned official snapshot, plus exact-email search compatibility and local account selection (85 tools).
- House task CLI using real MCP discovery and in-memory SDK transport, shared input validation, output flags, field selection and stable exit codes.
- Node 22+ Claude Desktop .mcpb build with bundled production dependencies and sensitive/private settings.
- Named account configuration, OAuth token-file refresh, owner-only atomic persistence and per-account request pacing.
- Bounded cursor aggregation without skipping unseen records at the max-items cap.
- Sequence/email CRUD, subscriber filters/stats/location, snippets, posts, OAuth-only bulk/purchases and signed webhook endpoints.
- Private signing-secret files and result/error secret redaction; no secrets returned to model output.
- Complete README argument catalog, INSTALL for all client/OS routes, portable skill, comparison, security and contribution documentation, topics and npm keywords.

### Changed

- 38 reads and 47 writes; 40 audience/delivery/deletion/secret operations require explicit confirmation.
- Create broadcast defaults private and unscheduled. send_at is the delivery field, separately from published_at.
- Current v4 key/header auth and API-host OAuth endpoints replace obsolete v3/token examples.
- No automatic retries for mutating API requests. Bounded GET 429/401 refresh retries only.
- Reviewed documented schema corrections for draft/template creation, partial broadcast updates, null fields and untag-by-email query input, recorded with exact source hash.

### Removed and migration

- Private personal account instructions, cookies and original source history are excluded from the public branch.
- Legacy browser login and broadcast/sequence/visual-automation duplication helpers are not included. Use Kit UI for designed duplication; new API sequence/email CRUD is distinct.
- Numeric v3 page pagination and v3 credentials are not supported.
- Preserve AGPL-3.0-or-later licensing; no license conversion.

### Validation and limits

- Build, typecheck and 36 behavior/CLI checks passed; real stdio discovery confirms counts and read-only behavior.
- Production dependency audit reported zero findings. Dev-only desktop tooling has an unpatched node-forge advisory; see SECURITY.md.
- Live authorized Kit reads/writes, Starting point templates, an actual desktop GUI installation and matched model-token/task comparisons remain pending.
- Clean npm-package installation, bundled desktop discovery and public source/artifact secret scans are checked separately from registry publication. Live registry/release proof is recorded after publication.

## 1.0.0 - private legacy source

The earlier account repository provided a 31-tool MCP and private browser/account workflows. Its original history and personal setup remain private. It had no equivalent house task CLI or complete current v4 schema coverage. This entry records migration context and does not expose private history or claim a public v1 npm release.
