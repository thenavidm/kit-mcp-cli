<p align="center"><img src="https://cdn.navid.me/brand/platforms/kit.png" width="80" alt="Kit" /></p>

<h1 align="center">Kit MCP Server & CLI</h1>

<p align="center">Your newsletter, subscribers and email sequences. One package. MCP and a task CLI.</p>

<p align="center">
<a href="https://www.npmjs.com/package/@thenavidm/kit-mcp-cli"><img src="https://img.shields.io/npm/v/@thenavidm/kit-mcp-cli" alt="npm version" /></a>
<a href="https://github.com/thenavidm/kit-mcp-cli/actions/workflows/ci.yml"><img src="https://github.com/thenavidm/kit-mcp-cli/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
<a href="https://github.com/thenavidm/kit-mcp-cli/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-AGPL--3.0--or--later-blue" alt="AGPL-3.0-or-later" /></a>
<img src="https://img.shields.io/badge/Node-22%2B-339933" alt="Node 22 or newer" />
<img src="https://img.shields.io/badge/tools-85-blue" alt="85 tools" />
</p>

<p align="center"><a href="./INSTALL.md">Install</a> · <a href="./SKILL.md">Agent skill</a> · <a href="./COMPARISON.md">Comparisons</a> · <a href="./CHANGELOG.md">Version history</a> · <a href="https://github.com/thenavidm/kit-mcp-cli/releases">Desktop releases</a></p>

A local MCP server and a scriptable CLI for Kit API v4. Read account data, draft and schedule broadcasts, manage subscribers and tags, edit sequences and snippets, collect email statistics, and configure signed webhooks. **85 tools: 38 reads and 47 writes. 40 audience, delivery, deletion and secret operations require explicit confirmation.**

Kit has an [official account MCP](https://developers.kit.com/mcp/kit-mcp). It already maps the v4 API and supports both reads and writes. This package adds a standalone task CLI, named local accounts, private token-file refresh, bounded cursor aggregation and a downloadable desktop bundle. It does not claim extra API coverage or measured token savings over the official server. Choose the official remote server if you prefer Kit-managed OAuth and a hosted connection.

The wrapper is free software under its existing AGPL-3.0-or-later license. Kit account access, plan eligibility and service charges remain separate. This is a community integration by Navid Moazzez, not a Kit-endorsed product.


<p align="center"><img src="https://cdn.navid.me/repos/kit-mcp-cli.gif" alt="Kit MCP and CLI draft workflow, illustrated in the house terminal" width="520" /></p>

The terminal illustrates the requested draft workflow; it is not a live account transcript.

The matching navid.me guide is prepared with 20 FAQs; authenticated CMS sync is pending. The installation and operation references in this repository are available now.

## Contents

| Section | What you will find |
| --- | --- |
| [1. What it does](#1-what-it-does) | Coverage and limits |
| [2. Quick start](#2-quick-start) | Install, discover and authenticate |
| [3. MCP or CLI](#3-mcp-or-cli) | The same handlers in two surfaces |
| [4. Client setup](#4-client-setup) | Every supported client and desktop route |
| [5. CLI contract](#5-cli-contract) | Flags, JSON, nested bodies and exit codes |
| [6. Authentication and accounts](#6-authentication-and-accounts) | API keys, OAuth and account selection |
| [7. Newsletter workflows](#7-newsletter-workflows) | Draft, review, schedule and inspect |
| [8. Subscriber workflows](#8-subscriber-workflows) | Filters, tags, forms and sequences |
| [9. Pagination and bulk work](#9-pagination-and-bulk-work) | Cursors, limits and async results |
| [10. Webhooks](#10-webhooks) | Private signing secrets |
| [11. Every tool](#11-every-tool) | Complete operations, schemas and arguments |
| [12. Safety and your data](#12-safety-and-your-data) | Guards, retries, audit and privacy |
| [13. Official and community comparisons](#13-official-and-community-comparisons) | Source-backed differences |
| [14. Token and task comparisons](#14-token-and-task-comparisons) | What is measured and what is pending |
| [15. Settings](#15-settings) | All environment variables |
| [16. Troubleshooting](#16-troubleshooting) | Common failures and remedies |
| [17. Frequently asked questions](#17-frequently-asked-questions) | Setup, delivery, templates and costs |
| [18. Development and releases](#18-development-and-releases) | Reproducible schemas, tests and artifacts |
| [19. Version history](#19-version-history) | Migration from the private legacy source |
| [About the author](#about-the-author) | Navid Media and links |


## 1. What it does

The pinned official API v4 snapshot contains 83 operations. This server exposes each one, plus `list_accounts` and the `search_subscribers` compatibility alias. The snapshot source, date, hash and reviewed corrections are in [api-source.json](./src/tools/api-source.json).

| Area | Examples |
| --- | --- |
| Account | Identity, creator profile, growth statistics, email statistics and colors |
| Broadcasts | Draft, read, update, delete, statistics and click breakdowns |
| Subscribers | Create, update, unsubscribe, filter, location, statistics and tags |
| Tags, forms, sequences | Read resources, subscribe to a form or sequence, tag and untag |
| Sequence emails | Read, create, edit and delete individual emails |
| Snippets and templates | Reusable content CRUD supported by the API; list email templates |
| Posts and segments | Read published posts and segment metadata |
| Purchases and bulk | OAuth-only purchase endpoints and asynchronous bulk jobs |
| Webhook endpoints | Signed endpoints, secret rotation and previous-secret revocation |
| Legacy webhooks | Older webhook API preserved separately |

The API does not provide all Kit UI actions. This package does not promise visual automation editing, automatic duplication of a designed broadcast, a block editor, a webhook receiver, a hosted scheduler or a browser session. A successful bulk submission is not proof that its asynchronous job has completed.

### What was actually checked

| Check | Status for 2.0.0 |
| --- | --- |
| Official API snapshot | 83 operations, pinned on 2026-10-02 |
| Real local MCP discovery | 85 tools, or 38 with read-only enabled |
| Behavior and shared CLI | 36 checks passed against controlled HTTP fixtures |
| TypeScript | Build and typecheck passed |
| Production dependency audit | Zero findings at review time |
| Live account reads and writes | Pending a configured v4 key or authorized OAuth session |
| Actual Claude Desktop installation | Pending a GUI check; archive and protocol checked separately |
| Matched MCP versus CLI model-token task | Pending; no performance percentages asserted |

Fixture tests check request construction and guards. They do not establish that a particular Kit account or email template accepts a live write. Release artifact checks are reported in the release notes when completed.

## 2. Quick start

Install Node.js 22 or newer, then:

```bash
npm install -g @thenavidm/kit-mcp-cli@latest
kit-cli --version
kit-cli
kit-cli list-broadcasts --help
kit-cli schema create-broadcast
kit-cli login
```

Discovery, help and schemas work before authentication. `login` prints setup instructions. It does not open a browser, exchange an OAuth code or save credentials. Configure a **v4** API key privately as `KIT_API_KEY`, then:

```bash
kit-cli doctor
kit-cli doctor --network
kit-cli get-account --agent
kit-cli list-broadcasts --per-page 10 --agent --select broadcasts.id,broadcasts.subject,pagination
```

The local doctor checks configuration. The network doctor reads the default account and reports authentication success without returning account details. It never sends a newsletter or changes subscribers.

For a single invocation without a global install:

```bash
npx -y --package @thenavidm/kit-mcp-cli@latest kit-cli tools
```

[INSTALL.md](./INSTALL.md) covers Node/PATH on macOS, Windows and Linux, private account setup, every client, updates and removal. No `.env` file is loaded automatically.

## 3. MCP or CLI

| Surface | How it runs | Suitable for |
| --- | --- | --- |
| `kit-mcp` | Local stdio server launched by an MCP client | Natural language account work in a compatible AI app |
| `kit-cli` | Schema-derived commands with machine-readable output | Scripts, CI and agents with shell access |
| `kit-2.0.1.mcpb` | Local MCP server with bundled production dependencies | Claude Desktop custom extensions |
| Official Kit MCP | Hosted `https://app.kit.com/mcp` with Kit OAuth | Remote connections and browser-only AI clients |

The CLI creates a real MCP server and client connected through the SDK's in-memory transport. It discovers the server's tools and calls the same schemas, validation, handlers and safety guards. Separate handwritten CLI request logic cannot drift from the MCP path.

An MCP client may send tool schemas or deferred tool names into model context. A shell agent instead needs the skill, help, commands and results. Both consume tokens; neither surface guarantees lower total cost for every task.

`kit-cli` with no arguments lists commands. `kit-mcp` with no arguments starts stdio and does not print a banner. Avoid launching an interactive banner on an MCP server's stdout.

## 4. Client setup

The full commands and private configurations are in [INSTALL.md](./INSTALL.md). Common registrations, after privately configuring account credentials:

```bash
claude mcp add --scope user kit -- npx -y @thenavidm/kit-mcp-cli@latest
claude mcp list
codex mcp add kit -- npx -y @thenavidm/kit-mcp-cli@latest
codex mcp list
```

Claude Desktop can install the `.mcpb` release or use manual JSON. Cursor, Windsurf and Gemini CLI use their user MCP settings; VS Code supports secure prompted inputs; Zed uses `context_servers`. Local Cline/Roo-style clients accept the same stdio command through their MCP setup UI. A local stdio process is not a public HTTP connector for ChatGPT on the web. Kit's official hosted MCP is the appropriate remote option there.

Desktop settings accept a sensitive API key or a private OAuth token-file path. API-key authentication cannot use OAuth-only bulk and purchase endpoints. Custom extension availability depends on your installed host and organization policy.

### Let an agent guide setup

> Help me install Kit MCP Server & CLI using INSTALL.md. Check Node and the binary, let me configure my account credentials privately, then run discovery and doctor --network. Do not send email or change subscribers during setup.

For shell agents, make [SKILL.md](./SKILL.md) available through the client's supported skills location. npm installation does not register the skill automatically.

## 5. CLI contract

Tool names become dashed commands: `get_broadcast` becomes `kit-cli get-broadcast`. Both exact underscore tool names and dashed forms are accepted. Argument names have dashed aliases: `broadcast_id` is `--broadcast-id`. Use help and `schema` to discover each operation's current input.

```bash
kit-cli tools
kit-cli get-broadcast --help
kit-cli schema get-broadcast
kit-cli get-broadcast --broadcast-id 123 --agent
```

| Flag | Behavior |
| --- | --- |
| `--help` | Current schema-derived arguments and defaults |
| `--json` | Structured JSON output |
| `--compact` | Compact JSON on one line |
| `--agent` | JSON, compact, no prompts or color |
| `--select a,b.c` | Keep selected fields; dotted paths descend through objects and arrays |
| `--no-color` | No terminal colors |
| `--no-input` | No interactive prompts |
| `--yes` | House noninteractive flag; never substitutes for `--confirm` |
| `--confirm` | Explicit confirmation for the requested guarded operation |
| `--account NAME` | Select a configured local account on API tools |
| `--payload JSON` | Complete request body as one JSON object |
| `--payload-file PATH` | Complete request body from a local regular JSON file, at most 5 MB |

Body flags and `payload`/`payload_file` are mutually exclusive. Path and query flags remain separate. Objects take JSON; array flags repeat once per array item. Do not pass an array to a flag that expects a single item:

```bash
kit-cli list-subscribers --include tags --include stats --per-page 10 --agent
kit-cli create-broadcast --payload-file /absolute/private/path/newsletter.json --confirm --agent
```

### Null is meaningful

A shell flag such as `--send-at null` is the string `null`, not JSON null. Use the complete body form to return a scheduled broadcast to draft:

```bash
kit-cli update-broadcast --broadcast-id 123 --payload '{"send_at":null}' --confirm --agent
```

The same applies to nullable text, thumbnail and other nullable fields. In an MCP call, send an actual JSON null. Avoid mixing the nullable complete body with individual body flags.

### Exit codes

| Code | Meaning | A script's next step |
| --- | --- | --- |
| 0 | Success | Use the returned data |
| 2 | Usage, validation or safety refusal | Correct inputs or obtain the requested authorization |
| 3 | Not found | Verify the resource ID |
| 4 | Authentication or permission failure | Check key, OAuth state or endpoint eligibility |
| 5 | Other API or transport failure | Inspect account state before repeating a write |
| 7 | Rate limit | Wait; mutating requests are not automatically retried |
| 10 | Missing or invalid local configuration | Repair private configuration |

Errors are JSON on stderr. On success, field selection shapes output only; it does not limit Kit's original response or its API processing.

## 6. Authentication and accounts

### Personal v4 API key

Open [Kit's Developer settings](https://app.kit.com/account_settings/developer_settings), click **Add a new key**, name it and save the value privately when shown. Kit does not let you view that value again afterwards. Set `KIT_API_KEY` in your local shell or client settings. The server sends it in `X-Kit-Api-Key`, never a URL query string. Old v3 API secrets are not interchangeable.

Kit documents 120 requests over a rolling 60 seconds per API key and 600 for OAuth API access. The official hosted MCP separately documents 120/minute per token. This wrapper spaces calls per account by 550 ms for keys and 110 ms for OAuth. Other processes using the same credential also count against Kit's limits.

### OAuth for full endpoint eligibility

Bulk and purchase endpoints in the tool table are marked OAuth-only. Create your own Kit app and enable API access, then implement the official [OAuth authorization flow](https://developers.kit.com/api-reference/oauth-refresh-token-flow) or Kit's [Node example](https://github.com/Kit/app-examples/tree/e627873f4a37dffcb3796b3a5ff25d4f108944c4/oauth-express). Keep the app's secret on a private confidential backend. Use the callback URI exactly as registered, a cryptographically random state verified on callback, and HTTPS for a hosted callback.

The current authorization and token endpoints are `https://api.kit.com/v4/oauth/authorize` and `https://api.kit.com/v4/oauth/token`. There is no built-in OAuth consent service in this package. The old source's `app.kit.com/oauth/token` examples are obsolete. Follow Kit's current registered-app instructions; do not invent unsupported fine-grained OAuth scopes from operation-schema security labels.

A private token file can contain:

```json
{
  "access_token": "YOUR_OAUTH_ACCESS_TOKEN",
  "refresh_token": "YOUR_OAUTH_REFRESH_TOKEN",
  "client_id": "YOUR_OWN_KIT_APP_CLIENT_ID",
  "client_secret": "YOUR_OWN_KIT_APP_CLIENT_SECRET",
  "created_at": 1790899200,
  "expires_in": 7200
}
```

These are placeholders; use actual issued expiry metadata. Point `KIT_TOKENS_FILE` at an absolute private path outside the checkout. It must be a regular JSON file, at most 64 KB; symlinks are refused. Restrict access to your OS user. If expiry metadata is available, refresh happens one minute before expiry. Concurrent refreshes within the same process are deduplicated. Updated tokens are written atomically with mode 0600. On Windows, protect the enclosing folder using user-only ACLs; POSIX mode bits are not a complete Windows access policy.

Alternatively set `KIT_ACCESS_TOKEN`, `KIT_REFRESH_TOKEN`, `KIT_CLIENT_ID` and `KIT_CLIENT_SECRET` privately. Without a token file, refresh state lasts only in that process. Without refresh credentials, renew an expired access token yourself. An OAuth access token takes precedence over an API key for the selected account.

### Multiple accounts

Set `KIT_ACCOUNTS` to a private JSON array. Its supported keys are `name`, `api_key`, `access_token`, `refresh_token`, `client_id`, `client_secret` and `tokens_file`. It replaces the single-account variables:

```json
[
  {"name":"work","api_key":"YOUR_WORK_V4_KEY"},
  {"name":"personal","tokens_file":"/absolute/private/path/personal-kit.json"}
]
```

Set `KIT_DEFAULT_ACCOUNT=work`, then:

```bash
kit-cli list-accounts --agent
kit-cli list-broadcasts --account work --per-page 10 --agent
kit-cli get-growth-stats --account personal --agent
```

Names must be unique. `list_accounts` exposes labels, default choice and auth type only, never credentials or file paths. Guard logs omit account names. Separate processes are still preferable when you need strict account isolation.

## 7. Newsletter workflows

### Draft privately, review, then schedule

A create call defaults to `public:false` and `send_at:null`. It creates a private unscheduled draft. It still requires confirmation because it changes account content and can accept delivery fields when explicitly supplied.

```bash
kit-cli list-email-templates --agent
kit-cli create-broadcast --subject "This week's creator notes" --content '<p>Write the actual newsletter here.</p>' --confirm --agent --select broadcast.id,broadcast.subject,broadcast.send_at
kit-cli get-broadcast --broadcast-id BROADCAST_ID_FROM_RESULT --agent
```

Positive IDs are returned by Kit; replace illustrative markers with real IDs. For an existing draft, validate the intended audience and delivery time before the separate confirmed update:

```bash
kit-cli update-broadcast --broadcast-id 123 --payload-file /absolute/private/path/schedule.json --confirm --agent
```

Your private `schedule.json` contains the ISO timestamp and the audience fields from the current schema, for example `send_at` with a timezone offset or UTC `Z`. `published_at` controls web publication metadata; **it is not the email send time**. Neither successful creation nor a local confirmation proves delivery. Read the broadcast and statistics afterwards.

### Template HTML needs care

The API's `content` is HTML; it is not Kit's visual editor block tree. Preserve the full email wrapper and required Liquid unsubscribe/address markup when replacing content. Retrieve an existing example and inspect the selected template before updating. Do not replace a whole template with one paragraph if you need its existing branding and legal footer.

Kit's current OpenAPI prose contradicts itself around Starting point templates and required fields. This wrapper accepts a subject plus either `content` or `email_template_id`, allows nonempty partial broadcast updates, and exposes the documented `allow_starting_point` flag. These reviewed corrections are recorded with the snapshot. **Starting point behavior remains unverified against a live account**, so test with a private unscheduled draft and inspect it in Kit before any send.

### Existing broadcasts and click reports

```bash
kit-cli list-broadcasts --per-page 10 --agent --select broadcasts.id,broadcasts.subject,pagination
kit-cli get-broadcast-stats --broadcast-id 123 --agent
kit-cli get-broadcast-clicks --broadcast-id 123 --agent
```

The client does not automatically retry POST, PUT, PATCH or DELETE requests. A timeout can have an unknown outcome. Check the existing draft or scheduled broadcast before repeating a write; sending twice cannot be undone by a retry wrapper.

## 8. Subscriber workflows

Find an exact email or read a bounded list, then choose a requested audience change:

```bash
kit-cli search-subscribers --email-address reader@example.com --agent
kit-cli list-tags --agent
kit-cli tag-subscriber --tag-id 123 --email-address reader@example.com --confirm --agent
kit-cli list-subscriber-tags --subscriber-id 456 --agent
```

The `.example` address is illustrative. Do not add or tag real people without the requested account action. Tagging and form/sequence enrollment may trigger existing Kit automations.

`filter_subscribers` is a read-only POST with nested `all`/`any` filters. Use its current schema and a private JSON body; it is not a v3 page-number endpoint. `search_subscribers` is an exact-email compatibility alias, not a fuzzy search engine.

Sequences now have their own create/update/delete endpoints and individual email operations. Read their schemas and current delay units before using them. Sequence enrollment can deliver email through existing automation, so it is confirmed even if the API call itself merely adds a subscriber.

Custom field and tag creation are reversible configuration writes, so they do not require `--confirm`; they still disappear in read-only mode. Deletions, audience changes, snippets that can affect email and purchases are guarded. The tool table labels every operation.

## 9. Pagination and bulk work

### Cursor pages

Kit v4 uses `after`, `before`, `start_cursor` and `end_cursor`, not old v3 numeric `page` arguments. Default `per_page` is 500, maximum 1000. Ask for a small page when you only need a sample:

```bash
kit-cli list-subscribers --per-page 25 --include-total-count --agent
kit-cli list-subscribers --after END_CURSOR_FROM_RESULT --per-page 25 --agent
kit-cli list-subscribers --all-pages --max-items 1000 --agent
```

Do not supply both `before` and `after`. `all_pages` traverses forward and refuses `before`. It stops at `max_items` (default 1000, maximum 10000) or 100 pages, and refuses repeated cursors. It reduces each page size to the remaining cap so the returned end cursor does not skip unseen records. Aggregated output includes `collected`, `pages`, the last pagination object and `truncated`.

`include_total_count` must be requested where supported; total count can add API work. `max_items` without `all_pages` is a usage error. This is bounded retrieval, not a backup/export guarantee for an entire large account.

### OAuth-only bulk

The full API snapshot supplies nested request schemas and endpoint-specific limits. Discover the body and put private batches outside the checkout:

```bash
kit-cli schema bulk-create-subscribers
kit-cli bulk-create-subscribers --payload-file /absolute/private/path/subscribers.json --confirm --agent
```

Some bulk operations require a callback URL. Use HTTPS on a receiver you control and inspect its actual completion notification. The wrapper does not deploy or listen for callbacks. Split payloads according to Kit's current per-endpoint limits and the local 5 MB request cap. Do not retry an asynchronous submission merely because its completion has not arrived yet.

## 10. Webhooks

The current signed `webhook_endpoints` family and older `webhooks` are separate APIs. Prefer signed endpoints for new setups. Discover the accepted event enum from the current schema:

```bash
kit-cli schema create-webhook-endpoint
kit-cli create-webhook-endpoint --url https://your-receiver.example/kit --events EVENT_FROM_SCHEMA --secret-name newsletter-hook --confirm --agent
```

Replace both placeholders with your own endpoint and a supported event. Creation and secret rotation require a new `secret_name`. Before the remote call, the server reserves that filename exclusively under `KIT_PRIVATE_DIR` (default `~/.config/kit-mcp-cli/secrets`) with mode 0600. Existing files are never overwritten.

Returned signing secrets are redacted from model/CLI output and saved to the private file. The result exposes `secret_file`, not the secret itself. Configure your own receiver's signature verification privately. The package does not provide a receiver or claim that the endpoint is reachable. Protect private folders with Windows ACLs where applicable.

When rotating, update and verify your receiver before revoking the previous secret. If Kit changed the endpoint but local secret storage failed, inspect the remote endpoint before attempting rotation again. Do not paste signing secrets in an AI chat or public issue.


## 11. Every tool

The following catalog is generated from the actual `tools/list` result. Body-required fields are enforced within `payload` or individual body arguments at execution; path/query requirements appear in each input schema. `schema <command>` is the exact machine-readable reference. OAuth-only labels come from the pinned operation security definitions.

| Tool | API | Mode | OAuth only |
| --- | --- | --- | --- |
| `get_account` | `GET /v4/account` | Read | No |
| `list_colors` | `GET /v4/account/colors` | Read | No |
| `update_colors` | `PUT /v4/account/colors` | Write | No |
| `get_creator_profile` | `GET /v4/account/creator_profile` | Read | No |
| `get_email_stats` | `GET /v4/account/email_stats` | Read | No |
| `get_growth_stats` | `GET /v4/account/growth_stats` | Read | No |
| `list_broadcasts` | `GET /v4/broadcasts` | Read | No |
| `create_broadcast` | `POST /v4/broadcasts` | Write, confirms | No |
| `list_broadcast_stats` | `GET /v4/broadcasts/stats` | Read | No |
| `get_broadcast_clicks` | `GET /v4/broadcasts/{broadcast_id}/clicks` | Read | No |
| `get_broadcast_stats` | `GET /v4/broadcasts/{broadcast_id}/stats` | Read | No |
| `delete_broadcast` | `DELETE /v4/broadcasts/{id}` | Write, confirms | No |
| `get_broadcast` | `GET /v4/broadcasts/{id}` | Read | No |
| `update_broadcast` | `PUT /v4/broadcasts/{id}` | Write, confirms | No |
| `bulk_create_custom_fields` | `POST /v4/bulk/custom_fields` | Write | Yes |
| `bulk_update_subscriber_custom_field_values` | `POST /v4/bulk/custom_fields/subscribers` | Write, confirms | Yes |
| `list_custom_fields` | `GET /v4/custom_fields` | Read | No |
| `create_custom_field` | `POST /v4/custom_fields` | Write | No |
| `delete_custom_field` | `DELETE /v4/custom_fields/{id}` | Write, confirms | No |
| `update_custom_field` | `PUT /v4/custom_fields/{id}` | Write | No |
| `list_email_templates` | `GET /v4/email_templates` | Read | No |
| `bulk_add_subscribers_to_forms` | `POST /v4/bulk/forms/subscribers` | Write, confirms | Yes |
| `list_forms` | `GET /v4/forms` | Read | No |
| `list_subscribers_for_form` | `GET /v4/forms/{form_id}/subscribers` | Read | No |
| `add_subscriber_to_form` | `POST /v4/forms/{form_id}/subscribers` | Write, confirms | No |
| `add_subscriber_to_form_by_id` | `POST /v4/forms/{form_id}/subscribers/{id}` | Write, confirms | No |
| `list_posts` | `GET /v4/posts` | Read | No |
| `get_post` | `GET /v4/posts/{id}` | Read | No |
| `list_purchases` | `GET /v4/purchases` | Read | Yes |
| `create_purchase` | `POST /v4/purchases` | Write, confirms | Yes |
| `get_purchase` | `GET /v4/purchases/{id}` | Read | Yes |
| `list_segments` | `GET /v4/segments` | Read | No |
| `list_sequence_emails` | `GET /v4/sequences/{sequence_id}/emails` | Read | No |
| `create_sequence_email` | `POST /v4/sequences/{sequence_id}/emails` | Write, confirms | No |
| `delete_sequence_email` | `DELETE /v4/sequences/{sequence_id}/emails/{id}` | Write, confirms | No |
| `get_sequence_email` | `GET /v4/sequences/{sequence_id}/emails/{id}` | Read | No |
| `update_sequence_email` | `PUT /v4/sequences/{sequence_id}/emails/{id}` | Write, confirms | No |
| `list_sequences` | `GET /v4/sequences` | Read | No |
| `create_sequence` | `POST /v4/sequences` | Write, confirms | No |
| `delete_sequence` | `DELETE /v4/sequences/{id}` | Write, confirms | No |
| `get_sequence` | `GET /v4/sequences/{id}` | Read | No |
| `update_sequence` | `PUT /v4/sequences/{id}` | Write, confirms | No |
| `list_subscribers_for_sequence` | `GET /v4/sequences/{sequence_id}/subscribers` | Read | No |
| `add_subscriber_to_sequence` | `POST /v4/sequences/{sequence_id}/subscribers` | Write, confirms | No |
| `add_subscriber_to_sequence_by_id` | `POST /v4/sequences/{sequence_id}/subscribers/{id}` | Write, confirms | No |
| `list_snippets` | `GET /v4/snippets` | Read | No |
| `create_snippet` | `POST /v4/snippets` | Write, confirms | No |
| `get_snippet` | `GET /v4/snippets/{id}` | Read | No |
| `update_snippet` | `PUT /v4/snippets/{id}` | Write, confirms | No |
| `bulk_create_subscribers` | `POST /v4/bulk/subscribers` | Write, confirms | Yes |
| `list_subscribers` | `GET /v4/subscribers` | Read | No |
| `create_subscriber` | `POST /v4/subscribers` | Write, confirms | No |
| `filter_subscribers` | `POST /v4/subscribers/filter` | Read | No |
| `get_subscriber` | `GET /v4/subscribers/{id}` | Read | No |
| `update_subscriber` | `PUT /v4/subscribers/{id}` | Write, confirms | No |
| `unsubscribe` | `POST /v4/subscribers/{id}/unsubscribe` | Write, confirms | No |
| `delete_subscriber_location` | `DELETE /v4/subscribers/{subscriber_id}/location` | Write, confirms | No |
| `update_subscriber_location` | `PATCH /v4/subscribers/{subscriber_id}/location` | Write, confirms | No |
| `pin_subscriber_location` | `POST /v4/subscribers/{subscriber_id}/location` | Write, confirms | No |
| `get_subscriber_stats` | `GET /v4/subscribers/{subscriber_id}/stats` | Read | No |
| `list_subscriber_tags` | `GET /v4/subscribers/{subscriber_id}/tags` | Read | No |
| `bulk_delete_tags` | `DELETE /v4/bulk/tags` | Write, confirms | Yes |
| `bulk_create_tags` | `POST /v4/bulk/tags` | Write | Yes |
| `bulk_remove_tags_from_subscribers` | `DELETE /v4/bulk/tags/subscribers` | Write, confirms | Yes |
| `bulk_tag_subscribers` | `POST /v4/bulk/tags/subscribers` | Write, confirms | Yes |
| `list_tags` | `GET /v4/tags` | Read | No |
| `create_tag` | `POST /v4/tags` | Write | No |
| `update_tag_name` | `PUT /v4/tags/{id}` | Write | No |
| `untag_subscriber_by_email` | `DELETE /v4/tags/{tag_id}/subscribers` | Write, confirms | No |
| `list_subscribers_for_tag` | `GET /v4/tags/{tag_id}/subscribers` | Read | No |
| `tag_subscriber` | `POST /v4/tags/{tag_id}/subscribers` | Write, confirms | No |
| `untag_subscriber` | `DELETE /v4/tags/{tag_id}/subscribers/{id}` | Write, confirms | No |
| `tag_subscriber_by_id` | `POST /v4/tags/{tag_id}/subscribers/{id}` | Write, confirms | No |
| `list_webhook_endpoints` | `GET /v4/webhook_endpoints` | Read | No |
| `create_webhook_endpoint` | `POST /v4/webhook_endpoints` | Write, confirms | No |
| `delete_webhook_endpoint` | `DELETE /v4/webhook_endpoints/{id}` | Write, confirms | No |
| `get_webhook_endpoint` | `GET /v4/webhook_endpoints/{id}` | Read | No |
| `update_webhook_endpoint` | `PATCH /v4/webhook_endpoints/{id}` | Write, confirms | No |
| `revoke_previous_webhook_secret` | `POST /v4/webhook_endpoints/{id}/revoke_previous_secret` | Write, confirms | No |
| `rotate_webhook_secret` | `POST /v4/webhook_endpoints/{id}/rotate_secret` | Write, confirms | No |
| `list_webhooks` | `GET /v4/webhooks` | Read | No |
| `create_webhook` | `POST /v4/webhooks` | Write, confirms | No |
| `delete_webhook` | `DELETE /v4/webhooks/{id}` | Write, confirms | No |
| `search_subscribers` | Alias for GET /v4/subscribers with exact email | Read | No |
| `list_accounts` | Local labels only | Read | No |

### Shared input rules

Every API tool accepts optional `account`. Writes accept `confirm`; the 40 guarded operations require it to be true. Pagination controls are included only on tools whose schema supports cursor pagination. Body tools accept either their individual body fields or `payload`/`payload_file`. `list_accounts` accepts no arguments.

### Complete arguments

#### get_account

Get current account. Read-only.

```bash
kit-cli get-account --help
```

| Argument | Type | Required | Meaning |
| --- | --- | --- | --- |

#### list_colors

List colors. Read-only.

```bash
kit-cli list-colors --help
```

| Argument | Type | Required | Meaning |
| --- | --- | --- | --- |

#### update_colors

Update colors. Reversible configuration write.

```bash
kit-cli update-colors --help
```

| Argument | Type | Required | Meaning |
| --- | --- | --- | --- |
| `colors` | array | Body | An array of up to 10 color hex codes |

#### get_creator_profile

Get Creator Profile. Read-only.

```bash
kit-cli get-creator-profile --help
```

| Argument | Type | Required | Meaning |
| --- | --- | --- | --- |

#### get_email_stats

Get email stats. Read-only.

```bash
kit-cli get-email-stats --help
```

| Argument | Type | Required | Meaning |
| --- | --- | --- | --- |

#### get_growth_stats

Get growth stats. Read-only.

```bash
kit-cli get-growth-stats --help
```

| Argument | Type | Required | Meaning |
| --- | --- | --- | --- |
| `ending` | string | No | See the exact input schema. |
| `starting` | string | No | See the exact input schema. |

#### list_broadcasts

List broadcasts. Read-only.

```bash
kit-cli list-broadcasts --help
```

| Argument | Type | Required | Meaning |
| --- | --- | --- | --- |
| `after` | schema | No | See the exact input schema. |
| `before` | schema | No | See the exact input schema. |
| `include_total_count` | boolean | No | See the exact input schema. |
| `per_page` | schema | No | See the exact input schema. |
| `sent_after` | schema | No | See the exact input schema. |
| `sent_before` | schema | No | See the exact input schema. |
| `slim` | boolean | No | See the exact input schema. |
| `status` | string | No |  Values: `draft`, `scheduled`, `sending`, `completed`, `aborted`. |
| `all_pages` | boolean | No | Read successive cursor pages, bounded by max_items (default 1000). Default false returns one API page. |
| `max_items` | integer | No | Maximum records when all_pages=true. A capped result reports truncation and its continuation cursor. |

#### create_broadcast

Create a broadcast. Requires confirmation.

```bash
kit-cli create-broadcast --help
```

| Argument | Type | Required | Meaning |
| --- | --- | --- | --- |
| `email_template_id` | integer | No | Id of the email template to use. Uses the account's default template if not provided. 'Starting point' template is not supported. |
| `email_address` | string/null | No | The sending email address to use. Uses the account's sending email address if not provided. |
| `content` | string | No | The HTML content of the email. On a `Classic` template this is the body, and the template adds the design around it when the broadcast is sent. On a `Starting point` template the design lives in the body, so this is the complete email: keep the wrappers, images, inline styles and Liquid tags, including `{{ unsubscribe_url }}` and `{{ address }}`. Without an unsubscribe link the broadcast can't be sent. A read returns the string that was written, so `GET`, `PUT`, `GET` round-trips, apart from Kit's own "Built with Kit" badge, which a `Starting point` write takes out of the body and re-applies when the email renders. A broadcast built in Kit's editor reads back as Kit's rendered HTML instead, and writing that back replaces its individually-editable blocks with one HTML block. Sending `content` in the same request as a `Starting point` `email_template_id` also needs `allow_starting_point: true`. Omit `content` and name a `Starting point` template in `email_template_id` to create the broadcast with that template's own design. |
| `description` | string | No | See the exact input schema. |
| `public` | boolean | No | `true` to publish this broadcast to the web. The broadcast will appear in a newsletter feed on your Creator Profile and Landing Pages. |
| `published_at` | string | No | The published timestamp to display in ISO8601 format. If no timezone is provided, UTC is assumed. |
| `send_at` | string/null | No | The scheduled send time for this broadcast in ISO8601 format. If no timezone is provided, UTC is assumed. |
| `thumbnail_alt` | string/null | No | See the exact input schema. |
| `thumbnail_url` | string/null | No | See the exact input schema. |
| `preview_text` | string | No | See the exact input schema. |
| `subject` | string | Body | See the exact input schema. |
| `subscriber_filter` | array | No | Filters your subscribers. At this time, we only support using only one filter group type via the API (e.g. `all`, `any`, or `none` but no combinations). If nothing is provided, will default to all of your subscribers. |
| `allow_starting_point` | boolean | No | Explicitly allow replacing a Starting point template body, as described in Kit’s current content-field documentation. Review the complete rendered HTML first. |

Body alternatives: content; email_template_id.

#### list_broadcast_stats

Get stats for a list of broadcasts. Read-only.

```bash
kit-cli list-broadcast-stats --help
```

| Argument | Type | Required | Meaning |
| --- | --- | --- | --- |
| `after` | schema | No | See the exact input schema. |
| `before` | schema | No | See the exact input schema. |
| `include_total_count` | boolean | No | See the exact input schema. |
| `per_page` | schema | No | See the exact input schema. |
| `sent_after` | schema | No | See the exact input schema. |
| `sent_before` | schema | No | See the exact input schema. |
| `status` | string | No |  Values: `draft`, `scheduled`, `sending`, `completed`, `aborted`. |
| `all_pages` | boolean | No | Read successive cursor pages, bounded by max_items (default 1000). Default false returns one API page. |
| `max_items` | integer | No | Maximum records when all_pages=true. A capped result reports truncation and its continuation cursor. |

#### get_broadcast_clicks

Get link clicks for a broadcast. Read-only.

```bash
kit-cli get-broadcast-clicks --help
```

| Argument | Type | Required | Meaning |
| --- | --- | --- | --- |
| `broadcast_id` | schema | Yes | Positive broadcast id. |

#### get_broadcast_stats

Get stats for a broadcast. Read-only.

```bash
kit-cli get-broadcast-stats --help
```

| Argument | Type | Required | Meaning |
| --- | --- | --- | --- |
| `broadcast_id` | schema | Yes | Positive broadcast id. |

#### delete_broadcast

Delete a broadcast. Requires confirmation.

```bash
kit-cli delete-broadcast --help
```

| Argument | Type | Required | Meaning |
| --- | --- | --- | --- |
| `broadcast_id` | schema | Yes | Positive broadcast id. |

#### get_broadcast

Get a broadcast. Read-only.

```bash
kit-cli get-broadcast --help
```

| Argument | Type | Required | Meaning |
| --- | --- | --- | --- |
| `broadcast_id` | schema | Yes | Positive broadcast id. |

#### update_broadcast

Update a broadcast. Requires confirmation.

```bash
kit-cli update-broadcast --help
```

| Argument | Type | Required | Meaning |
| --- | --- | --- | --- |
| `broadcast_id` | schema | Yes | Positive broadcast id. |
| `email_template_id` | integer | No | Id of the email template to use. Uses the account's default template if not provided. 'Starting point' template is not supported. |
| `email_address` | string/null | No | The sending email address to use. Uses the account's sending email address if not provided. |
| `content` | string | No | The HTML content of the email. On a `Classic` template this is the body, and the template adds the design around it when the broadcast is sent. On a `Starting point` template the design lives in the body, so this is the complete email: keep the wrappers, images, inline styles and Liquid tags, including `{{ unsubscribe_url }}` and `{{ address }}`. Without an unsubscribe link the broadcast can't be sent. A read returns the string that was written, so `GET`, `PUT`, `GET` round-trips, apart from Kit's own "Built with Kit" badge, which a `Starting point` write takes out of the body and re-applies when the email renders. A broadcast built in Kit's editor reads back as Kit's rendered HTML instead, and writing that back replaces its individually-editable blocks with one HTML block. Sending `content` in the same request as a `Starting point` `email_template_id` also needs `allow_starting_point: true`. |
| `description` | string | No | See the exact input schema. |
| `public` | boolean | No | `true` to publish this broadcast to the web. The broadcast will appear in a newsletter feed on your Creator Profile and Landing Pages. |
| `published_at` | string | No | The published timestamp to display in ISO8601 format. If no timezone is provided, UTC is assumed. |
| `send_at` | string/null | No | The scheduled send time for this broadcast in ISO8601 format. If no timezone is provided, UTC is assumed. |
| `thumbnail_alt` | string/null | No | See the exact input schema. |
| `thumbnail_url` | string/null | No | See the exact input schema. |
| `preview_text` | string | No | See the exact input schema. |
| `subject` | string | No | See the exact input schema. |
| `subscriber_filter` | array | No | Filters your subscribers. At this time, we only support using only one filter group type via the API (e.g. `all`, `any`, or `none` but no combinations). If nothing is provided, will default to all of your subscribers. |
| `allow_starting_point` | boolean | No | Explicitly allow replacing a Starting point template body, as described in Kit’s current content-field documentation. Review the complete rendered HTML first. |

#### bulk_create_custom_fields

Bulk create custom fields. OAuth-only. Reversible configuration write.

```bash
kit-cli bulk-create-custom-fields --help
```

| Argument | Type | Required | Meaning |
| --- | --- | --- | --- |
| `custom_fields` | array | Body | See the exact input schema. |
| `callback_url` | string/null | No | See the exact input schema. |

#### bulk_update_subscriber_custom_field_values

Bulk update subscriber custom field values. OAuth-only. Requires confirmation.

```bash
kit-cli bulk-update-subscriber-custom-field-values --help
```

| Argument | Type | Required | Meaning |
| --- | --- | --- | --- |
| `custom_field_values` | array | Body | See the exact input schema. |
| `callback_url` | schema | Body | See the exact input schema. |

#### list_custom_fields

List custom fields. Read-only.

```bash
kit-cli list-custom-fields --help
```

| Argument | Type | Required | Meaning |
| --- | --- | --- | --- |
| `after` | schema | No | See the exact input schema. |
| `before` | schema | No | See the exact input schema. |
| `include_total_count` | boolean | No | See the exact input schema. |
| `per_page` | schema | No | See the exact input schema. |
| `all_pages` | boolean | No | Read successive cursor pages, bounded by max_items (default 1000). Default false returns one API page. |
| `max_items` | integer | No | Maximum records when all_pages=true. A capped result reports truncation and its continuation cursor. |

#### create_custom_field

Create a custom field. Reversible configuration write.

```bash
kit-cli create-custom-field --help
```

| Argument | Type | Required | Meaning |
| --- | --- | --- | --- |
| `label` | string | Body | See the exact input schema. |

#### delete_custom_field

Delete custom field. Requires confirmation.

```bash
kit-cli delete-custom-field --help
```

| Argument | Type | Required | Meaning |
| --- | --- | --- | --- |
| `custom_field_id` | schema | Yes | Positive custom field id. |

#### update_custom_field

Update a custom field. Reversible configuration write.

```bash
kit-cli update-custom-field --help
```

| Argument | Type | Required | Meaning |
| --- | --- | --- | --- |
| `custom_field_id` | schema | Yes | Positive custom field id. |
| `label` | string | Body | See the exact input schema. |

#### list_email_templates

List email templates. Read-only.

```bash
kit-cli list-email-templates --help
```

| Argument | Type | Required | Meaning |
| --- | --- | --- | --- |
| `after` | schema | No | See the exact input schema. |
| `before` | schema | No | See the exact input schema. |
| `include_total_count` | boolean | No | See the exact input schema. |
| `per_page` | schema | No | See the exact input schema. |
| `all_pages` | boolean | No | Read successive cursor pages, bounded by max_items (default 1000). Default false returns one API page. |
| `max_items` | integer | No | Maximum records when all_pages=true. A capped result reports truncation and its continuation cursor. |

#### bulk_add_subscribers_to_forms

Bulk add subscribers to forms. OAuth-only. Requires confirmation.

```bash
kit-cli bulk-add-subscribers-to-forms --help
```

| Argument | Type | Required | Meaning |
| --- | --- | --- | --- |
| `additions` | array | Body | See the exact input schema. |
| `callback_url` | string/null | No | See the exact input schema. |

#### list_forms

List forms. Read-only.

```bash
kit-cli list-forms --help
```

| Argument | Type | Required | Meaning |
| --- | --- | --- | --- |
| `after` | schema | No | See the exact input schema. |
| `before` | schema | No | See the exact input schema. |
| `include_total_count` | boolean | No | See the exact input schema. |
| `per_page` | schema | No | See the exact input schema. |
| `status` | string/null | No |  Values: `active`, `archived`, `trashed`, `all`. |
| `type` | schema | No | See the exact input schema. |
| `include` | string | No | See the exact input schema. |
| `all_pages` | boolean | No | Read successive cursor pages, bounded by max_items (default 1000). Default false returns one API page. |
| `max_items` | integer | No | Maximum records when all_pages=true. A capped result reports truncation and its continuation cursor. |

#### list_subscribers_for_form

List subscribers for a form. Read-only.

```bash
kit-cli list-subscribers-for-form --help
```

| Argument | Type | Required | Meaning |
| --- | --- | --- | --- |
| `added_after` | string/null | No | See the exact input schema. |
| `added_before` | string/null | No | See the exact input schema. |
| `after` | schema | No | See the exact input schema. |
| `before` | schema | No | See the exact input schema. |
| `created_after` | string/null | No | See the exact input schema. |
| `created_before` | string/null | No | See the exact input schema. |
| `form_id` | schema | Yes | Positive form id. |
| `include_total_count` | boolean | No | See the exact input schema. |
| `per_page` | schema | No | See the exact input schema. |
| `slim` | boolean | No | See the exact input schema. |
| `status` | string | No |  Values: `active`, `inactive`, `bounced`, `complained`, `cancelled`, `all`. |
| `all_pages` | boolean | No | Read successive cursor pages, bounded by max_items (default 1000). Default false returns one API page. |
| `max_items` | integer | No | Maximum records when all_pages=true. A capped result reports truncation and its continuation cursor. |

#### add_subscriber_to_form

Add subscriber to form by email address. Requires confirmation.

```bash
kit-cli add-subscriber-to-form --help
```

| Argument | Type | Required | Meaning |
| --- | --- | --- | --- |
| `form_id` | schema | Yes | Positive form id. |
| `email_address` | string | Body | See the exact input schema. |
| `referrer` | string/null | No | See the exact input schema. |

#### add_subscriber_to_form_by_id

Add subscriber to form. Requires confirmation.

```bash
kit-cli add-subscriber-to-form-by-id --help
```

| Argument | Type | Required | Meaning |
| --- | --- | --- | --- |
| `form_id` | schema | Yes | Positive form id. |
| `subscriber_id` | schema | Yes | Positive subscriber id. |
| `referrer` | string | Body | See the exact input schema. |

#### list_posts

List posts. Read-only.

```bash
kit-cli list-posts --help
```

| Argument | Type | Required | Meaning |
| --- | --- | --- | --- |
| `after` | schema | No | See the exact input schema. |
| `before` | schema | No | See the exact input schema. |
| `include_content` | boolean | No | See the exact input schema. |
| `include_total_count` | boolean | No | See the exact input schema. |
| `per_page` | schema | No | See the exact input schema. |
| `all_pages` | boolean | No | Read successive cursor pages, bounded by max_items (default 1000). Default false returns one API page. |
| `max_items` | integer | No | Maximum records when all_pages=true. A capped result reports truncation and its continuation cursor. |

#### get_post

Get a post. Read-only.

```bash
kit-cli get-post --help
```

| Argument | Type | Required | Meaning |
| --- | --- | --- | --- |
| `post_id` | schema | Yes | Positive post id. |

#### list_purchases

List purchases. OAuth-only. Read-only.

```bash
kit-cli list-purchases --help
```

| Argument | Type | Required | Meaning |
| --- | --- | --- | --- |
| `after` | schema | No | See the exact input schema. |
| `before` | schema | No | See the exact input schema. |
| `include_total_count` | boolean | No | See the exact input schema. |
| `per_page` | schema | No | See the exact input schema. |
| `all_pages` | boolean | No | Read successive cursor pages, bounded by max_items (default 1000). Default false returns one API page. |
| `max_items` | integer | No | Maximum records when all_pages=true. A capped result reports truncation and its continuation cursor. |

#### create_purchase

Create a purchase. OAuth-only. Requires confirmation.

```bash
kit-cli create-purchase --help
```

| Argument | Type | Required | Meaning |
| --- | --- | --- | --- |
| `purchase` | object | Body | See the exact input schema. |

#### get_purchase

Get a purchase. OAuth-only. Read-only.

```bash
kit-cli get-purchase --help
```

| Argument | Type | Required | Meaning |
| --- | --- | --- | --- |
| `purchase_id` | schema | Yes | Positive purchase id. |

#### list_segments

List segments. Read-only.

```bash
kit-cli list-segments --help
```

| Argument | Type | Required | Meaning |
| --- | --- | --- | --- |
| `after` | schema | No | See the exact input schema. |
| `before` | schema | No | See the exact input schema. |
| `include_total_count` | boolean | No | See the exact input schema. |
| `per_page` | schema | No | See the exact input schema. |
| `all_pages` | boolean | No | Read successive cursor pages, bounded by max_items (default 1000). Default false returns one API page. |
| `max_items` | integer | No | Maximum records when all_pages=true. A capped result reports truncation and its continuation cursor. |

#### list_sequence_emails

List sequence emails. Read-only.

```bash
kit-cli list-sequence-emails --help
```

| Argument | Type | Required | Meaning |
| --- | --- | --- | --- |
| `after` | schema | No | See the exact input schema. |
| `before` | schema | No | See the exact input schema. |
| `include_content` | schema | No | See the exact input schema. |
| `include_total_count` | boolean | No | See the exact input schema. |
| `per_page` | schema | No | See the exact input schema. |
| `sequence_id` | schema | Yes | Positive sequence id. |
| `include` | string | No | See the exact input schema. |
| `all_pages` | boolean | No | Read successive cursor pages, bounded by max_items (default 1000). Default false returns one API page. |
| `max_items` | integer | No | Maximum records when all_pages=true. A capped result reports truncation and its continuation cursor. |

#### create_sequence_email

Create a sequence email. Requires confirmation.

```bash
kit-cli create-sequence-email --help
```

| Argument | Type | Required | Meaning |
| --- | --- | --- | --- |
| `sequence_id` | schema | Yes | Positive sequence id. |
| `subject` | string | Body | Subject line of the email |
| `preview_text` | string/null | No | Preview text shown in email clients before the email is opened |
| `content` | string/null | No | HTML body content of the email |
| `delay_value` | integer | Body | Number of days or hours to wait before sending this email after the previous one |
| `delay_unit` | string | Body | Unit for the send delay. Use `days` for schedule-aware delivery, `hours` for a fixed hourly delay Values: `days`, `hours`. |
| `email_template_id` | integer/null | No | ID of the email template to use for layout and styling |
| `published` | boolean | No | Whether the email is active and will be sent to subscribers. Defaults to `false` (draft) |
| `send_days` | array/null | No | Days of the week this email may be sent. Defaults to all 7 days (inherits the sequence schedule). Pass a subset to restrict delivery, or `null` to reset to all days |
| `position` | integer/null | No | Zero-based position of the email in the sequence. Assigned automatically after the last email if omitted |

#### delete_sequence_email

Delete a sequence email. Requires confirmation.

```bash
kit-cli delete-sequence-email --help
```

| Argument | Type | Required | Meaning |
| --- | --- | --- | --- |
| `email_id` | schema | Yes | Positive email id. |
| `sequence_id` | schema | Yes | Positive sequence id. |

#### get_sequence_email

Get a sequence email. Read-only.

```bash
kit-cli get-sequence-email --help
```

| Argument | Type | Required | Meaning |
| --- | --- | --- | --- |
| `email_id` | schema | Yes | Positive email id. |
| `sequence_id` | schema | Yes | Positive sequence id. |
| `include` | string | No | See the exact input schema. |

#### update_sequence_email

Update a sequence email. Requires confirmation.

```bash
kit-cli update-sequence-email --help
```

| Argument | Type | Required | Meaning |
| --- | --- | --- | --- |
| `email_id` | schema | Yes | Positive email id. |
| `sequence_id` | schema | Yes | Positive sequence id. |
| `subject` | string | No | New subject line for the email |
| `preview_text` | string/null | No | New preview text shown in email clients before the email is opened |
| `content` | string/null | No | New HTML body content of the email |
| `delay_value` | integer | No | New delay value |
| `delay_unit` | string | No | New delay unit. Use `days` for schedule-aware delivery, `hours` for a fixed hourly delay Values: `days`, `hours`. |
| `email_template_id` | integer/null | No | New email template ID for layout and styling. Pass `null` to clear |
| `published` | boolean | No | Pass `true` to publish a draft email or `false` to unpublish it |
| `send_days` | array/null | No | Days of the week this email may be sent. Pass a subset to restrict delivery, or `null` to reset to all days (inherits the sequence schedule) |
| `position` | integer/null | No | New zero-based position of the email in the sequence |

#### list_sequences

List sequences. Read-only.

```bash
kit-cli list-sequences --help
```

| Argument | Type | Required | Meaning |
| --- | --- | --- | --- |
| `after` | schema | No | See the exact input schema. |
| `before` | schema | No | See the exact input schema. |
| `include_total_count` | boolean | No | See the exact input schema. |
| `per_page` | schema | No | See the exact input schema. |
| `include` | string | No | See the exact input schema. |
| `all_pages` | boolean | No | Read successive cursor pages, bounded by max_items (default 1000). Default false returns one API page. |
| `max_items` | integer | No | Maximum records when all_pages=true. A capped result reports truncation and its continuation cursor. |

#### create_sequence

Create a sequence. Requires confirmation.

```bash
kit-cli create-sequence --help
```

| Argument | Type | Required | Meaning |
| --- | --- | --- | --- |
| `name` | string | No | The name of the sequence. |
| `email_address` | string | No | The sending email address to use. Uses the account's sending email address if not provided. |
| `email_template_id` | integer | No | Id of the email template to use. |
| `send_days` | array | No | The days of the week to send the sequence on. Must be one of: `monday`, `tuesday`, `wednesday`, `thursday`, `friday`, `saturday`, `sunday`. |
| `send_hour` | integer | No | The hour of the day to send the sequence at. Must be an integer between 0 and 23. |
| `time_zone` | string | No | The timezone to use for the sequence. Must be a valid IANA timezone string. |
| `active` | boolean | No | `true` to activate the sequence, `false` to deactivate it. |
| `repeat` | boolean | No | When `true`, subscribers can restart the sequence multiple times. |
| `hold` | boolean | No | When `true`, subscribers added via Visual Automations stay in the sequence after receiving the last email. |
| `exclude_subscriber_sources` | array | No | The subscriber sources to exclude from the sequence. |

#### delete_sequence

Delete a sequence. Requires confirmation.

```bash
kit-cli delete-sequence --help
```

| Argument | Type | Required | Meaning |
| --- | --- | --- | --- |
| `sequence_id` | schema | Yes | Positive sequence id. |

#### get_sequence

Get a sequence. Read-only.

```bash
kit-cli get-sequence --help
```

| Argument | Type | Required | Meaning |
| --- | --- | --- | --- |
| `sequence_id` | schema | Yes | Positive sequence id. |
| `include` | string | No | See the exact input schema. |

#### update_sequence

Update a sequence. Requires confirmation.

```bash
kit-cli update-sequence --help
```

| Argument | Type | Required | Meaning |
| --- | --- | --- | --- |
| `sequence_id` | schema | Yes | Positive sequence id. |
| `name` | string | No | The name of the sequence. |
| `email_address` | string | No | The sending email address to use. Uses the account's sending email address if not provided. |
| `email_template_id` | integer | No | Id of the email template to use. |
| `send_days` | array | No | The days of the week to send the sequence on. Must be one of: `monday`, `tuesday`, `wednesday`, `thursday`, `friday`, `saturday`, `sunday`. |
| `send_hour` | integer | No | The hour of the day to send the sequence at. Must be an integer between 0 and 23. |
| `time_zone` | string | No | The timezone to use for the sequence. Must be a valid IANA timezone string. |
| `active` | boolean | No | `true` to activate the sequence, `false` to deactivate it. |
| `repeat` | boolean | No | When `true`, subscribers can restart the sequence multiple times. |
| `hold` | boolean | No | When `true`, subscribers added via Visual Automations stay in the sequence after receiving the last email. |
| `exclude_subscriber_sources` | array | No | The subscriber sources to exclude from the sequence. |

#### list_subscribers_for_sequence

List subscribers for a sequence. Read-only.

```bash
kit-cli list-subscribers-for-sequence --help
```

| Argument | Type | Required | Meaning |
| --- | --- | --- | --- |
| `added_after` | string/null | No | See the exact input schema. |
| `added_before` | string/null | No | See the exact input schema. |
| `after` | schema | No | See the exact input schema. |
| `before` | schema | No | See the exact input schema. |
| `created_after` | string/null | No | See the exact input schema. |
| `created_before` | string/null | No | See the exact input schema. |
| `include_total_count` | boolean | No | See the exact input schema. |
| `per_page` | schema | No | See the exact input schema. |
| `sequence_id` | schema | Yes | Positive sequence id. |
| `status` | string | No |  Values: `active`, `inactive`, `bounced`, `complained`, `cancelled`, `all`. |
| `all_pages` | boolean | No | Read successive cursor pages, bounded by max_items (default 1000). Default false returns one API page. |
| `max_items` | integer | No | Maximum records when all_pages=true. A capped result reports truncation and its continuation cursor. |

#### add_subscriber_to_sequence

Add subscriber to sequence by email address. Requires confirmation.

```bash
kit-cli add-subscriber-to-sequence --help
```

| Argument | Type | Required | Meaning |
| --- | --- | --- | --- |
| `sequence_id` | schema | Yes | Positive sequence id. |
| `email_address` | string | Body | See the exact input schema. |

#### add_subscriber_to_sequence_by_id

Add subscriber to sequence. Requires confirmation.

```bash
kit-cli add-subscriber-to-sequence-by-id --help
```

| Argument | Type | Required | Meaning |
| --- | --- | --- | --- |
| `subscriber_id` | schema | Yes | Positive subscriber id. |
| `sequence_id` | schema | Yes | Positive sequence id. |

#### list_snippets

List snippets. Read-only.

```bash
kit-cli list-snippets --help
```

| Argument | Type | Required | Meaning |
| --- | --- | --- | --- |
| `after` | schema | No | See the exact input schema. |
| `archived` | schema | No | See the exact input schema. |
| `before` | schema | No | See the exact input schema. |
| `include_content` | boolean | No | See the exact input schema. |
| `include_total_count` | boolean | No | See the exact input schema. |
| `per_page` | schema | No | See the exact input schema. |
| `snippet_type` | schema | No | See the exact input schema. |
| `all_pages` | boolean | No | Read successive cursor pages, bounded by max_items (default 1000). Default false returns one API page. |
| `max_items` | integer | No | Maximum records when all_pages=true. A capped result reports truncation and its continuation cursor. |

#### create_snippet

Create a snippet. Requires confirmation.

```bash
kit-cli create-snippet --help
```

| Argument | Type | Required | Meaning |
| --- | --- | --- | --- |

#### get_snippet

Get a snippet. Read-only.

```bash
kit-cli get-snippet --help
```

| Argument | Type | Required | Meaning |
| --- | --- | --- | --- |
| `snippet_id` | schema | Yes | Positive snippet id. |

#### update_snippet

Update a snippet. Requires confirmation.

```bash
kit-cli update-snippet --help
```

| Argument | Type | Required | Meaning |
| --- | --- | --- | --- |
| `snippet_id` | schema | Yes | Positive snippet id. |

#### bulk_create_subscribers

Bulk create subscribers. OAuth-only. Requires confirmation.

```bash
kit-cli bulk-create-subscribers --help
```

| Argument | Type | Required | Meaning |
| --- | --- | --- | --- |
| `subscribers` | array | Body | See the exact input schema. |
| `callback_url` | string/null | No | See the exact input schema. |

#### list_subscribers

List subscribers. Read-only.

```bash
kit-cli list-subscribers --help
```

| Argument | Type | Required | Meaning |
| --- | --- | --- | --- |
| `after` | string/null | No | See the exact input schema. |
| `before` | string/null | No | See the exact input schema. |
| `created_after` | string | No | See the exact input schema. |
| `created_before` | string | No | See the exact input schema. |
| `email_address` | string | No | See the exact input schema. |
| `include` | string | No | See the exact input schema. |
| `include_total_count` | boolean | No | See the exact input schema. |
| `per_page` | number/null | No | See the exact input schema. |
| `slim` | boolean | No | See the exact input schema. |
| `sort_field` | string | No |  Values: `id`, `created_at`, `updated_at`, `cancelled_at`, `canceled_at`, `engagement__sent`, `engagement__opens`, `engagement__clicks`, `engagement__open_rate`, `engagement__click_rate`. |
| `sort_order` | string | No |  Values: `asc`, `desc`. |
| `status` | string | No |  Values: `active`, `inactive`, `bounced`, `complained`, `cancelled`, `all`. |
| `updated_after` | string | No | See the exact input schema. |
| `updated_before` | string | No | See the exact input schema. |
| `all_pages` | boolean | No | Read successive cursor pages, bounded by max_items (default 1000). Default false returns one API page. |
| `max_items` | integer | No | Maximum records when all_pages=true. A capped result reports truncation and its continuation cursor. |

#### create_subscriber

Create a subscriber. Requires confirmation.

```bash
kit-cli create-subscriber --help
```

| Argument | Type | Required | Meaning |
| --- | --- | --- | --- |
| `first_name` | string/null | No | See the exact input schema. |
| `email_address` | string | Body | See the exact input schema. |
| `state` | string/null | No | Create subscriber in this state (`active`, `bounced`, `cancelled`, `complained` or `inactive`). Defaults to `active`. Values: `active`, `cancelled`, `bounced`, `complained`, `inactive`. |
| `fields` | object | No | Custom field values keyed by the custom field's `key` (e.g. `last_name`, not `Last Name`). Unknown keys are ignored and reported in the response `warnings` array. |

#### filter_subscribers

Filter subscribers by engagement, sign-up date, state, and tags. Read-only.

```bash
kit-cli filter-subscribers --help
```

| Argument | Type | Required | Meaning |
| --- | --- | --- | --- |
| `counting_mode` | string | No | Controls how engagement-filter count thresholds are tallied. `raw` (default) counts every event : five opens of the same email = five. `unique_email` counts distinct emails on which the action occurred : five opens of the same email = one. Applies to every engagement filter (opens, clicks, sent, delivered) in the request; ignored for other filter types. Values: `raw`, `unique_email`. |
| `all` | array | Body | Array of filter conditions where ALL must be met (AND logic) |
| `include` | array | No | Optional. Array of `{ type, ...config }` objects naming additional fields to embed on each subscriber row. Valid types: `attribution`, `tags`, `location`, `canceled_at`, `stats`, `custom_fields`. The `stats` type accepts an optional `range: { start, end }` (YYYY-MM-DD dates, defaulting to the last 90 days). The `custom_fields` type adds a `fields` object with all account custom field values (null for fields the subscriber has not set). |
| `sort_field` | string | No | Field to order results by. Base columns (`id`, `first_name`, `email_address`, `created_at`) order by that subscriber attribute. `engagement__ ` orders by an engagement stat over the trailing 90 days: counts (`sent`, `opens`, `clicks`) and rates (`open_rate`, `click_rate`); subscribers with no sends order as 0. `location__distance` orders by great-circle distance and requires a `location` filter in the same request : its `latitude`/`longitude` supply the origin, and subscribers without a primary location are excluded. Distance defaults to nearest-first (`sort_order` defaults to `asc` for this field); pass `sort_order=desc` for farthest-first. Values: `id`, `first_name`, `email_address`, `created_at`, `engagement__sent`, `engagement__opens`, `engagement__clicks`, `engagement__open_rate`, `engagement__click_rate`, `location__distance`. Default: `"created_at"`. |
| `sort_order` | string | No | Sort direction (default: desc). Values: `asc`, `desc`. |

#### get_subscriber

Get a subscriber. Read-only.

```bash
kit-cli get-subscriber --help
```

| Argument | Type | Required | Meaning |
| --- | --- | --- | --- |
| `subscriber_id` | schema | Yes | Positive subscriber id. |

#### update_subscriber

Update a subscriber. Requires confirmation.

```bash
kit-cli update-subscriber --help
```

| Argument | Type | Required | Meaning |
| --- | --- | --- | --- |
| `subscriber_id` | schema | Yes | Positive subscriber id. |
| `first_name` | string/null | No | See the exact input schema. |
| `email_address` | string | Body | See the exact input schema. |
| `fields` | object | No | Custom field values keyed by the custom field's `key` (e.g. `last_name`, not `Last Name`). Unknown keys are ignored and reported in the response `warnings` array. |

#### unsubscribe

Unsubscribe subscriber. Requires confirmation.

```bash
kit-cli unsubscribe --help
```

| Argument | Type | Required | Meaning |
| --- | --- | --- | --- |
| `subscriber_id` | schema | Yes | Positive subscriber id. |

#### delete_subscriber_location

Delete a subscriber's location. Requires confirmation.

```bash
kit-cli delete-subscriber-location --help
```

| Argument | Type | Required | Meaning |
| --- | --- | --- | --- |
| `subscriber_id` | schema | Yes | Positive subscriber id. |

#### update_subscriber_location

Update a subscriber's pinned location. Requires confirmation.

```bash
kit-cli update-subscriber-location --help
```

| Argument | Type | Required | Meaning |
| --- | --- | --- | --- |
| `subscriber_id` | schema | Yes | Positive subscriber id. |
| `location` | object | Body | See the exact input schema. |

#### pin_subscriber_location

Pin a subscriber's location. Requires confirmation.

```bash
kit-cli pin-subscriber-location --help
```

| Argument | Type | Required | Meaning |
| --- | --- | --- | --- |
| `subscriber_id` | schema | Yes | Positive subscriber id. |
| `location` | object | Body | See the exact input schema. |

#### get_subscriber_stats

List stats for a subscriber. Read-only.

```bash
kit-cli get-subscriber-stats --help
```

| Argument | Type | Required | Meaning |
| --- | --- | --- | --- |
| `email_sent_after` | string | No | See the exact input schema. |
| `email_sent_before` | string | No | See the exact input schema. |
| `subscriber_id` | schema | Yes | Positive subscriber id. |

#### list_subscriber_tags

List tags for a subscriber. Read-only.

```bash
kit-cli list-subscriber-tags --help
```

| Argument | Type | Required | Meaning |
| --- | --- | --- | --- |
| `after` | schema | No | See the exact input schema. |
| `before` | schema | No | See the exact input schema. |
| `include_total_count` | boolean | No | See the exact input schema. |
| `per_page` | schema | No | See the exact input schema. |
| `subscriber_id` | schema | Yes | Positive subscriber id. |
| `all_pages` | boolean | No | Read successive cursor pages, bounded by max_items (default 1000). Default false returns one API page. |
| `max_items` | integer | No | Maximum records when all_pages=true. A capped result reports truncation and its continuation cursor. |

#### bulk_delete_tags

Bulk delete tags. OAuth-only. Requires confirmation.

```bash
kit-cli bulk-delete-tags --help
```

| Argument | Type | Required | Meaning |
| --- | --- | --- | --- |
| `tags` | array | Body | Tags to delete, identified by `id`. Batches of 100 or fewer are processed synchronously (200); larger batches are queued and processed asynchronously (202). |
| `callback_url` | string/null | No | Optional. When the batch is processed asynchronously (more than 100 tags), the results are POSTed to this URL on completion. |

#### bulk_create_tags

Bulk create tags. OAuth-only. Reversible configuration write.

```bash
kit-cli bulk-create-tags --help
```

| Argument | Type | Required | Meaning |
| --- | --- | --- | --- |
| `tags` | array | Body | See the exact input schema. |
| `callback_url` | string/null | No | See the exact input schema. |

#### bulk_remove_tags_from_subscribers

Bulk remove tags from subscribers. OAuth-only. Requires confirmation.

```bash
kit-cli bulk-remove-tags-from-subscribers --help
```

| Argument | Type | Required | Meaning |
| --- | --- | --- | --- |

#### bulk_tag_subscribers

Bulk tag subscribers. OAuth-only. Requires confirmation.

```bash
kit-cli bulk-tag-subscribers --help
```

| Argument | Type | Required | Meaning |
| --- | --- | --- | --- |
| `taggings` | array | Body | See the exact input schema. |
| `callback_url` | string/null | No | See the exact input schema. |

#### list_tags

List tags. Read-only.

```bash
kit-cli list-tags --help
```

| Argument | Type | Required | Meaning |
| --- | --- | --- | --- |
| `after` | schema | No | See the exact input schema. |
| `before` | schema | No | See the exact input schema. |
| `include_total_count` | boolean | No | See the exact input schema. |
| `per_page` | schema | No | See the exact input schema. |
| `include` | string | No | See the exact input schema. |
| `all_pages` | boolean | No | Read successive cursor pages, bounded by max_items (default 1000). Default false returns one API page. |
| `max_items` | integer | No | Maximum records when all_pages=true. A capped result reports truncation and its continuation cursor. |

#### create_tag

Create a tag. Reversible configuration write.

```bash
kit-cli create-tag --help
```

| Argument | Type | Required | Meaning |
| --- | --- | --- | --- |
| `name` | string | Body | See the exact input schema. |

#### update_tag_name

Update tag name. Reversible configuration write.

```bash
kit-cli update-tag-name --help
```

| Argument | Type | Required | Meaning |
| --- | --- | --- | --- |
| `tag_id` | schema | Yes | Positive tag id. |
| `name` | string | Body | See the exact input schema. |

#### untag_subscriber_by_email

Remove tag from subscriber by email address. Requires confirmation.

```bash
kit-cli untag-subscriber-by-email --help
```

| Argument | Type | Required | Meaning |
| --- | --- | --- | --- |
| `tag_id` | schema | Yes | Positive tag id. |
| `email_address` | string | Yes | See the exact input schema. |

#### list_subscribers_for_tag

List subscribers for a tag. Read-only.

```bash
kit-cli list-subscribers-for-tag --help
```

| Argument | Type | Required | Meaning |
| --- | --- | --- | --- |
| `after` | schema | No | See the exact input schema. |
| `before` | schema | No | See the exact input schema. |
| `created_after` | string/null | No | See the exact input schema. |
| `created_before` | string/null | No | See the exact input schema. |
| `include_total_count` | boolean | No | See the exact input schema. |
| `per_page` | schema | No | See the exact input schema. |
| `slim` | boolean | No | See the exact input schema. |
| `status` | string | No |  Values: `active`, `inactive`, `bounced`, `complained`, `cancelled`, `all`. |
| `tag_id` | schema | Yes | Positive tag id. |
| `tagged_after` | string/null | No | See the exact input schema. |
| `tagged_before` | string/null | No | See the exact input schema. |
| `all_pages` | boolean | No | Read successive cursor pages, bounded by max_items (default 1000). Default false returns one API page. |
| `max_items` | integer | No | Maximum records when all_pages=true. A capped result reports truncation and its continuation cursor. |

#### tag_subscriber

Tag a subscriber by email address. Requires confirmation.

```bash
kit-cli tag-subscriber --help
```

| Argument | Type | Required | Meaning |
| --- | --- | --- | --- |
| `tag_id` | schema | Yes | Positive tag id. |
| `email_address` | string | Body | See the exact input schema. |

#### untag_subscriber

Remove tag from subscriber. Requires confirmation.

```bash
kit-cli untag-subscriber --help
```

| Argument | Type | Required | Meaning |
| --- | --- | --- | --- |
| `subscriber_id` | schema | Yes | Positive subscriber id. |
| `tag_id` | schema | Yes | Positive tag id. |

#### tag_subscriber_by_id

Tag a subscriber. Requires confirmation.

```bash
kit-cli tag-subscriber-by-id --help
```

| Argument | Type | Required | Meaning |
| --- | --- | --- | --- |
| `subscriber_id` | schema | Yes | Positive subscriber id. |
| `tag_id` | schema | Yes | Positive tag id. |

#### list_webhook_endpoints

List webhook endpoints. Read-only.

```bash
kit-cli list-webhook-endpoints --help
```

| Argument | Type | Required | Meaning |
| --- | --- | --- | --- |
| `after` | schema | No | See the exact input schema. |
| `before` | schema | No | See the exact input schema. |
| `include_total_count` | boolean | No | See the exact input schema. |
| `per_page` | schema | No | See the exact input schema. |
| `status` | string | No |  Values: `active`, `disabled`. |
| `all_pages` | boolean | No | Read successive cursor pages, bounded by max_items (default 1000). Default false returns one API page. |
| `max_items` | integer | No | Maximum records when all_pages=true. A capped result reports truncation and its continuation cursor. |

#### create_webhook_endpoint

Create a webhook endpoint. Requires confirmation.

```bash
kit-cli create-webhook-endpoint --help
```

| Argument | Type | Required | Meaning |
| --- | --- | --- | --- |
| `url` | string | Body | See the exact input schema. |
| `events` | array | Body | Event types this endpoint subscribes to (e.g. `subscriber.created`). On update, the list supplied here replaces the endpoint's full subscription list. |
| `name` | string | No | See the exact input schema. |
| `description` | string | No | See the exact input schema. |
| `secret_name` | string | Yes | New private filename under KIT_PRIVATE_DIR. Required before creating/rotating a signing secret; never overwritten. |

#### delete_webhook_endpoint

Delete a webhook endpoint. Requires confirmation.

```bash
kit-cli delete-webhook-endpoint --help
```

| Argument | Type | Required | Meaning |
| --- | --- | --- | --- |
| `webhook_endpoint_id` | schema | Yes | Positive webhook endpoint id. |

#### get_webhook_endpoint

Get a webhook endpoint. Read-only.

```bash
kit-cli get-webhook-endpoint --help
```

| Argument | Type | Required | Meaning |
| --- | --- | --- | --- |
| `webhook_endpoint_id` | schema | Yes | Positive webhook endpoint id. |

#### update_webhook_endpoint

Update a webhook endpoint. Requires confirmation.

```bash
kit-cli update-webhook-endpoint --help
```

| Argument | Type | Required | Meaning |
| --- | --- | --- | --- |
| `webhook_endpoint_id` | schema | Yes | Positive webhook endpoint id. |
| `name` | string | No | See the exact input schema. |
| `url` | string | No | See the exact input schema. |
| `description` | string | No | See the exact input schema. |
| `status` | string | No | Endpoint status. One of: `active`, `disabled`. Values: `active`, `disabled`. |
| `events` | array | No | Event types this endpoint subscribes to (e.g. `subscriber.created`). On update, the list supplied here replaces the endpoint's full subscription list. |

#### revoke_previous_webhook_secret

Revoke the previous webhook endpoint secret. Requires confirmation.

```bash
kit-cli revoke-previous-webhook-secret --help
```

| Argument | Type | Required | Meaning |
| --- | --- | --- | --- |
| `webhook_endpoint_id` | schema | Yes | Positive webhook endpoint id. |

#### rotate_webhook_secret

Rotate a webhook endpoint secret. Requires confirmation.

```bash
kit-cli rotate-webhook-secret --help
```

| Argument | Type | Required | Meaning |
| --- | --- | --- | --- |
| `webhook_endpoint_id` | schema | Yes | Positive webhook endpoint id. |
| `force` | boolean | No | Rotating again while a previous rotation's overlap window is still open returns `409` (see the responses below). Pass `true` to rotate anyway, immediately expiring the older secret. |
| `secret_name` | string | Yes | New private filename under KIT_PRIVATE_DIR. Required before creating/rotating a signing secret; never overwritten. |

#### list_webhooks

List webhooks. Read-only.

```bash
kit-cli list-webhooks --help
```

| Argument | Type | Required | Meaning |
| --- | --- | --- | --- |
| `after` | schema | No | See the exact input schema. |
| `before` | schema | No | See the exact input schema. |
| `include_total_count` | boolean | No | See the exact input schema. |
| `per_page` | schema | No | See the exact input schema. |
| `all_pages` | boolean | No | Read successive cursor pages, bounded by max_items (default 1000). Default false returns one API page. |
| `max_items` | integer | No | Maximum records when all_pages=true. A capped result reports truncation and its continuation cursor. |

#### create_webhook

Create a webhook. Requires confirmation.

```bash
kit-cli create-webhook --help
```

| Argument | Type | Required | Meaning |
| --- | --- | --- | --- |
| `target_url` | string | Body | See the exact input schema. |
| `event` | object | Body | See the exact input schema. |

#### delete_webhook

Delete a webhook. Requires confirmation.

```bash
kit-cli delete-webhook --help
```

| Argument | Type | Required | Meaning |
| --- | --- | --- | --- |
| `webhook_id` | schema | Yes | Positive webhook id. |

#### search_subscribers

Find subscribers by exact email. Read-only.

```bash
kit-cli search-subscribers --help
```

| Argument | Type | Required | Meaning |
| --- | --- | --- | --- |
| `after` | string/null | No | See the exact input schema. |
| `before` | string/null | No | See the exact input schema. |
| `created_after` | string | No | See the exact input schema. |
| `created_before` | string | No | See the exact input schema. |
| `email_address` | string | Yes | See the exact input schema. |
| `include` | string | No | See the exact input schema. |
| `include_total_count` | boolean | No | See the exact input schema. |
| `per_page` | number/null | No | See the exact input schema. |
| `slim` | boolean | No | See the exact input schema. |
| `sort_field` | string | No |  Values: `id`, `created_at`, `updated_at`, `cancelled_at`, `canceled_at`, `engagement__sent`, `engagement__opens`, `engagement__clicks`, `engagement__open_rate`, `engagement__click_rate`. |
| `sort_order` | string | No |  Values: `asc`, `desc`. |
| `status` | string | No |  Values: `active`, `inactive`, `bounced`, `complained`, `cancelled`, `all`. |
| `updated_after` | string | No | See the exact input schema. |
| `updated_before` | string | No | See the exact input schema. |
| `all_pages` | boolean | No | Read successive cursor pages, bounded by max_items (default 1000). Default false returns one API page. |
| `max_items` | integer | No | Maximum records when all_pages=true. A capped result reports truncation and its continuation cursor. |

#### list_accounts

List configured accounts. Read-only.

```bash
kit-cli list-accounts --help
```

No arguments.

## 12. Safety and your data

`KIT_READ_ONLY=1` hides every write, leaving 38 reads, and also refuses a direct write invocation. `KIT_ALLOW_DESTRUCTIVE=0` leaves tools visible but refuses the 40 guarded audience/delivery/deletion/secret operations. There is no `--agent` or `--yes` bypass. Confirmation means permission for the actual user-requested operation, not a blanket license to modify an account.

Seven configuration writes (such as creating a tag or custom field) do not require confirmation. They are still writes and are blocked by read-only mode. Tool annotations describe read, destructive, idempotent and open-world behavior; application prompts remain client-dependent.

Requests go directly to `https://api.kit.com/v4`; no Navid-hosted relay, analytics or telemetry is included. HTTP redirects are refused. Keys, OAuth tokens, client secrets and signing secrets are sanitized from tool results and reflected API errors. Subscriber addresses, email content, reports and other authorized response data are still private business data that your AI client can process. Configure its retention and sharing policy accordingly.

Private OAuth files, webhook-secret files and optional audit files remain local. Audit records contain attempted write names, risk, surface, decision and outcome, without arguments, subscriber addresses, message bodies, account labels or credentials. Audit failure does not block a requested operation. It is a guard-decision log, not proof of remote delivery or complete Kit account audit history.

GET 429 responses can retry up to two times by default, honoring a bounded delay. GET OAuth 401 can refresh and retry once. All mutating requests have **zero automatic retries**, including 429 and token expiry. A read-only filter POST also has no automatic retry. Treat service data as data, not instructions to execute an unrelated operation.

See [SECURITY.md](./SECURITY.md) for disclosure, private file handling, dependency limitations and live-validation limits.

## 13. Official and community comparisons

| Offering | Surface | What the reviewed source establishes | Tradeoff |
| --- | --- | --- | --- |
| [Official Kit account MCP](https://developers.kit.com/mcp/kit-mcp) | Remote MCP, Kit OAuth | v4 account reads and writes; paid Creator/Creator Pro; 120 requests/min/token | Hosted consent/setup; standalone task CLI not identified there |
| [Kit Developer Docs MCP](https://developers.kit.com/mcp/kit-developer-docs-mcp) | Documentation MCP | Read documentation | No account operations |
| This package | Local stdio, CLI, desktop archive | 83 pinned operations + 2 helpers, private account settings and guards | You maintain local credentials; live writes pending |
| [ArtisanPack UI ConvertKit](https://github.com/ArtisanPack-UI/convertkit) | PHP/Laravel integration and Artisan commands | Kit integration with framework commands | Requires the Laravel application environment |
| [CData ConvertKit CLI](https://www.cdata.com/kb/tech/convertkit-jdbc-cli-github-copilot.rst) | Provider data-access CLI | JDBC-backed data access from a CLI | Different provider/license and data-oriented scope |

[COMPARISON.md](./COMPARISON.md) records dated primary sources, scope and limitations. Counts are package discovery results, not evidence that the official server has fewer endpoints. No competitor latency, success rate or total token cost has been measured here.

## 14. Token and task comparisons

No fresh Claude Code token benchmark is available for this version. There are no claimed savings or made-up token figures. `tools/list` and the installed skill are the actual inputs for a future measurement.

Measure the same successful task with: baseline, MCP with eager tool loading, MCP with the client's normal deferred search, CLI with its installed skill, and the official Kit MCP when account authorization is available. Fix client/model versions, account, prompt, selected fields and result size. Record standing context separately from input/output/cache tokens, reasoning, command help, response data, latency and any service costs. Discovery alone does not measure completed-task cost.

A sensible matched task reads the latest five broadcasts and their statistics into one compact summary. A draft-only write comparison must use a test account and explicit approval, and verify equal resulting drafts. Neither comparison should send newsletters during setup. Results remain pending until real client usage and successful task outcomes are captured.

## 15. Settings

| Variable | Default | Meaning |
| --- | --- | --- |
| `KIT_API_KEY` | `Empty` | Personal v4 API key |
| `KIT_ACCESS_TOKEN` | `Empty` | Existing OAuth access token |
| `KIT_REFRESH_TOKEN` | `Empty` | OAuth refresh token |
| `KIT_CLIENT_ID` | `Empty` | Your authorized Kit app ID |
| `KIT_CLIENT_SECRET` | `Empty` | Your private confidential-app secret |
| `KIT_TOKENS_FILE` | `Empty` | Regular private OAuth JSON, max 64 KB |
| `KIT_ACCOUNTS` | `Empty` | Private JSON named accounts; replaces single-account settings |
| `KIT_DEFAULT_ACCOUNT` | `First account` | Default name from KIT_ACCOUNTS |
| `KIT_READ_ONLY` | `0` | 1 or true hides and refuses all 47 writes |
| `KIT_ALLOW_DESTRUCTIVE` | `1` | 0 or false blocks all 40 guarded operations even with confirm |
| `KIT_AUDIT_LOG` | `None` | Local attempted-write guard log, no request fields |
| `KIT_PRIVATE_DIR` | `~/.config/kit-mcp-cli/secrets` | Private signing-secret folder |
| `KIT_REQUEST_TIMEOUT_MS` | `30000` | Per-request deadline, integer 100–300000 |
| `KIT_MAX_RETRIES` | `2` | GET 429 retries only, integer 0–5 |
| `KIT_MIN_REQUEST_INTERVAL_MS` | `0 = automatic` | 0 chooses 550 ms keys / 110 ms OAuth; otherwise 1–10000 ms |

The package reads environment variables only. It does not automatically load `.env`, resolve a secret-manager account, or inherit GUI environment values from a terminal. Private client config examples are in INSTALL.md. Never put real credentials in project MCP files.

## 16. Troubleshooting

| Symptom | Resolution |
| --- | --- |
| Binary not found | Install Node 22+, check npm global prefix/PATH, reopen terminal |
| PowerShell blocks npm.ps1 | Use npm.cmd or Command Prompt in accordance with your policy |
| Local doctor exit 10 | Configure a v4 key or regular OAuth token file in private settings |
| GUI works differently from terminal | GUI clients often do not inherit shell env; configure private client env |
| API 401 | Verify v4 credentials; OAuth may be expired or revoked |
| API 403 / OAuth required | Check current plan permissions and use OAuth for that endpoint |
| Read-only missing tools | Set KIT_READ_ONLY=0 only when writes are wanted; reconnect |
| Confirmation refused | Supply confirm:true/--confirm only for an explicitly requested operation; check destructive policy |
| Invalid request body | Read schema; use payload for nested fields/null; avoid mixing body forms |
| No results beyond the first page | Follow end_cursor or use bounded all_pages |
| 429 | Wait; other integrations share the credential limit; do not blindly retry writes |
| Write timeout | Outcome may be unknown; inspect the account before repeating |
| Template or Starting point error | See recorded schema contradictions and test an unscheduled private draft |
| Secret filename exists | Choose a new private secret_name; files are never overwritten |
| Refresh succeeds but file update fails | Repair private folder access and inspect state before another write |
| Desktop extension rejected | Validate host custom-extension policy and compatible runtime; try manual stdio setup |

## 17. Frequently asked questions

### Is Kit free to use here?

The wrapper is free AGPL software. Your Kit subscription and API eligibility are separate. The official Kit MCP is available on paid Creator and Creator Pro plans; consult Kit for your account’s API access.

### Does Kit already have an official MCP?

Yes. Its account server supports reads and writes across v4. Its separate developer-docs MCP reads documentation and cannot act on your account.

### Why use this if the official one exists?

Use it for standalone task commands, shell automation, private named-account settings, token-file refresh, bounded pagination or a local desktop archive. Use Kit’s official server for Kit-managed hosted OAuth. Neither is declared universally better.

### Is there an official Kit CLI?

No standalone email-account task CLI was identified in the official developer surfaces reviewed on 2026-10-02. Framework-specific and data-provider CLIs exist; see COMPARISON.md.

### Are all 85 tools available with an API key?

Discovery shows them, but OAuth-only bulk and purchase endpoints reject API-key calls before HTTP. The tool table marks them. Use an authorized OAuth session for those operations.

### Do I need to give the AI my key?

No. Configure it privately in your shell or client settings. Help, discovery and schemas work without it.

### Does login sign me in?

No. It explains first-time key/OAuth setup. This package does not host a consent flow or copy your browser cookies.

### Can I use Claude Desktop?

Yes, through local stdio configuration or the custom .mcpb release. GUI installation of this version remains a separate host check.

### Can I use ChatGPT on the web?

This local package does not expose an HTTPS connector. Use Kit’s official remote MCP for a compatible web connector.

### Will creating a broadcast immediately send it?

The wrapper defaults create to private and unscheduled. If you explicitly pass send_at or publication fields, they can change that behavior. All broadcast writes require confirmation; review in Kit before delivery.

### Is published_at the schedule time?

No. Use send_at for email delivery. published_at concerns web publication.

### How do I clear a schedule?

Use update_broadcast with a JSON body containing send_at:null, then inspect the broadcast. A shell string null is not JSON null.

### Can I preserve my designed email template?

Inspect existing template HTML and required Liquid/footer markup before changing content. The API is not a visual block editor. Starting point schema conflicts remain live-account validation pending.

### Can tags send email indirectly?

Yes, existing automations can react to tagging, form subscription or sequence enrollment. Those operations require explicit confirmation here.

### Will the CLI retry a failed send?

No. Mutating requests are never automatically retried. A timeout may have an unknown outcome; inspect the account first.

### Can I connect multiple accounts?

Yes. Use a private KIT_ACCOUNTS array with unique names, then --account. list_accounts returns labels/auth methods without credentials.

### How do I retrieve more than one page?

Use after or bounded all_pages/max_items. v4 uses cursors. Aggregate output exposes the last cursor and truncation; it is not an unlimited export.

### Where do webhook secrets go?

New signed endpoint secrets go to exclusive owner-only files under KIT_PRIVATE_DIR and are redacted from returned tool data. Configure your own receiver privately.

### Is it more token-efficient than official MCP?

That has not been measured. Model context, discovery, skill, command help, results, cache and task length all matter. No invented savings are advertised.

### Can I migrate my old private setup?

Create new private settings with a v4 key or authorized OAuth token file. Do not copy old personal SKILL content, cookies or source history into a public repo. See the 2.0 migration notes.

## 18. Development and releases

```bash
git clone https://github.com/thenavidm/kit-mcp-cli.git
cd kit-mcp-cli
npm ci
npm run typecheck
npm run build
npm test
npm run check:counts
npm run build:mcpb
npm pack --dry-run
```

The snapshot is checked into `scripts/kit-api.snapshot.json`; generated operation schemas and the source hash are in `src/tools/`. To review a future API snapshot, save the official document locally and run `node scripts/sync-openapi.mjs /absolute/path/reviewed-v4.json`, inspect every diff and re-run the checks. Do not treat new endpoint discovery as a reviewed release. Record current source corrections and verify live behavior when credentials permit.

The CI workflow verifies Node 22 and 24 on Linux and Windows, then builds the desktop archive. The release workflow verifies package/tag/counts/tests, publishes npm with provenance, and attaches the matching desktop archive. Release tags are annotated `v<package version>`. Topics and npm keywords cover the actual Kit/MCP/CLI surfaces. Credentials use encrypted GitHub secrets or private local configuration and never enter a package.

The npm allowlist includes built code, full setup/skill/comparison/changelog/security/contribution docs and licenses. It excludes source tests, private account files, local `.env`, build scratch folders and the desktop archive. The `.mcpb` vendors production dependencies, the server and notices without configured credentials. A build dependency audit can differ from the production audit; see SECURITY.md.

Issues and reproducible bug reports are welcome. This repository does not accept unsolicited pull requests; see [CONTRIBUTING.md](./CONTRIBUTING.md). Use private vulnerability reporting for security issues.

## 19. Version history

[CHANGELOG.md](./CHANGELOG.md) records dated changes and validation. Version 2.0.0 replaces the private 1.0.0 source with a sanitized public v4 implementation. It preserves the AGPL license and useful operation names, and adds the CLI and desktop surface.

The old source's private account instructions and original commits remain private. Public history starts with the reviewed v2 source; this avoids publishing personal setup data. Only the sanitized public branch is pushed.

### Major-version migration

- Configure a v4 key or private authorized OAuth file; a v3 API secret is insufficient.
- Replace numeric page arguments with v4 cursors.
- Use current tool IDs and schemas; `search_subscribers` remains an exact-email alias.
- The old browser `kit_login` and broadcast/sequence/visual-automation duplication helpers are not included. Their private cookie workflows are not part of the v4 API. Use the Kit UI for designed duplication and visual automation work.
- API sequence/email CRUD is now available, but it is not a claim of legacy browser feature parity.
- Review `send_at`, draft defaults and explicit confirmation before any delivery or audience change.
- Never copy old personal SKILL content, cookies or the private Git history into public files.

## License

This wrapper is **AGPL-3.0-or-later**, preserving the legacy source's license. See [LICENSE](./LICENSE) and the full [AGPL text](./licenses/AGPL-3.0.txt). Kit's service and documentation retain their own rights and terms. Third-party dependency attribution is in [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md).


## About the author

Navid Moazzez is a leading AI business strategist, and the host of the AI Creator Summit, watched by 100,000+ creators. He helps creators and founders master AI and build their own AI Operating System (AI OS) to automate their business and life. This Kit MCP server and CLI is one piece of that system.

**Links**

- Personal website: [navid.me](https://navid.me)
- Link in bio: [navid.bio](https://navid.bio)
- Navid Media: [navid.media](https://navid.media)
- YouTube: [@thenavidm](https://youtube.com/@thenavidm?sub_confirmation=1) and [@thenavidai](https://youtube.com/@thenavidai?sub_confirmation=1)
- X: [@thenavidm](https://x.com/thenavidm)
- Instagram: [@thenavidm](https://instagram.com/thenavidm)
- LinkedIn: [thenavidm](https://linkedin.com/in/thenavidm)

---

© 2026 [Navid Media](https://navid.media). Made with ❤️ by [Navid Moazzez](https://navid.me).
