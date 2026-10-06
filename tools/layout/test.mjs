import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { snapshot,sha,inventory,changedFiles } from '../management/files.mjs';
import { read,capabilities } from '../management/contract.mjs';
import { plan,materialise } from '../management/materialise.mjs';
import { readLayout,layoutCapabilities,gridId,cardIds,layoutPaths } from './contract.mjs';
import { previewBridge } from './bridge.mjs';

const source=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..'),temporary=fs.mkdtempSync(path.join(os.tmpdir(),'kkp-layout-tests-'));
const baseline=path.join(temporary,'baseline'),candidate=path.join(temporary,'candidate');
const consumer={protocolVersion:1,capabilities,layout:{protocolVersion:1,capabilities:layoutCapabilities}};
const original=new Map();for(const file of ['index.html','about/index.html','data/site-management.json','data/site-layout.json','data/site-layout-state.json','styles/site-layout.generated.css','data/tournaments.config.js'])original.set(file,fs.readFileSync(path.join(source,file)));
let count=0;
function reset(){for(const root of [baseline,candidate]){fs.rmSync(root,{recursive:true,force:true});fs.mkdirSync(root);for(const [file,bytes] of original){fs.mkdirSync(path.dirname(path.join(root,file)),{recursive:true});fs.writeFileSync(path.join(root,file),bytes);}}}
function test(name,fn){reset();fn();count++;console.log('PASS '+name);}
function op(id,kind,value,expectedOld=null){return{id,kind,value,expectedOld};}
function request(operations){const identity=snapshot(baseline,'layout-test'),content=read(candidate,consumer),layout=readLayout(candidate,consumer.layout);assert.equal(layout.state,'COMPATIBLE');return{identity,request:{schemaVersion:1,baselineSha256:identity.sha256,contractSha256:content.contractSha256,layoutContractSha256:layout.layoutContractSha256,operations:[],layoutOperations:operations,expectedFiles:Object.fromEntries([layoutPaths.source,layoutPaths.state,layoutPaths.style].map(file=>[file,sha(fs.readFileSync(path.join(candidate,file)))]))}};}
function apply(operations){const {identity,request:r}=request(operations);r.allowedOutputs=plan(candidate,baseline,identity,r,consumer).outputs;const receipt=materialise(candidate,baseline,identity,r,consumer);return{identity,receipt,request:r};}
function rejects(code,operations){const {identity,request:r}=request(operations);assert.throws(()=>plan(candidate,baseline,identity,r,consumer),e=>e.code===code);assert.deepEqual(inventory(candidate),identity.files);}
function mutate(file,fn){fs.writeFileSync(path.join(candidate,file),fn(fs.readFileSync(path.join(candidate,file),'utf8')));}
try{
  test('default source/state/renderer map compatible with no overrides',()=>{assert.equal(readLayout(candidate,consumer.layout).state,'COMPATIBLE');});
  test('semantic section order round trip keeps hero first and content IDs',()=>{const before=read(candidate,consumer).bindings;const layout=readLayout(candidate,consumer.layout);apply([op('about.page','setOrder',[...layout.layoutState.orders['about.page']].reverse(),layout.layoutState.orders['about.page'])]);assert.deepEqual(readLayout(candidate,consumer.layout).layoutState.orders['about.page'],[...layout.layoutState.orders['about.page']].reverse());assert.deepEqual(read(candidate,consumer).bindings,before);});
  test('card DOM order round trip preserves unrelated source/tournament bytes',()=>{const {identity}=apply([op(gridId,'setOrder',[...cardIds].reverse(),cardIds)]);assert.deepEqual(readLayout(candidate,consumer.layout).layoutState.orders[gridId],[...cardIds].reverse());assert.deepEqual(changedFiles(identity.files,inventory(candidate)),['about/index.html','data/site-layout-state.json']);assert.ok(fs.readFileSync(path.join(candidate,'data/tournaments.config.js')).equals(original.get('data/tournaments.config.js')));});
  test('wide span and grid inheritance clamps safely for smaller profiles',()=>{apply([op(gridId,'setGrid',{profile:'wide',columns:3,alignment:'stretch'}),op(cardIds[0],'setSpan',{profile:'wide',span:3})]);const r=readLayout(candidate,consumer.layout);assert.equal(r.effective.medium.grid.columns,2);assert.equal(r.effective.medium.cards[cardIds[0]].span,2);assert.equal(r.effective.compact.cards[cardIds[0]].span,1);assert.equal(r.bindings.find(b=>b.id===cardIds[0]).storedProfiles.medium,null);assert.equal(r.effective.medium.cards[cardIds[0]].inherited,true);});
  test('medium override distinct from effective wide inheritance',()=>{apply([op(gridId,'setGrid',{profile:'wide',columns:3,alignment:'stretch'}),op(gridId,'setGrid',{profile:'medium',columns:1,alignment:'start'})]);const r=readLayout(candidate,consumer.layout);assert.equal(r.effective.medium.grid.columns,1);assert.equal(r.effective.medium.grid.inherited,false);assert.equal(r.effective.compact.grid.inherited,true);});
  test('no-op order preserves exact original bytes and empty outputs',()=>{const result=apply([op(gridId,'setOrder',cardIds,cardIds)]);assert.deepEqual(result.receipt.outputs,[]);assert.deepEqual(inventory(candidate),result.identity.files);});
  test('profile reset removes stored override and restores inherited effective values',()=>{const first=apply([op(gridId,'setGrid',{profile:'wide',columns:3,alignment:'stretch'}),op(gridId,'setGrid',{profile:'medium',columns:1,alignment:'start'})]);for(const file of changedFiles(first.identity.files,inventory(candidate)))fs.copyFileSync(path.join(candidate,file),path.join(baseline,file));apply([op(gridId,'resetProfile',{profile:'medium'},{columns:1,alignment:'start'})]);assert.equal(readLayout(candidate,consumer.layout).effective.medium.grid.columns,2);});
  test('whole-profile reset restores original projected stylesheet',()=>{const first=apply([op(gridId,'setGrid',{profile:'wide',columns:3,alignment:'stretch'}),op(cardIds[0],'setSpan',{profile:'wide',span:2})]);for(const file of changedFiles(first.identity.files,inventory(candidate)))fs.copyFileSync(path.join(candidate,file),path.join(baseline,file));const stored=readLayout(candidate,consumer.layout).layoutState.overrides.wide;apply([op('about.page','resetProfile',{profile:'wide'},stored)]);assert.equal(readLayout(candidate,consumer.layout).effective.wide.grid,null);assert.ok(fs.readFileSync(path.join(candidate,layoutPaths.style)).equals(original.get(layoutPaths.style)));});
  test('locked hero reorder refused',()=>rejects('LAYOUT_LOCKED',[op('about.hero','setOrder',[],[])]));
  test('moving card into page-section parent refused',()=>rejects('LAYOUT_ORDER',[op('about.page','setOrder',cardIds,readLayout(candidate,consumer.layout).layoutState.orders['about.page'])]));
  test('missing or duplicate card order refused',()=>rejects('LAYOUT_ORDER',[op(gridId,'setOrder',[cardIds[0],cardIds[0],...cardIds.slice(2)],cardIds)]));
  test('profile-specific order/extra value shape refused',()=>rejects('LAYOUT_ORDER',[op(gridId,'setOrder',{profile:'wide',order:cardIds},cardIds)]));
  test('unknown profile refused',()=>rejects('LAYOUT_PROFILE',[op(gridId,'setGrid',{profile:'arbitrary',columns:2,alignment:'start'})]));
  test('oversized compact grid refused',()=>rejects('LAYOUT_GRID',[op(gridId,'setGrid',{profile:'compact',columns:2,alignment:'stretch'})]));
  test('arbitrary alignment/CSS refused',()=>rejects('LAYOUT_GRID',[op(gridId,'setGrid',{profile:'wide',columns:2,alignment:'position:absolute'})]));
  test('span without explicit or inherited grid refused',()=>rejects('LAYOUT_SPAN',[op(cardIds[0],'setSpan',{profile:'wide',span:2})]));
  test('span beyond effective grid refused',()=>rejects('LAYOUT_SPAN',[op(gridId,'setGrid',{profile:'wide',columns:1,alignment:'stretch'}),op(cardIds[0],'setSpan',{profile:'wide',span:2})]));
  test('stored precondition cannot be confused with inherited/effective value',()=>rejects('STALE_VALUE',[op(gridId,'setGrid',{profile:'wide',columns:2,alignment:'stretch'},{columns:2,alignment:'stretch'})]));
  test('duplicate target/profile net operation refused',()=>rejects('LAYOUT_REQUEST',[op(gridId,'setGrid',{profile:'wide',columns:2,alignment:'stretch'}),op(gridId,'resetProfile',{profile:'wide'})]));
  test('unsupported consumer remains read only',()=>assert.equal(readLayout(candidate,{protocolVersion:1,capabilities:[]}).state,'ADMIN_UPDATE_REQUIRED'));
  test('broken declaration nesting remains unverified',()=>{mutate(layoutPaths.contract,s=>s.replace('"parent": "about.features.grid"','"parent": "about.page"'));assert.equal(readLayout(candidate,consumer.layout).state,'UNVERIFIED');});
  test('unknown declared profile semantics require consumer update',()=>{mutate(layoutPaths.contract,s=>s.replace('"minWidth": 981','"minWidth": 900'));assert.equal(readLayout(candidate,consumer.layout).state,'ADMIN_UPDATE_REQUIRED');});
  test('duplicate source identity refused',()=>{mutate(layoutPaths.source,s=>s.replace('data-kkp-layout-id="about.feature.videos"','data-kkp-layout-id="about.feature.streaming"'));assert.equal(readLayout(candidate,consumer.layout).state,'UNVERIFIED');});
  test('source DOM order drift refused',()=>{mutate(layoutPaths.state,s=>{const state=JSON.parse(s);state.orders[gridId].reverse();return JSON.stringify(state);});assert.equal(readLayout(candidate,consumer.layout).state,'UNVERIFIED');});
  test('forged generated CSS refused',()=>{mutate(layoutPaths.style,s=>s+'body { width: 9999px; }');assert.equal(readLayout(candidate,consumer.layout).state,'UNVERIFIED');});
  test('stale layout contract pinned hash refused',()=>{const {identity,request:r}=request([op(gridId,'setGrid',{profile:'wide',columns:2,alignment:'stretch'})]);r.layoutContractSha256='0'.repeat(64);assert.throws(()=>plan(candidate,baseline,identity,r,consumer),e=>e.code==='STALE_CONTRACT');});
  test('mixed content and layout net operations preserve independent binding edits',()=>{const {identity,request:r}=request([op(gridId,'setOrder',[...cardIds].reverse(),cardIds)]);const binding=read(candidate,consumer).bindings[0];r.operations=[op(binding.id,'setText','D1 mixed text review',binding.value)];r.allowedOutputs=plan(candidate,baseline,identity,r,consumer).outputs;materialise(candidate,baseline,identity,r,consumer);assert.equal(read(candidate,consumer).bindings[0].value,'D1 mixed text review');assert.deepEqual(readLayout(candidate,consumer.layout).layoutState.orders[gridId],[...cardIds].reverse());});
  test('bridge origin/session/document identity required',()=>{assert.throws(()=>previewBridge({origin:'https://example.com'},readLayout(candidate,consumer.layout).bindings),e=>e.code==='PREVIEW_ORIGIN');});
  console.log(`LAYOUT PASS — ${count} refusal/projection cases`);
}finally{fs.rmSync(temporary,{recursive:true,force:true});}
