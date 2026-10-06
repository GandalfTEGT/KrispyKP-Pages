import fs from 'node:fs';
import {main} from '../management/cli.mjs';
import {readPages} from './contract.mjs';
import {previewBridge} from '../layout/bridge.mjs';
import {inventory,sha,privateOutput} from '../management/files.mjs';
import {must} from './rules.mjs';

const [command,...args]=process.argv.slice(2);
try{
  if(!['read','bridge'].includes(command))process.exitCode=await main([command,...args]);
  else{
    const options={};while(args.length){const key=args.shift();must(['--root','--consumer','--settings','--page-id','--receipt'].includes(key)&&!Object.hasOwn(options,key)&&args.length,'ARGUMENT','Unknown/duplicate/missing pages argument.');options[key]=args.shift();}
    must(options['--root']&&options['--consumer']&&options['--receipt'],'ARGUMENT','Explicit root/consumer/private receipt required.');const output=privateOutput(options['--receipt'],[options['--root']]);const consumer=JSON.parse(fs.readFileSync(options['--consumer'],'utf8'));let result=readPages(options['--root'],consumer.pages);
    if(command==='bridge'&&!result.readOnly){const settings=JSON.parse(fs.readFileSync(options['--settings'],'utf8'));must(settings.candidateSha256===sha(JSON.stringify(inventory(options['--root']))),'PREVIEW_IDENTITY','Candidate bytes differ from bridge identity.');const page=result.mappings.find(p=>p.id===options['--page-id']);must(page,'PAGE_ID','No managed page bridge for this identity.');result=previewBridge(settings,page.components.map(n=>({...n,operations:['setPage']})),{attribute:'data-kkp-page-id',routes:[page.route,page.route+'index.html']});}
    fs.writeFileSync(output,JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({command,state:result.state,status:result.status,readOnly:result.readOnly,diagnostics:result.diagnostics}));process.exitCode=result.readOnly?1:0;
  }
}catch(error){console.error(JSON.stringify({status:'FAIL',code:error.code||'INPUT',message:error.message}));process.exitCode=2;}
