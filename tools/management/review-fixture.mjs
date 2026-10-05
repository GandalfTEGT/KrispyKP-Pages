import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { inventory, snapshot, safeFile, sha, requireThat, privateOutput } from './files.mjs';
import { read, capabilities } from './contract.mjs';
import { plan, materialise } from './materialise.mjs';
import { validateCandidate } from './validate.mjs';

// A generated 64px RGB PNG avoids external uploads and contains no private metadata.
function examplePng(){
  function chunk(type,data){const body=Buffer.concat([Buffer.from(type),data]);let crc=0xffffffff;for(const byte of body){crc^=byte;for(let i=0;i<8;i++)crc=crc&1?0xedb88320^(crc>>>1):crc>>>1;}const header=Buffer.alloc(4),tail=Buffer.alloc(4);header.writeUInt32BE(data.length);tail.writeUInt32BE((crc^0xffffffff)>>>0);return Buffer.concat([header,body,tail]);}
  const header=Buffer.alloc(13);header.writeUInt32BE(64,0);header.writeUInt32BE(64,4);header[8]=8;header[9]=2;
  const pixels=Buffer.alloc(64*(64*3+1));for(let y=0;y<64;y++)for(let x=0;x<64;x++){const p=y*193+x*3+1;pixels[p]=30;pixels[p+1]=160;pixels[p+2]=180;}
  return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',header),chunk('IDAT',zlib.deflateSync(pixels)),chunk('IEND',Buffer.alloc(0))]);
}
export async function createReview(source,output,profile='standard'){
  const guard=privateOutput(path.join(output,'fixture.json'),[source]);output=path.dirname(guard);
  requireThat(fs.readdirSync(output).length===0,'FIXTURE','Review output must be an empty private directory.');
  const baseline=path.join(output,'baseline'),candidate=path.join(output,'candidate');fs.mkdirSync(baseline);fs.mkdirSync(candidate);
  for(const file of inventory(source))for(const root of [baseline,candidate]){const destination=path.join(root,file.path);fs.mkdirSync(path.dirname(destination),{recursive:true});fs.copyFileSync(safeFile(source,file.path),destination);}
  const identity=snapshot(baseline,'Website-B-owner-review');const consumer={protocolVersion:1,capabilities};const state=read(baseline,consumer);
  const changes=[['about.hero.title','setText','The KrispyKP Hub — private owner review'],['home.hero.summary','setText','Private draft review: gaming, community & creative projects.'],['home.hero.twitch','setLink',{text:'Owner review link',href:'https://www.twitch.tv/krispykp'}],['home.hero.image','replaceImage',{alt:'Private review square image',mode:'selected-use',fit:'intrinsic',focal:'none',pngBase64:examplePng().toString('base64')}]];
  const operations=changes.map(([id,kind,value])=>({id,kind,value,expectedOld:state.bindings.find(b=>b.id===id).value}));
  const expectedFiles={};for(const op of operations){const binding=state.bindings.find(b=>b.id===op.id);expectedFiles[binding.file]=sha(fs.readFileSync(safeFile(baseline,binding.file)));}
  const request={schemaVersion:1,baselineSha256:identity.sha256,contractSha256:state.contractSha256,expectedFiles,operations};
  request.allowedOutputs=plan(baseline,baseline,identity,request,consumer).outputs;
  const save=(file,data)=>fs.writeFileSync(path.join(output,file),JSON.stringify(data,null,2)+'\n');
  save('identity.json',identity);save('consumer.json',consumer);save('read.json',state);save('request.json',request);save('changed-files.json',request.allowedOutputs);
  save('materialise.json',materialise(candidate,baseline,identity,request,consumer));
  const result=await validateCandidate({root:candidate,baseline,identity,request,consumer,changed:request.allowedOutputs,profile});save('validation.json',result);
  save('fixture.json',{schemaVersion:1,profile,status:result.status,baselineSha256:identity.sha256,contractSha256:state.contractSha256,outputs:request.allowedOutputs,hasGitCheckout:false});
  console.log(JSON.stringify({status:result.status,checks:result.checks,failures:result.failures}));return result;
}
if(process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const output=process.argv[2];requireThat(output,'ARGUMENT','Usage: node tools/management/review-fixture.mjs <empty-private-output-dir> [standard|acceptance]');
  const source=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
  const result=await createReview(source,output,process.argv[3]||'standard');process.exitCode=result.status==='PASS'?0:1;
}
