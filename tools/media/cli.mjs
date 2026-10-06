import fs from 'node:fs';
import {main} from '../management/cli.mjs';
import {readMedia} from './contract.mjs';
import {admission} from './decode.mjs';
import {assetRecord} from './model.mjs';
import {privateOutput} from '../management/files.mjs';
import {must} from '../pages/rules.mjs';
const [command,...args]=process.argv.slice(2);
try{
  if(!['read','admit'].includes(command))process.exitCode=await main([command,...args]);
  else{
    const opts={};while(args.length){const key=args.shift();must(['--root','--consumer','--upload','--receipt'].includes(key)&&!Object.hasOwn(opts,key)&&args.length,'ARGUMENT','Unknown/duplicate/missing media argument.');opts[key]=args.shift();}
    must(opts['--root']&&opts['--consumer']&&opts['--receipt'],'ARGUMENT','Explicit root/consumer/private receipt required.');const output=privateOutput(opts['--receipt'],[opts['--root']]),consumer=JSON.parse(fs.readFileSync(opts['--consumer'],'utf8'));let report=readMedia(opts['--root'],consumer.media);
    if(command==='admit'&&!report.readOnly){must(opts['--upload']&&fs.statSync(opts['--upload']).size<=11200000,'INPUT','Bounded private upload JSON required.');const proof=admission(JSON.parse(fs.readFileSync(opts['--upload'],'utf8')));report={status:'ADMITTED',requiresValidation:true,asset:assetRecord(proof),renditionBase64:proof.data.toString('base64'),originalUploadPublished:false};}
    const serialized=JSON.stringify(report,null,2)+'\n';must(Buffer.byteLength(serialized)<=16777216,'MEDIA_LIMIT','Private media receipt exceeds16MiB.');fs.writeFileSync(output,serialized);console.log(JSON.stringify({command,status:report.status||report.state,readOnly:report.readOnly,diagnostics:report.diagnostics}));process.exitCode=report.readOnly?1:0;
  }
}catch(error){console.error(JSON.stringify({status:'FAIL',code:error.code||'INPUT',message:error.message}));process.exitCode=2;}
