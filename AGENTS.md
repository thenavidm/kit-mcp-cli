# Kit MCP server and CLI

Read INSTALL.md, SKILL.md and COMPARISON.md. Follow the current Bluesky/Substack
framework and the shared MCP/CLI skill. Preserve AGPL-3.0-or-later licensing.

The public v2 branch is sanitized. Legacy personal account instructions and
private source history stay on the local legacy/private-source branch and in
the old account. Never push that history to the new public remote.

Both binaries use one operation registry and server through the house CLI
adapter. Generate schemas from the official OpenAPI snapshot; review recorded
overrides and current docs before syncing. Do not guess OAuth scopes, template
behavior, pagination or API-key eligibility. Never retry a mutating API request
automatically. Confirm audience changes, publishing, sending and deletions.

Never expose credentials in tool arguments, errors, stdout, audit records,
source, package or bundle. Webhook signing secrets go to owner-only private
files, not the model. Keep every advertised client, feature and count factual.

Before release: build, typecheck, behavior tests, actual discovery/counts,
clean package and desktop checks, source/history/artifact secret scans and
complete README/INSTALL/SKILL/CHANGELOG/topics/keywords/release/CMS review.
Use the configured maintainer commit identity.
