import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {chromium} from 'playwright-core';
import {createStaticServer} from '../validate-browser.mjs';
import {findChromiumExecutable} from '../validation-common.mjs';
import {inventory,sha} from '../management/files.mjs';
import {materialise} from '../management/materialise.mjs';
import {pageSpec,requestFor,copyInventory} from './fixtures.mjs';
import {checkPageFoundation,checkManagedImage} from './render.mjs';

const root=process.cwd(),out=path.resolve(process.argv[2]||'');
assert.ok(process.argv[2]&&!out.startsWith(root+path.sep)&&(!fs.existsSync(out)||!fs.readdirSync(out).length),'Use an empty private fixture directory outside source');
const baseline=path.join(out,'baseline'),candidate=path.join(out,'candidate'),sourceBefore=inventory(root);
copyInventory(root,baseline,sourceBefore);copyInventory(root,candidate,sourceBefore);
const value=pageSpec('lazy-image-review');value.name='N'.repeat(80);value.navLabel='M'.repeat(40);value.title='T'.repeat(120);value.description='D'.repeat(300);value.hero.title='H'.repeat(80);value.hero.summary='S'.repeat(600);
value.components[0].children[0].text='X'.repeat(160);value.components[0].children[1].text='P'.repeat(2400);value.components[0].children[2].text='C'.repeat(120);
value.components[0].children.push({id:'more-copy',kind:'text',text:'Q'.repeat(2400)},{id:'second-image',kind:'image',src:'/assets/logo.png',alt:'Second lazy image after maximum preceding text'});
const {identity,request,consumer}=requestFor(baseline,[{id:value.id,kind:'createPage',expectedOld:null,value}],{mixed:true});
materialise(candidate,baseline,identity,request,consumer);
for(const [name,data] of Object.entries({identity,request,consumer}))fs.writeFileSync(path.join(out,name+'.json'),JSON.stringify(data,null,2)+'\n');
const before=inventory(candidate),server=await createStaticServer(candidate),browser=await chromium.launch({executablePath:findChromiumExecutable(),headless:true}),results=[];
const pass=name=>{results.push({name,status:'PASS'});console.log('PASS '+name);};
const context=async()=>{const c=await browser.newContext({viewport:{width:280,height:900},reducedMotion:'reduce'});await c.route('**/*',r=>r.request().url().startsWith(server.baseUrl)?r.continue():r.abort());return c;};
try{
  const c=await context();try{const page=await c.newPage();await page.goto(server.baseUrl+'/lazy-image-review/');const images=page.locator('main img');assert.equal(await images.count(),2);for(const image of await images.all())assert.ok(await image.evaluate(e=>e.loading==='lazy'&&e.getBoundingClientRect().top>innerHeight));for(const image of await images.all())await checkManagedImage(image);assert.ok(await images.evaluateAll(nodes=>nodes.every(e=>e.loading==='lazy'&&e.complete&&e.naturalWidth===300)));}finally{await c.close();}pass('two initially offscreen lazy images after maximum legal preceding content decode sequentially at280 without changing lazy loading');
  await checkPageFoundation(browser,server.baseUrl,candidate);pass('maximum-content mixed page passes full acceptance image/geometry gates at all eleven thresholds');
  for(const mode of ['missing','corrupt']){
    const c=await context();try{await c.route('**/assets/logo.png',r=>mode==='missing'?r.fulfill({status:404,body:'missing'}):r.fulfill({status:200,contentType:'image/png',body:Buffer.from('invalid PNG bytes')}));const page=await c.newPage();await page.goto(server.baseUrl+'/lazy-image-review/');await assert.rejects(()=>checkManagedImage(page.locator('main img').first()),/must successfully decode within 5000ms/);}finally{await c.close();}pass(mode+' managed image still refuses acceptance');
  }
  const distorted=await context();try{const page=await distorted.newPage();await page.goto(server.baseUrl+'/lazy-image-review/');const image=page.locator('main img').first();await image.evaluate(e=>{e.style.width='200px';e.style.height='40px';});await assert.rejects(()=>checkManagedImage(image),/preserve intrinsic aspect/);}finally{await distorted.close();}pass('decoded but distorted managed image still refuses acceptance');
  const stalled=await context();try{const page=await stalled.newPage();await page.goto(server.baseUrl+'/lazy-image-review/');const image=page.locator('main img').first();await image.evaluate(e=>{e.decode=()=>new Promise(()=>{});});const start=Date.now();await assert.rejects(()=>checkManagedImage(image),/Image decode deadline exceeded/);assert.ok(Date.now()-start<10000);}finally{await stalled.close();}pass('stalled decode refuses within the bounded deadline');
  assert.deepEqual(inventory(candidate),before);assert.deepEqual(inventory(root),sourceBefore);pass('positive and fault-injected browser checks preserve all source and candidate bytes');
  fs.writeFileSync(path.join(out,'images.json'),JSON.stringify({status:'PASS',results,thresholds:[280,320,390,699,700,701,979,980,981,1024,1440],candidateSha256:sha(JSON.stringify(before)),sourceSha256:sha(JSON.stringify(sourceBefore)),manual:['Headless Chromium checks do not establish native WebView2 DPI/true zoom or subjective/assistive quality.']},null,2)+'\n');
}finally{await browser.close();await new Promise(r=>server.server.close(r));}
