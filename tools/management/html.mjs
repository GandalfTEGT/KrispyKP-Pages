import { requireThat, sha, json } from './files.mjs';

export function decode(value) {
  return value.replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (_, entity) => {
    if (entity.startsWith('#')) {
      const n = entity[1].toLowerCase() === 'x' ? parseInt(entity.slice(2),16) : Number(entity.slice(1));
      requireThat(n > 0 && n <= 0x10FFFF && !(n >= 0xD800 && n <= 0xDFFF), 'MAPPING', 'Invalid HTML character reference.');
      return String.fromCodePoint(n);
    }
    const entities = { amp:'&',lt:'<',gt:'>',quot:'"',apos:"'",nbsp:'\u00a0' };
    requireThat(Object.hasOwn(entities,entity.toLowerCase()), 'MAPPING', 'Unsupported HTML entity in managed source.');
    return entities[entity.toLowerCase()];
  });
}
export const plainText = value => decode(value).replace(/\s+/gu,' ').trim();
export const encode = value => value.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');

export function nodes(source) {
  const output=[]; let raw=null;
  const tokens=/<!--[\s\S]*?-->|<![^>]*>|<\/?[A-Za-z][A-Za-z0-9:-]*(?:[^>"']|"[^"]*"|'[^']*')*>/g;
  for(const token of source.matchAll(tokens)) {
    const tagText=token[0]; if(tagText.startsWith('<!'))continue;
    const tag=/^<\/?([\w:-]+)/.exec(tagText)[1].toLowerCase();
    const closing=tagText.startsWith('</');
    if(raw) { if(closing && tag===raw)raw=null; continue; }
    if(!closing && (tag==='script'||tag==='style')) { raw=tag;continue; }
    if(closing)continue;
    const attributes={};
    const pattern=/\s+([\w:-]+)(?:\s*=\s*("[^"]*"|'[^']*'|[^\s>]+))?/g;
    for(const attribute of tagText.matchAll(pattern)) {
      const name=attribute[1].toLowerCase();
      requireThat(!Object.hasOwn(attributes,name),'MAPPING','Duplicate attributes in a source tag.');
      const rawValue=attribute[2] || '';
      const quoted=rawValue.startsWith('"')||rawValue.startsWith("'");
      const value=quoted?rawValue.slice(1,-1):rawValue;
      const offset=token.index+attribute.index+attribute[0].indexOf(rawValue)+(quoted?1:0);
      attributes[name]={value:decode(value),start:offset,end:offset+value.length,quote:quoted?rawValue[0]:null};
    }
    if(!attributes['data-kkp-manage-id'])continue;
    const start=token.index+tagText.length;
    let end=start;
    if(tag!=='img') {
      const close=new RegExp(`</${tag}\\s*>`,'gi');close.lastIndex=start;
      const found=close.exec(source);
      requireThat(found && !/[<>]/.test(source.slice(start,found.index)), 'MAPPING','Managed text/link must be an unambiguous leaf, without child markup.');
      end=found.index;
    }
    output.push({id:attributes['data-kkp-manage-id'].value,tag,attributes,start,end,text:plainText(source.slice(start,end))});
  }
  return output;
}
export function valueOf(node,kind) {
  if(kind==='text')return node.text;
  if(kind==='link')return {text:node.text,href:node.attributes.href?.value};
  return {src:node.attributes.src?.value,alt:node.attributes.alt?.value,fit:'intrinsic',focal:'none',mode:'selected-use'};
}
export function replaceNode(source,node,kind,value) {
  const patches=[];
  if(kind==='text'||kind==='link') {
    const inner=source.slice(node.start,node.end);
    const leading=/^\s*/u.exec(inner)[0];const trailing=/\s*$/u.exec(inner)[0];
    patches.push({start:node.start,end:node.end,value:leading+encode(kind==='text'?value:value.text)+trailing});
  }
  for(const attribute of kind==='link'?['href']:kind==='image'?['src','alt']:[]) {
    const old=node.attributes[attribute];
    requireThat(old?.quote,'MAPPING','Managed attributes must already exist and be quoted.',node.id);
    patches.push({start:old.start,end:old.end,value:encode(value[attribute])});
  }
  for(const patch of patches.sort((a,b)=>b.start-a.start))source=source.slice(0,patch.start)+patch.value+source.slice(patch.end);
  return source;
}
export function relevantMapping(node, binding) {
  return sha(json({id:node.id,tag:node.tag,kind:binding.kind,width:node.attributes.width?.value,height:node.attributes.height?.value,target:node.attributes.target?.value,rel:node.attributes.rel?.value}));
}
