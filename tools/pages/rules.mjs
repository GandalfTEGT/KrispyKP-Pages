import fs from 'node:fs';
import path from 'node:path';
import { isDeepStrictEqual } from 'node:util';

export function must(value,code,message){if(!value){const error=new Error(message);error.code=code;throw error;}}
export const exact=(value,keys)=>value&&typeof value==='object'&&!Array.isArray(value)&&isDeepStrictEqual(Object.keys(value).sort(),[...keys].sort());
export function plain(value,max,empty=false){must(typeof value==='string'&&value===value.trim()&&value.length<=max&&(empty||value.length>0)&&!/[\x00-\x1f\x7f<>]/.test(value),'PAGE_TEXT','Expected bounded plain text, without markup or control characters.');return value;}
export const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const origin='https://krispykp.com';
export const existing=[['home','/','index.html','Home',true],...['music','videos','tournaments','about','contact','privacy'].map(id=>[id,`/${id}/`,`${id}/index.html`,id[0].toUpperCase()+id.slice(1),id!=='privacy'])].map(([id,route,file,label,header])=>({id,route,file,label,header,footer:true}));
const reserved=new Set('index assets media data styles scripts tools docs tasks node_modules bin obj music videos tournaments about contact privacy home cname robots sitemap favicon site manifest credentials secrets'.split(' '));
export function slug(value){must(typeof value==='string'&&/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(value)&&value.length<=64&&!reserved.has(value)&&! /^(?:con|prn|aux|nul|com\d|lpt\d)$/.test(value),'PAGE_ROUTE','Slug is noncanonical, reserved or unsupported.');return value;}
export function registryShape(registry){
  must(exact(registry,['siteId','schemaVersion','adapter','existing','pages'])&&registry.siteId==='krispykp'&&registry.schemaVersion===1&&registry.adapter==='static-pages-v1'&&isDeepStrictEqual(registry.existing,existing),'PAGE_REGISTRY','Existing routes or registry authority changed.');
  must(Array.isArray(registry.pages)&&registry.pages.length<=20,'PAGE_LIMIT','At most twenty managed pages are supported.');const seen=new Set();
  for(const page of registry.pages){slug(page?.slug);must(!seen.has(page.slug)&&page.id===`page.${page.slug}`,'PAGE_ROUTE','Duplicate or disagreeing page identity.');seen.add(page.slug);must(exact(page,['id','slug','name','navLabel','navigation','template','title','description','hero','components']),'PAGE_MAPPING','Unexpected page fields.');plain(page.name,80);plain(page.navLabel,40);plain(page.title,120);plain(page.description,300);must(exact(page.navigation,['header','footer'])&&Object.values(page.navigation).every(v=>typeof v==='boolean'),'PAGE_NAV','Invalid navigation proposal.');must(['blank','standard'].includes(page.template),'PAGE_TEMPLATE','Unknown page template.');if(page.hero!==null){must(exact(page.hero,['title','summary']),'PAGE_HERO','Invalid hero mapping.');plain(page.hero.title,80);plain(page.hero.summary,600,true);}must(page.template!=='blank'||page.hero===null,'PAGE_HERO','Blank template does not support a decorative hero.');must(Array.isArray(page.components),'PAGE_COMPONENT','Components must be an array.');}
  return registry;
}
export function loadRegistry(root,{optional=false}={}){
  for(const directory of [root,path.join(root,'data')])if(fs.existsSync(directory))must(!fs.lstatSync(directory).isSymbolicLink(),'SYMLINK','Linked registry paths are refused.');
  const file=path.join(root,'data/site-pages.json');if(optional&&!fs.existsSync(file))return {existing,pages:[]};
  must(fs.existsSync(file)&&!fs.lstatSync(file).isSymbolicLink(),'PAGE_REGISTRY','Missing or linked route registry.');const bytes=fs.readFileSync(file);must(bytes.length<=262144,'PAGE_LIMIT','Registry exceeds bounds.');let result;try{result=JSON.parse(bytes);}catch{must(false,'PAGE_REGISTRY','Malformed route registry.');}registryShape(result);
  const entries=fs.readdirSync(root);for(const page of result.pages){const matches=entries.filter(n=>n.toLowerCase()===page.slug);must(matches.length<=1&&matches.every(n=>n===page.slug),'PAGE_COLLISION','Managed route has an on-disk case alias.');for(const name of matches)must(fs.statSync(path.join(root,name)).isDirectory()&&!fs.lstatSync(path.join(root,name)).isSymbolicLink(),'SYMLINK','Managed route must be an unlinked directory.');}return result;
}
export function routeTable(root){const registry=loadRegistry(root,{optional:true});return Object.fromEntries([...registry.existing,...registry.pages.map(p=>({id:p.id,route:`/${p.slug}/`}))].map(p=>[p.id,p.route]));}
export function routeFiles(root){return Object.fromEntries(Object.entries(routeTable(root)).map(([id,route])=>[id,route==='/'?'index.html':route.slice(1)+'index.html']));}
