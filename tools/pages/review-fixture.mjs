import fs from 'node:fs';
import path from 'node:path';
import {inventory} from '../management/files.mjs';
import {pageSpec,requestFor,copyInventory} from './fixtures.mjs';
import {materialise} from '../management/materialise.mjs';
import {validateCandidate} from '../management/validate.mjs';
import {loadPages} from './contract.mjs';
import {must} from './rules.mjs';

const root=process.cwd(),out=path.resolve(process.argv[2]||''),profile=process.argv[3]||'acceptance';must(process.argv[2]&&(!fs.existsSync(out)||fs.readdirSync(out).length===0),'FIXTURE','Use an empty private review directory.');must(!out.startsWith(root+path.sep),'FIXTURE','Review fixture must stay outside public source.');fs.mkdirSync(out,{recursive:true});const baseline=path.join(out,'baseline'),candidate=path.join(out,'candidate');const files=inventory(root);copyInventory(root,baseline,files);copyInventory(root,candidate,files);
const write=(name,value)=>fs.writeFileSync(path.join(out,name+'.json'),JSON.stringify(value,null,2)+'\n');const ops=[pageSpec(),pageSpec('quiet-page','blank')].map(value=>({id:value.id,kind:'createPage',expectedOld:null,value}));ops[1].value.navigation={header:false,footer:false};
const {identity,request,consumer}=requestFor(baseline,ops,{mixed:true});write('identity',identity);write('request',request);write('consumer',consumer);write('changed-files',request.allowedOutputs);write('read-before',loadPages(baseline,consumer.pages));write('materialise',materialise(candidate,baseline,identity,request,consumer));write('read-after',loadPages(candidate,consumer.pages));const result=await validateCandidate({root:candidate,baseline,identity,request,consumer,changed:request.allowedOutputs,profile});write('validation',result);console.log(JSON.stringify({status:result.status,checks:result.checks,changedFiles:result.changedFiles,failures:result.failures}));process.exitCode=result.status==='PASS'?0:1;
