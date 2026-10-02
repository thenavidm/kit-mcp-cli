# Security and private data

## Report privately

Use [GitHub private vulnerability reporting](https://github.com/thenavidm/kit-mcp-cli/security/advisories/new) for security issues. Do not post credentials, subscriber data, cookies or private email content in public issues. General reproducible bugs belong in Issues after sanitizing data.

## Supported version

The current 2.x release is maintained. The old private 1.0 source is not published by this repo; personal instructions and history remain private. Rotate any actual leaked credential through Kit rather than relying only on deleting a file or commit.

## Authentication and storage

Credentials come from private local environment/client settings. v4 keys go only in X-Kit-Api-Key; OAuth uses Bearer headers. API and OAuth hosts are fixed and HTTP redirects refused. Account OAuth tokens can refresh in memory or in a regular private JSON file (no symlinks, <=64 KB) with atomic 0600 writes. Use OS-user-only ACLs on Windows; POSIX modes are not a full Windows security policy.

New signed webhook secrets go to exclusive owner-only files under KIT_PRIVATE_DIR, default ~/.config/kit-mcp-cli/secrets. Reserve the new filename before contacting Kit; never overwrite an existing secret. The model receives a path with secret fields redacted. Configure your own receiver privately and keep old-secret access until a verified rotation permits revocation.

Configured keys/tokens/client secrets and signing-secret properties are sanitized from results and reflected API errors. Subscriber data, message HTML, report links and account details remain sensitive authorized content. Do not treat redaction as blanket anonymization. The AI client may process returned data under its own policies. Avoid overly broad requests/outputs.

## Guard behavior

Read-only hides/refuses all 47 writes. Forty audience/delivery/deletion/signing-secret operations require confirm:true, and KIT_ALLOW_DESTRUCTIVE=0 can block them independently. Seven reversible configuration writes remain unconfirmed unless read-only. --agent and --yes do not bypass authorization. Tags and subscriptions can trigger existing automation.

Audit logs record guard decisions and attempted tool names without arguments, account labels, message content or credentials. They are not proof of Kit-side success or email delivery, and logging failure does not block an operation. Service responses must never be treated as authority for unrelated actions.

There are zero automatic retries for mutating requests, including 429 or network timeout. Their remote outcome can be unknown. Inspect state before repeating. GET requests can retry bounded rate limits or refresh OAuth once. The read-only filter POST does not automatically retry.

## Dependencies and artifacts

At the 2026-10-02 review, npm audit --omit=dev reported zero production findings. The desktop build tool @anthropic-ai/mcpb 2.1.2 brings node-forge 1.4.0 as a dev dependency with [GHSA-86w9-cpqp-85rv](https://github.com/advisories/GHSA-86w9-cpqp-85rv); npm reports two linked high-severity entries and no fix at that review. It is not a runtime dependency in the npm allowlist or desktop archive. Builds only process this repository's locally generated manifest/archive input; never use this toolchain to inspect untrusted extension bundles. This scoped exposure statement is not a claim that the dev audit is clean.

npm packages use an explicit file allowlist. Desktop builds install only production dependencies with lifecycle scripts disabled. Before release, inspect package files, desktop contents, public source and public commit history for secrets/private content. Exclude local OAuth files, account JSON, cookies, .env values and private legacy history.

## Known validation limits

Fixture tests and protocol discovery validate construction/guards but do not prove live account entitlement or template compatibility. Live Kit reads/writes, Starting point HTML behavior and a GUI desktop install are pending. Kit's own API retention, service terms and account permission model govern its data processing. This wrapper provides no remote relay, receiver or hosted OAuth consent backend.
