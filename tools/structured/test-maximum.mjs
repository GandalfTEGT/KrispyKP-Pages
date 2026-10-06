import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import assert from 'node:assert/strict';
import {inventory} from '../management/files.mjs';
import {plan} from '../management/materialise.mjs';
import {copyInventory,requestFor,consumer,operation} from './fixtures.mjs';
import {loadStructured} from './project.mjs';
import {sources} from './model.mjs';
import {maximumSource} from './maximum-fixture.mjs';
import {publicOperations} from './export.mjs';
const root=process.cwd(),before=inventory(root),temporary=fs.mkdtempSync(path.join(os.tmpdir(),'kkp-structured-max-')),target=path.join(temporary,'maximum');let count=0;
const test=(name,fn)=>{fn();count++;console.log('PASS '+name);};
try{
  copyInventory(root,target,before);const maximum=maximumSource(target),loaded=loadStructured(target,consumer.structured);
  test('maximum source:500 tracks/100 playlists/100 categories/200 tabs/5000 videos',()=>{assert.equal(loaded.source.tracks.length,500);assert.equal(loaded.source.playlists.length,100);assert.equal(loaded.source.categories.length,100);assert.equal(loaded.source.tabs.length,200);assert.equal(loaded.source.videos.size,5000);assert.equal(maximum.videoIndex,5000);});
  test('maximum500 typed edits with200-character labels preserve original source/unknown fields',()=>{const ops=loaded.values.tracks.map(t=>operation(loaded,'setTrack','tracks',t.id,{name:'£'.repeat(200)})),bundle=requestFor(target,ops),result=plan(target,target,bundle.identity,bundle.request,consumer);assert.deepEqual(result.outputs,['data/site-structured-content.json','data/site-structured.generated.js']);const state=JSON.parse(result.files.get('data/site-structured-content.json'));assert.equal(state.music.tracks.length,500);assert.equal(loaded.source.tracks[0].unknown.preserved,0);assert.ok(fs.readFileSync(path.join(target,'data/tracks.js'),'utf8').startsWith('/* Original fixture comment preserved. */'));});
  test('aggregate authored output limit refuses individually valid multiline values',()=>{const ops=loaded.values.lyrics.map(t=>operation(loaded,'setLyrics','lyrics',t.id,{lyrics:'x'.repeat(32000)}));assert.throws(()=>requestFor(target,ops),e=>e.code==='STRUCTURED_LIMIT');});
  test('source count just over500 tracks refuses before projection',()=>{const file=path.join(target,'data/tracks.js'),old=fs.readFileSync(file);try{const list=[...maximum.tracks,{...maximum.tracks[0],id:'fixture-track-over'}];fs.writeFileSync(file,'window.KRISPY_TRACKS = '+JSON.stringify(list)+';\nwindow.KRISPY_PLAYLISTS = '+JSON.stringify(maximum.playlists)+';\n');assert.throws(()=>sources(target),e=>e.code==='STRUCTURED_LIMIT');}finally{fs.writeFileSync(file,old);}});
  test('private-before-public typed projection omits private text, identifiers and media import bytes',()=>{const publicOp=operation(loaded,'setTrack','tracks',loaded.values.tracks[0].id,{name:'Public maximum fixture'}),journal=[{scope:'private',operation:{id:'PRIVATE-ID-MARKER',kind:'setLyrics',value:{lyrics:'PRIVATE-LYRICS-MARKER'}}},{scope:'private',operation:{id:'PRIVATE-ART-MARKER',kind:'importAsset',value:{base64:'PRIVATE-BYTES-MARKER'}}},{scope:'public',operation:publicOp}],ops=publicOperations(journal);assert.deepEqual(ops,[publicOp]);const bundle=requestFor(target,ops),result=plan(target,target,bundle.identity,bundle.request,consumer);for(const bytes of result.files.values())assert.equal(bytes.includes(Buffer.from('PRIVATE-')),false);assert.equal(JSON.stringify(bundle.request).includes('PRIVATE-'),false);assert.equal(journal.length,3);assert.throws(()=>publicOperations([{scope:'unknown',operation:{}}]),e=>e.code==='STRUCTURED_PRIVACY');});
  if(process.env.KKP_STRUCTURED_MAX_ROOT){const out=path.resolve(process.env.KKP_STRUCTURED_MAX_ROOT);assert.ok(!fs.existsSync(out));copyInventory(target,out,inventory(target));}
  test('original source remains immutable',()=>assert.deepEqual(inventory(root),before));
  console.log(`STRUCTURED MAXIMUM PASS — ${count} resource, privacy and preservation groups`);
}finally{assert.ok(temporary.startsWith(path.resolve(os.tmpdir())+path.sep));fs.rmSync(temporary,{recursive:true,force:true});}
