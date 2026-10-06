import { requireThat } from '../management/files.mjs';

function install(options){
  if(location.origin!==options.origin || !['127.0.0.1','localhost','[::1]'].includes(location.hostname))throw Error('Preview origin mismatch');
  if(!(options.routes||['/about/','/about/index.html']).includes(location.pathname))throw Error('This route has no declared layout selection capability');
  window.__kkpLayoutBridgeV1?.detach();
  let mode='inspect',selected=null,revision=0,active=true,pending=0;
  const attribute=options.attribute||'data-kkp-layout-id';
  const targets=new Map(options.targets.map(t=>[t.id,t]));
  function validMap(){if(attribute!=='data-kkp-page-id')return true;const nodes=[...document.querySelectorAll('['+attribute+']')];return nodes.length===targets.size&&nodes.every((node,index)=>{const id=node.getAttribute(attribute),declaration=options.targets[index],parent=node.parentElement?.closest('['+attribute+']');return declaration?.id===id&&node.tagName.toLowerCase()===declaration.tag&&(parent?.getAttribute(attribute)||null)===declaration.parent;});}
  if(!validMap())throw Error('Managed page render map disagrees');
  const overlay=document.createElement('div');overlay.dataset.kkpPrivateOverlay='layout-v1';overlay.setAttribute('aria-hidden','true');
  overlay.style.cssText='position:fixed;pointer-events:none;z-index:2147483000;box-sizing:border-box;border:2px solid #7ee7ff;display:none;';document.body.append(overlay);
  const find=id=>[...document.querySelectorAll('['+attribute+']')].find(n=>n.getAttribute(attribute)===id);
  function send(kind,extra={}){if(!active)return;window.chrome?.webview?.postMessage({protocolVersion:1,kind,sessionId:options.sessionId,documentId:options.documentId,candidateSha256:options.candidateSha256,revision:++revision,...extra});}
  function geometry(){pending=0;if(!active||!selected)return;const element=find(selected);if(!element||!validMap()){selected=null;overlay.style.display='none';send('selectionInvalidated',{reason:'Rendered binding disappeared'});return;}
    const frame=element.tagName==='IMG'&&element.getAttribute('data-kkp-media-id')===selected?element.closest('[data-kkp-media-frame]'):null;
    const r=(frame?.getAttribute('data-kkp-media-frame')===selected?frame:element).getBoundingClientRect();overlay.style.display=mode==='edit'?'block':'none';Object.assign(overlay.style,{left:r.left+'px',top:r.top+'px',width:r.width+'px',height:r.height+'px'});
    const declaration=targets.get(selected);send('selectionGeometry',{id:selected,locked:declaration.locked,reason:declaration.reason||null,viewport:{width:innerWidth,height:innerHeight},devicePixelRatio,visualViewport:window.visualViewport?{scale:visualViewport.scale,offsetLeft:visualViewport.offsetLeft,offsetTop:visualViewport.offsetTop}:null,scroll:{x:scrollX,y:scrollY},rect:{x:r.x,y:r.y,width:r.width,height:r.height},units:'css-px'});
  }
  function schedule(){if(active&&!pending)pending=requestAnimationFrame(geometry);}
  function select(id){if(!validMap()){selected=null;overlay.style.display='none';send('selectionInvalidated',{reason:'Managed page render map disagrees'});return false;}if(!targets.has(id)||!find(id))return false;selected=id;geometry();return true;}
  function click(event){if(mode!=='edit')return;event.preventDefault();event.stopImmediatePropagation();let node=event.target instanceof Element?event.target.closest('['+attribute+']'):null;
    if(node&&targets.has(node.getAttribute(attribute)))select(node.getAttribute(attribute));else{selected=null;overlay.style.display='none';send('selectionLocked',{reason:'Undeclared Website region is locked'});}}
  function keyboard(event){if(mode!=='edit')return;if(event.key==='Escape'){selected=null;overlay.style.display='none';send('selectionCleared');event.preventDefault();event.stopImmediatePropagation();return;}
    if(!['ArrowUp','ArrowDown'].includes(event.key))return;const ids=[...document.querySelectorAll('['+attribute+']')].map(n=>n.getAttribute(attribute)).filter(id=>targets.has(id));let index=ids.indexOf(selected);index=event.key==='ArrowDown'?Math.min(ids.length-1,index+1):Math.max(0,index-1);select(ids[index]);event.preventDefault();event.stopImmediatePropagation();}
  const resize=new ResizeObserver(schedule);resize.observe(document.documentElement);
  const mutations=new MutationObserver(records=>{if(records.some(r=>r.target!==overlay))schedule();});mutations.observe(document.querySelector('main')||document.body,{subtree:true,childList:true,attributes:true,attributeFilter:[attribute,'class','style','hidden']});
  document.addEventListener('click',click,true);document.addEventListener('keydown',keyboard,true);window.addEventListener('scroll',schedule,true);window.addEventListener('resize',schedule);window.visualViewport?.addEventListener('resize',schedule);window.visualViewport?.addEventListener('scroll',schedule);
  function detach(){if(!active)return;send('bridgeDetached');active=false;if(pending)cancelAnimationFrame(pending);resize.disconnect();mutations.disconnect();document.removeEventListener('click',click,true);document.removeEventListener('keydown',keyboard,true);window.removeEventListener('scroll',schedule,true);window.removeEventListener('resize',schedule);window.visualViewport?.removeEventListener('resize',schedule);window.visualViewport?.removeEventListener('scroll',schedule);window.removeEventListener('pagehide',detach);overlay.remove();selected=null;}
  window.addEventListener('pagehide',detach);
  const authenticate=request=>active&&request?.sessionId===options.sessionId&&request.documentId===options.documentId&&request.candidateSha256===options.candidateSha256;
  window.__kkpLayoutBridgeV1=Object.freeze({command(request){if(!authenticate(request))return false;if(request.kind==='mode'){if(!['edit','inspect','interact'].includes(request.mode))return false;mode=request.mode;if(mode!=='edit'){selected=null;overlay.style.display='none';}send('modeChanged',{mode});return true;}if(request.kind==='select')return mode==='edit'&&select(request.id);if(request.kind==='detach'){detach();return true;}return false;},detach});
  send('bridgeReady',{mode,targets:[...targets.keys()]});
}
export function previewBridge(settings,bindings,scope=null){
  requireThat(settings&&typeof settings.origin==='string'&&/^http:\/\/(?:127\.0\.0\.1|localhost|\[::1\]):\d+$/.test(settings.origin),'PREVIEW_ORIGIN','Only the exact private loopback preview origin is supported.');
  requireThat(typeof settings.sessionId==='string'&&/^[A-Za-z0-9_-]{16,100}$/.test(settings.sessionId)&&typeof settings.documentId==='string'&&/^[A-Za-z0-9_-]{16,100}$/.test(settings.documentId)&&/^[A-F0-9]{64}$/.test(settings.candidateSha256),'PREVIEW_IDENTITY','Session/document/candidate identities are required.');
  requireThat(settings&&Object.keys(settings).length===4&&Object.keys(settings).every(key=>['origin','sessionId','documentId','candidateSha256'].includes(key)),'PREVIEW_IDENTITY','Preview settings cannot override Website route/attribute scope.');
  requireThat(scope===null||(Object.keys(scope).length===2&&scope.attribute==='data-kkp-page-id'&&Array.isArray(scope.routes)&&scope.routes.length===2&&/^\/[a-z][a-z0-9-]*\/$/.test(scope.routes[0])&&scope.routes[1]===scope.routes[0]+'index.html'),'PREVIEW_IDENTITY','Invalid managed page bridge scope.');
  const options={...settings,...(scope||{}),targets:bindings.map(b=>({id:b.id,tag:b.tag,parent:b.parent,locked:b.operations.length===0,reason:b.reason||null}))};
  return{schemaVersion:1,status:'PREPARED',requiresValidatedHost:true,protocolVersion:1,sessionId:settings.sessionId,documentId:settings.documentId,candidateSha256:settings.candidateSha256,script:`(${install.toString()})(${JSON.stringify(options)});`,exportable:false};
}
