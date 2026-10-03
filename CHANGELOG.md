# Changelog

## Unreleased

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
