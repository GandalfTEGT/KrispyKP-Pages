import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { loadLayout,layoutCapabilities,gridId,cardIds } from './contract.mjs';

export async function checkLayout(browser,baseUrl,root){
  if(!fs.existsSync(path.join(root,'data/site-layout.json')))return;
  const loaded=loadLayout(root,{protocolVersion:1,capabilities:layoutCapabilities});
  const context=await browser.newContext({viewport:{width:1440,height:900},reducedMotion:'reduce'});
  await context.route('**/*',r=>r.request().url().startsWith(baseUrl)?r.continue():r.abort());
  try{
    const page=await context.newPage();await page.goto(baseUrl+'/about/',{waitUntil:'networkidle'});
    for(const width of [280,320,390,699,700,701,979,980,981,1024,1440]){
      await page.setViewportSize({width,height:900});
      const facts=await page.evaluate(()=>{
        const main=document.querySelector('[data-kkp-layout-id="about.page"]'),grid=document.querySelector('[data-kkp-layout-id="about.features.grid"]');
        return{order:[...main.children].map(n=>n.dataset.kkpLayoutId),cards:[...grid.children].map(n=>({id:n.dataset.kkpLayoutId,order:getComputedStyle(n).order,span:getComputedStyle(n).gridColumnStart,rect:{x:n.getBoundingClientRect().x,y:n.getBoundingClientRect().y,width:n.getBoundingClientRect().width},tag:n.tagName})),columns:getComputedStyle(grid).gridTemplateColumns.split(' ').length,alignment:getComputedStyle(grid).alignItems,overflow:document.documentElement.scrollWidth>innerWidth+1,ids:[...document.querySelectorAll('[data-kkp-layout-id]')].map(n=>n.dataset.kkpLayoutId),editorMarkup:document.querySelectorAll('[data-kkp-private-overlay]').length};
      });
      assert.deepEqual(facts.order,['about.hero',...loaded.layoutState.orders['about.page']]);assert.deepEqual(facts.cards.map(c=>c.id),loaded.layoutState.orders[gridId]);
      assert.equal(new Set(facts.ids).size,loaded.bindings.length);assert.equal(facts.editorMarkup,0,'Public source must contain no host editor overlay');assert.equal(facts.overflow,false,`${width}px overflow`);
      const profile=width<=700?'compact':width<=980?'medium':'wide',effective=loaded.effective[profile];
      for(const card of facts.cards){assert.equal(card.order,'0','Semantic DOM order must drive visual reading order');assert.equal(card.tag,'ARTICLE');assert.ok(card.rect.width>0);if(effective.grid)assert.equal(card.span,'span '+effective.cards[card.id].span);}
      if(effective.grid){assert.equal(facts.columns,effective.grid.columns,`${width}px grid profile`);assert.equal(facts.alignment,effective.grid.alignment);}
      for(let i=1;i<facts.cards.length;i++){const previous=facts.cards[i-1].rect,current=facts.cards[i].rect;assert.ok(current.y>=previous.y-1,'Visual rows must follow DOM order');if(Math.abs(current.y-previous.y)<1)assert.ok(current.x>=previous.x-1,'Visual columns must follow DOM order');}
    }
    // Reordered sections must still expose the original link semantics and keyboard order.
    const domLinks=await page.locator('main a').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('href')));
    const visited=[];await page.locator('main a').first().focus();
    for(let i=0;i<domLinks.length;i++){visited.push(await page.evaluate(()=>document.activeElement?.getAttribute('href')));if(i+1<domLinks.length)await page.keyboard.press('Tab');}
    assert.deepEqual(visited,domLinks,'Keyboard reading order must follow actual reordered source');
  }finally{await context.close();}
}
