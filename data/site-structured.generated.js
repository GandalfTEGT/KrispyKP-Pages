/* Website-owned structured overlay; generated, read-only. */
(function(){
const state={"siteId":"krispykp","schemaVersion":1,"music":{"tracks":[],"playlists":[],"lyrics":[],"order":[]},"videos":{"videos":[],"categories":[],"tabs":[],"tabOrders":[],"order":[],"featured":null}};
const artwork={};
window.KRISPY_STRUCTURED_ARTWORK=artwork;
const music=function musicProjection(tracks,playlists,lyrics,state,artwork={}) {
  const hidden=new Set(state.tracks.filter(r=>r.visible===false).map(r=>r.id));
  let next=tracks.map(t=>{const row=state.tracks.find(r=>r.id===t.id);const value=row?{...t,name:row.name,artist:row.artist,album:row.album,available:row.available}: {...t};if(artwork[t.id]){value.art=artwork[t.id].src;}return value;}).filter(t=>!hidden.has(t.id));
  if(state.order.length)next.sort((a,b)=>state.order.indexOf(a.id)-state.order.indexOf(b.id));
  const ps=playlists.map(p=>{const row=state.playlists.find(r=>r.id===p.id);const value=row?{...p,name:row.name,tracks:row.tracks}: {...p};if(Array.isArray(value.tracks))value.tracks=value.tracks.filter(id=>!hidden.has(id));return value;});
  const ls={...lyrics};for(const r of state.lyrics)ls[r.id]={...(ls[r.id]||{}),title:r.title,lyrics:r.lyrics};for(const id of hidden)delete ls[id];
  return {tracks:next,playlists:ps,lyrics:ls};
};
const video=function videoProjection(data,state) {
  if(!state.videos.length&&!state.categories.length&&!state.tabs.length&&!state.tabOrders.length&&!state.order.length&&state.featured===null)return data;
  // Unwrap supported derived fields before reapplying; imported unknown fields survive.
  const original=item=>({...data._kkpStructuredProjection===1&&item._kkpDerived===1&&item._kkpOriginal||item});
  const originals=new WeakMap();
  const hidden=new Set(state.videos.filter(r=>r.visible===false).map(r=>r.id));
  const project=item=>{const base=original(item),row=state.videos.find(r=>r.id===base.videoId);if(hidden.has(base.videoId))return null;if(!row){originals.set(base,base);return base;}const v={...base,_kkpDerived:1,_kkpOriginal:base};if(row.title!==null)v.title=row.title;if(row.note!==null)v.note=row.note;originals.set(v,base);return v;};
  const all=new Map();for(const c of data.categories||[])for(const t of c.subTabs||[])for(const v of t.items||[])if(!all.has(v.videoId))all.set(v.videoId,original(v));
  let categories=(data.categories||[]).map(c=>{const row=state.categories.find(r=>r.id===c.id);let tabs=(c.subTabs||[]).map(t=>{const r=state.tabs.find(r=>r.id===t.id);const local=new Map((t.items||[]).map(v=>[v.videoId,original(v)]));let items=r?r.videoIds.map(id=>local.get(id)||all.get(id)).filter(Boolean):(t.items||[]);items=items.map(project).filter(Boolean);if(r)items=items.map((v,i)=>({...v,_kkpDerived:1,_kkpOriginal:originals.get(v)||v,position:i}));return {...t,...(r?{title:r.title}:{}),items};});const order=state.tabOrders.find(r=>r.id===c.id);if(order)tabs.sort((a,b)=>order.ids.indexOf(a.id)-order.ids.indexOf(b.id));const sourceFeature=data._kkpStructuredProjection===1?(c._kkpOriginalFeaturedVideoId??c.featuredVideoId):c.featuredVideoId,feature=row?row.featuredVideoId:sourceFeature;return {...c,...(row?{_kkpOriginalFeaturedVideoId:sourceFeature,authoredFeatured:row.featuredVideoId!==sourceFeature}:{}),...(row?{title:row.title}:{}),featuredVideoId:hidden.has(feature)?'':feature,subTabs:tabs,latest:(c.latest||[]).map(project).filter(Boolean)};});
  if(state.tabs.length||state.videos.some(v=>v.visible===false)){const recent=(items,count)=>[...new Map(items.map(v=>[v.videoId,v])).values()].sort((a,b)=>(Date.parse(b.playlistAddedAt||0)||0)-(Date.parse(a.playlistAddedAt||0)||0)).slice(0,count);for(const c of categories)if(c.id!=='latest')c.latest=recent(c.subTabs.flatMap(t=>t.items),c.latestCount||12);const latest=categories.find(c=>c.id==='latest');if(latest)latest.latest=recent(categories.filter(c=>c.id!=='latest').flatMap(c=>c.latest),latest.latestCount||16);}
  if(state.order.length)categories.sort((a,b)=>state.order.indexOf(a.id)-state.order.indexOf(b.id));
  const originalFeatured=data._kkpStructuredProjection===1?(data._kkpOriginalFeatured||data.featured||{}):(data.featured||{});
  const feature=state.featured===null?originalFeatured.videoId:state.featured;
  let featured={...originalFeatured,videoId:feature};
  if(state.featured!==null&&feature!==originalFeatured.videoId&&all.has(feature))featured=project(all.get(feature));
  const override=state.videos.find(v=>v.id===feature);if(override){if(override.title!==null)featured.title=override.title;if(override.note!==null)featured.note=override.note;}
  if(!feature||hidden.has(feature))featured={};
  return {...data,_kkpStructuredProjection:1,_kkpOriginalFeatured:originalFeatured,featured,categories};
};
if(window.KRISPY_TRACKS){const projected=music(window.KRISPY_TRACKS,window.KRISPY_PLAYLISTS||[],window.KRISPY_LYRICS||{},state.music,artwork);window.KRISPY_TRACKS=projected.tracks;window.KRISPY_PLAYLISTS=projected.playlists;if(window.KRISPY_LYRICS)window.KRISPY_LYRICS=projected.lyrics;}
if(window.KRISPY_VIDEO_DATA)window.KRISPY_VIDEO_DATA=video(window.KRISPY_VIDEO_DATA,state.videos);
})();
