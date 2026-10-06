import fs from 'node:fs';
import {consumer as previous,copyInventory,pageSpec} from '../pages/fixtures.mjs';
import {snapshot,sha,safeFile} from '../management/files.mjs';
import {read} from '../management/contract.mjs';
import {plan} from '../management/materialise.mjs';
import {capabilities} from './model.mjs';
import {loadStructured,expectedFiles} from './project.mjs';
export {copyInventory,pageSpec};
export const consumer={...previous,structured:{protocolVersion:1,capabilities},media:{...previous.media,capabilities:[...previous.media.capabilities,'structured.artwork.v1']}};
export function requestFor(root,operations=[]){const identity=snapshot(root,'Structured private fixture'),content=read(root,consumer),loaded=loadStructured(root,consumer.structured);const request={schemaVersion:1,baselineSha256:identity.sha256,contractSha256:content.contractSha256,operations:[],structuredOperations:operations,structuredContractSha256:loaded.structuredContractSha256,structuredStateSha256:loaded.structuredStateSha256,expectedFiles:operations.length?expectedFiles(root):{}};request.allowedOutputs=plan(root,root,identity,request,consumer).outputs;return {identity,request,consumer};}
export function operation(loaded,kind,key,id,patch){const before=Array.isArray(loaded.values[key])?loaded.values[key].find(r=>r.id===id):loaded.values[key];return {id,kind,expectedOld:before,value:typeof patch==='function'?patch(before):{...before,...patch}};}
export function addHashes(root,request,paths){for(const p of paths)request.expectedFiles[p]=sha(fs.readFileSync(safeFile(root,p)));}
