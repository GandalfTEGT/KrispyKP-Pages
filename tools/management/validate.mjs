import fs from 'node:fs';
import { isDeepStrictEqual } from 'node:util';
import { safeRoot, safeFile, verifySnapshot, inventory, changedFiles, requireThat, sha, separateRoots, assertCandidateShape } from './files.mjs';
import { plan } from './materialise.mjs';
import {mediaReceipt} from '../media/model.mjs';
import { usages } from './media.mjs';
import { detectScope } from '../validation-common.mjs';
import { runStaticValidation } from '../validate-static.mjs';
import { runBrowserValidation } from '../validate-browser.mjs';

// These are trusted Website entry points. No source manifest selects executable code.
export async function validateCandidate({root, baseline, identity, request, consumer, changed, profile='standard'}) {
  root=safeRoot(root);baseline=safeRoot(baseline);
  separateRoots(root,baseline);assertCandidateShape(root);
  requireThat(['standard','acceptance'].includes(profile),'PROFILE','Snapshot validation requires standard or acceptance.');
  verifySnapshot(baseline,identity,request.baselineSha256);
  const before=inventory(root);
  const actual=changedFiles(identity.files,before);
  const mediaImpact=actual.filter(file=>/\.(png|jpg|jpeg|webp|svg)$/i.test(file)).map(file=>({path:file,affectedUsages:usages(root,before,file)}));
  requireThat(Array.isArray(changed) && new Set(changed).size===changed.length && isDeepStrictEqual([...changed].sort(),actual),'CHANGED_SCOPE','Explicit changed-file scope differs from candidate bytes.');
  const expected=plan(baseline,baseline,identity,request,consumer);
  try{
    requireThat(Array.isArray(request.allowedOutputs) && isDeepStrictEqual(actual,expected.outputs),'PRESERVATION','Candidate changes exceed the exact deterministic operation outputs.');
    for(const file of expected.outputs)requireThat(fs.readFileSync(safeFile(root,file)).equals(expected.files.get(file)),'PRESERVATION','Candidate does not equal deterministic materialisation.',file);
  }catch(error){error.mediaImpact=mediaImpact;throw error;}
  const scope=detectScope({root,base:'snapshot',files:actual});
  // Every included tool/config byte outside the declared output set is unchanged.
  const staticResult=runStaticValidation({root,profile,scope,snapshotBaseline:baseline});
  const browserResult=await runBrowserValidation({root,profile,scope,screenshots:false});
  requireThat(isDeepStrictEqual(before,inventory(root)),'VALIDATION_MUTATION','Candidate bytes changed during validation.');
  verifySnapshot(baseline,identity,request.baselineSha256);
  const results=[staticResult,browserResult];
  return {schemaVersion:1,status:results.every(r=>r.status==='PASS')?'PASS':'FAIL',profile,baselineSha256:identity.sha256,contractSha256:expected.contractSha256,layoutContractSha256:expected.layoutContractSha256,requestSha256:sha(JSON.stringify(request)),consumerSha256:sha(JSON.stringify(consumer)),layoutImpact:expected.layoutImpact,pageImpact:expected.pageImpact,pagesContractSha256:expected.pagesContractSha256,shellSha256:expected.shellSha256,changedFiles:actual,
    structuredImpact:expected.structuredImpact,structuredContractSha256:expected.structuredContractSha256,structuredStateSha256:expected.structuredStateSha256,structuredSourceHashes:expected.structuredSourceHashes,candidateSha256:sha(JSON.stringify(before)),mediaImpact:[...expected.mediaImpact,...mediaImpact],...mediaReceipt(expected),preservation:'PASS',
    repositoryGates:{status:'NOT_RUN',reason:'Snapshot validation does not establish branch ancestry, remote tip, integration or publication.'},
    checks:results.reduce((n,r)=>n+r.checks.length,0),failures:results.flatMap(r=>r.failures),manual:[...new Set(results.flatMap(r=>r.manual))],results};
}
