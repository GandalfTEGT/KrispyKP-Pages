import fs from 'node:fs';
import { isDeepStrictEqual } from 'node:util';
import { safeFile, requireThat, sha, json } from '../management/files.mjs';
import { tree } from './source.mjs';

export const layoutCapabilities=['layout.order.v1','layout.grid-span.v1','layout.profiles.v1','preview.selection.v1'];
export const layoutPaths={contract:'data/site-layout.json',source:'about/index.html',state:'data/site-layout-state.json',style:'styles/site-layout.generated.css'};
export const gridId='about.features.grid';
export const profileIds=['wide','medium','compact'];
const limits={wide:3,medium:2,compact:1};
const sectionIds=['about.overview-section','about.features-section','about.platforms-section','about.purpose-section'];
export const cardIds=['about.feature.streaming','about.feature.videos','about.feature.music','about.feature.tournaments'];
const fields=(value,keys)=>value&&isDeepStrictEqual(Object.keys(value).sort(),[...keys].sort());
const sameMembers=(value,expected)=>Array.isArray(value)&&new Set(value).size===value.length&&isDeepStrictEqual([...value].sort(),[...expected].sort());
export function effective(state){
  let grid=null;const spans={};const result={};
  for(const profile of profileIds){
    const stored=state.overrides[profile];
    if(stored[gridId])grid={...stored[gridId],sourceProfile:profile};
    for(const id of cardIds)if(Object.hasOwn(stored,id))spans[id]={span:stored[id],sourceProfile:profile};
    const columns=grid?Math.min(grid.columns,limits[profile]):null;
    result[profile]={grid:grid?{...grid,columns,requestedColumns:grid.columns,clamped:columns!==grid.columns,inherited:grid.sourceProfile!==profile}:null,cards:Object.fromEntries(cardIds.map(id=>{const value=spans[id];return[id,{span:value?Math.min(value.span,columns):1,requestedSpan:value?.span||1,sourceProfile:value?.sourceProfile||null,clamped:Boolean(value&&value.span>columns),inherited:Boolean(value&&value.sourceProfile!==profile)}];}))};
  }
  return result;
}
export function validateState(state){
  requireThat(fields(state,['schemaVersion','orders','overrides'])&&state.schemaVersion===1,'LAYOUT_STATE','Malformed layout state.');
  requireThat(fields(state.orders,['about.page',gridId])&&sameMembers(state.orders['about.page'],sectionIds)&&sameMembers(state.orders[gridId],cardIds),'LAYOUT_ORDER','Order must contain exactly declared siblings; no locked/missing/duplicate nodes.');
  requireThat(fields(state.overrides,profileIds),'LAYOUT_PROFILE','Only declared responsive profiles are supported.');
  for(const profile of profileIds){
    const stored=state.overrides[profile];requireThat(stored&&typeof stored==='object'&&!Array.isArray(stored)&&Object.keys(stored).every(id=>id===gridId||cardIds.includes(id)),'LAYOUT_OVERRIDE','Override target is not a supported grid/card.');
    if(stored[gridId])requireThat(fields(stored[gridId],['columns','alignment'])&&Number.isInteger(stored[gridId].columns)&&stored[gridId].columns>=1&&stored[gridId].columns<=limits[profile]&&['stretch','start','center'].includes(stored[gridId].alignment),'LAYOUT_GRID','Grid columns/alignment exceed approved profile bounds.');
    for(const id of cardIds)if(Object.hasOwn(stored,id))requireThat(Number.isInteger(stored[id])&&stored[id]>=1&&stored[id]<=limits[profile],'LAYOUT_SPAN','Card span is outside approved profile bounds.',id);
  }
  const resolved=effective(state);
  for(const profile of profileIds)for(const id of cardIds)if(Object.hasOwn(state.overrides[profile],id))requireThat(resolved[profile].grid&&state.overrides[profile][id]<=resolved[profile].grid.columns,'LAYOUT_SPAN','Stored span requires an explicit/inherited grid with sufficient columns.',id);
  return resolved;
}
export function stylesheet(state){
  const resolved=validateState(state);let output='/* Website-owned bounded layout projection; no default overrides. */\n';
  const queries={wide:'(min-width: 981px)',medium:'(min-width: 701px) and (max-width: 980px)',compact:'(max-width: 700px)'};
  for(const profile of profileIds){const value=resolved[profile];if(!value.grid)continue;
    output+=`@media ${queries[profile]} {\n  .page-about [data-kkp-layout-id="${gridId}"] { grid-template-columns: repeat(${value.grid.columns}, minmax(0, 1fr)); align-items: ${value.grid.alignment}; }\n`;
    for(const id of cardIds)output+=`  .page-about [data-kkp-layout-id="${id}"] { grid-column: span ${value.cards[id].span}; min-width: 0; }\n`;
    output+='}\n';
  }
  return output;
}
export function loadLayout(root,consumer){
  requireThat(consumer?.protocolVersion===1&&Array.isArray(consumer.capabilities)&&layoutCapabilities.every(c=>consumer.capabilities.includes(c)),'ADMIN_UPDATE_REQUIRED','Layout consumer protocol/capabilities are missing.');
  const bytes=fs.readFileSync(safeFile(root,layoutPaths.contract));requireThat(bytes.length<=65536,'LAYOUT_MAPPING','Layout declaration exceeds bounds.');
  let contract,state;try{contract=JSON.parse(bytes);state=JSON.parse(fs.readFileSync(safeFile(root,layoutPaths.state),'utf8'));}catch{requireThat(false,'LAYOUT_MAPPING','Layout declaration/state JSON is malformed.');}
  requireThat(contract?.siteId==='krispykp'&&contract.schemaVersion===1&&contract.protocolVersion===1&&contract.adapter==='about-layout-v1','ADMIN_UPDATE_REQUIRED','Unsupported layout schema/adapter.');
  requireThat(sameMembers(contract.requiredCapabilities,layoutCapabilities),'ADMIN_UPDATE_REQUIRED','Unsupported required layout semantics.');
  requireThat(contract.sourceFile===layoutPaths.source&&contract.stateFile===layoutPaths.state&&contract.styleFile===layoutPaths.style&&contract.renderAttribute==='data-kkp-layout-id','LAYOUT_MAPPING','Layout paths/attribute differ from reviewed adapter.');
  requireThat(isDeepStrictEqual(contract.profiles,[{id:'wide',minWidth:981,maxWidth:null,maxColumns:3},{id:'medium',minWidth:701,maxWidth:980,maxColumns:2},{id:'compact',minWidth:280,maxWidth:700,maxColumns:1}])&&isDeepStrictEqual(contract.inheritance,profileIds),'ADMIN_UPDATE_REQUIRED','Responsive profile semantics changed.');
  const expected=[['about.page','root','main',null],['about.hero','locked','section','about.page'],...sectionIds.map(id=>[id,'section','section','about.page']),[gridId,'grid','div','about.features-section'],...cardIds.map(id=>[id,'card','article',gridId])];
  requireThat(Array.isArray(contract.nodes)&&contract.nodes.length===expected.length,'LAYOUT_MAPPING','Unexpected component library/nesting.');
  for(const [index,[id,kind,tag,parent]] of expected.entries()){const n=contract.nodes[index];requireThat(n.id===id&&n.kind===kind&&n.tag===tag&&n.parent===parent&&typeof n.label==='string'&&n.label.length<=120,'LAYOUT_MAPPING','Component identity/type/nesting is unsupported.',id);}
  requireThat(isDeepStrictEqual(contract.nodes[0].children,['about.hero',...sectionIds])&&isDeepStrictEqual(contract.nodes[0].reorderable,sectionIds)&&isDeepStrictEqual(contract.nodes[6].children,cardIds)&&isDeepStrictEqual(contract.nodes[6].reorderable,cardIds),'LAYOUT_MAPPING','Declared child membership changed.');
  const resolved=validateState(state),source=fs.readFileSync(safeFile(root,layoutPaths.source),'utf8'),all=tree(source),mapped=all.filter(n=>n.id);
  requireThat(mapped.length===expected.length&&new Set(mapped.map(n=>n.id)).size===mapped.length,'LAYOUT_MAPPING','Missing/duplicate rendered identities.');
  for(const declaration of contract.nodes){const node=mapped.find(n=>n.id===declaration.id);let parent=node?.parent;while(parent&&!parent.id)parent=parent.parent;
    requireThat(node?.tag===declaration.tag&&(parent?.id||null)===declaration.parent,'LAYOUT_NESTING','Source identity/type/nearest managed parent disagrees.',declaration.id);
  }
  const main=mapped.find(n=>n.id==='about.page'),grid=mapped.find(n=>n.id===gridId);
  requireThat(isDeepStrictEqual(main.children.map(n=>n.id),['about.hero',...state.orders['about.page']])&&isDeepStrictEqual(grid.children.map(n=>n.id),state.orders[gridId]),'LAYOUT_ORDER','Actual DOM order differs from stored semantic order.');
  requireThat(fs.readFileSync(safeFile(root,layoutPaths.style),'utf8').replaceAll('\r\n','\n')===stylesheet(state),'LAYOUT_PARITY','Generated stylesheet differs from the bounded state projection.');
  requireThat(source.includes('<link rel="stylesheet" href="/styles/site-layout.generated.css">'),'LAYOUT_MAPPING','Projected stylesheet is not bound to the page.');
  return {state:'COMPATIBLE',readOnly:false,requiresValidation:true,contract,layoutContractSha256:sha(bytes),layoutFingerprint:sha(json(contract.nodes)),layoutState:state,effective:resolved,bindings:contract.nodes.map(n=>({...n,operations:n.kind==='root'?['setOrder','resetProfile']:n.kind==='grid'?['setOrder','setGrid','resetProfile']:n.kind==='card'?['setSpan','resetProfile']:n.kind==='section'?['reorderWithinParent']:[],storedProfiles:Object.fromEntries(profileIds.map(p=>[p,state.overrides[p][n.id]??null]))}))};
}
export function readLayout(root,consumer){try{return loadLayout(root,consumer);}catch(error){return{state:error.code==='ADMIN_UPDATE_REQUIRED'?'ADMIN_UPDATE_REQUIRED':'UNVERIFIED',readOnly:true,diagnostics:[{severity:'blocking',code:error.code||'LAYOUT_MAPPING',field:error.field||null,message:error.message}]};}}
