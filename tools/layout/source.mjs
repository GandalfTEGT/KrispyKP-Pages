import { requireThat } from '../management/files.mjs';

const voids=new Set(['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr']);
export function tree(source){
  const stack=[],all=[];let raw=null;
  const pattern=/<!--[\s\S]*?-->|<![^>]*>|<\/?[A-Za-z][\w:-]*(?:[^>"']|"[^"]*"|'[^']*')*>/g;
  for(const token of source.matchAll(pattern)){
    const text=token[0];if(text.startsWith('<!'))continue;
    const tag=/^<\/?([\w:-]+)/.exec(text)[1].toLowerCase(),closing=text.startsWith('</');
    if(raw){if(!(closing&&tag===raw))continue;raw=null;}
    if(closing){const node=stack.pop();requireThat(node?.tag===tag,'LAYOUT_MAPPING','Source nesting is ambiguous or malformed.');node.end=token.index+text.length;continue;}
    const attrs={};for(const match of text.matchAll(/\s+([\w:-]+)(?:\s*=\s*("[^"]*"|'[^']*'|[^\s>]+))?/g)){const key=match[1].toLowerCase();requireThat(!Object.hasOwn(attrs,key),'LAYOUT_MAPPING','Duplicate source attributes.');attrs[key]=(match[2]||'').replace(/^['"]|['"]$/g,'');}
    const node={tag,start:token.index,end:token.index+text.length,attrs,id:attrs['data-kkp-layout-id']||null,parent:stack.at(-1)||null,children:[]};
    node.parent?.children.push(node);all.push(node);
    if(!voids.has(tag)&&!text.endsWith('/>')){stack.push(node);if(['script','style'].includes(tag))raw=tag;}
  }
  requireThat(stack.length===0,'LAYOUT_MAPPING','Unclosed source structure.');
  return all;
}
export function reorder(source,parent,ids,all){
  const selected=parent.children.filter(n=>ids.includes(n.id));
  requireThat(selected.length===ids.length && selected.every(n=>n.id),'LAYOUT_NESTING','Reordering requires declared direct siblings.');
  const first=selected[0],last=selected.at(-1);
  const middle=parent.children.filter(n=>n.start>=first.start&&n.end<=last.end);
  requireThat(middle.length===selected.length,'LAYOUT_LOCKED','Locked siblings cannot be moved through managed children.');
  const gaps=selected.slice(1).map((node,index)=>source.slice(selected[index].end,node.start));
  requireThat(gaps.every(gap=>/^\s*$/.test(gap)),'LAYOUT_MAPPING','Unexpected source between reorderable siblings.');
  const nodes=new Map(selected.map(n=>[n.id,n]));
  const replacement=ids.map((id,index)=>{const n=nodes.get(id);return(index?gaps[index-1]:'')+source.slice(n.start,n.end);}).join('');
  return source.slice(0,first.start)+replacement+source.slice(last.end);
}
