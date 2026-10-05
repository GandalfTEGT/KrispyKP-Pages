import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright-core';
import { createStaticServer } from '../validate-browser.mjs';
import { findChromiumExecutable } from '../validation-common.mjs';
import { privateOutput, safeRoot, requireThat } from './files.mjs';

const root=safeRoot(process.argv[2]);const output=process.argv[3];requireThat(output,'ARGUMENT','Explicit private screenshot directory required.');
const executablePath=findChromiumExecutable();requireThat(executablePath,'BROWSER','Chromium is required.');
const {server,baseUrl}=await createStaticServer(root);let browser;
try{
  browser=await chromium.launch({executablePath,headless:true});
  for(const [name,route] of [['home','/'],['about','/about/']])for(const width of [390,980,1440]){
    const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});
    await context.route('**/*',r=>r.request().url().startsWith(baseUrl)?r.continue():r.abort());
    try{const page=await context.newPage();await page.goto(baseUrl+route,{waitUntil:'networkidle'});await page.evaluate(async()=>{for(let y=0;y<document.body.scrollHeight;y+=600){scrollTo(0,y);await new Promise(r=>setTimeout(r,40));}scrollTo(0,0);});await page.screenshot({path:privateOutput(path.join(output,`${name}-${width}.png`),[root]),fullPage:true});}finally{await context.close();}
  }
  console.log('CAPTURE PASS — Home/About at 390, 980, 1440');
}finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
