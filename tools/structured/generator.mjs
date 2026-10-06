import {load,sources,validateState} from './model.mjs';
import {requireThat as must} from '../management/files.mjs';
import {videoProjection} from './runtime.mjs';
// Called by the existing generator only after its own credentialed import succeeds.
// This function itself performs no fetch, environment lookup or output mutation.
export function preserveVideoOverlays(root,imported){
  const {state}=load(root),serialized='window.KRISPY_VIDEO_DATA = '+JSON.stringify(imported,null,2)+';\n';
  must(Buffer.byteLength(serialized)<=8388608,'STRUCTURED_LIMIT','Imported video source exceeds8MiB.');
  const source=sources(root,new Map([['data/videos.generated.js',Buffer.from(serialized)]]));
  validateState(state,source);
  const projected=videoProjection(imported,state.videos);
  must(Buffer.byteLength('window.KRISPY_VIDEO_DATA = '+JSON.stringify(projected)+';')<=8388608,'STRUCTURED_LIMIT','Projected video source exceeds8MiB.');
  // The durable overlay is reapplied by site-structured.generated.js. Writing a
  // filtered projection here would discard hidden imported IDs on the next read.
  return imported;
}
