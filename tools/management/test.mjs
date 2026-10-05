import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { snapshot, sha, safeFile, relativePath, privateOutput, changedFiles, inventory } from './files.mjs';
import { read, capabilities, loadContract } from './contract.mjs';
import { materialise, plan } from './materialise.mjs';
import { usages, upload } from './media.mjs';
import { validateCandidate } from './validate.mjs';
import { validateSnapshotDiff } from '../validate-static.mjs';
import { createResult } from '../validation-common.mjs';

const source=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const fixture=fs.mkdtempSync(path.join(os.tmpdir(),'kkp-management-tests-'));
const baseline=path.join(fixture,'baseline'),candidate=path.join(fixture,'candidate');
const consumer={protocolVersion:1,capabilities};
let count=0;
const original=new Map();
for(const file of ['index.html','about/index.html','data/site-management.json','data/tournaments.config.js','styles/about.css','styles/home.css','assets/logo.png'])original.set(file,fs.readFileSync(path.join(source,file)));
original.set('data/unknown.json',Buffer.from('{"unknownOwnerField":"preserve me", "spacing": 7}\r\n'));
function reset(){
  for(const root of [baseline,candidate]){fs.rmSync(root,{recursive:true,force:true});fs.mkdirSync(root);for(const [file,bytes] of original){fs.mkdirSync(path.dirname(path.join(root,file)),{recursive:true});fs.writeFileSync(path.join(root,file),bytes);}}
}
function test(name,fn){reset();fn();console.log('PASS '+name);count++;}
function mutate(file,fn,root=candidate){fs.writeFileSync(path.join(root,file),fn(fs.readFileSync(path.join(root,file),'utf8')));}
function request(id='about.hero.title',value='Owner test & <plain> "copy"'){
  const identity=snapshot(baseline,'test');const state=read(candidate,consumer);const binding=state.bindings.find(b=>b.id===id);
  return {identity,request:{schemaVersion:1,baselineSha256:identity.sha256,contractSha256:state.contractSha256,expectedFiles:{[binding.file]:sha(fs.readFileSync(path.join(candidate,binding.file)))},allowedOutputs:[binding.file],operations:[{id,kind:binding.kind==='link'?'setLink':'setText',expectedOld:binding.value,value}]}};
}
function rejects(code,fn){assert.throws(fn,error=>error.code===code);}
try{
  test('text round trip escapes markup and preserves all other bytes',()=>{const {identity,request:r}=request();const receipt=materialise(candidate,baseline,identity,r,consumer);assert.equal(read(candidate,consumer).bindings[0].value,r.operations[0].value);assert.deepEqual(receipt.outputs.map(o=>o.path),['about/index.html']);assert.deepEqual(changedFiles(identity.files,inventory(candidate)),['about/index.html']);assert.ok(fs.readFileSync(path.join(candidate,'data/unknown.json')).equals(original.get('data/unknown.json')));});
  test('link round trip accepts reordered expected-old object keys',()=>{const {identity,request:r}=request('home.hero.twitch',{href:'https://example.com/owner?x=1&y=2',text:'Owner & link'});r.operations[0].expectedOld={href:r.operations[0].expectedOld.href,text:r.operations[0].expectedOld.text};materialise(candidate,baseline,identity,r,consumer);assert.deepEqual(read(candidate,consumer).bindings.find(b=>b.id==='home.hero.twitch').value,r.operations[0].value);});
  test('no-op retains original entity and whitespace bytes',()=>{const {identity,request:r}=request('about.hero.summary');r.operations[0].value=r.operations[0].expectedOld;r.allowedOutputs=[];materialise(candidate,baseline,identity,r,consumer);assert.deepEqual(inventory(candidate),identity.files);});
  test('output allowlist refuses undeclared paths',()=>{const {identity,request:r}=request();r.allowedOutputs.push('data/tournaments.config.js');rejects('OUTPUT_ALLOWLIST',()=>materialise(candidate,baseline,identity,r,consumer));assert.deepEqual(inventory(candidate),identity.files);});
  test('stale source hash refuses write',()=>{const {identity,request:r}=request();r.expectedFiles['about/index.html']='0'.repeat(64);rejects('STALE_SOURCE',()=>materialise(candidate,baseline,identity,r,consumer));});
  test('stale baseline hash refuses write',()=>{const {identity,request:r}=request();r.baselineSha256='0'.repeat(64);rejects('STALE_BASELINE',()=>materialise(candidate,baseline,identity,r,consumer));});
  test('dirty candidate refuses write',()=>{const {identity,request:r}=request();mutate('data/unknown.json',s=>s+' ');rejects('STALE_BASELINE',()=>materialise(candidate,baseline,identity,r,consumer));});
  test('dirty immutable baseline refuses write',()=>{const {identity,request:r}=request();mutate('data/unknown.json',s=>s+' ',baseline);rejects('STALE_BASELINE',()=>materialise(candidate,baseline,identity,r,consumer));});
  test('stale expected old value refuses write',()=>{const {identity,request:r}=request();r.operations[0].expectedOld='Wrong';rejects('STALE_VALUE',()=>materialise(candidate,baseline,identity,r,consumer));});
  test('duplicate operation refuses batch',()=>{const {identity,request:r}=request();r.operations.push(r.operations[0]);rejects('OPERATION',()=>materialise(candidate,baseline,identity,r,consumer));});
  test('unknown operation binding refuses batch',()=>{const {identity,request:r}=request();r.operations[0].id='about.unknown';rejects('OPERATION',()=>materialise(candidate,baseline,identity,r,consumer));});
  test('unsupported consumer remains read only',()=>{assert.equal(read(candidate,{protocolVersion:1,capabilities:[]}).state,'ADMIN_UPDATE_REQUIRED');});
  test('unsupported required Website semantics refused even if consumer claims support',()=>{mutate('data/site-management.json',s=>{const c=JSON.parse(s);c.requiredCapabilities.push('unknown.execute.v1');return JSON.stringify(c);});assert.equal(read(candidate,{protocolVersion:1,capabilities:[...capabilities,'unknown.execute.v1']}).state,'ADMIN_UPDATE_REQUIRED');});
  test('missing map remains unverified',()=>{fs.unlinkSync(path.join(candidate,'data/site-management.json'));assert.equal(read(candidate,consumer).state,'UNVERIFIED');});
  test('malformed map remains unverified',()=>{mutate('data/site-management.json',()=>'{');assert.equal(read(candidate,consumer).state,'UNVERIFIED');});
  test('duplicate source/render ID refuses editing',()=>{mutate('about/index.html',s=>s.replace('</main>','<p data-kkp-manage-id="about.hero.title">Duplicate</p></main>'));assert.equal(read(candidate,consumer).state,'UNVERIFIED');});
  test('duplicate contract ID refuses editing',()=>{mutate('data/site-management.json',s=>{const c=JSON.parse(s);c.bindings.push(c.bindings[0]);return JSON.stringify(c);});assert.equal(read(candidate,consumer).state,'UNVERIFIED');});
  test('source tag disagreement refuses editing',()=>{mutate('data/site-management.json',s=>s.replace('"tag": "h1"','"tag": "h2"'));assert.equal(read(candidate,consumer).state,'UNVERIFIED');});
  test('render-only CSS drift needs new draft without consumer release',()=>{const identity=snapshot(baseline,'test');mutate('styles/about.css',s=>s+'\n/* owner render polish */\n');const r=read(candidate,consumer,identity);assert.equal(r.state,'COMPATIBLE_UNMANAGED');assert.equal(r.readOnly,true);assert.equal(r.requiresNewSnapshot,true);});
  test('unknown source drift remains read only',()=>{const identity=snapshot(baseline,'test');mutate('data/unknown.json',s=>s+' ');assert.equal(read(candidate,consumer,identity).state,'UNVERIFIED');});
  test('new supported text binding is discoverable by existing consumer',()=>{mutate('about/index.html',s=>s.replace('</main>','<p data-kkp-manage-id="about.newcopy">New copy</p></main>'));mutate('data/site-management.json',s=>{const c=JSON.parse(s);c.bindings.push({id:'about.newcopy',label:'New copy',file:'about/index.html',route:'/about/',tag:'p',kind:'text',maxLength:120});return JSON.stringify(c);});assert.equal(read(candidate,consumer).state,'COMPATIBLE');assert.equal(read(candidate,consumer).bindings.at(-1).value,'New copy');});
  test('breaking media semantics require consumer/contract update',()=>{mutate('data/site-management.json',s=>s.replace('"fit": "intrinsic"','"fit": "cover"'));assert.equal(read(candidate,consumer).state,'ADMIN_UPDATE_REQUIRED');});
  test('unknown contract fields preserved without execution',()=>{mutate('data/site-management.json',s=>{const c=JSON.parse(s);c.future={executable:'never execute',owner:'unknown'};return JSON.stringify(c);});assert.equal(read(candidate,consumer).state,'COMPATIBLE');});
  test('path traversal and Windows path ambiguity refused',()=>{for(const file of ['../escape','/absolute','data\\escape','data/a%2fb','data/CON.txt','data/file.','data/file:stream'])rejects('PATH',()=>relativePath(file));});
  test('linked source directory refuses traversal',()=>{fs.symlinkSync(baseline,path.join(candidate,'assets','linked'),'junction');rejects('SYMLINK',()=>safeFile(candidate,'assets/linked/index.html'));});
  test('private receipt cannot enter public roots',()=>{rejects('PRIVATE_OUTPUT',()=>privateOutput(path.join(candidate,'data','receipt.json'),[candidate]));});
  test('unsafe external link refuses materialisation',()=>{const {identity,request:r}=request('home.hero.twitch',{href:'javascript:alert(1)',text:'Link'});rejects('VALUE',()=>materialise(candidate,baseline,identity,r,consumer));});
  test('same-path shared logo replacement identifies multiple affected sources',()=>{const files=inventory(candidate);const impact=usages(candidate,files,'assets/logo.png');assert.ok(impact.includes('index.html') && impact.includes('about/index.html'));});
  test('unsupported upload MIME refused',()=>{rejects('MEDIA',()=>upload({pngBase64:Buffer.from('not a PNG').toString('base64')},loadContract(candidate).bindings.find(b=>b.kind==='image').media));});
  test('Git-less whitespace bridge accepts ordinary differences and rejects real faults',()=>{
    const scope={files:['about/index.html'],pages:['about'],extras:[]};
    mutate('about/index.html',s=>s.replace('The KrispyKP Hub','Changed heading'));
    let result=createResult('standard',scope);validateSnapshotDiff(candidate,baseline,scope,result);assert.equal(result.status,'PASS');
    mutate('about/index.html',s=>s+'\n<p>Trailing space</p> \n');
    result=createResult('standard',scope);validateSnapshotDiff(candidate,baseline,scope,result);assert.equal(result.status,'FAIL');assert.match(result.failures[0].message,/trailing whitespace/);
    assert.equal(fs.existsSync(path.join(candidate,'.git')),false);
  });
  test('private credential asset cannot hide outside hashed inventory',()=>{const {identity,request:r}=request();fs.writeFileSync(path.join(candidate,'assets','secrets.key'),'private');rejects('PRIVATE_ASSET',()=>materialise(candidate,baseline,identity,r,consumer));});
  test('multi-binding same-file batch preserves independent values',()=>{const {identity,request:r}=request();const binding=read(candidate,consumer).bindings.find(b=>b.id==='about.focus');r.operations.push({id:binding.id,kind:'setText',expectedOld:binding.value,value:'Second independent edit'});materialise(candidate,baseline,identity,r,consumer);assert.equal(read(candidate,consumer).bindings.find(b=>b.id===binding.id).value,'Second independent edit');});
  reset();{
    const {identity,request:r}=request();materialise(candidate,baseline,identity,r,consumer);
    await assert.rejects(validateCandidate({root:candidate,baseline,identity,request:r,consumer,changed:[]}),e=>e.code==='CHANGED_SCOPE');
    console.log('PASS snapshot changed scope cannot conceal changed files');count++;
    fs.writeFileSync(path.join(candidate,'assets/logo.png'),Buffer.from('same-path unauthorized replacement'));
    await assert.rejects(validateCandidate({root:candidate,baseline,identity,request:r,consumer,changed:['about/index.html','assets/logo.png']}),e=>e.code==='PRESERVATION' && e.mediaImpact[0].affectedUsages.includes('index.html'));
    console.log('PASS same-path shared media change refused with usage impact');count++;
  }
  console.log(`MANAGEMENT PASS — ${count} contract and preservation cases`);
}finally{fs.rmSync(fixture,{recursive:true,force:true});}
