import fs from 'node:fs';
import path from 'node:path';
import {capabilities,loadPages,registryPath,stylePath} from './contract.mjs';
import {capabilities as contentCapabilities,read} from '../management/contract.mjs';
import {layoutCapabilities,loadLayout} from '../layout/contract.mjs';
import {snapshot,sha,safeFile} from '../management/files.mjs';
import {plan} from '../management/materialise.mjs';

export const consumer={protocolVersion:1,capabilities:contentCapabilities,layout:{protocolVersion:1,capabilities:layoutCapabilities},pages:{protocolVersion:1,capabilities}};
export function pageSpec(slug='community-note',template='standard'){return {id:`page.${slug}`,slug,name:'Community Note',navLabel:'Community',navigation:{header:true,footer:true},template,title:'Community Note | KrispyKP',description:'A private page-authoring validation fixture.',hero:template==='standard'?{title:'Community Note',summary:'A private fixture using the shared Website shell.'}:null,components:template==='blank'?[]:[{id:'intro',kind:'panel',children:[{id:'heading',kind:'heading',level:2,text:'Community updates'},{id:'copy',kind:'text',text:'This private draft demonstrates bounded page composition.'},{id:'cta',kind:'button',text:'About KrispyKP',href:'/about/'},{id:'logo',kind:'image',src:'/assets/logo.png',alt:'KrispyKP logo'}]},{id:'cards',kind:'grid',profiles:{wide:3,medium:null,compact:null},children:[{id:'first',kind:'panel',children:[{id:'first-title',kind:'heading',level:2,text:'Streams'},{id:'first-copy',kind:'text',text:'Follow the streams.'}]},{id:'second',kind:'panel',children:[{id:'second-title',kind:'heading',level:2,text:'Music'},{id:'second-copy',kind:'text',text:'Explore the music.'}]}]}]};}
export function requestFor(root,operations,{mixed=false}={}){
  const identity=snapshot(root,'E1 private fixture'),loaded=loadPages(root,consumer.pages),content=read(root,consumer),layout=loadLayout(root,consumer.layout);
  const request={schemaVersion:1,baselineSha256:identity.sha256,contractSha256:content.contractSha256,pagesContractSha256:loaded.pagesContractSha256,shellSha256:loaded.shellSha256,expectedFiles:{},operations:[],pageOperations:operations};
  const sources=new Set();if(operations.length){for(const f of [registryPath,stylePath,'sitemap.xml',...loaded.registry.existing.map(p=>p.file),...loaded.registry.pages.map(p=>`${p.slug}/index.html`)])sources.add(f);}
  if(mixed){request.operations=[{id:'about.hero.title',kind:'setText',expectedOld:content.bindings.find(b=>b.id==='about.hero.title').value,value:'The KrispyKP Hub — private E1 fixture'}];request.layoutContractSha256=layout.layoutContractSha256;request.layoutOperations=[{id:'about.features.grid',kind:'setGrid',expectedOld:null,value:{profile:'wide',columns:3,alignment:'stretch'}}];for(const f of ['about/index.html','data/site-layout-state.json','styles/site-layout.generated.css'])sources.add(f);}
  request.expectedFiles=Object.fromEntries([...sources].sort().map(f=>[f,sha(fs.readFileSync(safeFile(root,f)))]));request.allowedOutputs=plan(root,root,identity,request,consumer).outputs;return {identity,request,consumer};
}
export function copyInventory(root,output,files){fs.mkdirSync(output,{recursive:true});for(const file of files){const dest=path.join(output,file.path);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.copyFileSync(path.join(root,file.path),dest);}}
