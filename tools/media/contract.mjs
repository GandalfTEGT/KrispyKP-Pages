import fs from 'node:fs';
import {must} from '../pages/rules.mjs';
import {sha,safeFile} from '../management/files.mjs';
import {loadDeclaration,loadState,statePath,stylePath,consumerCheck,targetIds} from './model.mjs';
import {loadRegistry} from '../pages/rules.mjs';
import {usageInventory,sharedScope} from './refs.mjs';
import {stylesheet,imageMarkup} from './render.mjs';
import {loadPages} from '../pages/contract.mjs';
import {enabled as structuredEnabled} from '../structured/model.mjs';

export function loadMedia(root,consumer){if(consumer!==undefined)consumerCheck(consumer);const declaration=loadDeclaration(root),state=loadState(root),registry=loadRegistry(root),targets=targetIds(registry,root);if(consumer!==undefined&&state.usages.some(u=>u.id.startsWith('track.')))must(consumer.capabilities.includes('structured.artwork.v1'),'ADMIN_UPDATE_REQUIRED','Structured artwork requires its declared additional media capability.');for(const row of state.usages)must(targets.has(row.id),'MEDIA_MAPPING','Media usage names an undeclared or removed target.');
  must(fs.readFileSync(safeFile(root,stylePath),'utf8').replaceAll('\r\n','\n')===stylesheet(state),'MEDIA_PARITY','Media styles disagree with typed usage state.');
  const home=state.usages.find(r=>r.id==='home.hero.image'),source=fs.readFileSync(safeFile(root,'index.html'),'utf8');must(source.includes('<link rel="stylesheet" href="/styles/site-media.generated.css">')===(!!home||structuredEnabled(root)),'MEDIA_PARITY','Home media stylesheet binding disagrees.');if(home)must(source.includes(imageMarkup(root,home.id,'class="hero-logo" data-kkp-manage-id="home.hero.image"')),'MEDIA_PARITY','Home image source differs from declared usage rendering.');
  loadPages(root);
  const usages=usageInventory(root,state);return {state:'COMPATIBLE',readOnly:false,requiresValidation:true,...declaration,mediaStateSha256:sha(fs.readFileSync(safeFile(root,statePath))),...usages,assets:state.assets,usageValues:state.usages,slots:[...targets.values()].map(t=>({...t,value:state.usages.find(u=>u.id===t.id)?.value??null,requiredCapabilities:t.id.startsWith('track.')?['structured.artwork.v1']:[],readOnly:t.id.startsWith('track.')&&consumer!==undefined&&!consumer.capabilities.includes('structured.artwork.v1'),constraints:t.id.startsWith('track.')?{frames:['square'],fits:['contain','cover'],crop:true,focal:true,aspect:[0.125,8]}:t.id==='home.hero.image'?{frames:['intrinsic'],fits:['contain'],crop:false,focal:false,aspect:[0.25,4]}:{frames:['intrinsic','square','landscape','portrait'],fits:['contain','cover'],crop:true,focal:true,aspect:[0.125,8]}})),shared:state.assets.map(a=>({assetId:a.id,...sharedScope(state,usages,a.id)}))};
}
export function readMedia(root,consumer){try{consumerCheck(consumer);return loadMedia(root,consumer);}catch(error){return {state:error.code==='ADMIN_UPDATE_REQUIRED'?'ADMIN_UPDATE_REQUIRED':'UNVERIFIED',readOnly:true,diagnostics:[{severity:'blocking',code:error.code||'MEDIA_MAPPING',message:error.message}]};}}
