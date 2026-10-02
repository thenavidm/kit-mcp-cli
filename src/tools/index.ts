import operationsData from "./operations.json" with {type:"json"};
import { Ajv, type ValidateFunction } from "ajv";
import addFormats from "ajv-formats";
import { readFile, lstat } from "node:fs/promises";
import type { Json, KitClient } from "../api/client.js";
import { UsageError } from "../api/errors.js";
import type { Config } from "../config.js";
import type { Risk } from "../safety.js";
export type Operation={name:string;title:string;description:string;method:string;path:string;group:string;risk:Risk;oauthOnly:boolean;params:{name:string;key:string;in:string;required?:boolean;schema:Json}[];bodySchema:Json};
export type ToolSpec={name:string;title:string;description:string;group:string;inputSchema:Json;risk:Risk;handler:(args:Json,client:KitClient)=>Promise<unknown>};
const operations=operationsData as unknown as Operation[];
const ajv=new Ajv({allErrors:true,strict:false});(addFormats as unknown as(a:Ajv)=>void)(ajv);
function check(validate:ValidateFunction,args:unknown):void {if(!validate(args))throw new UsageError(ajv.errorsText(validate.errors,{separator:"; "}));}
function fieldsFor(op:Operation):Json {
 const properties:Json=Object.fromEntries(op.params.map(p=>[p.key,p.schema]));
 Object.assign(properties,op.bodySchema.properties??{});
 properties.account={type:"string",description:"Named private account from KIT_ACCOUNTS. Defaults to KIT_DEFAULT_ACCOUNT or the first configured account."};
 if(op.risk!=="read")properties.confirm={type:"boolean",description:"Must be true for audience/delivery changes, publishing, destructive operations and signing-secret changes. Use only for an action requested by the user."};
 const required=op.params.filter(p=>p.required).map(p=>p.key);
 if(Object.keys(op.bodySchema.properties??{}).length) {
  properties.payload={...op.bodySchema,description:"Complete JSON body instead of individual body flags. Supports nullable fields and nested bulk structures. Cannot be combined with body flags or payload_file."};
  properties.payload_file={type:"string",minLength:1,description:"Local JSON request body file, at most 5 MB. Contents are validated before the API call and are never logged."};
 }
 if(op.params.some(p=>p.name==="after")) {
  properties.all_pages={type:"boolean",description:"Read successive cursor pages, bounded by max_items (default 1000). Default false returns one API page."};
  properties.max_items={type:"integer",minimum:1,maximum:10000,description:"Maximum records when all_pages=true. A capped result reports truncation and its continuation cursor."};
 }
 if(["create_webhook_endpoint","rotate_webhook_secret"].includes(op.name)) {
  properties.secret_name={type:"string",pattern:"^[a-zA-Z0-9][a-zA-Z0-9_.-]{0,79}$",description:"New private filename under KIT_PRIVATE_DIR. Required before creating/rotating a signing secret; never overwritten."};required.push("secret_name");
 }
 return {type:"object",properties,required,additionalProperties:false};
}
async function execute(op:Operation,args:Json,client:KitClient):Promise<unknown> {
 const flat=Object.fromEntries(Object.keys(op.bodySchema.properties??{}).filter(k=>args[k]!==undefined).map(k=>[k,args[k]]));
 if((args.payload!==undefined||args.payload_file!==undefined)&&Object.keys(flat).length)throw new UsageError("Use individual body flags or payload/payload_file, without mixing them.");
 if(args.payload!==undefined&&args.payload_file!==undefined)throw new UsageError("Use payload or payload_file, not both.");
 let body:Json=args.payload??flat;
 if(args.payload_file)try {
  const stat=await lstat(args.payload_file);if(!stat.isFile()||stat.size>5*1024*1024)throw new Error();
  body=JSON.parse(await readFile(args.payload_file,"utf8"));
 }catch {throw new UsageError("payload_file must be a regular JSON file, at most 5 MB.");}
 if(op.name==="create_broadcast")body={public:false,send_at:null,...body};
 check(ajv.compile(op.bodySchema),body);
 if(["update_broadcast","update_sequence","update_sequence_email","update_snippet","update_webhook_endpoint"].includes(op.name)&&!Object.keys(body).length)throw new UsageError("Provide at least one field to update.");
 if(args.after&&args.before)throw new UsageError("Use after or before, not both.");
 if(args.all_pages&&args.before)throw new UsageError("all_pages traverses forward; use after rather than before.");
 if(args.max_items!==undefined&&!args.all_pages)throw new UsageError("max_items requires all_pages=true.");
 for(const key of["url","target_url","callback_url"])if(body[key]) {
  let url:URL;try {url=new URL(body[key]);}catch {throw new UsageError(`${key} must be an absolute HTTPS URL.`);}
  if(url.protocol!=="https:"||url.username||url.password)throw new UsageError(`${key} must use HTTPS without embedded credentials.`);
 }
 const path=op.params.filter(p=>p.in==="path").reduce((path,p)=>path.replace(`{${p.name}}`,encodeURIComponent(String(args[p.key]))),op.path);
 const query:Json=Object.fromEntries(op.params.filter(p=>p.in==="query"&&args[p.key]!==undefined).map(p=>[p.name,args[p.key]]));
 if(args.all_pages)query.per_page=Math.min(query.per_page??500,args.max_items??1000);
 let secret:Awaited<ReturnType<KitClient["reserveSecret"]>>|undefined;
 if(args.secret_name)secret=await client.reserveSecret(args.secret_name);
 try {
  const result=await client.request(op.method,path,query,op.method==="GET"||!Object.keys(body).length?undefined:body,args.account,op.oauthOnly);
  if(secret) {
   const newSecret=result.secret??result.webhook_endpoint?.secret;
   if(typeof newSecret!=="string"||!newSecret)throw new UsageError("Kit did not return a signing secret. Inspect the endpoint before repeating the remote operation.");
   await secret.save(newSecret);
   return {...client.sanitize(result) as Json,secret_file:secret.path};
  }
  if(!args.all_pages)return client.sanitize(result);
  const collection=Object.keys(result).find(k=>Array.isArray(result[k]));
  if(!collection)throw new UsageError("This response has no paginated collection.");
  const max=args.max_items??1000;const items=result[collection].slice(0,max);let page=result;const seen=new Set<string>();let pages=1;
  while(items.length<max&&page.pagination?.has_next_page) {
   const cursor=page.pagination.end_cursor;
   if(typeof cursor!=="string"||!cursor||seen.has(cursor)||pages>=100)throw new UsageError("Pagination cursor repeated or exceeded 100 pages; narrow the request.");
   seen.add(cursor);page=await client.request(op.method,path,{...query,after:cursor,per_page:Math.min(query.per_page??500,max-items.length)},undefined,args.account,op.oauthOnly);pages++;
   if(!Array.isArray(page[collection]))throw new UsageError("Pagination response collection changed unexpectedly.");
   items.push(...page[collection].slice(0,max-items.length));
  }
  return client.sanitize({...result,[collection]:items,pagination:page.pagination,collected:items.length,pages,truncated:Boolean(page.pagination?.has_next_page)});
 }finally {await secret?.discard();}
}
export const ALL_TOOLS:ToolSpec[]=operations.map(op=>({name:op.name,title:op.title,description:op.description,group:op.group,inputSchema:fieldsFor(op),risk:op.risk,handler:(args,client)=>execute(op,args,client)}));
const search=ALL_TOOLS.find(t=>t.name==="list_subscribers")!;
ALL_TOOLS.push({...search,name:"search_subscribers",title:"Find subscribers by exact email",description:"Compatibility alias for list_subscribers with a required exact email_address filter.",inputSchema:{...search.inputSchema,required:["email_address"]}},
 {name:"list_accounts",title:"List configured accounts",description:"List private account labels and configured auth methods, without returning credentials or token-file paths. Does not contact Kit.",group:"account",risk:"read",inputSchema:{type:"object",properties:{},additionalProperties:false},handler:async(_args,client)=>({accounts:client.config.accounts.map(a=>({name:a.name,default:a.name===client.config.defaultAccount,auth:a.tokensFile||a.accessToken?"oauth":a.apiKey?"api_key":"not_configured"}))})});
const validators=new Map(ALL_TOOLS.map(t=>[t.name,ajv.compile(t.inputSchema)]));
export function validateArguments(tool:ToolSpec,args:Json):void {check(validators.get(tool.name)!,args);}
export function visibleTools(config:Config):ToolSpec[] {return ALL_TOOLS.filter(t=>!config.readOnly||t.risk==="read");}
