import fs from 'node:fs';
import zlib from 'node:zlib';
import { requireThat, safeFile, sha } from './files.mjs';

const crcTable=Array.from({length:256},(_,n)=>{let c=n;for(let k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;return c>>>0;});
const crc32=bytes=>{let c=0xFFFFFFFF;for(const b of bytes)c=crcTable[(c^b)&255]^(c>>>8);return (c^0xFFFFFFFF)>>>0;};
export function png(bytes, policy) {
  requireThat(Buffer.isBuffer(bytes) && bytes.length<=policy.maxBytes && bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])), 'MEDIA', 'Only bounded PNG files are supported.');
  let offset=8, width=0,height=0,color=0,ended=false;const data=[];
  while(offset<bytes.length){
    requireThat(offset+12<=bytes.length,'MEDIA','Truncated PNG chunk.');
    const size=bytes.readUInt32BE(offset);const type=bytes.toString('ascii',offset+4,offset+8);
    requireThat(size<=policy.maxBytes && offset+12+size<=bytes.length,'MEDIA','Invalid PNG chunk size.');
    requireThat(crc32(bytes.subarray(offset+4,offset+8+size))===bytes.readUInt32BE(offset+8+size),'MEDIA','PNG checksum mismatch.');
    requireThat(['IHDR','IDAT','IEND','sRGB','gAMA','cHRM','pHYs'].includes(type),'MEDIA','Unsupported PNG chunks, animation and embedded private metadata are refused.');
    if(!width){
      requireThat(type==='IHDR' && size===13,'MEDIA','PNG must start with IHDR.');
      width=bytes.readUInt32BE(offset+8);height=bytes.readUInt32BE(offset+12);color=bytes[offset+17];
      requireThat(bytes[offset+16]===8 && [2,6].includes(color) && bytes[offset+18]===0 && bytes[offset+19]===0 && bytes[offset+20]===0,'MEDIA','Use non-interlaced 8-bit RGB/RGBA PNG.');
      requireThat(width===height && width>=policy.minDimension && width<=policy.maxDimension,'MEDIA','Managed hero image must be square within declared dimensions.');
    }else requireThat(type!=='IHDR','MEDIA','Duplicate PNG header.');
    if(type==='IDAT')data.push(bytes.subarray(offset+8,offset+8+size));
    if(type==='IEND'){requireThat(size===0 && offset+12===bytes.length,'MEDIA','Invalid PNG end/trailing bytes.');ended=true;}
    offset+=size+12;
  }
  requireThat(ended && data.length>0,'MEDIA','Incomplete PNG.');
  const row=width*(color===6?4:3)+1;let decoded;
  try{decoded=zlib.inflateSync(Buffer.concat(data),{maxOutputLength:row*height});}catch{requireThat(false,'MEDIA','PNG pixel data is invalid or exceeds bounds.');}
  requireThat(decoded.length===row*height,'MEDIA','PNG decoded size disagrees with dimensions.');
  for(let y=0;y<height;y++)requireThat(decoded[y*row]<=4,'MEDIA','Invalid PNG filter.');
  return {mime:'image/png',width,height,bytes:bytes.length,sha256:sha(bytes)};
}
export function upload(value,policy){
  requireThat(value && typeof value.pngBase64==='string' && value.pngBase64.length<=Math.ceil(policy.maxBytes/3)*4 && /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(value.pngBase64),'MEDIA','Expected bounded canonical PNG base64 data.');
  const bytes=Buffer.from(value.pngBase64,'base64');png(bytes,policy);
  return {bytes,relative:`assets/managed/home-hero-${sha(bytes).toLowerCase()}.png`};
}
// Inventory evidence, not a promise of a general media library or complete runtime usage discovery.
export function usages(root,files,relative){
  const terms=[relative,'/'+relative];const result=[];
  for(const file of files){
    if(!/\.(?:html|css|js|mjs|json)$/i.test(file.path) || file.path.startsWith('tools/'))continue;
    const source=fs.readFileSync(safeFile(root,file.path),'utf8');
    if(terms.some(term=>source.includes(term)))result.push(file.path);
  }
  return result.sort();
}
