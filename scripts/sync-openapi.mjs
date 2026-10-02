import fs from "node:fs";
import crypto from "node:crypto";
const source="https://developers.kit.com/api-reference/v4.json";
const local=process.argv[2];
const raw=local?fs.readFileSync(local,"utf8"):await(await fetch(source,{headers:{"User-Agent":"Mozilla/5.0"},signal:AbortSignal.timeout(30000)})).text();
const api=JSON.parse(raw);
function clean(v,stack=[]) {
 if(Array.isArray(v))return v.map(x=>clean(x,stack));
 if(!v||typeof v!=="object")return v;
 if(v.$ref) {
  if(stack.includes(v.$ref))throw new Error(`Circular schema: ${v.$ref}`);
  const target=v.$ref.slice(2).split("/").reduce((o,k)=>o[k],api);
  return clean({...target,...Object.fromEntries(Object.entries(v).filter(([k])=>k!=="$ref"))},[...stack,v.$ref]);
 }
 const o={};for(const[k,x]of Object.entries(v))if(!["example","examples","deprecated","readOnly","writeOnly","xml","discriminator","nullable"].includes(k))o[k]=clean(x,stack);
 if(typeof o.description==="string")o.description=o.description.replace(/<[^>]*>/g," ").replace(/\s+/g," ").replace(/—/g,":").trim();
 if(v.nullable&&typeof o.type==="string")o.type=[o.type,"null"];
 if(o.type==="object"&&o.additionalProperties===undefined)o.additionalProperties=false;
 return o;
}
const names={
 "get /v4/account":"get_account",
 "delete /v4/subscribers/{subscriber_id}/location":"delete_subscriber_location",
 "patch /v4/subscribers/{subscriber_id}/location":"update_subscriber_location",
 "post /v4/subscribers/{subscriber_id}/location":"pin_subscriber_location",
 "get /v4/broadcasts/stats":"list_broadcast_stats",
 "get /v4/broadcasts/{broadcast_id}/clicks":"get_broadcast_clicks",
 "get /v4/broadcasts/{broadcast_id}/stats":"get_broadcast_stats",
 "post /v4/forms/{form_id}/subscribers":"add_subscriber_to_form",
 "post /v4/forms/{form_id}/subscribers/{id}":"add_subscriber_to_form_by_id",
 "post /v4/sequences/{sequence_id}/subscribers":"add_subscriber_to_sequence",
 "post /v4/sequences/{sequence_id}/subscribers/{id}":"add_subscriber_to_sequence_by_id",
 "post /v4/tags/{tag_id}/subscribers":"tag_subscriber",
 "post /v4/tags/{tag_id}/subscribers/{id}":"tag_subscriber_by_id",
 "delete /v4/tags/{tag_id}/subscribers/{id}":"untag_subscriber",
 "delete /v4/tags/{tag_id}/subscribers":"untag_subscriber_by_email",
 "post /v4/subscribers/{id}/unsubscribe":"unsubscribe",
 "post /v4/subscribers/filter":"filter_subscribers",
 "get /v4/subscribers/{subscriber_id}/stats":"get_subscriber_stats",
 "get /v4/subscribers/{subscriber_id}/tags":"list_subscriber_tags",
 "post /v4/webhook_endpoints/{id}/revoke_previous_secret":"revoke_previous_webhook_secret",
 "post /v4/webhook_endpoints/{id}/rotate_secret":"rotate_webhook_secret",
};
const corrections=[
 "Broadcast create/update required-field lists conflict with draft/template creation and partial-update documentation. Create requires subject plus content or email_template_id; update accepts a nonempty partial body.",
 "Broadcast allow_starting_point is described by the official content field but absent from properties. It is included as a reviewed boolean extension; runtime support still needs a live-account write check.",
 "Broadcast update send_at supports null when returning to a draft; thumbnail fields are typed string-or-null. The generated GET broadcast parameter named [] is omitted as a malformed documentation entry.",
 "Untag-by-email adds the required email_address query parameter described by the official operation but missing from its parameter list.",
 "Path IDs are positive integers or digit strings. Tool names and generic id parameters use resource-specific names; search_subscribers remains a compatibility alias.",
];
const operations=[];
for(const[path,item]of Object.entries(api.paths))for(const[method,op]of Object.entries(item)) {
 if(!["get","post","put","patch","delete"].includes(method))continue;
 const name=names[`${method} ${path}`]??op.summary.toLowerCase().replace(/['’]/g,"").replace(/\b(a|an|the)\b/g,"").replace(/[^a-z0-9]+/g,"_").replace(/^_|_$/g,"");
 let group=path.split("/")[2];if(group==="bulk")group=path.split("/")[3];
 if(group==="sequences"&&path.includes("/emails"))group="sequence_emails";
 const idName={account:"account_id",broadcasts:"broadcast_id",custom_fields:"custom_field_id",forms:"subscriber_id",posts:"post_id",purchases:"purchase_id",sequences:"sequence_id",sequence_emails:"email_id",snippets:"snippet_id",subscribers:"subscriber_id",tags:"tag_id",webhook_endpoints:"webhook_endpoint_id",webhooks:"webhook_id"}[group];
 const params=(op.parameters??[]).filter(p=>p.in==="path"||p.in==="query").filter(p=>p.name!=="[]").map(p=>({...p,key:p.name==="id"?(path.includes("/subscribers/")?"subscriber_id":idName):p.name,schema:clean(p.schema??{})}));
 for(const p of params)if(p.in==="path")p.schema={anyOf:[{type:"integer",minimum:1},{type:"string",pattern:"^[1-9][0-9]*$"}],description:`Positive ${p.key.replaceAll("_"," ")}.`};
 if(name==="untag_subscriber_by_email")params.push({name:"email_address",key:"email_address",in:"query",required:true,schema:{type:"string",format:"email"}});
 const body=clean(op.requestBody?.content?.["application/json"]?.schema??{type:"object",properties:{},additionalProperties:false});
 if(path.startsWith("/v4/broadcasts")&&["post","put"].includes(method)) {
  body.required=method==="post"?["subject"]:[];
  if(method==="post")body.anyOf=[{required:["content"]},{required:["email_template_id"]}];
  body.properties.allow_starting_point={type:"boolean",description:"Explicitly allow replacing a Starting point template body, as described in Kit’s current content-field documentation. Review the complete rendered HTML first."};
  body.properties.send_at={...body.properties.send_at,type:["string","null"]};
  for(const k of["thumbnail_url","thumbnail_alt"])body.properties[k]={...body.properties[k],type:["string","null"]};
 }
 const read=method==="get"||name==="filter_subscribers";
 const risk=read?"read":method==="delete"||/(subscribers|broadcasts|sequences|snippets|purchases|webhook)/.test(path)?"destructive":"write";
 const oauthOnly=!op.security?.some(s=>"API Key"in s);
 const description=`${op.summary.replace(/—/g,":")}. ${read?"Reads account data.":risk==="destructive"?"May affect delivery, audience membership, published data or irreversible state. Requires confirm=true.":"Changes account configuration."}${oauthOnly?" Requires OAuth; API keys are not supported for this endpoint.":""}${name.includes("webhook")?" Webhook response secrets are redacted; new signing secrets are saved only to a private local file.":""}`;
 operations.push({name,title:op.summary.replace(/—/g,":"),description,method:method.toUpperCase(),path,group,risk,oauthOnly,params,bodySchema:body});
}
if(new Set(operations.map(o=>o.name)).size!==operations.length)throw new Error("Duplicate operation names");
fs.writeFileSync(new URL("../src/tools/operations.json",import.meta.url),JSON.stringify(operations,null,2)+"\n");
fs.writeFileSync(new URL("../src/tools/api-source.json",import.meta.url),JSON.stringify({source,checked:new Date().toISOString().slice(0,10),apiVersion:api.info.version,sha256:crypto.createHash("sha256").update(raw).digest("hex"),operationCount:operations.length,corrections},null,2)+"\n");
if(!local)fs.writeFileSync(new URL("./kit-api.snapshot.json",import.meta.url),raw);
console.log(`Generated ${operations.length} Kit v4 operations from the official snapshot.`);
