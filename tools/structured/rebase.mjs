import {isDeepStrictEqual} from 'node:util';
import {sha,requireThat as must} from '../management/files.mjs';
import {loadStructured} from './project.mjs';
import {view,empty,exact,consumerCheck} from './model.mjs';
export function originalValue(source,kind,id){
  switch(kind){
    case 'setTrack':return source.tracks.find(t=>t.id===id);
    case 'setPlaylist':return source.playlists.find(p=>p.id===id);
    case 'setLyrics':return source.tracks.some(t=>t.id===id)?source.lyrics[id]??null:undefined;
    case 'setVideo':return source.videos.get(id);
    case 'setCategory':return source.categories.find(c=>c.id===id);
    case 'setTab':return source.tabs.find(t=>t.id===id);
    case 'setCatalogueOrder':return id==='music.catalogue'?source.tracks.map(t=>t.id):undefined;
    case 'setCategoryOrder':return id==='videos.categories'?source.categories.map(c=>c.id):undefined;
    case 'setTabOrder':return source.categories.find(c=>c.id===id)?.subTabs?.map(t=>t.id);
    case 'setFeaturedVideo':return id==='videos.featured'?(source.video._kkpStructuredProjection===1?(source.video._kkpOriginalFeatured||source.video.featured):source.video.featured)?.videoId||'':undefined;
    default:return undefined;
  }
}
export function editingValue(values,kind,id){const keys={setTrack:'tracks',setPlaylist:'playlists',setLyrics:'lyrics',setVideo:'videos',setCategory:'categories',setTab:'tabs',setTabOrder:'tabOrders'};if(Object.hasOwn(keys,kind))return values[keys[kind]].find(v=>v.id===id);return kind==='setCatalogueOrder'?values.catalogueOrder:kind==='setCategoryOrder'?values.categoryOrder:kind==='setFeaturedVideo'?values.featured:undefined;}
export function translateOriginalProposal(root,proposal,consumer){
  consumerCheck(consumer);must(exact(proposal,['kind','id','expectedOriginal','proposedValue','sourceHashes']),'STRUCTURED_REBASE','Preparation translation requires exact original proof fields.');
  const loaded=loadStructured(root,consumer);must(isDeepStrictEqual(proposal.sourceHashes,loaded.sourceHashes),'STRUCTURED_REBASE_CONFLICT','Original source hashes changed; retain original journal and prepare an explicit separate rebase.');
  const original=originalValue(loaded.source,proposal.kind,proposal.id);must(original!==undefined&&isDeepStrictEqual(original,proposal.expectedOriginal),'STRUCTURED_REBASE_CONFLICT','Original prepared expected value differs from frozen source.');
  const current=editingValue(loaded.values,proposal.kind,proposal.id),pristine=editingValue(view({source:loaded.source,state:empty()}),proposal.kind,proposal.id);
  must(current!==undefined&&isDeepStrictEqual(current,pristine),'STRUCTURED_REBASE_CONFLICT','Target already has authored edits; original proposals cannot silently overwrite them.');
  return {status:'TRANSLATED',requiresPlanAndValidation:true,operation:{id:proposal.id,kind:proposal.kind,expectedOld:current,value:proposal.proposedValue},proof:{sourceHashes:loaded.sourceHashes,originalExpectedSha256:sha(JSON.stringify(proposal.expectedOriginal)),translatedExpectedSha256:sha(JSON.stringify(current)),originalJournalPreserved:true}};
}
