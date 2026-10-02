
import {describe,it,expect,vi} from "vitest";
import {loadConfig} from "../src/config.js";
import {KitClient} from "../src/api/client.js";
import {ALL_TOOLS,validateArguments} from "../src/tools/index.js";
import {buildServer} from "../src/server.js";
import {Client} from "@modelcontextprotocol/sdk/client/index.js";
import {InMemoryTransport} from "@modelcontextprotocol/sdk/inMemory.js";
import {mkdtemp,writeFile,readFile,stat,symlink} from "node:fs/promises";
import {tmpdir} from "node:os";
import {join} from "node:path";
const cfg=()=>loadConfig({KIT_API_KEY:"test-private-key",KIT_MIN_REQUEST_INTERVAL_MS:"1",KIT_MAX_RETRIES:"1"});
const json=(data:unknown,status=200,headers:Record<string,string>={})=>new Response(JSON.stringify(data),{status,headers});
const tool=(name:string)=>ALL_TOOLS.find(t=>t.name===name)!;
async function connection(c=cfg(),f=vi.fn().mockResolvedValue(json({})),surface:"mcp"|"cli"="mcp") {
 const server=buildServer(c,new KitClient(c,f,async()=>{}),surface);
 const transports=InMemoryTransport.createLinkedPair();
 await server.connect(transports[1]);const client=new Client({name:"tests",version:"1"});await client.connect(transports[0]);
 return {client,close:async()=>{await client.close();await server.close();}};
}
describe("Kit v4 request contracts",()=>{
 it("uses cursor pagination and includes total counts without exposing the API key",async()=>{
  const f=vi.fn().mockResolvedValue(json({subscribers:[],pagination:{}}));const api=new KitClient(cfg(),f,async()=>{});
  await tool("list_subscribers").handler({after:"cursor",include_total_count:true,include:["fields","stats"],per_page:20},api);
  const[url,init]=f.mock.calls[0];expect(String(url)).toContain("after=cursor");expect(String(url)).toContain("include_total_count=true");expect(String(url)).toContain("include%5B%5D=fields");expect(String(url)).not.toContain("test-private-key");expect(init.headers["X-Kit-Api-Key"]).toBe("test-private-key");expect(init.redirect).toBe("error");
 });
 it("refuses obsolete page parameters and unknown fields",()=>{expect(()=>validateArguments(tool("list_subscribers"),{page:2})).toThrow(/additional properties/);expect(()=>validateArguments(tool("get_subscriber"),{subscriber_id:"1/../../account"})).toThrow();});
 it("keeps broadcast creation private and unscheduled unless explicitly requested",async()=>{
  const f=vi.fn().mockResolvedValue(json({broadcast:{id:1}}));await tool("create_broadcast").handler({subject:"Example",content:"<p>Hello</p>"},new KitClient(cfg(),f,async()=>{}));
  expect(JSON.parse(f.mock.calls[0][1].body)).toEqual({subject:"Example",content:"<p>Hello</p>",public:false,send_at:null});
 });
 it("accepts explicit nullable updates through the validated payload",async()=>{
  const f=vi.fn().mockResolvedValue(json({broadcast:{id:12}}));await tool("update_broadcast").handler({broadcast_id:12,payload:{send_at:null,public:false}},new KitClient(cfg(),f,async()=>{}));
  expect(String(f.mock.calls[0][0])).toBe("https://api.kit.com/v4/broadcasts/12");expect(JSON.parse(f.mock.calls[0][1].body)).toEqual({send_at:null,public:false});
 });
 it("validates required nested bulk data before making a request",async()=>{const f=vi.fn();const api=new KitClient(cfg(),f);await expect(tool("bulk_create_subscribers").handler({payload:{subscribers:[{first_name:"Missing email"}]}},api)).rejects.toThrow();expect(f).not.toHaveBeenCalled();});
 it("does not silently merge conflicting body sources",async()=>{const f=vi.fn();await expect(tool("create_tag").handler({name:"One",payload:{name:"Two"}},new KitClient(cfg(),f))).rejects.toThrow(/without mixing/);expect(f).not.toHaveBeenCalled();});
 it("reads validated local JSON bodies without logging their contents",async()=>{
  const dir=await mkdtemp(join(tmpdir(),"kit-payload-"));const file=join(dir,"body.json");await writeFile(file,JSON.stringify({name:"Example tag"}));const f=vi.fn().mockResolvedValue(json({tag:{id:2}}));await tool("create_tag").handler({payload_file:file},new KitClient(cfg(),f,async()=>{}));expect(JSON.parse(f.mock.calls[0][1].body)).toEqual({name:"Example tag"});
 });
 it("rejects symbolic-link payload files before reading them",async()=>{if(process.platform==="win32")return;const dir=await mkdtemp(join(tmpdir(),"kit-symlink-"));await writeFile(join(dir,"source.json"),"{}");await symlink(join(dir,"source.json"),join(dir,"alias.json"));const f=vi.fn();await expect(tool("create_tag").handler({payload_file:join(dir,"alias.json")},new KitClient(cfg(),f))).rejects.toThrow(/regular JSON/);expect(f).not.toHaveBeenCalled();});
 it("maps tag removal by email to its actual query parameter",async()=>{const f=vi.fn().mockResolvedValue(new Response(null,{status:204}));await tool("untag_subscriber_by_email").handler({tag_id:2,email_address:"reader@example.com"},new KitClient(cfg(),f,async()=>{}));expect(String(f.mock.calls[0][0])).toBe("https://api.kit.com/v4/tags/2/subscribers?email_address=reader%40example.com");expect(f.mock.calls[0][1].method).toBe("DELETE");});
 it("treats subscriber filtering POST as a read rather than an audience change",async()=>{const f=vi.fn().mockResolvedValue(json({subscribers:[]}));const c=await connection({...cfg(),readOnly:true},f);try{const r=await c.client.callTool({name:"filter_subscribers",arguments:{all:[{type:"subscriber_state",states:["active"]}]}});expect(r.isError).not.toBe(true);expect(f.mock.calls[0][1].method).toBe("POST");}finally{await c.close();}});
});
describe("pagination preserves continuation",()=>{
 it("shrinks the first and following page sizes to the remaining cap",async()=>{
  const f=vi.fn().mockResolvedValueOnce(json({tags:[{id:1},{id:2}],pagination:{has_next_page:true,end_cursor:"two"}})).mockResolvedValueOnce(json({tags:[{id:3}],pagination:{has_next_page:true,end_cursor:"three"}}));
  const r=await tool("list_tags").handler({all_pages:true,max_items:3,per_page:2},new KitClient(cfg(),f,async()=>{})) as any;
  expect(r.tags.map((x:any)=>x.id)).toEqual([1,2,3]);expect(r.truncated).toBe(true);expect(r.pagination.end_cursor).toBe("three");expect(String(f.mock.calls[1][0])).toContain("per_page=1");
 });
 it("caps the very first page rather than dropping records behind its cursor",async()=>{const f=vi.fn().mockResolvedValue(json({tags:[{id:1}],pagination:{has_next_page:true,end_cursor:"one"}}));await tool("list_tags").handler({all_pages:true,max_items:1},new KitClient(cfg(),f,async()=>{}));expect(String(f.mock.calls[0][0])).toContain("per_page=1");expect(f).toHaveBeenCalledTimes(1);});
 it("refuses repeated cursors and backwards aggregate traversal",async()=>{
  const f=vi.fn().mockImplementation(()=>Promise.resolve(json({tags:[{id:1}],pagination:{has_next_page:true,end_cursor:"same"}})));const api=new KitClient(cfg(),f,async()=>{});
  await expect(tool("list_tags").handler({all_pages:true,max_items:10},api)).rejects.toThrow(/repeated/);const calls=f.mock.calls.length;await expect(tool("list_tags").handler({all_pages:true,before:"x"},api)).rejects.toThrow(/forward/);expect(f).toHaveBeenCalledTimes(calls);
 });
});
describe("authentication and network safety",()=>{
 it("refuses OAuth-only operations with an API key without making a request",async()=>{const f=vi.fn();await expect(new KitClient(cfg(),f).request("GET","/v4/purchases",{},undefined,undefined,true)).rejects.toThrow(/OAuth is required/);expect(f).not.toHaveBeenCalled();});
 it("never retries mutating requests on 429 or a network failure",async()=>{
  const f=vi.fn().mockResolvedValue(json({errors:["Rate limited"]},429));const api=new KitClient(cfg(),f,async()=>{});await expect(api.request("POST","/v4/tags",{},{name:"Example"})).rejects.toThrow(/429/);expect(f).toHaveBeenCalledTimes(1);
  const failed=vi.fn().mockRejectedValue(new Error("Contains test-private-key"));await expect(new KitClient(cfg(),failed).request("PUT","/v4/tags/1",{},{name:"Example"})).rejects.toThrow(/outcome may be unknown/);expect(failed).toHaveBeenCalledTimes(1);
 });
 it("bounds safe GET rate-limit retries",async()=>{const f=vi.fn().mockImplementation(()=>Promise.resolve(json({},429,{"retry-after":"9999"})));const sleep=vi.fn().mockResolvedValue(undefined);await expect(new KitClient(cfg(),f,sleep).request("GET","/v4/tags")).rejects.toThrow(/429/);expect(f).toHaveBeenCalledTimes(2);expect(sleep.mock.calls.some(([ms])=>ms===10000)).toBe(true);});
 it("deduplicates concurrent OAuth refresh and updates private tokens atomically",async()=>{
  const dir=await mkdtemp(join(tmpdir(),"kit-oauth-"));const file=join(dir,"tokens.json");await writeFile(file,JSON.stringify({access_token:"old-private-token",refresh_token:"private-refresh",client_id:"client-id",client_secret:"private-secret",created_at:1,expires_in:1}));
  const config=loadConfig({KIT_TOKENS_FILE:file,KIT_MIN_REQUEST_INTERVAL_MS:"1"});const f=vi.fn().mockImplementation((url)=>Promise.resolve(String(url).endsWith("oauth/token")?json({access_token:"new-private-token",refresh_token:"new-refresh",expires_in:3600}):json({account:{id:1}})));
  const api=new KitClient(config,f,async()=>{});await Promise.all([api.request("GET","/v4/account"),api.request("GET","/v4/account")]);expect(f.mock.calls.filter(([url])=>String(url).endsWith("oauth/token"))).toHaveLength(1);expect(JSON.parse(await readFile(file,"utf8")).access_token).toBe("new-private-token");if(process.platform!=="win32")expect((await stat(file)).mode&0o777).toBe(0o600);
 });
 it("never echoes private refresh credentials on a failed OAuth request",async()=>{const config=loadConfig({KIT_ACCESS_TOKEN:"private-access",KIT_REFRESH_TOKEN:"private-refresh",KIT_CLIENT_ID:"client-id",KIT_CLIENT_SECRET:"private-secret"});const f=vi.fn().mockResolvedValueOnce(json({},401)).mockRejectedValueOnce(new Error("private-refresh private-secret"));await expect(new KitClient(config,f).request("GET","/v4/account")).rejects.toThrow("No token values are logged");});
 it("redacts credentials reflected by an API error",async()=>{const f=vi.fn().mockResolvedValue(json({errors:["bad test-private-key"]},400));await expect(new KitClient(cfg(),f).request("GET","/v4/account")).rejects.toThrow("[redacted]");});
 it("resolves named accounts without returning credentials",async()=>{
  const config=loadConfig({KIT_ACCOUNTS:JSON.stringify([{name:"one",api_key:"key-one"},{name:"two",api_key:"key-two"}]),KIT_DEFAULT_ACCOUNT:"one",KIT_MIN_REQUEST_INTERVAL_MS:"1"});const f=vi.fn().mockResolvedValue(json({}));const api=new KitClient(config,f);await api.request("GET","/v4/account",{},undefined,"two");expect(f.mock.calls[0][1].headers["X-Kit-Api-Key"]).toBe("key-two");const labels=JSON.stringify(await tool("list_accounts").handler({},api));expect(labels).toContain("two");expect(labels).not.toContain("key-two");
 });
 it("rejects arbitrary request origins and traversal",async()=>{const f=vi.fn();await expect(new KitClient(cfg(),f).request("GET","https://example.com/")).rejects.toThrow(/Unsupported/);await expect(new KitClient(cfg(),f).request("GET","/v4/../account")).rejects.toThrow(/Unsupported/);expect(f).not.toHaveBeenCalled();});
});
describe("MCP and CLI share real safety",()=>{
 it("starts and discovers tools without any credentials",async()=>{const c=await connection(loadConfig({}));try{expect((await c.client.listTools()).tools).toHaveLength(85);}finally{await c.close();}});
 it.each(["mcp","cli"] as const)("refuses an unconfirmed audience write on %s",async(surface)=>{const f=vi.fn();const c=await connection(cfg(),f,surface);try{const r=await c.client.callTool({name:"tag_subscriber",arguments:{tag_id:2,email_address:"reader@example.com"}});expect(r.isError).toBe(true);expect(JSON.stringify(r)).toContain(surface==="cli"?"--confirm":"confirm: true");expect(f).not.toHaveBeenCalled();}finally{await c.close();}});
 it("hides writes and audits blocked direct calls without subscriber data",async()=>{
  const audit=join(await mkdtemp(join(tmpdir(),"kit-audit-")),"audit.jsonl");const f=vi.fn();const c=await connection({...cfg(),readOnly:true,auditPath:audit},f);
  try{expect((await c.client.listTools()).tools).toHaveLength(38);const r=await c.client.callTool({name:"tag_subscriber",arguments:{tag_id:2,email_address:"reader@example.com",confirm:true}});expect(r.isError).toBe(true);const log=await readFile(audit,"utf8");expect(log).toContain("blocked: read-only");expect(log).not.toContain("reader@example.com");expect(log).not.toContain("test-private-key");expect(f).not.toHaveBeenCalled();}finally{await c.close();}
 });
 it("saves newly created webhook secrets privately and keeps them out of MCP output",async()=>{
  const dir=await mkdtemp(join(tmpdir(),"kit-signing-"));const f=vi.fn().mockResolvedValue(json({webhook_endpoint:{id:1,secret:"test-signing-secret"}}));const c=await connection({...cfg(),privateDir:dir},f);
  try{const r=await c.client.callTool({name:"create_webhook_endpoint",arguments:{url:"https://example.com/events",events:["subscriber.created"],secret_name:"endpoint.txt",confirm:true}});expect(r.isError).not.toBe(true);expect(JSON.stringify(r)).not.toContain("test-signing-secret");expect(await readFile(join(dir,"endpoint.txt"),"utf8")).toBe("test-signing-secret");if(process.platform!=="win32")expect((await stat(join(dir,"endpoint.txt"))).mode&0o777).toBe(0o600);}finally{await c.close();}
 });
 it("refuses an existing secret filename before creating a remote secret",async()=>{
  const dir=await mkdtemp(join(tmpdir(),"kit-secret-existing-"));await writeFile(join(dir,"secret.txt"),"existing");const f=vi.fn();const c=await connection({...cfg(),privateDir:dir},f);
  try{const r=await c.client.callTool({name:"rotate_webhook_secret",arguments:{webhook_endpoint_id:1,secret_name:"secret.txt",confirm:true}});expect(r.isError).toBe(true);expect(f).not.toHaveBeenCalled();expect(await readFile(join(dir,"secret.txt"),"utf8")).toBe("existing");}finally{await c.close();}
 });
});
