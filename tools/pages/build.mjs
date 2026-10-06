import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {loadRegistry,must} from './rules.mjs';
import {safeFile} from '../management/files.mjs';
import {partials,shell,patchShell,pageDocument,generatedStyle,sitemap} from './shell.mjs';
import {loadPages} from './contract.mjs';

// Website maintenance only. Admin net page operations use the immutable planner.
export function shellProjection(root){const registry=loadRegistry(root),templates=partials(root),files=new Map();const set=(file,text)=>{const target=safeFile(root,file,{existing:false}),before=fs.existsSync(target)?fs.readFileSync(target):null,eol=before?.toString('utf8').includes('\r\n')?'\r\n':'\n',bytes=Buffer.from(text.replaceAll('\r\n','\n').replaceAll('\n',eol));if(!before||!before.equals(bytes))files.set(file,bytes);};
  for(const route of registry.existing)set(route.file,patchShell(fs.readFileSync(safeFile(root,route.file),'utf8'),shell(registry,route.route,templates)));
  for(const page of registry.pages)set(`${page.slug}/index.html`,pageDocument(page,registry,root,templates));set('styles/site-pages.generated.css',generatedStyle(registry,root));set('sitemap.xml',sitemap(registry));return files;}
export function build(root,{write=false}={}){const files=shellProjection(root);if(write){for(const [file,bytes] of files){const target=safeFile(root,file,{existing:false});fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,bytes);}loadPages(root);}return {status:files.size?(write?'RENDERED':'STALE'):'CURRENT',outputs:[...files.keys()].sort(),requiresValidation:write};}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){try{const args=process.argv.slice(2);must(args.length===3&&args[0]==='--root'&&['--check','--write'].includes(args[2]),'ARGUMENT','Use --root <Website-root> --check|--write.');const result=build(path.resolve(args[1]),{write:args[2]==='--write'});console.log(JSON.stringify(result));process.exitCode=result.status==='STALE'?1:0;}catch(error){console.error(JSON.stringify({status:'FAIL',code:error.code||'INPUT',message:error.message}));process.exitCode=2;}}
