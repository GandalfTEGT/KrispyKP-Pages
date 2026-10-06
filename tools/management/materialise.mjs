import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { isDeepStrictEqual } from 'node:util';
import { requireThat, safeRoot, safeFile, verifySnapshot, sha, json, separateRoots, assertCandidateShape } from './files.mjs';
import { read } from './contract.mjs';
import { nodes, valueOf, replaceNode } from './html.mjs';
import { upload, usages } from './media.mjs';
import { projectLayout } from '../layout/project.mjs';
import { projectPages } from '../pages/project.mjs';

function text(value,max,id){requireThat(typeof value==='string' && value.trim()===value && value.length>0 && value.length<=max && !/[\x00-\x1f\x7f]/.test(value),'VALUE','Expected nonempty bounded plain text without control characters.',id);}
function link(root,value,binding){
  requireThat(value && json(Object.keys(value).sort())===json(['href','text']),'VALUE','Link value must contain only text and href.',binding.id);text(value.text,binding.maxLength,binding.id);
  requireThat(typeof value.href==='string' && value.href.length<=2048 && !/[\s\\\x00-\x1f]/u.test(value.href),'VALUE','Invalid link destination.',binding.id);
  if(value.href.startsWith('/') && !value.href.startsWith('//')){
    const route=value.href.split(/[?#]/)[0];const relative=route.endsWith('/')?route.slice(1)+'index.html':route.slice(1);safeFile(root,relative||'index.html');
  }else{
    let url;try{url=new URL(value.href);}catch{requireThat(false,'VALUE','Link must be a local route or HTTPS URL.',binding.id);}
    requireThat(url.protocol==='https:' && !url.username && !url.password,'VALUE','Only credential-free HTTPS external links are supported.',binding.id);
  }
}
export function plan(root,baseline,identity,request,consumer){
  requireThat(request?.schemaVersion===1 && Array.isArray(request.operations) && request.operations.length<=40,'REQUEST','Malformed or unbounded operation batch.');
  verifySnapshot(baseline,identity,request.baselineSha256);
  const handshake=read(root,consumer);requireThat(handshake.state==='COMPATIBLE','COMPATIBILITY','Consumer/source compatibility proof is missing.');
  requireThat(handshake.contractSha256===request.contractSha256,'STALE_CONTRACT','Management contract hash changed.');
  const files=new Map();const mediaImpact=[];const seen=new Set();const expectedSource=new Set();
  for(const operation of request.operations){
    requireThat(operation && json(Object.keys(operation).sort())===json(['expectedOld','id','kind','value']),'REQUEST','Operation must contain exactly id, kind, expectedOld and value.');
    const binding=handshake.bindings.find(b=>b.id===operation.id);
    requireThat(binding && !seen.has(operation.id),'OPERATION','Unknown or duplicate binding operation.',operation.id);seen.add(operation.id);
    requireThat(operation.kind===({text:'setText',link:'setLink',image:'replaceImage'})[binding.kind],'OPERATION','Unsupported operation for binding.',operation.id);
    expectedSource.add(binding.file);
    let source=files.get(binding.file)?.toString('utf8') ?? fs.readFileSync(safeFile(root,binding.file),'utf8');
    const node=nodes(source).find(n=>n.id===binding.id);
    requireThat(isDeepStrictEqual(valueOf(node,binding.kind),operation.expectedOld),'STALE_VALUE','Expected old value differs from current source.',binding.id);
    if(binding.kind==='text')text(operation.value,binding.maxLength,binding.id);
    if(binding.kind==='link')link(root,operation.value,binding);
    let value=operation.value;
    if(binding.kind==='image'){
      requireThat(value && json(Object.keys(value).sort())===json(['alt','fit','focal','mode','pngBase64']),'MEDIA','Image value must contain PNG data and declared usage semantics.',binding.id);
      text(value.alt,160,binding.id);
      requireThat(value.mode==='selected-use' && value.fit==='intrinsic' && value.focal==='none','MEDIA','Shared replacement, crop/focal and fit changes are unsupported.',binding.id);
      const asset=upload(value,binding.media);const existing=safeFile(root,asset.relative,{existing:false});
      if(fs.existsSync(existing))requireThat(sha(fs.readFileSync(existing))===sha(asset.bytes),'MEDIA','Content-addressed image path already holds different bytes.');
      else files.set(asset.relative,asset.bytes);
      const oldRelative=operation.expectedOld.src.slice(1);
      mediaImpact.push({binding:binding.id,oldPath:oldRelative,existingReferences:usages(root,identity.files,oldRelative),selectedUsageOnly:true,newPath:asset.relative,sharedFileUnchanged:true});
      value={src:'/'+asset.relative,alt:value.alt};
    }
    if(json(valueOf(node,binding.kind))!==json(value))source=replaceNode(source,node,binding.kind,value);
    const bytes=Buffer.from(source,'utf8');
    if(!bytes.equals(fs.readFileSync(safeFile(root,binding.file))))files.set(binding.file,bytes);
  }
  const layout=request.layoutOperations?projectLayout(root,files,request,consumer):{expectedSources:[],layoutImpact:[]};
  for(const file of layout.expectedSources)expectedSource.add(file);
  const pages=request.pageOperations?projectPages(root,files,request,consumer):{expectedSources:[],pageImpact:[]};
  for(const file of pages.expectedSources)expectedSource.add(file);
  requireThat(request.expectedFiles && json(Object.keys(request.expectedFiles).sort())===json([...expectedSource].sort()),'PRECONDITION','Exact managed source file hashes are required.');
  for(const file of expectedSource)requireThat(request.expectedFiles[file]===sha(fs.readFileSync(safeFile(root,file))),'STALE_SOURCE','Managed source hash differs from request.',file);
  const outputs=[...files.keys()].sort();
  if(request.allowedOutputs)requireThat(json([...request.allowedOutputs].sort())===json(outputs) && new Set(request.allowedOutputs).size===request.allowedOutputs.length,'OUTPUT_ALLOWLIST','Declared outputs differ from deterministic output set.');
  return {files,outputs,mediaImpact,layoutImpact:layout.layoutImpact,pageImpact:pages.pageImpact,pagesContractSha256:pages.pagesContractSha256??null,shellSha256:pages.shellSha256??null,contractSha256:handshake.contractSha256,layoutContractSha256:request.layoutOperations?.length?request.layoutContractSha256:null};
}
export function materialise(root,baseline,identity,request,consumer){
  root=safeRoot(root);baseline=safeRoot(baseline);
  separateRoots(root,baseline);assertCandidateShape(root);
  verifySnapshot(root,identity,request.baselineSha256);
  const planned=plan(root,baseline,identity,request,consumer);
  requireThat(Array.isArray(request.allowedOutputs),'OUTPUT_ALLOWLIST','Materialisation requires an explicit exact output allowlist.');
  const destinations=new Map(planned.outputs.map(file=>[file,safeFile(root,file,{existing:false})]));
  const before=new Map(planned.outputs.map(file=>[file,fs.existsSync(destinations.get(file))?fs.readFileSync(destinations.get(file)):null]));
  const staging=fs.mkdtempSync(path.join(os.tmpdir(),'kkp-materialise-'));
  const written=[];const staged=[];
  try{
    for(const [index,file] of planned.outputs.entries()){
      const temp=path.join(staging,String(index));fs.writeFileSync(temp,planned.files.get(file));
      const fd=fs.openSync(temp,'r+');try{fs.fsyncSync(fd);}finally{fs.closeSync(fd);}
    }
    verifySnapshot(root,identity,request.baselineSha256);
    for(const [index,file] of planned.outputs.entries()){
      safeFile(root,file,{existing:false});const target=destinations.get(file);fs.mkdirSync(path.dirname(target),{recursive:true});
      // Same-directory rename is atomic per file; receipt/validation gate covers the whole transaction.
      const temporary=target+'.kkp-stage-'+path.basename(staging);staged.push(temporary);fs.copyFileSync(path.join(staging,String(index)),temporary);
      fs.renameSync(temporary,target);written.push(file);
    }
  }catch(error){
    for(const file of written.reverse()){
      const target=destinations.get(file);if(before.get(file)===null)fs.unlinkSync(target);else fs.writeFileSync(target,before.get(file));
    }
    throw error;
  }finally{for(const temporary of staged)if(fs.existsSync(temporary))fs.unlinkSync(temporary);fs.rmSync(staging,{recursive:true});}
  return {status:'MATERIALISED',requiresValidation:true,baselineSha256:identity.sha256,contractSha256:planned.contractSha256,layoutContractSha256:planned.layoutContractSha256,pagesContractSha256:planned.pagesContractSha256,shellSha256:planned.shellSha256,outputs:planned.outputs.map(file=>({path:file,sha256:sha(planned.files.get(file)),bytes:planned.files.get(file).length})),mediaImpact:planned.mediaImpact,layoutImpact:planned.layoutImpact,pageImpact:planned.pageImpact};
}
