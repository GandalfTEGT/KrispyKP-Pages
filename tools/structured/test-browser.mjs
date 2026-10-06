import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {chromium} from 'playwright-core';
import {createStaticServer} from '../validate-browser.mjs';
import {findChromiumExecutable} from '../validation-common.mjs';
import {inventory,sha} from '../management/files.mjs';
import {consumer} from './fixtures.mjs';
import {loadStructured} from './project.mjs';
import {structuredBridge} from './bridge.mjs';
import {checkManagedImage} from '../pages/render.mjs';
const root=path.resolve(process.argv[2]),out=path.resolve(process.argv[3]);assert.ok(process.argv[2]&&process.argv[3]&&!out.startsWith(root+path.sep));fs.mkdirSync(out,{recursive:true});
const before=inventory(root),loaded=loadStructured(root,consumer.structured),candidateSha256=sha(JSON.stringify(before)),server=await createStaticServer(root),browser=await chromium.launch({executablePath:findChromiumExecutable(),headless:true}),results=[];
try{
  for(const dpr of [1,1.5,2]){const context=await browser.newContext({deviceScaleFactor:dpr,reducedMotion:'reduce'});await context.route('**/*',r=>r.request().url().startsWith(server.baseUrl)?r.continue():r.abort());const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
    try{for(const width of [280,320,390,699,700,701,979,980,981,1024,1440]){
      await page.setViewportSize({width,height:900});
      await page.goto(server.baseUrl+'/music/?track=surplus');await page.waitForFunction(()=>document.querySelector('#playerArt')?.dataset.artState!=='loading');
      assert.equal(await page.locator('#playerSong').textContent(),'Structured £ fixture');assert.equal(await page.locator('#audio').evaluate(a=>a.paused),true);assert.equal(await page.locator('#lyricsCopy').textContent(),'First line\n\nSecond £ line');
      for(const image of await page.locator('img[data-kkp-media-id="track.surplus"]').all())await checkManagedImage(image);
      const frame=page.locator('#playerArt [data-kkp-media-frame="track.surplus"]');const bounds=await frame.evaluate(e=>{const r=e.getBoundingClientRect(),crop=e.firstElementChild,c=crop.getBoundingClientRect(),img=crop.firstElementChild,i=img.getBoundingClientRect();return {w:r.width,h:r.height,cw:c.width,ch:c.height,iw:i.width,ih:i.height,alt:img.alt,overflow:getComputedStyle(e).overflow};});assert.ok(Math.abs(bounds.w/bounds.h-1)<0.01);assert.equal(bounds.alt,'Structured surplus artwork');assert.equal(bounds.overflow,'hidden');assert.ok(Math.abs(bounds.iw*0.9-bounds.cw)<0.1&&Math.abs(bounds.ih*0.9-bounds.ch)<0.1);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
      const settings={origin:server.baseUrl,sessionId:'structured_session_123456',documentId:'structured_document_123456',candidateSha256},bridge=structuredBridge(root,settings,consumer.structured);
      await page.evaluate(()=>{window.structuredMessages=[];window.chrome={webview:{postMessage:value=>window.structuredMessages.push(value)}}});await page.evaluate(bridge.script);
      assert.equal(await page.evaluate(settings=>window.__kkpLayoutBridgeV1.command({...settings,sessionId:'wrong',kind:'mode',mode:'edit'}),settings),false);
      await page.evaluate(settings=>window.__kkpLayoutBridgeV1.command({...settings,kind:'mode',mode:'edit'}),settings);await page.evaluate(settings=>window.__kkpLayoutBridgeV1.command({...settings,kind:'select',id:'music.track.surplus'}),settings);const selected=await page.evaluate(()=>window.structuredMessages.filter(v=>v.kind==='selectionGeometry').at(-1));assert.equal(selected.id,'music.track.surplus');assert.ok(selected.rect.width>0);assert.equal(selected.devicePixelRatio,dpr);await page.keyboard.press('Escape');assert.equal(await page.evaluate(()=>window.structuredMessages.at(-1).kind),'selectionCleared');await page.evaluate(()=>window.__kkpLayoutBridgeV1.detach());assert.equal(await page.locator('[data-kkp-private-overlay]').count(),0);
      if(dpr===1&&[320,390,980,1440].includes(width))await page.screenshot({path:path.join(out,`music-${width}.png`),fullPage:true});results.push({route:'music',width,dpr,status:'PASS'});
      await page.goto(server.baseUrl+'/videos/');await page.locator('#videoCategorySelect').evaluate(select=>{select.value='tiberian-dawn';select.dispatchEvent(new Event('change',{bubbles:true}));});assert.equal(await page.locator('#videoCategorySelect option:checked').textContent(),'Structured Tiberian Dawn');assert.equal(await page.locator('.videos-subtab').first().textContent(),'Curated Ladder');const videos=await page.evaluate(()=>window.KRISPY_VIDEO_DATA);const target=videos.categories.flatMap(c=>c.subTabs).flatMap(t=>t.items).find(v=>v.title==='Structured Video fixture');assert.ok(target);await page.goto(server.baseUrl+'/videos/?video='+target.videoId);assert.equal(await page.locator('#videosPlayerTitle').textContent(),'Structured Video fixture');assert.equal(await page.locator('#videosPlayerNote').textContent(),'Private candidate fixture');assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);if(dpr===1&&[320,390,980,1440].includes(width))await page.screenshot({path:path.join(out,`videos-${width}.png`),fullPage:true});results.push({route:'videos',width,dpr,status:'PASS'});
      await page.goto(server.baseUrl+'/');assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);assert.equal(await page.evaluate(()=>window.KRISPY_TRACKS.find(t=>t.id==='surplus').name),'Structured £ fixture');for(const image of await page.locator('img[data-kkp-media-id]').all())await checkManagedImage(image);if(dpr===1&&[320,390,980,1440].includes(width))await page.screenshot({path:path.join(out,`home-${width}.png`),fullPage:true});results.push({route:'home',width,dpr,status:'PASS'});
    }
    assert.deepEqual(errors,[]);
    }finally{await context.close();}
  }
  assert.deepEqual(inventory(root),before);fs.writeFileSync(path.join(out,'browser.json'),JSON.stringify({status:'PASS',candidateSha256,cases:results,sourcePreservation:'PASS',manual:['Native WPF/WebView2, physical DPI/touch, true zoom, assistive technology, subjective audio/visual quality and external service delivery remain unverified.']},null,2)+'\n');console.log(`STRUCTURED BROWSER PASS — ${results.length} route/width/DPR cases with real decoded artwork, lyrics, deep links and private bridge lifecycle`);
}finally{await browser.close();await new Promise(resolve=>server.server.close(resolve));}
