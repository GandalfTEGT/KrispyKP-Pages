import fs from 'node:fs';
import {consumer,pageSpec,copyInventory} from '../pages/fixtures.mjs';
import {snapshot,sha,safeFile} from '../management/files.mjs';
import {read} from '../management/contract.mjs';
import {loadPages} from '../pages/contract.mjs';
import {loadRegistry} from '../pages/rules.mjs';
import {loadMedia} from './contract.mjs';
import {plan} from '../management/materialise.mjs';
import {loadLayout} from '../layout/contract.mjs';
export {consumer,pageSpec,copyInventory};
export const usage=(assetId,extra={})=>({assetId,alt:'Private media fixture',frame:'intrinsic',fit:'contain',position:{mode:'center',x:0.5,y:0.5},crop:null,...extra});
export function requestFor(root,mediaOperations,pageOperations=[],operations=[],layoutOperations=[]){
  const identity=snapshot(root,'Media private fixture'),content=read(root,consumer),pages=loadPages(root,consumer.pages),media=loadMedia(root,consumer.media),registry=loadRegistry(root);
  const request={schemaVersion:1,baselineSha256:identity.sha256,contractSha256:content.contractSha256,pagesContractSha256:pages.pagesContractSha256,shellSha256:pages.shellSha256,mediaContractSha256:media.mediaContractSha256,mediaStateSha256:media.mediaStateSha256,usageInventorySha256:media.usageInventorySha256,operations,pageOperations,mediaOperations,expectedFiles:{}};
  const sources=new Set();if(mediaOperations.length){for(const f of ['data/site-media-contract.json','data/site-media.json','styles/site-media.generated.css','data/site-pages.json','data/site-pages-contract.json','styles/site-pages.generated.css','index.html',...registry.pages.map(p=>p.slug+'/index.html'),...media.assets.map(a=>a.path)])sources.add(f);}
  if(pageOperations.length)for(const f of ['data/site-pages.json','styles/site-pages.generated.css','sitemap.xml',...registry.existing.map(p=>p.file),...registry.pages.map(p=>p.slug+'/index.html')])sources.add(f);
  for(const op of operations)sources.add(content.bindings.find(b=>b.id===op.id).file);
  if(layoutOperations.length){request.layoutOperations=layoutOperations;request.layoutContractSha256=loadLayout(root,consumer.layout).layoutContractSha256;for(const file of ['about/index.html','data/site-layout-state.json','styles/site-layout.generated.css'])sources.add(file);}
  request.expectedFiles=Object.fromEntries([...sources].sort().map(f=>[f,sha(fs.readFileSync(safeFile(root,f)))]));request.allowedOutputs=plan(root,root,identity,request,consumer).outputs;return {identity,request,consumer};
}
