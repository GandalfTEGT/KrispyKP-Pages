import fs from 'node:fs';
import { requireThat, safeFile, sha, json, inventory, changedFiles } from './files.mjs';
import { nodes, valueOf, relevantMapping } from './html.mjs';

export const capabilities=['content.text.v1','content.link.v1','media.png-selected-use.v1','source.html-leaf.v1','snapshot.validation.v1'];
export const contractPath='data/site-management.json';
const outputs=['about/index.html','index.html'];
export function loadContract(root){
  const bytes=fs.readFileSync(safeFile(root,contractPath));let contract;
  requireThat(bytes.length<=262144,'MAPPING','Management contract exceeds its bounded size.');
  try{contract=JSON.parse(bytes.toString('utf8'));}catch{requireThat(false,'MAPPING','Management contract JSON is malformed.');}
  requireThat(contract && contract.siteId==='krispykp','MAPPING','Missing or unknown site identity.');
  requireThat(contract.schemaVersion===1 && contract.protocolVersion===1,'ADMIN_UPDATE_REQUIRED','Required contract schema/protocol is unsupported.');
  requireThat(contract.adapter==='html-leaf-v1' && contract.renderAttribute==='data-kkp-manage-id','ADMIN_UPDATE_REQUIRED','Required source/render adapter is unsupported.');
  requireThat(Array.isArray(contract.requiredCapabilities) && contract.requiredCapabilities.every(c=>typeof c==='string') && new Set(contract.requiredCapabilities).size===contract.requiredCapabilities.length,'MAPPING','Required capabilities must be unique strings.');
  requireThat(capabilities.every(c=>contract.requiredCapabilities.includes(c)),'MAPPING','Contract omits mandatory semantics.');
  requireThat(contract.requiredCapabilities.every(c=>capabilities.includes(c)),'ADMIN_UPDATE_REQUIRED','Website adapter does not implement a required capability.');
  requireThat(Array.isArray(contract.bindings) && contract.bindings.length>0 && contract.bindings.length<=40,'MAPPING','Expected a bounded nonempty binding map.');
  requireThat(Array.isArray(contract.outputFiles) && new Set(contract.outputFiles).size===contract.outputFiles.length && json([...contract.outputFiles].sort())===json(outputs),'MAPPING','Managed source output allowlist differs from supported files.');
  requireThat(json(contract.renderOnlyFiles)===json(['styles/about.css','styles/home.css']),'MAPPING','Render-only drift declarations differ from supported files.');
  const seen=new Set();const sources=new Map(outputs.map(file=>[file,fs.readFileSync(safeFile(root,file),'utf8')]));
  const maps=new Map(outputs.map(file=>[file,nodes(sources.get(file))]));const bindings=[];
  for(const binding of contract.bindings){
    requireThat(binding && typeof binding.id==='string' && /^(?:about|home)\.[a-z0-9.]+$/.test(binding.id) && !seen.has(binding.id),'MAPPING','Binding IDs must be stable, scoped and unique.');seen.add(binding.id);
    requireThat(outputs.includes(binding.file) && binding.route===(binding.file==='index.html'?'/':'/about/') && ['text','link','image'].includes(binding.kind),'MAPPING','Unsupported binding file, route or type.',binding.id);
    requireThat(typeof binding.label==='string' && binding.label.length>0 && binding.label.length<=120,'MAPPING','Binding requires a bounded owner label.',binding.id);
    const found=maps.get(binding.file).filter(node=>node.id===binding.id);
    requireThat(found.length===1 && found[0].tag===binding.tag,'MAPPING','Missing, duplicate or disagreeing source/render binding.',binding.id);
    const node=found[0];const source=sources.get(binding.file);
    requireThat(node.start>source.indexOf('<main') && node.end<source.indexOf('</main>'),'MAPPING','Managed binding must be in page body main.',binding.id);
    if(binding.kind==='image'){
      const policy=binding.media;
      requireThat(binding.id==='home.hero.image' && binding.tag==='img' && policy?.mime==='image/png' && policy.maxBytes===1048576 && policy.minDimension===64 && policy.maxDimension===2048 && policy.aspect==='1:1' && policy.alt==='required' && policy.fit==='intrinsic' && policy.focal==='none' && policy.replacement==='selected-use-only' && policy.outputPrefix==='assets/managed/','ADMIN_UPDATE_REQUIRED','Unsupported media/crop/layout semantics require contract/consumer review.',binding.id);
      requireThat(node.attributes.width?.value==='300' && node.attributes.height?.value==='300' && node.attributes.src?.value?.startsWith('/') && typeof node.attributes.alt?.value==='string','MAPPING','Managed image intrinsic mapping changed.',binding.id);
    }else{
      requireThat(Number.isInteger(binding.maxLength) && binding.maxLength>0 && binding.maxLength<=1200,'MAPPING','Text/link requires bounded length.',binding.id);
      requireThat(binding.kind==='link'?binding.tag==='a':['h1','h2','h3','p','span','blockquote'].includes(binding.tag),'MAPPING','Unsupported leaf tag.',binding.id);
      if(binding.kind==='link')requireThat(node.attributes.href?.quote && node.attributes.target?.value==='_blank' && node.attributes.rel?.value==='noopener noreferrer','MAPPING','Link safety/target mapping changed.',binding.id);
    }
    bindings.push({...binding,value:valueOf(node,binding.kind),mappingSha256:relevantMapping(node,binding)});
  }
  for(const [file,list] of maps)for(const node of list)requireThat(seen.has(node.id) && contract.bindings.find(b=>b.id===node.id)?.file===file,'MAPPING','Undeclared management attribute is not an editing permission.',node.id);
  return {contract,contractSha256:sha(bytes),managedFingerprint:sha(json(contract.bindings)),rendererFingerprint:sha(json(bindings.map(b=>({id:b.id,mapping:b.mappingSha256})))),bindings};
}
export function read(root,consumer,previous=null){
  try{
    const loaded=loadContract(root);
    requireThat(consumer?.protocolVersion===1 && Array.isArray(consumer.capabilities),'ADMIN_UPDATE_REQUIRED','Consumer must declare protocol/capability support.');
    const missing=loaded.contract.requiredCapabilities.filter(c=>!consumer.capabilities.includes(c));
    requireThat(missing.length===0,'ADMIN_UPDATE_REQUIRED',`Unsupported required capabilities: ${missing.join(', ')}.`);
    let state='COMPATIBLE';let drift=[];
    if(previous){
      requireThat(previous.schemaVersion===1 && Array.isArray(previous.files),'IDENTITY','Malformed comparison snapshot.');
      requireThat(sha(json({schemaVersion:1,sourceId:previous.sourceId,files:previous.files}))===previous.sha256,'IDENTITY','Comparison snapshot digest is invalid.');
      drift=changedFiles(previous.files,inventory(root));
      if(drift.length){
        requireThat(drift.every(file=>loaded.contract.renderOnlyFiles.includes(file)),'UNKNOWN_DRIFT','Changed sources are not declared render-only; use a new verified draft/review.');
        state='COMPATIBLE_UNMANAGED';
      }
    }
    return {state,readOnly:state!=='COMPATIBLE',requiresNewSnapshot:drift.length>0,requiresCandidateValidation:true,drift,...loaded};
  }catch(error){return {state:error.code==='ADMIN_UPDATE_REQUIRED'?'ADMIN_UPDATE_REQUIRED':'UNVERIFIED',readOnly:true,diagnostics:[{severity:'blocking',code:error.code||'MAPPING',field:error.field||null,message:error.message}]};}
}
