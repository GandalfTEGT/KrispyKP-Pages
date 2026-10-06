import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {must,exact} from '../pages/rules.mjs';
import {sha} from '../management/files.mjs';
const directory=path.dirname(fileURLToPath(import.meta.url));
const python=()=>process.env.KKP_MEDIA_PYTHON||path.join(os.homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe');
const cache=new Map();
export function decode(bytes,mime,mode='admit'){
  must(Buffer.isBuffer(bytes)&&bytes.length>0&&bytes.length<=8388608&&['image/png','image/jpeg','image/webp'].includes(mime)&&['admit','inspect'].includes(mode),'MEDIA_DECODE','Unsupported or oversized still image.');
  const policy=JSON.parse(fs.readFileSync(path.join(directory,'decoder-policy.json'),'utf8'));
  const runtime=path.dirname(python());
  const dependency=policy.files.map(file=>{must(/^(?:runtime|PIL|pillow\.libs)\/[A-Za-z0-9_./-]+$/.test(file.path)&&!file.path.split('/').includes('..'),'MEDIA_DECODER_UPDATE','Noncanonical trusted dependency path.');const target=file.path.startsWith('runtime/')?path.join(runtime,file.path.slice(8)):path.join(runtime,'Lib/site-packages',file.path);return {path:file.path,sha256:sha(fs.readFileSync(target))};});
  must(sha(JSON.stringify(dependency))===policy.dependencySha256,'MEDIA_DECODER_UPDATE','Installed decoder files changed; cached admission cannot bypass runtime trust.');
  const key=sha(JSON.stringify(policy))+python()+mode+mime+sha(bytes);if(cache.has(key))return cache.get(key);
  const result=spawnSync(python(),['-I','-S','-B',path.join(directory,'codec.py')],{input:JSON.stringify({mode,mime,base64:bytes.toString('base64')}),encoding:'utf8',timeout:15000,maxBuffer:16*1024*1024,windowsHide:true});
  must(!result.error&&result.status===0,'MEDIA_DECODE','Image failed bounded decode/sanitization: '+(result.error?.code||result.stdout.slice(0,500)));
  let parsed;try{parsed=JSON.parse(result.stdout);}catch{must(false,'MEDIA_DECODE','Malformed fixed decoder proof.');}
  must(parsed.status==='PASS'&&parsed.dependencySha256===policy.dependencySha256,'MEDIA_DECODER_UPDATE','Installed decoder dependency does not match the trusted byte closure.');
  const value=parsed.value;must(value&&value.mime===mime&&value.width>=32&&value.height>=32&&value.width<=8192&&value.height<=8192&&value.width*value.height<=16000000,'MEDIA_DECODE','Decoded proof exceeds intrinsic bounds.');
  if(mode==='admit'){const output=Buffer.from(value.base64,'base64');must(sha(output)===value.sha256&&output.length===value.bytes&&value.clean,'MEDIA_DECODE','Rendition byte proof disagrees.');value.data=output;delete value.base64;}
  cache.set(key,value);return value;
}
export function admission(value){must(exact(value,['mime','base64'])&&typeof value.base64==='string'&&value.base64.length<=11184812&&/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(value.base64),'MEDIA_UPLOAD','Expected bounded canonical MIME/base64 upload.');return decode(Buffer.from(value.base64,'base64'),value.mime);}
