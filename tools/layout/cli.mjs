import fs from 'node:fs';
import { main } from '../management/cli.mjs';
import { readLayout } from './contract.mjs';
import { previewBridge } from './bridge.mjs';
import { requireThat,privateOutput,ManagementError,inventory,sha } from '../management/files.mjs';

const [command,...args]=process.argv.slice(2);
if(!['read','bridge'].includes(command))process.exitCode=await main([command,...args]);
else{
  try{
    const options={};while(args.length){const key=args.shift();requireThat(['--root','--consumer','--receipt','--settings'].includes(key)&&!Object.hasOwn(options,key)&&args.length,'ARGUMENT','Unknown, duplicate or missing layout argument.');options[key]=args.shift();}
    requireThat(options['--root']&&options['--receipt']&&options['--consumer'],'ARGUMENT','Explicit root/consumer/private receipt required.');
    const output=privateOutput(options['--receipt'],[options['--root']]);
    const consumer=JSON.parse(fs.readFileSync(options['--consumer'],'utf8'));let result=readLayout(options['--root'],consumer.layout);
    if(command==='bridge'&&result.state==='COMPATIBLE'){const settings=JSON.parse(fs.readFileSync(options['--settings'],'utf8'));requireThat(settings.candidateSha256===sha(JSON.stringify(inventory(options['--root']))),'PREVIEW_IDENTITY','Bridge candidate digest differs from actual source bytes.');result=previewBridge(settings,result.bindings);}
    fs.writeFileSync(output,JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({command,status:result.status,state:result.state,readOnly:result.readOnly,diagnostics:result.diagnostics}));process.exitCode=result.readOnly?1:0;
  }catch(error){console.error(JSON.stringify({status:'FAIL',code:error.code||'INPUT',message:error instanceof ManagementError?error.message:'Invalid layout command input.'}));process.exitCode=2;}
}
