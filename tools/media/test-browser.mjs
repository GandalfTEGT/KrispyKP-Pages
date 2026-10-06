import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {chromium} from 'playwright-core';
import {createStaticServer} from '../validate-browser.mjs';
import {findChromiumExecutable} from '../validation-common.mjs';
import {checkManagedImage,checkPageFoundation} from '../pages/render.mjs';
import {loadMedia} from './contract.mjs';
import {loadPages} from '../pages/contract.mjs';
import {consumer} from './fixtures.mjs';
import {previewBridge} from '../layout/bridge.mjs';
import {inventory,sha} from '../management/files.mjs';
const root=path.resolve(process.argv[2]),out=path.resolve(process.argv[3]);assert.ok(process.argv[2]&&process.argv[3]&&!out.startsWith(root+path.sep));fs.mkdirSync(out,{recursive:true});
const before=inventory(root),loaded=loadMedia(root,consumer.media),pageMap=loadPages(root).mappings.find(p=>p.id==='page.media-fixture');
const server=await createStaticServer(root),browser=await chromium.launch({executablePath:findChromiumExecutable(),headless:true}),results=[];
try{
  await checkPageFoundation(browser,server.baseUrl,root);
  for(const dpr of [1,1.5,2]){const context=await browser.newContext({deviceScaleFactor:dpr,reducedMotion:'reduce'});await context.route('**/*',r=>r.request().url().startsWith(server.baseUrl)?r.continue():r.abort());const page=await context.newPage();
    try{for(const width of [280,320,390,699,700,701,979,980,981,1024,1440]){
      await page.setViewportSize({width,height:900});await page.goto(server.baseUrl+'/media-fixture/');
      for(const image of await page.locator('main img').all())await checkManagedImage(image);
      const frames=await page.locator('[data-kkp-media-frame]').evaluateAll(nodes=>nodes.map(e=>{const r=e.getBoundingClientRect(),crop=e.firstElementChild,c=crop.getBoundingClientRect(),image=crop.querySelector('img'),i=image.getBoundingClientRect();return {id:e.dataset.kkpMediaFrame,frame:{x:r.x,y:r.y,width:r.width,height:r.height},crop:{x:c.x,y:c.y,width:c.width,height:c.height},image:{x:i.x,y:i.y,width:i.width,height:i.height},overflow:getComputedStyle(e).overflow};}));
      assert.equal(frames.length,2);const first=frames[0],second=frames[1];assert.ok(Math.abs(first.frame.width/first.frame.height-16/9)<0.01);assert.ok(Math.abs(second.frame.width/second.frame.height-3/4)<0.01);assert.equal(first.overflow,'hidden');assert.ok(Math.abs(first.image.width*0.8-first.crop.width)<0.1);assert.ok(Math.abs(first.image.x+first.image.width*0.1-first.crop.x)<0.1);assert.ok(Math.abs(first.image.y+first.image.height*0.1-first.crop.y)<0.1);assert.ok(first.crop.width>=first.frame.width-0.1&&first.crop.height>=first.frame.height-0.1);assert.ok(second.crop.width<=second.frame.width+0.1&&second.crop.height<=second.frame.height+0.1);
      const settings={origin:server.baseUrl,sessionId:'media_session_123456789',documentId:'media_document_12345678',candidateSha256:sha(JSON.stringify(before))},bridge=previewBridge(settings,pageMap.components.map(n=>({...n,operations:['setPage']})),{attribute:'data-kkp-page-id',routes:['/media-fixture/','/media-fixture/index.html']});
      await page.evaluate(()=>{window.mediaMessages=[];window.chrome={webview:{postMessage:v=>window.mediaMessages.push(v)}}});await page.evaluate(bridge.script);
      const selected=first.id;await page.evaluate(({settings,selected})=>{window.__kkpLayoutBridgeV1.command({...settings,kind:'mode',mode:'edit'});window.__kkpLayoutBridgeV1.command({...settings,kind:'select',id:selected})},{settings,selected});const geometry=await page.evaluate(()=>window.mediaMessages.filter(v=>v.kind==='selectionGeometry').at(-1));assert.ok(Math.abs(geometry.rect.width-first.frame.width)<0.1);assert.ok(Math.abs(geometry.rect.height-first.frame.height)<0.1);await page.evaluate(()=>window.__kkpLayoutBridgeV1.detach());assert.equal(await page.locator('[data-kkp-private-overlay]').count(),0);
      if(dpr===1&&[280,390,981,1440].includes(width))await page.screenshot({path:path.join(out,`media-${width}.png`),fullPage:true});
      await page.goto(server.baseUrl+'/');const image=page.locator('[data-kkp-media-id="home.hero.image"]');await checkManagedImage(image);const home=await image.evaluate(e=>e.getBoundingClientRect().width);assert.ok(Math.abs(home-(width<=420?104:width<=700?88:150))<0.1);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);results.push({width,dpr,status:'PASS'});
    }}finally{await context.close();}}
  const context=await browser.newContext();try{const page=await context.newPage();await page.goto(server.baseUrl+'/media-fixture/');const image=page.locator('main img').first();await image.evaluate(e=>{e.style.width='200px';e.style.height='40px'});await assert.rejects(()=>checkManagedImage(image),/preserve intrinsic aspect/);}finally{await context.close();}
  assert.deepEqual(inventory(root),before);fs.writeFileSync(path.join(out,'browser.json'),JSON.stringify({status:'PASS',results,checks:['eleven page foundation thresholds','decoded natural image aspect','crop coordinates','cover and contain frame geometry','selection uses visible frame','Home intrinsic threshold','distortion refusal','byte preservation'],manual:['Native WPF/WebView2 input, true zoom, physical display DPI and assistive technology remain unverified.']},null,2)+'\n');console.log(`MEDIA BROWSER PASS — ${results.length} width/DPR cases plus foundation and distortion refusal`);
}finally{await browser.close();await new Promise(r=>server.server.close(r));}
