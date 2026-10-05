import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import assert from 'node:assert/strict';
import { chromium } from 'playwright-core';
import { createStaticServer } from '../validate-browser.mjs';
import { findChromiumExecutable } from '../validation-common.mjs';
import { checkBindings } from './render.mjs';
import { safeRoot, inventory, safeFile } from './files.mjs';

// An independent fresh source with altered CSS must fail even when the map still parses.
const source=safeRoot(process.argv[2]);const fixture=fs.mkdtempSync(path.join(os.tmpdir(),'kkp-management-render-test-'));
let server,browser;
try{
  for(const file of inventory(source)){const target=path.join(fixture,file.path);fs.mkdirSync(path.dirname(target),{recursive:true});fs.copyFileSync(safeFile(source,file.path),target);}
  fs.appendFileSync(path.join(fixture,'styles/home.css'),'\n.hero-logo { object-fit: cover !important; }\n');
  const hosted=await createStaticServer(fixture);server=hosted.server;
  browser=await chromium.launch({executablePath:findChromiumExecutable(),headless:true});
  await assert.rejects(checkBindings(browser,hosted.baseUrl,fixture),error=>/Changed fit/.test(error.message));
  console.log('RENDER NEGATIVE PASS — changed managed-image CSS fit refused');
}finally{if(browser)await browser.close();if(server)await new Promise(resolve=>server.close(resolve));fs.rmSync(fixture,{recursive:true,force:true});}
