import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {inventory,assertCandidateShape} from '../management/files.mjs';
import {materialise,plan} from '../management/materialise.mjs';
import {pageSpec,requestFor,consumer} from './fixtures.mjs';
import {loadPages,readPages} from './contract.mjs';
import {routeTable} from './rules.mjs';
import {build} from './build.mjs';
import {validateSnapshotDiff} from '../validate-static.mjs';
import {createResult} from '../validation-common.mjs';
import {previewBridge} from '../layout/bridge.mjs';
import {partials,segments,patchShell,shell,pageDocument} from './shell.mjs';

const source=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..'),temporary=fs.mkdtempSync(path.join(os.tmpdir(),'kkp-pages-tests-')),baseline=path.join(temporary,'baseline'),candidate=path.join(temporary,'candidate');
const names=['index.html','music/index.html','videos/index.html','tournaments/index.html','about/index.html','contact/index.html','privacy/index.html','sitemap.xml','assets/logo.png','data/site-management.json','data/site-layout.json','data/site-layout-state.json','styles/site-layout.generated.css','data/site-pages.json','data/site-pages-contract.json','styles/site-pages.generated.css',...['header','footer','footer-privacy','background','background-tournaments'].map(n=>`tools/pages/partials/${n}.html`)];
let count=0;const remove=root=>{assert.ok(path.resolve(root).startsWith(temporary+path.sep));fs.rmSync(root,{recursive:true,force:true});};
function reset(){for(const root of [baseline,candidate]){remove(root);for(const name of names){const dest=path.join(root,name);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.copyFileSync(path.join(source,name),dest);}}}
function test(name,fn){reset();fn();count++;console.log('PASS '+name);}
const op=value=>({id:value.id,kind:'createPage',expectedOld:null,value});
function apply(operations,mixed=false){const value=requestFor(baseline,operations,{mixed});materialise(candidate,baseline,value.identity,value.request,value.consumer);return value;}
function refuse(code,change){const value=pageSpec();change(value);const before=inventory(candidate);assert.throws(()=>requestFor(baseline,[op(value)]),error=>error.code===code);assert.deepEqual(inventory(candidate),before);}
try{
  test('default shell/registry parity preserves seven bespoke routes',()=>assert.equal(loadPages(candidate,consumer.pages).state,'COMPATIBLE'));
  test('empty page journal gives no outputs and null page proof digest',()=>{const {identity,request}=requestFor(baseline,[]);const result=plan(candidate,baseline,identity,request,consumer);assert.deepEqual(result.outputs,[]);assert.equal(result.pagesContractSha256,null);});
  test('mixed content/layout plus two pages preserves independent mappings',()=>{const a=pageSpec(),b=pageSpec('quiet-page','blank');b.navigation={header:false,footer:false};apply([op(a),op(b)],true);assert.equal(Object.keys(routeTable(candidate)).length,9);assert.equal(loadPages(candidate,consumer.pages).mappings.length,2);assertCandidateShape(candidate);assert.ok(fs.readFileSync(path.join(candidate,'about/index.html'),'utf8').includes('private E1 fixture'));assert.ok(inventory(candidate).some(f=>f.path==='quiet-page/index.html'));});
  test('hidden Blank creation preserves every existing HTML byte',()=>{const p=pageSpec('quiet-page','blank');p.navigation={header:false,footer:false};const value=apply([op(p)]);for(const name of names.filter(n=>n.endsWith('index.html')))assert.ok(fs.readFileSync(path.join(candidate,name)).equals(fs.readFileSync(path.join(baseline,name))));assert.ok(!value.request.allowedOutputs.includes('index.html'));});
  test('new page edit and no-op reset use baseline whole-page precondition',()=>{const p=pageSpec();apply([op(p)]);remove(baseline);fs.cpSync(candidate,baseline,{recursive:true});const old=loadPages(baseline).registry.pages[0],value=structuredClone(old);value.hero.summary='Revised private summary';const edit={id:old.id,kind:'setPage',expectedOld:old,value};const input=requestFor(baseline,[edit]);assert.ok(input.request.allowedOutputs.includes('community-note/index.html'));const noOp=requestFor(baseline,[{...edit,value:old}]);assert.deepEqual(noOp.request.allowedOutputs,[]);});
  test('reserved existing route refused',()=>refuse('PAGE_ROUTE',p=>{p.slug='about';p.id='page.about';}));
  test('case alias refused',()=>refuse('PAGE_ROUTE',p=>{p.slug='Community';p.id='page.Community';}));
  test('Windows device path refused',()=>refuse('PAGE_ROUTE',p=>{p.slug='con';p.id='page.con';}));
  test('encoded traversal refused',()=>refuse('PAGE_ROUTE',p=>{p.slug='a%2fb';p.id='page.a%2fb';}));
  test('occupied case-insensitive source directory refused',()=>{fs.mkdirSync(path.join(baseline,'COMMUNITY-NOTE'));assert.throws(()=>requestFor(baseline,[op(pageSpec())]),e=>e.code==='PAGE_COLLISION');});
  test('duplicate page operations refused',()=>assert.throws(()=>requestFor(baseline,[op(pageSpec()),op(pageSpec())]),e=>e.code==='PAGE_REQUEST'));
  test('arbitrary HTML component refused',()=>refuse('PAGE_COMPONENT',p=>p.components=[{id:'raw',kind:'html',html:'<script>x</script>'}]));
  test('markup in page content refused before writes',()=>refuse('PAGE_TEXT',p=>p.description='<img onerror=x>'));
  test('duplicate component IDs refused',()=>refuse('PAGE_ID',p=>p.components[0].children[1].id='heading'));
  test('heading hierarchy skip refused',()=>refuse('PAGE_HEADING',p=>p.components[0].children[0].level=3));
  test('invalid compact columns refused',()=>refuse('PAGE_GRID',p=>p.components[1].profiles.compact=2));
  test('unknown profile refused',()=>refuse('PAGE_PROFILE',p=>p.components[1].profiles.phone=1));
  test('invalid grid nesting refused',()=>refuse('PAGE_NESTING',p=>p.components[1].children=[{id:'bad',kind:'text',text:'bad'}]));
  test('unsafe script link refused',()=>refuse('PAGE_LINK',p=>p.components[0].children[2].href='javascript:alert(1)'));
  test('credential-bearing HTTPS refused',()=>refuse('PAGE_LINK',p=>p.components[0].children[2].href='https://user:pass@example.com/'));
  test('undeclared local route refused',()=>refuse('PAGE_LINK',p=>p.components[0].children[2].href='/missing/'));
  test('new media upload/crop fields refused',()=>refuse('PAGE_COMPONENT',p=>p.components[0].children[3].crop='cover'));
  test('non-PNG initial reference refused',()=>refuse('PAGE_MEDIA',p=>p.components[0].children[3].src='/assets/logo.svg'));
  test('missing image alternative text refused',()=>refuse('PAGE_TEXT',p=>p.components[0].children[3].alt=''));
  test('existing routes cannot be removed from harness authority',()=>{const r=JSON.parse(fs.readFileSync(path.join(candidate,'data/site-pages.json')));r.existing.pop();fs.writeFileSync(path.join(candidate,'data/site-pages.json'),JSON.stringify(r));assert.throws(()=>inventory(candidate),e=>e.code==='PAGE_REGISTRY');});
  test('extra private file in managed route refused',()=>{apply([op(pageSpec())]);fs.writeFileSync(path.join(candidate,'community-note/private.json'),'{}');assert.throws(()=>assertCandidateShape(candidate),e=>e.code==='PRIVATE_ASSET');});
  test('tampered shell/output remains read-only',()=>{fs.appendFileSync(path.join(candidate,'tools/pages/partials/header.html'),'tamper');assert.equal(readPages(candidate,consumer.pages).readOnly,true);});
  test('unsupported consumer remains read-only',()=>assert.equal(readPages(candidate,{protocolVersion:1,capabilities:[]}).state,'ADMIN_UPDATE_REQUIRED'));
  test('missing page consumer cannot read or project enabled pages',()=>{assert.equal(readPages(candidate).state,'ADMIN_UPDATE_REQUIRED');const input=requestFor(baseline,[op(pageSpec())]);assert.throws(()=>plan(candidate,baseline,input.identity,input.request,{...consumer,pages:undefined}),e=>e.code==='ADMIN_UPDATE_REQUIRED');});
  test('private settings cannot widen route/attribute capabilities',()=>{const settings={origin:'http://127.0.0.1:54321',sessionId:'session_identifier_123',documentId:'document_identifier_123',candidateSha256:'A'.repeat(64)};for(const extra of [{routes:['/']},{attribute:'id'},{targets:[]}])assert.throws(()=>previewBridge({...settings,...extra},[]),e=>e.code==='PREVIEW_IDENTITY');});
  test('stored Blank hero cannot silently hide unused authored values',()=>refuse('PAGE_HERO',p=>p.template='blank'));
  test('stale source refuses candidate write',()=>{const input=requestFor(baseline,[op(pageSpec())]);fs.appendFileSync(path.join(candidate,'about/index.html'),'tamper');const before=inventory(candidate);assert.throws(()=>materialise(candidate,baseline,input.identity,input.request,consumer),e=>e.code==='STALE_BASELINE');assert.deepEqual(inventory(candidate),before);});
  test('page ID/slug rename refused',()=>{apply([op(pageSpec())]);remove(baseline);fs.cpSync(candidate,baseline,{recursive:true});const old=loadPages(baseline).registry.pages[0],value={...old,slug:'renamed-page'};assert.throws(()=>requestFor(baseline,[{id:old.id,kind:'setPage',expectedOld:old,value}]),e=>e.code==='PAGE_ROUTE');});
  test('navigation-only output cannot be forged outside typed page projection',()=>{const input=requestFor(baseline,[]);input.request.allowedOutputs=['index.html'];assert.throws(()=>plan(candidate,baseline,input.identity,input.request,consumer),e=>e.code==='OUTPUT_ALLOWLIST');});
  test('linked managed route rejected before snapshot traversal',()=>{apply([op(pageSpec())]);const directory=path.join(candidate,'community-note'),moved=path.join(temporary,'held-page');fs.renameSync(directory,moved);try{fs.symlinkSync(moved,directory,'junction');assert.throws(()=>inventory(candidate),e=>e.code==='SYMLINK');}finally{if(fs.existsSync(directory))fs.unlinkSync(directory);fs.renameSync(moved,directory);}});
  test('tampered managed metadata remains unverified',()=>{apply([op(pageSpec())]);const file=path.join(candidate,'community-note/index.html');fs.writeFileSync(file,fs.readFileSync(file,'utf8').replace('Community Note | KrispyKP','Unrequested title'));assert.equal(readPages(candidate,consumer.pages).readOnly,true);});
  test('new-route whitespace gate accepts new bytes and rejects real trailing whitespace',()=>{apply([op(pageSpec())]);const scope={files:['community-note/index.html'],pages:[],extras:[]};let result=createResult('standard',scope);validateSnapshotDiff(candidate,baseline,scope,result);assert.equal(result.status,'PASS');fs.appendFileSync(path.join(candidate,'community-note/index.html'),'bad space \n');result=createResult('standard',scope);validateSnapshotDiff(candidate,baseline,scope,result);assert.equal(result.status,'FAIL');});
  test('actual shell rebuild propagates central change to all old and new routes',()=>{apply([op(pageSpec())]);const file=path.join(candidate,'tools/pages/partials/header.html');fs.writeFileSync(file,fs.readFileSync(file,'utf8').replace('brand-mark">KrispyKP','brand-mark">KrispyKP fixture'));assert.equal(build(candidate).status,'STALE');const before=loadPages(baseline).registry.existing.map(r=>[r.file,segments(fs.readFileSync(path.join(candidate,r.file),'utf8')).body]);assert.equal(build(candidate,{write:true}).outputs.filter(f=>f.endsWith('index.html')).length,8);assert.equal(loadPages(candidate).state,'COMPATIBLE');for(const [name,body] of before)assert.equal(segments(fs.readFileSync(path.join(candidate,name),'utf8')).body,body);assert.equal(build(candidate).status,'CURRENT');});
  test('Website global shell change propagates to existing and created pages without body edits',()=>{apply([op(pageSpec())]);const r=loadPages(candidate).registry,t=partials(candidate);t.header=t.header.replace('brand-mark">KrispyKP','brand-mark">KrispyKP fixture');for(const route of r.existing){const s=fs.readFileSync(path.join(candidate,route.file),'utf8'),next=patchShell(s,shell(r,route.route,t));assert.equal(segments(next).body,segments(s).body);assert.ok(next.includes('KrispyKP fixture'));}assert.ok(pageDocument(r.pages[0],r,candidate,t).includes('KrispyKP fixture'));});
  console.log('PAGES PASS — '+count+' projection/refusal/preservation cases');
}finally{assert.ok(temporary.startsWith(path.resolve(os.tmpdir())+path.sep));fs.rmSync(temporary,{recursive:true,force:true});}
