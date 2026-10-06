import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { snapshot, privateOutput, requireThat, ManagementError } from './files.mjs';
import { read } from './contract.mjs';
import { plan, materialise, operationProof } from './materialise.mjs';
import { validateCandidate } from './validate.mjs';
import {mediaReceipt} from '../media/model.mjs';

function options(args){
  const allowed=new Set(['root','baseline-root','identity','request','consumer','previous','source-id','receipt','changed-files','profile']);
  const out={};
  while(args.length){const key=args.shift();requireThat(key?.startsWith('--') && allowed.has(key.slice(2)) && !Object.hasOwn(out,key.slice(2)) && args.length>0,'ARGUMENT','Unknown, duplicate or missing command argument.');out[key.slice(2)]=args.shift();}
  return out;
}
function input(filename,maxBytes=8388608){requireThat(typeof filename==='string','ARGUMENT','Required JSON input path missing.');const stat=fs.statSync(filename);requireThat(stat.isFile() && stat.size<=maxBytes,'INPUT','JSON inputs must be bounded regular files.');return JSON.parse(fs.readFileSync(filename,'utf8'));}
export async function main(argv){
  const [command,...args]=argv;const opt=options(args);
  requireThat(['snapshot','read','plan','materialise','validate'].includes(command),'ARGUMENT','Command must be snapshot, read, plan, materialise, operationProof or validate.');
  requireThat(opt.root && opt.receipt,'ARGUMENT','Explicit root and private receipt are required.');
  // Resolve/check the private destination before any source mutation.
  const output=privateOutput(opt.receipt,[opt.root,opt['baseline-root']].filter(Boolean));
  let report;
  try{
    if(command==='snapshot')report=snapshot(opt.root,opt['source-id']);
    else if(command==='read')report=read(opt.root,input(opt.consumer),opt.previous?input(opt.previous):null);
    else{
      const identity=input(opt.identity),request=input(opt.request,50331648),consumer=input(opt.consumer),baseline=opt['baseline-root'];
      requireThat(baseline,'ARGUMENT','Immutable baseline root is required.');
      if(command==='validate')report=await validateCandidate({root:opt.root,baseline,identity,request,consumer,changed:input(opt['changed-files']),profile:opt.profile||'standard'});
      else if(command==='materialise')report=materialise(opt.root,baseline,identity,request,consumer);
      else {const result=plan(opt.root,baseline,identity,request,consumer);report={status:'PLANNED',requiresValidation:true,...operationProof(identity,request,consumer),...mediaReceipt(result),outputs:result.outputs,mediaImpact:result.mediaImpact,layoutImpact:result.layoutImpact,pageImpact:result.pageImpact,pagesContractSha256:result.pagesContractSha256,shellSha256:result.shellSha256,contractSha256:result.contractSha256,layoutContractSha256:result.layoutContractSha256};}
    }
  }catch(error){report={status:'FAIL',mediaImpact:error.mediaImpact||[],diagnostics:[{severity:'blocking',code:error.code||'INPUT',field:error.field||null,message:error instanceof ManagementError?error.message:'Input or environment error; see the private consumer log.'}]};}
  const serialized=JSON.stringify(report,null,2)+'\n';requireThat(Buffer.byteLength(serialized)<=16777216,'RECEIPT_LIMIT','Private receipt exceeds16MiB.');fs.writeFileSync(output,serialized);
  console.log(JSON.stringify({command,status:report.status||report.state||'SNAPSHOT',outputs:report.outputs,checks:report.checks,diagnostics:report.diagnostics}));
  return report.status==='FAIL'||report.readOnly?1:0;
}
if(process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  try{process.exitCode=await main(process.argv.slice(2));}catch(error){console.error(JSON.stringify({status:'FAIL',code:error.code||'INPUT',message:error instanceof ManagementError?error.message:'Invalid command input.'}));process.exitCode=2;}
}
