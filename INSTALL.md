# Install Kit MCP Server & CLI

One npm package includes both binaries and all **85 tools**. Requires Node.js 22 or newer for CLI/manual MCP installs. Discovery works before account authentication. Account operations need eligible Kit API access; some endpoints additionally require OAuth.

| Route | Program | Use |
| --- | --- | --- |
| Terminal | kit-cli | Scripts and agents with a shell |
| Local MCP | kit-mcp | AI clients supporting stdio |
| Desktop archive | kit-2.0.2.mcpb | Compatible Claude Desktop custom extensions |
| Kit-hosted alternative | https://app.kit.com/mcp | Official remote OAuth, paid Creator/Creator Pro |

## Contents

[Requirements](#requirements) · [CLI](#cli) · [Private account setup](#private-account-setup) · [Claude Code](#claude-code) · [Codex](#codex) · [Claude Desktop](#claude-desktop) · [Cursor](#cursor) · [VS Code and Copilot](#vs-code-and-copilot) · [Windsurf](#windsurf) · [Zed](#zed) · [Gemini CLI](#gemini-cli) · [Docker](#docker) · [Verify](#verify) · [Multiple accounts](#multiple-accounts) · [Updates and removal](#updates-and-removal) · [Troubleshooting](#troubleshooting) · [Development](#development)

## Requirements

Install Node from [nodejs.org](https://nodejs.org/en/download). Open a new terminal and check `node --version` and `npm --version`. The desktop host needs a compatible Node runtime; dependencies are bundled. A GUI app may not inherit your terminal's environment. Check your account's current API access with Kit instead of assuming npm installation provides it.

## CLI

On macOS/Linux, use Terminal. On Windows, use PowerShell or Command Prompt:

```bash
npm install -g @thenavidm/kit-mcp-cli@latest
kit-cli --version
kit-cli
kit-cli list-broadcasts --help
kit-cli schema create-broadcast
kit-cli login
```

If PowerShell blocks npm.ps1, use npm.cmd or Command Prompt according to your policy. If a binary is missing, check `npm prefix -g`, ensure its executable directory is on PATH and open a new terminal. Avoid sudo as a workaround for PATH problems.

For one command without a global install:

```bash
npx -y --package @thenavidm/kit-mcp-cli@latest kit-cli tools
```

Make [SKILL.md](./SKILL.md) available in your agent's supported skill location. The installed file is `<npm root -g>/@thenavidm/kit-mcp-cli/SKILL.md`. npm does not automatically register client skills. Your agent should read the actual schema and use --agent/--select for compact output.

## Private account setup

### API key for your own account

1. Open [Kit Developer settings](https://app.kit.com/account_settings/developer_settings).
2. Choose **Add a new key** and give it an internal name.
3. Save the newly shown **v4** key privately; it cannot be viewed again afterwards.
4. Configure `KIT_API_KEY` in your private shell/secret manager or the client's user settings.
5. Run local doctor, then doctor --network. It reads account identity without sending email or editing subscribers.

Never put real values into an AI chat, shared command transcript, repo, issue or project .mcp.json. GUI clients need their own private local environment/config. Old v3 API secrets are not accepted. The package does not load .env automatically. `login` explains setup and does not save credentials.

For API-key-only setups, omit OAuth variables. For OAuth-only setups, omit the API key and provide an absolute `KIT_TOKENS_FILE`. Empty placeholders in examples should be removed when not needed.

### OAuth for bulk and purchase endpoints

Follow the [current authentication guide](https://developers.kit.com/api-reference/authentication) and [OAuth flow](https://developers.kit.com/api-reference/oauth-refresh-token-flow). Create your own Kit app, enable API access and configure its authorization URL and exact registered redirect URI. Use the official [Node example](https://github.com/Kit/app-examples/tree/e627873f4a37dffcb3796b3a5ff25d4f108944c4/oauth-express) if you need a confidential callback implementation. It must validate state and keep app secrets off the browser. This package does not supply a hosted consent backend.

Authorization uses https://api.kit.com/v4/oauth/authorize and exchange/refresh uses https://api.kit.com/v4/oauth/token. After your own approved app obtains tokens, store them in a private regular JSON file outside the checkout:

```json
{"access_token":"YOUR_ACCESS_TOKEN","refresh_token":"YOUR_REFRESH_TOKEN","client_id":"YOUR_APP_ID","client_secret":"YOUR_APP_SECRET","created_at":1790899200,"expires_in":7200}
```

Use issued timestamps/expiry, not these sample numbers. Set KIT_TOKENS_FILE to its absolute path. Limit the file to your OS user (0600 on POSIX, user-only folder/file ACLs on Windows). The reader refuses symlinks and files above 64 KB. Refresh writes atomically at mode 0600. Read [authentication and accounts](./README.md#3-set-up-kit-access) for environment-token alternatives, refresh failures and precedence. No fine-grained OAuth scope claims are inferred from schema labels.

### Agent-guided installation

> Help me install Kit MCP Server & CLI with INSTALL.md. Check Node and the binary, let me configure my account credentials privately, then run discovery and doctor --network. Do not send email or change subscribers during setup.

## Claude Code

For a user-scoped connection, after privately configuring credentials:

~~~bash
claude mcp add --scope user kit -- npx -y @thenavidm/kit-mcp-cli@latest
claude mcp list
~~~

Use the client's private local environment settings for the account variable if they are not inherited. Claude's `-e NAME=value` registration option writes values into its config; only use it locally through your secret manager, with no shared command transcript. Never place credentials in a project .mcp.json. Reconnect and ask Claude to verify credentials.

Alternatively install the CLI, make SKILL.md available to Claude, and use shell commands. Registering both surfaces is optional.

## Codex

~~~bash
codex mcp add kit -- npx -y @thenavidm/kit-mcp-cli@latest
codex mcp list
~~~

Account credentials must reach the server through private environment settings. `codex mcp add --env NAME=value` stores values in your local config, so never commit that config or put secrets in a shared command. In TOML, the equivalent server is:

~~~toml
[mcp_servers.kit]
command = "npx"
args = ["-y", "@thenavidm/kit-mcp-cli@latest"]
env_vars = ["KIT_API_KEY", "KIT_TOKENS_FILE"]
~~~

`env_vars` forwards those names from the environment available to Codex. If that environment does not contain them, configure private env settings locally. Codex can also call the CLI directly with SKILL.md and `--agent` output.

## Claude Desktop

### Install the .mcpb extension

1. Download `kit-2.0.2.mcpb` from [GitHub Releases](https://github.com/thenavidm/kit-mcp-cli/releases/latest).
2. In a supported Claude Desktop build, open **Settings > Extensions > Advanced settings > Install Extension…** and select it.
3. Enter a v4 API key in the sensitive setting, or an absolute private OAuth token-file path. Leave the unused method empty.
4. Enable read-only if you want only the 38 reads. Reconnect and ask for account verification.

The bundle includes production dependencies and no credentials. OAuth-only bulk and purchase endpoints need the token-file route. The manifest requires Node 22 or newer from a compatible host. Organization policy may restrict custom extensions. Manual bundle updates require installing the new version; no automatic directory updates are promised. GUI installation remains unverified separately from archive/protocol checks.

### Manual config

Open **Settings > Developer > Edit Config**, or use your platform's config file:

| OS | Typical config path |
| --- | --- |
| macOS | `~/Library/Application Support/Claude/claude_desktop_config.json` |
| Windows | `%APPDATA%\Claude\claude_desktop_config.json` |
| Linux | `~/.config/Claude/claude_desktop_config.json`; confirm the location through Edit Config in your installed build |

~~~json
{
  "mcpServers": {
    "kit": {
      "command": "npx",
      "args": ["-y", "@thenavidm/kit-mcp-cli@latest"],
      "env": {
        "KIT_API_KEY": "YOUR_V4_API_KEY",
        "KIT_TOKENS_FILE": ""
      }
    }
  }
}
~~~

Replace the placeholders only in your private file. Merge the server entry into an existing mcpServers object instead of replacing other integrations. Fully quit and reopen Claude Desktop. Do not enable an extension and a manual entry with the same name; choose one route.

If a Windows launcher cannot execute npx directly, use `"command": "cmd"` with `"args": ["/c", "npx", "-y", "@thenavidm/kit-mcp-cli@latest"]`. An absolute node executable and installed `dist/index.js` path also avoids launcher/PATH problems.

## Cursor

Use private user settings at `~/.cursor/mcp.json`, or **Settings > Tools & MCP**. [Cursor documents environment interpolation and envFile support](https://cursor.com/docs/mcp).

~~~json
{
  "mcpServers": {
    "kit": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@thenavidm/kit-mcp-cli@latest"],
      "env": {
        "KIT_API_KEY": "${env:KIT_API_KEY}",
        "KIT_TOKENS_FILE": "${env:KIT_TOKENS_FILE}"
      }
    }
  }
}
~~~

The environment values must exist for the Cursor process. If you use envFile, keep that file private and outside version control. A project's .cursor/mcp.json must not contain actual credentials. Reconnect the server after saving.

## VS Code and Copilot

Use **MCP: Open User Configuration**. [VS Code uses servers and secure inputs](https://code.visualstudio.com/docs/agent-customization/mcp-servers), rather than a mcpServers root:

~~~json
{
  "inputs": [
    {"type": "promptString", "id": "kit-api-key", "description": "Kit v4 API key (leave empty for OAuth)", "password": true},
    {"type": "promptString", "id": "kit-token-file", "description": "Optional private OAuth token-file path (leave empty for API key)"}
  ],
  "servers": {
    "kit": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@thenavidm/kit-mcp-cli@latest"],
      "env": {
        "KIT_API_KEY": "${input:kit-api-key}",
        "KIT_TOKENS_FILE": "${input:kit-token-file}"
      }
    }
  }
}
~~~

Start Kit through the MCP controls, approve trust if prompted, and enter credentials in the private input prompts. Workspace .vscode/mcp.json may contain this placeholder-only structure, but never resolved secret values. Remote development runs the server in the selected remote environment, so local file paths refer to that environment.

## Windsurf

Open Cascade's MCP settings or edit the private user file `~/.codeium/windsurf/mcp_config.json`. Use the Claude Desktop manual mcpServers block above with your locally configured env values. See [Windsurf's current MCP documentation](https://docs.devin.ai/desktop/cascade/mcp). Restart or reconnect Kit in Cascade; project files must not contain secrets.

## Zed

Open **Settings > AI > MCP Servers > Add Server > Add Local Server**, or your user settings file. [Zed uses context_servers](https://zed.dev/docs/ai/mcp):

~~~json
{
  "context_servers": {
    "kit": {
      "command": "npx",
      "args": ["-y", "@thenavidm/kit-mcp-cli@latest"],
      "env": {
        "KIT_API_KEY": "YOUR_V4_API_KEY",
        "KIT_TOKENS_FILE": ""
      }
    }
  }
}
~~~

Enter actual values only in private user settings. Check the active-server indicator before prompting. Do not wrap command and args inside a nested command object from older Zed examples.

## Gemini CLI

Merge the Claude Desktop manual mcpServers block into your private `~/.gemini/settings.json`. Configure the two env values locally, then restart Gemini CLI and inspect `/mcp`. See [Gemini CLI's MCP configuration](https://geminicli.com/docs/tools/mcp-server/). Its project settings must not contain real credentials. You can instead use the CLI from an agent shell.

Other local stdio clients use the same command and arguments, adapted to their config format. A client that only accepts a remote MCP URL cannot connect directly: this package does not ship a public HTTP listener. ChatGPT's remote connector setup is not a substitute for local stdio installation.

## Docker

Build locally from the reviewed source; no prebuilt registry image is claimed:

```bash
git clone https://github.com/thenavidm/kit-mcp-cli.git
cd kit-mcp-cli
docker build -t kit-mcp-cli .
docker run --rm -i -e KIT_API_KEY kit-mcp-cli
```

`-e KIT_API_KEY` forwards the shell's already configured private value. MCP needs `-i` and stdio. For OAuth, mount the private token file into the container with only the access needed for refresh, then set the in-container absolute KIT_TOKENS_FILE path. Host paths do not automatically exist inside a container. Restrict mounts and persist refreshed tokens if you need restart continuity.

## Cline and other local MCP clients

Use the client's **Add MCP server** flow with command `npx`, arguments `-y` and `@thenavidm/kit-mcp-cli@latest`, stdio transport, and private local KIT_API_KEY or KIT_TOKENS_FILE settings. UI names depend on the installed client. Reconnect and discover tools before an account call. Browser-only clients need a remote HTTPS connector; use Kit's official server rather than this local stdio command.

## Verify

```bash
kit-cli doctor
kit-cli doctor --network
kit-cli tools
kit-cli schema list-subscribers
kit-cli list-accounts --agent
```

The full server discovers 85 tools; read-only discovers 38. Help/schemas/list_accounts are local. The network doctor reads the default account without returning its private details. A successful account read does not prove every endpoint's OAuth/plan eligibility or successful delivery.

To try read-only, privately set KIT_READ_ONLY=1, restart/reconnect and inspect discovery. All 47 writes must disappear and direct write calls must refuse. Remove/disable the setting and reconnect only when you need writes. `KIT_ALLOW_DESTRUCTIVE=0` separately blocks the 40 confirmed operations while retaining ordinary configuration writes.

## Multiple accounts

Set private KIT_ACCOUNTS JSON, which replaces the single-account variables:

```json
[{"name":"work","api_key":"YOUR_WORK_V4_KEY"},{"name":"personal","tokens_file":"/absolute/private/path/personal-kit.json"}]
```

Set KIT_DEFAULT_ACCOUNT=work. `kit-cli list-accounts --agent` lists labels and auth methods; `--account personal` selects another account. Keep the JSON out of public project configs. Separate server instances can provide stronger process-level isolation if needed.

## Updates and removal

```bash
npm install -g @thenavidm/kit-mcp-cli@latest
kit-cli --version
claude mcp remove --scope user kit
codex mcp remove kit
npm uninstall -g @thenavidm/kit-mcp-cli
```

Reinstall a newer desktop archive separately and restart affected clients. Remove manual client entries using its own settings. Uninstalling the package does not revoke Kit credentials, remove private token/secret files or unschedule email. Revoke/delete keys or authorized apps in Kit when appropriate. Inspect and remove private files yourself after preserving any receiver secrets still in use.

Pin a reviewed version instead of @latest if your automation requires reproducibility. Check [CHANGELOG.md](./CHANGELOG.md) and [GitHub Releases](https://github.com/thenavidm/kit-mcp-cli/releases) before a major update. Do not roll back by blindly publishing an older version over an existing npm version.

## Troubleshooting

| Problem | Check |
| --- | --- |
| Missing command | Node 22+, global prefix and PATH |
| No configured account | Private KIT_API_KEY or regular KIT_TOKENS_FILE |
| GUI authentication fails | Actual private GUI environment; shell env is separate |
| OAuth required | Tool table marks OAuth-only endpoints |
| 401/403 | Key version, OAuth expiry/revocation, current account permissions |
| Invalid/null body | schema; use payload/payload_file for null and nested data |
| First page only | after/end_cursor or bounded all_pages |
| Guard refusal | User-requested --confirm, read-only and destructive settings |
| Write timeout | Inspect account before repeating; no automatic write retries |
| Desktop host rejects extension | Compatible host/runtime and organization custom-extension policy |

See the README for the complete argument table, safety, 20 FAQs and API snapshot corrections. Secrets must never appear in a troubleshooting transcript.

## Development

```bash
git clone https://github.com/thenavidm/kit-mcp-cli.git
cd kit-mcp-cli
npm ci
npm run typecheck
npm run build
npm test
npm run check:counts
npm run build:mcpb
```

Source mode: configure private env, then register `node /absolute/path/kit-mcp-cli/dist/index.js` as the MCP command. Build before registration and after source changes. No local credentials are packaged. [CONTRIBUTING.md](./CONTRIBUTING.md), [SECURITY.md](./SECURITY.md) and [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md) cover contributions, disclosures and licensing.
