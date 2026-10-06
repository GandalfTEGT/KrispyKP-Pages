import fs from 'node:fs';
import {isDeepStrictEqual} from 'node:util';
import {safeFile,sha} from '../management/files.mjs';
import {must,loadRegistry,routeTable} from './rules.mjs';
import {partials,shell,segments,normalized,pageDocument,generatedStyle,sitemap,shellHash} from './shell.mjs';
import {composition} from './components.mjs';

export const capabilities=['pages.compose.v1','pages.routes.v1','pages.shell.v1','snapshot.validation.v1'];
export const contractPath='data/site-pages-contract.json',registryPath='data/site-pages.json',stylePath='styles/site-pages.generated.css';
const expected={siteId:'krispykp',schemaVersion:1,protocolVersion:1,adapter:'static-pages-v1',requiredCapabilities:capabilities,registryFile:registryPath,styleFile:stylePath,templates:['blank','standard'],components:['heading','text','button','image','panel','grid'],maxPages:20,maxNodes:80,maxDepth:5};
export function loadPages(root,consumer){
  if(consumer!==undefined)must(consumer?.protocolVersion===1&&Array.isArray(consumer.capabilities)&&capabilities.every(c=>consumer.capabilities.includes(c)),'ADMIN_UPDATE_REQUIRED','Pages consumer capabilities require an update.');
  const bytes=fs.readFileSync(safeFile(root,contractPath));must(bytes.length<=16384,'PAGE_MAPPING','Page contract exceeds bounds.');let contract;try{contract=JSON.parse(bytes);}catch{must(false,'PAGE_MAPPING','Malformed page contract.');}must(isDeepStrictEqual(contract,expected),'ADMIN_UPDATE_REQUIRED','Unsupported page contract semantics.');
  const registry=loadRegistry(root),templates=partials(root);const mappings=[];
  for(const route of registry.existing){const source=fs.readFileSync(safeFile(root,route.file),'utf8'),parts=segments(source),expected=shell(registry,route.route,templates);for(const id of ['header','footer','background'])must(normalized(parts[id])===normalized(expected[id]),'PAGE_SHELL_PARITY',`${route.id} ${id} disagrees with central shell.`);must([...source.matchAll(/<link rel="stylesheet" href="\/styles\/site-pages.generated.css">/g)].length===(expected.managedNavigation?1:0),'PAGE_SHELL_PARITY','Managed navigation style binding disagrees.');}
  for(const page of registry.pages){const file=`${page.slug}/index.html`;must(fs.readFileSync(safeFile(root,file),'utf8').replaceAll('\r\n','\n')===pageDocument(page,registry,root,templates),'PAGE_PARITY','Managed output differs from Website composition.');mappings.push({id:page.id,route:`/${page.slug}/`,file,components:composition(page,registry,root).map});}
  must(fs.readFileSync(safeFile(root,stylePath),'utf8').replaceAll('\r\n','\n')===generatedStyle(registry,root),'PAGE_PARITY','Managed stylesheet projection differs.');must(fs.readFileSync(safeFile(root,'sitemap.xml'),'utf8').replaceAll('\r\n','\n')===sitemap(registry),'PAGE_SITEMAP','Sitemap disagrees with route registry.');
  return {state:'COMPATIBLE',readOnly:false,requiresValidation:true,pagesContractSha256:sha(bytes),registrySha256:sha(fs.readFileSync(safeFile(root,registryPath))),shellSha256:shellHash(templates),registry,mappings,routes:routeTable(root),limits:{maxPages:20,maxNodes:80,maxDepth:5},operations:['createPage','setPage'],templates:['blank','standard'],components:expected.components};
}
export function readPages(root,consumer){try{must(consumer?.protocolVersion===1,'ADMIN_UPDATE_REQUIRED','Explicit page consumer handshake required.');return loadPages(root,consumer);}catch(error){return {state:error.code==='ADMIN_UPDATE_REQUIRED'?'ADMIN_UPDATE_REQUIRED':'UNVERIFIED',readOnly:true,diagnostics:[{severity:'blocking',code:error.code||'PAGE_MAPPING',message:error.message}]};}}
