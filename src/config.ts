import { homedir } from "node:os";
import { join } from "node:path";
export type Account = {name:string; apiKey:string; accessToken:string; refreshToken:string; clientId:string; clientSecret:string; tokensFile:string};
export type Config = {accounts:Account[];defaultAccount:string;readOnly:boolean;allowDestructive:boolean;auditPath:string;timeoutMs:number;maxRetries:number;minIntervalMs:number;privateDir:string};
function number(v:string|undefined, fallback:number, min:number, max:number):number {
 const n=v===undefined||v===""?fallback:Number(v);
 if(!Number.isInteger(n)||n<min||n>max)throw new Error("Invalid settings: request limits and timeouts are outside their supported ranges.");
 return n;
}
export function loadConfig(env:NodeJS.ProcessEnv=process.env):Config {
 let entries:Record<string,unknown>[]=[];
 if(env.KIT_ACCOUNTS)try {const x=JSON.parse(env.KIT_ACCOUNTS);if(!Array.isArray(x))throw new Error();entries=x;}catch {throw new Error("KIT_ACCOUNTS must be a private JSON array of named accounts.");}
 else if(env.KIT_API_KEY||env.KIT_ACCESS_TOKEN||env.KIT_TOKENS_FILE)entries=[{name:"default",api_key:env.KIT_API_KEY,access_token:env.KIT_ACCESS_TOKEN,refresh_token:env.KIT_REFRESH_TOKEN,client_id:env.KIT_CLIENT_ID,client_secret:env.KIT_CLIENT_SECRET,tokens_file:env.KIT_TOKENS_FILE}];
 const accounts=entries.map(x=>{
  if(!x||typeof x!=="object"||typeof x.name!=="string"||!x.name.trim())throw new Error("Every Kit account requires a unique, nonempty name.");
  const text=(key:string):string=>typeof x[key]==="string"?(x[key] as string):"";
  return {name:x.name.trim(),apiKey:text("api_key"),accessToken:text("access_token"),refreshToken:text("refresh_token"),clientId:text("client_id"),clientSecret:text("client_secret"),tokensFile:text("tokens_file")};
 });
 if(new Set(accounts.map(a=>a.name)).size!==accounts.length)throw new Error("Kit account names must be unique.");
 return {accounts,defaultAccount:env.KIT_DEFAULT_ACCOUNT??accounts[0]?.name??"",readOnly:/^(1|true)$/i.test(env.KIT_READ_ONLY??""),allowDestructive:!/^(0|false)$/i.test(env.KIT_ALLOW_DESTRUCTIVE??""),auditPath:env.KIT_AUDIT_LOG??"",timeoutMs:number(env.KIT_REQUEST_TIMEOUT_MS,30000,100,300000),maxRetries:number(env.KIT_MAX_RETRIES,2,0,5),minIntervalMs:number(env.KIT_MIN_REQUEST_INTERVAL_MS,0,0,10000),privateDir:env.KIT_PRIVATE_DIR||join(homedir(),".config","kit-mcp-cli","secrets")};
}
export function selectAccount(config:Config,hint?:string):Account {
 const name=hint??config.defaultAccount;const account=config.accounts.find(a=>a.name===name);
 if(!account)throw new Error(config.accounts.length?"Unknown account. Run list_accounts and use its exact name.":"No credentials configured. Set KIT_API_KEY or KIT_TOKENS_FILE. Run kit-cli login.");
 return account;
}
