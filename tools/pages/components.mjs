import fs from 'node:fs';
import path from 'node:path';
import {must,exact,plain,escape,origin} from './rules.mjs';

const limits={wide:3,medium:2,compact:1};
export function composition(page,registry,root){
  let count=0,lastHeading=1;const seen=new Set(),map=[];const links=new Set(['/',...registry.existing.map(p=>p.route),...registry.pages.map(p=>`/${p.slug}/`)]);let css='';
  function href(value){must(typeof value==='string'&&value.length<=2048&&!/[\s\\\x00-\x1f]/.test(value),'PAGE_LINK','Invalid link.');if(value.startsWith('/')&&!value.startsWith('//'))must(links.has(value),'PAGE_LINK','Link must name a declared route.');else{let u;try{u=new URL(value);}catch{must(false,'PAGE_LINK','Invalid URL.');}must(u.protocol==='https:'&&!u.username&&!u.password,'PAGE_LINK','Only credential-free HTTPS external links supported.');}return escape(value);}
  function render(node,parent,depth){
    must(depth<=5&&++count<=80&&node&&typeof node==='object','PAGE_LIMIT','Composition depth/node count exceeded.');must(typeof node.id==='string'&&/^[a-z][a-z0-9-]{0,39}$/.test(node.id)&&!seen.has(node.id),'PAGE_ID','Component IDs must be unique canonical strings.');seen.add(node.id);const id=`${page.id}.${node.id}`,attr=`data-kkp-page-id="${id}"`;map.push({id,parent,kind:node.kind,tag:({root:'main',heading:'h'+node.level,text:'p',button:'a',image:'img',panel:'section',grid:'div'})[node.kind]});
    if(node.kind==='heading'){must(exact(node,['id','kind','level','text'])&&[2,3].includes(node.level)&&node.level<=lastHeading+1,'PAGE_HEADING','Heading level skips hierarchy or creates another H1.');lastHeading=node.level;return `<h${node.level} class="section-title" ${attr}>${escape(plain(node.text,160))}</h${node.level}>`;}
    if(node.kind==='text'){must(exact(node,['id','kind','text']),'PAGE_COMPONENT','Invalid text fields.');return `<p class="sub" ${attr}>${escape(plain(node.text,2400))}</p>`;}
    if(node.kind==='button'){must(exact(node,['id','kind','text','href']),'PAGE_COMPONENT','Invalid CTA fields.');return `<a class="btn" ${attr} href="${href(node.href)}">${escape(plain(node.text,120))}</a>`;}
    if(node.kind==='image'){
      must(exact(node,['id','kind','src','alt']),'PAGE_COMPONENT','Invalid image fields.');must(typeof node.src==='string'&&/^\/(?:assets|media)\/[a-zA-Z0-9/_-]+\.png$/.test(node.src),'PAGE_MEDIA','Initial image reference supports existing PNG only.');const parts=node.src.slice(1).split('/');let current=root;for(const part of parts){current=path.join(current,part);must(fs.existsSync(current)&&!fs.lstatSync(current).isSymbolicLink(),'PAGE_MEDIA','Missing or linked image.');}
      const bytes=fs.readFileSync(current);must(bytes.length>=24&&bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])),'PAGE_MEDIA','Invalid PNG reference.');const width=bytes.readUInt32BE(16),height=bytes.readUInt32BE(20);must(width>0&&height>0&&width<=8192&&height<=8192,'PAGE_MEDIA','Invalid intrinsic image dimensions.');return `<img class="managed-image" ${attr} src="${escape(node.src)}" alt="${escape(plain(node.alt,160))}" width="${width}" height="${height}" loading="lazy" decoding="async">`;
    }
    must(['panel','grid'].includes(node.kind),'PAGE_COMPONENT','Unsupported component kind.');must(exact(node,node.kind==='panel'?['id','kind','children']:['id','kind','profiles','children'])&&Array.isArray(node.children)&&node.children.length>0&&node.children.length<=20,'PAGE_NESTING','Invalid container children.');
    if(node.kind==='grid'){
      must(exact(node.profiles,['wide','medium','compact']),'PAGE_PROFILE','Unknown responsive profile.');let inherited=1;for(const profile of ['wide','medium','compact']){const stored=node.profiles[profile];must(stored===null||(Number.isInteger(stored)&&stored>=1&&stored<=limits[profile]),'PAGE_GRID','Columns exceed profile bounds.');inherited=stored??inherited;const columns=Math.min(inherited,limits[profile]);const query={wide:'(min-width:981px)',medium:'(min-width:701px) and (max-width:980px)',compact:'(max-width:700px)'}[profile];css+=`@media ${query} { [data-kkp-page-id="${id}"] { grid-template-columns:repeat(${columns},minmax(0,1fr)); } }\n`;}
      must(node.children.every(n=>n.kind==='panel'),'PAGE_NESTING','Grid children must be panels.');
    }else must(node.children.every(n=>n.kind!=='panel'),'PAGE_NESTING','Panels cannot contain panels directly.');
    return `<${node.kind==='panel'?'section':'div'} class="${node.kind==='panel'?'frame panel':'managed-grid'}" ${attr}>${node.children.map(n=>render(n,id,depth+1)).join('\n')}</${node.kind==='panel'?'section':'div'}>`;
  }
  const content=page.components.map(n=>render(n,page.id,1)).join('\n');
  const title=page.hero?.title||page.name,summary=page.hero?.summary||'';
  const hero=page.template==='standard'&&page.hero!==null?`<section class="page-hero"><div class="container"><div class="frame panel"><div class="section-title">${escape(page.name)}</div><h1 class="h1">${escape(title)}</h1>${summary?`<p class="sub">${escape(summary)}</p>`:''}</div></div></section>`:`<section class="section"><div class="container"><h1 class="h1">${escape(page.name)}</h1></div></section>`;
  return {body:`<main data-kkp-page-id="${page.id}">\n${hero}\n<section class="section"><div class="container managed-body">\n${content}\n</div></section>\n</main>`,css,map:[{id:page.id,parent:null,kind:'root',tag:'main'},...map],canonical:origin+`/${page.slug}/`};
}
