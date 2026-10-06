import fs from 'node:fs';
import path from 'node:path';
import {sources} from './model.mjs';
// Isolated synthetic source fixture, never applied to a Website checkout.
export function maximumSource(root){
  const old=sources(root),tracks=Array.from({length:500},(_,i)=>({...old.tracks[i%old.tracks.length],id:'fixture-track-'+i,name:'Maximum £ track '+i,unknown:{preserved:i}}));
  const playlists=Array.from({length:100},(_,i)=>({id:'fixture-list-'+i,name:'Maximum playlist '+i,tracks:tracks.map(t=>t.id)}));
  const cats=[{id:'latest',title:'Latest Videos',type:'latest'}];let tabIndex=0,videoIndex=0;const categories=[{id:'latest',title:'Latest Videos',featuredVideoId:'',latestCount:16,latest:[],subTabs:[]}];
  for(let i=0;i<99;i++){const config={id:'fixture-category-'+i,title:'Maximum category '+i,featuredVideoId:'',subTabs:[]},category={...config,subTabs:[],latest:[],latestCount:12};for(let j=0;j<(i===0?4:2);j++){const id='fixture-tab-'+tabIndex++,tab={id,title:'Maximum tab '+id,playlistId:'PLMaximumFixture'+tabIndex};config.subTabs.push(tab);const items=Array.from({length:25},(_,position)=>{const n=videoIndex++;return {videoId:'F'+String(n).padStart(10,'0'),title:'Maximum video '+n,description:'Synthetic bounded fixture',position,playlistAddedAt:'2026-01-01T00:00:00Z',videoPublishedAt:'2025-01-01T00:00:00Z',publishedAt:'2026-01-01T00:00:00Z',thumbnail:'https://i.ytimg.com/vi/F'+String(n).padStart(10,'0')+'/hqdefault.jpg',duration:'PT1M',playlistItemStatus:'public',unknown:{preserved:n}};});category.subTabs.push({...tab,items});}cats.push(config);categories.push(category);}
  const write=(p,s)=>fs.writeFileSync(path.join(root,p),s);
  write('data/tracks.js','/* Original fixture comment preserved. */\nwindow.KRISPY_TRACKS = '+JSON.stringify(tracks)+';\nwindow.KRISPY_PLAYLISTS = '+JSON.stringify(playlists)+';\n');
  write('data/lyrics.js','window.KRISPY_LYRICS = {};\n');write('data/video-playlists.config.mjs','export const VIDEO_PLAYLISTS = '+JSON.stringify(cats)+';\n');write('data/videos.generated.js','window.KRISPY_VIDEO_DATA = '+JSON.stringify({featured:{},categories,pageSize:8})+';\n');
  return {tracks,playlists,categories,tabIndex,videoIndex};
}
