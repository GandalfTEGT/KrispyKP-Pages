import fs from 'node:fs';
import { isDeepStrictEqual } from 'node:util';
import { requireThat,safeFile } from '../management/files.mjs';
import { loadLayout,layoutPaths,profileIds,gridId,cardIds,validateState,stylesheet } from './contract.mjs';
import { tree,reorder } from './source.mjs';

export function projectLayout(root,files,request,consumer){
  const operations=request.layoutOperations;
  requireThat(Array.isArray(operations)&&operations.length<=40,'LAYOUT_REQUEST','Layout operations must be a bounded array.');
  if(!operations.length)return{expectedSources:[],layoutImpact:[]};
  const loaded=loadLayout(root,consumer.layout);requireThat(loaded.layoutContractSha256===request.layoutContractSha256,'STALE_CONTRACT','Pinned layout contract changed.');
  const state=structuredClone(loaded.layoutState),seen=new Set(),impact=[];
  for(const op of operations){
    requireThat(op&&isDeepStrictEqual(Object.keys(op).sort(),['expectedOld','id','kind','value']),'LAYOUT_REQUEST','Layout operation keys must be id/kind/expectedOld/value.');
    const target=loaded.bindings.find(b=>b.id===op.id);requireThat(target?.operations.includes(op.kind),'LAYOUT_LOCKED','Target/operation is not declared editable.',op.id);
    const profile=op.kind==='setOrder'?null:op.value?.profile;
    requireThat(op.kind==='setOrder'||profileIds.includes(profile),'LAYOUT_PROFILE','Unknown responsive profile.',op.id);
    const key=op.id+':'+(profile||'order');requireThat(!seen.has(key),'LAYOUT_REQUEST','Duplicate net operation target/profile.',op.id);seen.add(key);
    const old=op.kind==='setOrder'?state.orders[op.id]:op.id==='about.page'?state.overrides[profile]:state.overrides[profile][op.id]??null;
    requireThat(isDeepStrictEqual(old,op.expectedOld),'STALE_VALUE','Layout expected old stored value differs; effective/inherited values are not preconditions.',op.id);
    if(op.kind==='setOrder')state.orders[op.id]=op.value;
    else if(op.kind==='setGrid'){
      requireThat(isDeepStrictEqual(Object.keys(op.value).sort(),['alignment','columns','profile']),'LAYOUT_REQUEST','Grid value requires profile/columns/alignment.');
      state.overrides[profile][op.id]={columns:op.value.columns,alignment:op.value.alignment};
    }else if(op.kind==='setSpan'){
      requireThat(isDeepStrictEqual(Object.keys(op.value).sort(),['profile','span']),'LAYOUT_REQUEST','Span value requires profile/span.');state.overrides[profile][op.id]=op.value.span;
    }else{
      requireThat(isDeepStrictEqual(Object.keys(op.value),['profile']),'LAYOUT_REQUEST','Reset value requires only profile.');
      if(op.id==='about.page')state.overrides[profile]={};else delete state.overrides[profile][op.id];
    }
    impact.push({id:op.id,kind:op.kind,profile,before:structuredClone(old),after:structuredClone(op.kind==='setOrder'?state.orders[op.id]:op.id==='about.page'?state.overrides[profile]:state.overrides[profile][op.id]??null)});
  }
  const resolved=validateState(state);
  let source=files.get(layoutPaths.source)?.toString('utf8')??fs.readFileSync(safeFile(root,layoutPaths.source),'utf8');
  for(const id of ['about.page',gridId])if(!isDeepStrictEqual(state.orders[id],loaded.layoutState.orders[id])){const all=tree(source);source=reorder(source,all.find(n=>n.id===id),state.orders[id],all);}
  const values={[layoutPaths.source]:source,[layoutPaths.state]:JSON.stringify(state,null,2)+'\n',[layoutPaths.style]:stylesheet(state)};
  for(const [file,text] of Object.entries(values)){
    const original=fs.readFileSync(safeFile(root,file)),eol=original.includes(Buffer.from('\r\n'))?'\r\n':'\n';
    const bytes=Buffer.from(file===layoutPaths.source?text:text.replaceAll('\n',eol));
    if(!isDeepStrictEqual(state,loaded.layoutState)||file===layoutPaths.source){if(!bytes.equals(original))files.set(file,bytes);}
  }
  return{expectedSources:Object.values(layoutPaths).filter(file=>file!==layoutPaths.contract),layoutImpact:impact,effective:resolved};
}
