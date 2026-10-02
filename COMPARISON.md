# Kit comparisons

Reviewed 2026-10-02 against the primary sources below. No universal superiority, latency or total token-cost claims.

## Official surfaces

| Surface | Documented behavior | Our role |
| --- | --- | --- |
| Official Kit account MCP | Hosted https://app.kit.com/mcp, OAuth creator consent; one-to-one v4 API reads/writes; paid Creator/Creator Pro; 120 requests/min/token | Local task CLI, local account settings, bounded cursors and downloadable desktop archive |
| Developer Docs MCP | Read Kit documentation; no account actions | Complementary documentation access |
| API v4 | Personal API keys 120/min, OAuth 600/min; some bulk/purchase endpoints OAuth-only | Schema-derived wrappers around the same official API |

The official account MCP already drafts/sends broadcasts and changes subscribers. We do not describe it as read-only or claim ours exposes more API functionality. No official standalone task CLI was identified in the reviewed developer index; this is a dated scoped finding, not proof that none exists elsewhere.

## Other repositories and tools

[ArtisanPack UI ConvertKit](https://github.com/ArtisanPack-UI/convertkit) provides a PHP/Laravel Kit integration and framework Artisan commands. [CData's ConvertKit CLI guide](https://www.cdata.com/kb/tech/convertkit-jdbc-cli-github-copilot.rst) documents a JDBC data-access CLI. They demonstrate that other CLI routes exist, with different environments, licensing and task scope. Their native tool counts, live tasks, current release compatibility and model-token usage were not benchmarked here.

The private legacy source has 31 tools and browser helpers, with account-specific instructions. The new sanitized public source has 83 current snapshot operations plus two helpers (85), 38 reads/47 writes/40 confirmed actions, a task CLI and desktop build. These counts were discovered locally. They are not a count of the official hosted MCP, nor proof that one tool equals one useful workflow. Browser designed-duplication/visual-automation helpers are not carried over; use Kit UI. Public history excludes personal source history and cookies.

## Evidence and schema conflicts

- [Official account MCP](https://developers.kit.com/mcp/kit-mcp): availability, coverage, OAuth and limits.
- [Official setup](https://help.kit.com/en/articles/14827557-how-to-connect-the-ai-connectors-to-your-ai-tools): hosted client connection guide.
- [API reference](https://developers.kit.com/api-reference/overview) and [OpenAPI snapshot](https://developers.kit.com/api-reference/v4.json): pinned 83 operations, hash in src/tools/api-source.json.
- [Authentication](https://developers.kit.com/api-reference/authentication) and [OAuth flow](https://developers.kit.com/api-reference/oauth-refresh-token-flow): private keys, app setup, refresh and current endpoints.
- [Official Node OAuth example](https://github.com/Kit/app-examples/tree/e627873f4a37dffcb3796b3a5ff25d4f108944c4/oauth-express): registered confidential-app flow.
- [Pagination](https://developers.kit.com/api-reference/pagination): cursor traversal and page size.
- [Create broadcast](https://developers.kit.com/api-reference/broadcasts/create-a-broadcast): draft and HTML/template semantics.

The current snapshot's create/update broadcast required lists contradict draft/template and partial-update prose. Starting point template text also conflicts internally. Reviewed overrides accept a subject plus content/template, a nonempty partial update, nullable reset fields, and the documented allow_starting_point input. They are recorded, not guessed as verified live behavior. Use an unscheduled draft to validate a real template before sending.

## MCP versus CLI measurement protocol

No fresh model-token/task measurements are available. Compare baseline, eager MCP, normal deferred MCP, CLI with registered skill, and official MCP on the same client/model/account/date. Record success, standing context, input/output/cache/reasoning/help/result tokens, latency and request count separately. Fix result selection and task scope. Reading five recent broadcasts with statistics is a useful first read task; draft writes require an approved test account and equal resulting state. No setup task should send newsletters.

Schema text size or number of tools alone is not a model-token benchmark. Historical numbers from another package/client are not this release's measured savings.
