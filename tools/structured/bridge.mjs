import {install} from '../layout/bridge.mjs';
import {requireThat as must} from '../management/files.mjs';
import {loadStructured} from './project.mjs';
export function structuredBridge(root,settings,consumer){
  must(settings&&Object.keys(settings).length===4&&Object.keys(settings).every(k=>['origin','sessionId','documentId','candidateSha256'].includes(k)),'PREVIEW_IDENTITY','Exact private preview identities required.');
  must(/^http:\/\/(?:127\.0\.0\.1|localhost|\[::1\]):\d+$/.test(settings.origin)&&/^[A-Za-z0-9_-]{16,100}$/.test(settings.sessionId)&&/^[A-Za-z0-9_-]{16,100}$/.test(settings.documentId)&&/^[A-F0-9]{64}$/.test(settings.candidateSha256),'PREVIEW_IDENTITY','Preview requires loopback origin/session/document/candidate pins.');
  const loaded=loadStructured(root,consumer),targets=[];
  const add=(id,tag)=>targets.push({id,tag,parent:null,locked:false,reason:null});
  for(const t of loaded.values.tracks.filter(t=>t.visible)){add('music.track.'+t.id,'button');add('home.track.'+t.id,'article');add('music.lyrics.'+t.id,'div');}
  for(const v of loaded.values.videos.filter(v=>v.visible))add('videos.video.'+v.id,'article');
  for(const c of loaded.values.categories)add('videos.category.'+c.id,'button');for(const t of loaded.values.tabs)add('videos.tab.'+t.id,'button');
  const options={...settings,attribute:'data-kkp-structured-id',routes:['/','/index.html','/music/','/music/index.html','/videos/','/videos/index.html'],targets};
  return {schemaVersion:1,status:'PREPARED',protocolVersion:1,requiresValidatedHost:true,exportable:false,...settings,targets,script:`(${install.toString()})(${JSON.stringify(options)});`};
}
