import { loadConfig } from "./config.js";
import { KitClient } from "./api/client.js";
import { exitCodeFor } from "./cli.js";
export async function runDoctor(network=false):Promise<number> {
 const config=loadConfig();const configured=config.accounts.length>0;
 const result:Record<string,unknown>={ok:configured,node:process.version,accountsConfigured:config.accounts.length,readOnly:config.readOnly,authenticationChecked:false,note:configured?"Run doctor --network to read the default account without sending email or changing subscribers.":"Set KIT_API_KEY or KIT_TOKENS_FILE in private settings. Run login for instructions."};
 if(!configured){console.log(JSON.stringify(result,null,2));return 10;}
 if(network)try {await new KitClient(config).request("GET","/v4/account");Object.assign(result,{authenticationChecked:true});}catch(e){console.error(JSON.stringify({error:(e as Error).message}));return exitCodeFor((e as Error).message);}
 console.log(JSON.stringify(result,null,2));return 0;
}
