import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { chromium } from 'playwright-core';
import { createStaticServer } from '../validate-browser.mjs';
import { findChromiumExecutable } from '../validation-common.mjs';
import { inventory,sha,privateOutput,safeRoot } from '../management/files.mjs';
import { loadLayout,layoutCapabilities,cardIds } from './contract.mjs';
import { previewBridge } from './bridge.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..'),baseline=safeRoot(process.argv[2]);
const output=privateOutput(process.argv[3],[root,baseline]),host=await createStaticServer(root),previous=await createStaticServer(baseline),before=inventory(root);
let browser;const results=[];
const record=name=>{results.push({name,status:'PASS'});console.log('PASS '+name);};
try{
  browser=await chromium.launch({executablePath:findChromiumExecutable(),headless:true});
  const context=await browser.newContext({viewport:{width:1440,height:900},reducedMotion:'reduce',deviceScaleFactor:1.5});
  await context.route('**/*',r=>[host.baseUrl,previous.baseUrl].some(url=>r.request().url().startsWith(url))?r.continue():r.abort());
  const page=await context.newPage(),oldPage=await context.newPage();
  await page.goto(host.baseUrl+'/about/',{waitUntil:'networkidle'});await oldPage.goto(previous.baseUrl+'/about/',{waitUntil:'networkidle'});
  const measurements=p=>p.evaluate(()=>({heading:document.querySelector('h1').textContent,sections:[...document.querySelector('main').children].map(n=>{const r=n.getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height};}),cards:[...document.querySelectorAll('.about-mini')].map(n=>{const r=n.getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height};}),links:[...document.querySelectorAll('main a')].map(n=>n.getAttribute('href'))}));
  for(const width of [320,390,699,700,701,979,980,981,1440]){
    await page.bringToFront();await page.setViewportSize({width,height:900});await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));const current=await measurements(page);
    await oldPage.bringToFront();await oldPage.setViewportSize({width,height:900});await oldPage.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));assert.deepEqual(current,await measurements(oldPage),`${width}px original appearance`);
  }
  record('default About rendered geometry/text/links match approved B at nine widths');
  await oldPage.close();await page.setViewportSize({width:1440,height:900});
  await page.evaluate(()=>{window.__layoutMessages=[];window.chrome=window.chrome||{};window.chrome.webview={postMessage:message=>window.__layoutMessages.push(message)};});
  const bindings=loadLayout(root,{protocolVersion:1,capabilities:layoutCapabilities}).bindings;
  const identity={origin:host.baseUrl,sessionId:'session_test_00000001',documentId:'document_test_00000001',candidateSha256:sha(JSON.stringify(before))};
  const script=previewBridge(identity,bindings).script;await page.evaluate(script);
  assert.equal(await page.locator('[data-kkp-private-overlay]').count(),1);assert.equal(await page.evaluate(()=>__layoutMessages[0].kind),'bridgeReady');
  const command=async request=>page.evaluate(request=>window.__kkpLayoutBridgeV1.command(request),{...identity,...request});
  assert.equal(await command({kind:'mode',mode:'edit',sessionId:'wrong_session_0001'}),false);assert.equal(await command({kind:'mode',mode:'edit',documentId:'wrong_document_0001'}),false);assert.equal(await command({kind:'mode',mode:'edit',candidateSha256:'0'.repeat(64)}),false);
  assert.equal(await command({kind:'mode',mode:'edit'}),true);record('stale session/document/candidate commands refused');
  await page.locator(`[data-kkp-layout-id="${cardIds[0]}"]`).click();
  let event=await page.evaluate(()=>__layoutMessages.at(-1));assert.equal(event.id,cardIds[0]);assert.equal(event.locked,false);assert.equal(event.units,'css-px');assert.equal(event.devicePixelRatio,1.5);
  let rect=await page.locator(`[data-kkp-layout-id="${cardIds[0]}"]`).boundingBox();assert.ok(Math.abs(event.rect.y-rect.y)<1);record('actual Website card click produces bounded CSS-pixel selection at simulated 1.5 scale');
  await page.evaluate(()=>scrollBy(0,150));await page.waitForTimeout(80);event=await page.evaluate(()=>__layoutMessages.at(-1));rect=await page.locator(`[data-kkp-layout-id="${cardIds[0]}"]`).boundingBox();assert.ok(Math.abs(event.rect.y-rect.y)<1);
  await page.setViewportSize({width:700,height:900});await page.waitForTimeout(80);event=await page.evaluate(()=>__layoutMessages.at(-1));assert.equal(event.viewport.width,700);record('scroll and profile resize refresh selected geometry');
  await command({kind:'select',id:'about.hero'});event=await page.evaluate(()=>__layoutMessages.at(-1));assert.equal(event.locked,true);assert.ok(event.reason);record('locked hero has an explicit selection reason');
  await page.keyboard.press('ArrowDown');event=await page.evaluate(()=>__layoutMessages.at(-1));assert.equal(event.id,'about.overview-section');await page.keyboard.press('Escape');assert.equal(await page.evaluate(()=>__layoutMessages.at(-1).kind),'selectionCleared');record('keyboard next selection and Escape clear');
  await command({kind:'mode',mode:'interact'});await page.locator('main a[href="/contact/"]').click();await page.waitForURL(host.baseUrl+'/contact/');assert.equal(await page.locator('[data-kkp-private-overlay]').count(),0);record('interaction mode restores Website navigation and old document teardown');
  await page.goto(host.baseUrl+'/about/',{waitUntil:'networkidle'});await page.evaluate(()=>{window.__layoutMessages=[];window.chrome=window.chrome||{};window.chrome.webview={postMessage:m=>__layoutMessages.push(m)};});
  await page.evaluate(script);await page.evaluate(script);assert.equal(await page.locator('[data-kkp-private-overlay]').count(),1);record('reattach detaches prior listeners/overlay without duplicates');
  await command({kind:'mode',mode:'edit'});await command({kind:'select',id:cardIds[0]});
  await page.evaluate(id=>document.querySelector(`[data-kkp-layout-id="${id}"]`).removeAttribute('data-kkp-layout-id'),cardIds[0]);await page.waitForTimeout(80);assert.equal(await page.evaluate(()=>__layoutMessages.at(-1).kind),'selectionInvalidated');record('runtime binding loss invalidates selection');
  await command({kind:'detach'});assert.equal(await page.locator('[data-kkp-private-overlay]').count(),0);assert.equal(await command({kind:'mode',mode:'edit'}),false);record('detached bridge refuses later commands');
  assert.deepEqual(inventory(root),before);record('selection overlays/runtime mutations never change exported source bytes');
  await context.close();fs.writeFileSync(output,JSON.stringify({schemaVersion:1,status:'PASS',results,manual:['Simulated Chromium scale is not native WebView2/OS DPI or physical-device proof.']},null,2)+'\n');
}finally{if(browser)await browser.close();await new Promise(resolve=>host.server.close(resolve));await new Promise(resolve=>previous.server.close(resolve));}
