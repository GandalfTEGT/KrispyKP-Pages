import fs from 'node:fs';
import {isDeepStrictEqual} from 'node:util';
import {safeFile} from '../management/files.mjs';
import {loadPages,registryPath,stylePath} from './contract.mjs';
import {must,exact,registryShape,slug} from './rules.mjs';
import {partials,patchShell,pageDocument,generatedStyle,sitemap,shell} from './shell.mjs';

export function pageProposal(root,request,consumer){
  must(Array.isArray(request.pageOperations)&&request.pageOperations.length<=20,'PAGE_REQUEST','Unbounded page operations.');
  must([1,2].includes(consumer?.pages?.protocolVersion),'ADMIN_UPDATE_REQUIRED','Page operations require explicit consumer capabilities.');const loaded=loadPages(root,consumer.pages);must(request.pagesContractSha256===loaded.pagesContractSha256&&request.shellSha256===loaded.shellSha256,'STALE_CONTRACT','Page contract or shell digest changed.');
  const registry=structuredClone(loaded.registry),seen=new Set(),occupied=new Set(fs.readdirSync(root).map(n=>n.toLowerCase()));
  for(const operation of request.pageOperations){must(exact(operation,['id','kind','expectedOld','value'])&&typeof operation.id==='string'&&!seen.has(operation.id),'PAGE_REQUEST','Malformed or duplicate page operation.');seen.add(operation.id);const value=operation.value;slug(value?.slug);must(operation.id===value.id,'PAGE_ID','Operation/page identity differs.');const before=registry.pages.find(p=>p.id===operation.id);
    if(operation.kind==='createPage'){must(operation.expectedOld===null&&!before&&!occupied.has(value.slug),'PAGE_COLLISION','Route already exists, is occupied, or has stale absence proof.');registry.pages.push(value);occupied.add(value.slug);}
    else{must(operation.kind==='setPage'&&before&&isDeepStrictEqual(before,operation.expectedOld),'STALE_VALUE','Missing/stale/unsupported page edit.');must(before.slug===value.slug&&before.id===value.id,'PAGE_ROUTE','Rename/move/delete is outside this contract.');registry.pages[registry.pages.indexOf(before)]=value;}
  }
  registryShape(registry);return {loaded,registry};
}
export function projectPages(root,files,request,consumer){
  must(Array.isArray(request.pageOperations)&&request.pageOperations.length<=20,'PAGE_REQUEST','Unbounded page operations.');if(!request.pageOperations.length)return {expectedSources:[],pageImpact:[]};
  const {loaded,registry}=pageProposal(root,request,consumer),templates=partials(root),expectedSources=[registryPath,stylePath,'sitemap.xml',...registry.existing.map(p=>p.file)];
  const set=(file,text)=>{const target=safeFile(root,file,{existing:false}),old=fs.existsSync(target)?fs.readFileSync(target):null;const eol=old?.toString('utf8').includes('\r\n')?'\r\n':'\n',bytes=Buffer.from(text.replaceAll('\r\n','\n').replaceAll('\n',eol));if(!old||!bytes.equals(old))files.set(file,bytes);};
  set(registryPath,JSON.stringify(registry,null,2)+'\n');set(stylePath,generatedStyle(registry,root,files));set('sitemap.xml',sitemap(registry));
  for(const route of registry.existing){const source=files.get(route.file)?.toString('utf8')??fs.readFileSync(safeFile(root,route.file),'utf8');set(route.file,patchShell(source,shell(registry,route.route,templates)));}
  for(const page of registry.pages){if(loaded.registry.pages.some(p=>p.id===page.id))expectedSources.push(`${page.slug}/index.html`);set(`${page.slug}/index.html`,pageDocument(page,registry,root,templates,files));}
  return {expectedSources,pageImpact:request.pageOperations.map(op=>({id:op.id,kind:op.kind,before:op.expectedOld,after:op.value,route:`/${op.value.slug}/`,navigationProposal:op.value.navigation})),pagesContractSha256:loaded.pagesContractSha256,shellSha256:loaded.shellSha256};
}
