import fs from "node:fs";
import assert from "node:assert/strict";
import {Client} from "@modelcontextprotocol/sdk/client/index.js";
import {StdioClientTransport} from "@modelcontextprotocol/sdk/client/stdio.js";
const pkg=JSON.parse(fs.readFileSync("package.json","utf8"));
const env=Object.fromEntries(Object.entries(process.env).filter(([k])=>!k.startsWith("KIT_")));
const client=new Client({name:"release-check",version:"1"});
const transport=new StdioClientTransport({command:process.execPath,args:["dist/index.js"],env});
try {
 await client.connect(transport);const {tools}=await client.listTools();
 const reads=tools.filter(t=>t.annotations?.readOnlyHint);const confirms=tools.filter(t=>t.annotations?.destructiveHint);
 if(process.argv.includes("--capture"))fs.writeFileSync("/private/tmp/kit-tools.json",JSON.stringify(tools,null,2)+"\n");
 else {
  const manifest=JSON.parse(fs.readFileSync("desktop-extension/manifest.json","utf8"));assert.equal(manifest.version,pkg.version);assert.ok(manifest.description.includes(`${tools.length} tools`));assert.equal(manifest.user_config.api_key.sensitive,true);
  for(const file of["README.md","INSTALL.md"]) {
   const text=fs.readFileSync(file,"utf8");assert.ok(text.includes(`${tools.length} tools`)||text.includes(`${tools.length} commands`),`${file}: count missing`);
   const slugs=new Set([...text.matchAll(/^#{1,6} (.+)$/gm)].map(m=>m[1].toLowerCase().replace(/[^\w\s-]/g,"").trim().replace(/\s+/g,"-")));
   for(const m of text.matchAll(/\[[^\]]+\]\(#([^)]+)\)/g))assert.ok(slugs.has(m[1]),`${file}: missing ${m[1]}`);
  }
  const source=JSON.parse(fs.readFileSync("src/tools/api-source.json","utf8"));assert.equal(source.operationCount+2,tools.length);
 }
 assert.equal(new Set(tools.map(t=>t.name)).size,tools.length);
 console.log(`Real stdio handshake: ${tools.length} tools, ${reads.length} reads, ${tools.length-reads.length} writes, ${confirms.length} confirmation-gated operations.`);
}finally {await client.close();}
