import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { inventory,safeFile,snapshot,sha,requireThat,privateOutput } from '../management/files.mjs';
import { read,capabilities } from '../management/contract.mjs';
import { plan,materialise } from '../management/materialise.mjs';
import { validateCandidate } from '../management/validate.mjs';
import { readLayout,layoutCapabilities,layoutPaths,gridId,cardIds } from './contract.mjs';

export async function createLayoutReview(source,output,profile='acceptance'){
  output=path.dirname(privateOutput(path.join(output,'fixture.json'),[source]));requireThat(fs.readdirSync(output).length===0,'FIXTURE','Review output must be empty and private.');
  const baseline=path.join(output,'baseline'),candidate=path.join(output,'candidate');fs.mkdirSync(baseline);fs.mkdirSync(candidate);
  for(const file of inventory(source))for(const root of [baseline,candidate]){const dest=path.join(root,file.path);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.copyFileSync(safeFile(source,file.path),dest);}
  const identity=snapshot(baseline,'D1-private-layout-review'),consumer={protocolVersion:1,capabilities,layout:{protocolVersion:1,capabilities:layoutCapabilities}},content=read(baseline,consumer),layout=readLayout(baseline,consumer.layout);
  requireThat(layout.state==='COMPATIBLE','FIXTURE','Initial layout fixture is not compatible.');
  const title=content.bindings.find(b=>b.id==='about.hero.title');
  const operations=[{id:title.id,kind:'setText',expectedOld:title.value,value:'The KrispyKP Hub — private layout review'}];
  const layoutOperations=[{id:'about.page',kind:'setOrder',expectedOld:layout.layoutState.orders['about.page'],value:['about.purpose-section','about.overview-section','about.features-section','about.platforms-section']},{id:gridId,kind:'setOrder',expectedOld:cardIds,value:[...cardIds].reverse()},{id:gridId,kind:'setGrid',expectedOld:null,value:{profile:'wide',columns:3,alignment:'stretch'}},{id:cardIds[0],kind:'setSpan',expectedOld:null,value:{profile:'wide',span:2}},{id:gridId,kind:'setGrid',expectedOld:null,value:{profile:'medium',columns:2,alignment:'start'}}];
  const request={schemaVersion:1,baselineSha256:identity.sha256,contractSha256:content.contractSha256,layoutContractSha256:layout.layoutContractSha256,expectedFiles:Object.fromEntries([layoutPaths.source,layoutPaths.state,layoutPaths.style].map(file=>[file,sha(fs.readFileSync(safeFile(baseline,file)))])),operations,layoutOperations};
  request.allowedOutputs=plan(candidate,baseline,identity,request,consumer).outputs;
  const save=(file,data)=>fs.writeFileSync(path.join(output,file),JSON.stringify(data,null,2)+'\n');
  save('identity.json',identity);save('consumer.json',consumer);save('content-read.json',content);save('layout-read.json',layout);save('request.json',request);save('changed-files.json',request.allowedOutputs);save('materialise.json',materialise(candidate,baseline,identity,request,consumer));
  save('layout-after.json',readLayout(candidate,consumer.layout));const validation=await validateCandidate({root:candidate,baseline,identity,request,consumer,changed:request.allowedOutputs,profile});save('validation.json',validation);save('fixture.json',{schemaVersion:1,status:validation.status,withoutGit:true,base:'7863940a218ef23adffb7d5e212018302e1f3a81',changedFiles:request.allowedOutputs});console.log(JSON.stringify({status:validation.status,checks:validation.checks,failures:validation.failures}));return validation;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){requireThat(process.argv[2],'ARGUMENT','Private review directory required.');const source=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');const result=await createLayoutReview(source,process.argv[2],process.argv[3]||'acceptance');process.exitCode=result.status==='PASS'?0:1;}
