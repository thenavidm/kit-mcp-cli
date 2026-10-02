#!/usr/bin/env node
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { buildServer,VERSION } from "./server.js";
import { runCli, exitCodeFor } from "./cli.js";
import { runDoctor } from "./doctor.js";
import { basename } from "node:path";
const HELP=`Kit MCP server and CLI ${VERSION}

kit-mcp                         Start the local stdio MCP server
kit-cli                         List all available commands
kit-cli <command> --help        Schema-derived arguments and flags
kit-cli schema <command>        Exact MCP input schema
kit-cli doctor [--network]      Check settings; optionally read the account
kit-cli login                   Private account setup instructions
kit-cli --version               Package version

KIT_API_KEY                     A v4 API key for personal automation
KIT_ACCESS_TOKEN                OAuth access token
KIT_TOKENS_FILE                 Private OAuth JSON with refresh credentials
KIT_CLIENT_ID / _CLIENT_SECRET / _REFRESH_TOKEN   Optional OAuth refresh settings
KIT_ACCOUNTS / _DEFAULT_ACCOUNT  Named account configuration
KIT_READ_ONLY=1                 Hide/refuse all writes
KIT_ALLOW_DESTRUCTIVE=0         Block audience/delivery/deletion/secret changes
KIT_AUDIT_LOG                   Private write-guard log, no request data
KIT_REQUEST_TIMEOUT_MS=30000; KIT_MAX_RETRIES=2 (GET 429 only)
KIT_MIN_REQUEST_INTERVAL_MS     Default pacing: 550 ms API key, 110 ms OAuth
KIT_PRIVATE_DIR                 Private signing-secret folder; default ~/.config/kit-mcp-cli/secrets

https://github.com/thenavidm/kit-mcp-cli
`;
async function main():Promise<void> {
 const args=process.argv.slice(2);const command=args[0];
 if(command==="--version"||command==="-v"){console.log(VERSION);return;}
 if(command==="--help"||command==="-h"||command==="help"){process.stdout.write(HELP);return;}
 if(command==="doctor"){if(args.slice(1).some(a=>a!=="--network")){process.exitCode=2;console.error(JSON.stringify({error:"doctor accepts only --network"}));return;}process.exitCode=await runDoctor(args.includes("--network"));return;}
 if(command==="login"){console.log("For personal automation, open https://app.kit.com/account_settings/developer_settings and create a v4 API key with Add a new key. Store it only in private shell/client settings as KIT_API_KEY. OAuth-only operations need your own authorized Kit OAuth app and a private KIT_TOKENS_FILE. Follow INSTALL.md and https://developers.kit.com/api-reference/authentication. login does not open a browser, exchange authorization codes or store credentials. Then run kit-cli doctor --network.");return;}
 if(args.length||basename(process.argv[1]??"").startsWith("kit-cli")){process.exitCode=await runCli(args);return;}
 const server=buildServer();await server.connect(new StdioServerTransport());
 const close=async()=>{await server.close();process.exit(0);};process.on("SIGTERM",()=>void close());process.on("SIGINT",()=>void close());
}
main().catch(e=>{console.error(JSON.stringify({error:e.message}));process.exitCode=exitCodeFor(e.message);});
