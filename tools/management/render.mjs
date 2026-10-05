import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { loadContract } from './contract.mjs';

export async function checkBindings(browser,baseUrl,root) {
  if(!fs.existsSync(path.join(root,'data/site-management.json')))return;
  const {bindings}=loadContract(root);
  for(const route of ['/','/about/']){
    const context=await browser.newContext({viewport:{width:390,height:900},reducedMotion:'reduce'});
    await context.route('**/*',r=>r.request().url().startsWith(baseUrl)?r.continue():r.abort());
    try{
      const page=await context.newPage();await page.goto(baseUrl+route,{waitUntil:'networkidle'});
      for(const width of [320,390,699,700,701,979,980,981,1200,1201,1440]){
        await page.setViewportSize({width,height:900});
        for(const binding of bindings.filter(b=>b.route===route)){
          const locator=page.locator(`[data-kkp-manage-id="${binding.id}"]`);
          assert.equal(await locator.count(),1,`${binding.id}: rendered ID must be unique`);
          const rendered=await locator.evaluate(element=>({tag:element.tagName.toLowerCase(),text:element.textContent.replace(/\s+/gu,' ').trim(),href:element.getAttribute('href'),src:element.getAttribute('src'),alt:element.getAttribute('alt'),target:element.getAttribute('target'),rel:element.getAttribute('rel'),fit:getComputedStyle(element).objectFit,focal:getComputedStyle(element).objectPosition,width:element.getBoundingClientRect().width,height:element.getBoundingClientRect().height,naturalWidth:element.naturalWidth,naturalHeight:element.naturalHeight}));
          assert.equal(rendered.tag,binding.tag);
          if(binding.kind==='text')assert.equal(rendered.text,binding.value);
          if(binding.kind==='link'){assert.equal(rendered.text,binding.value.text);assert.equal(rendered.href,binding.value.href);assert.equal(rendered.target,'_blank');assert.equal(rendered.rel,'noopener noreferrer');}
          if(binding.kind==='image'){
            assert.equal(rendered.src,binding.value.src);assert.equal(rendered.alt,binding.value.alt);
            assert.equal(rendered.fit,'fill','Changed fit requires updated supported media semantics');assert.equal(rendered.focal,'50% 50%');
            assert.ok(rendered.naturalWidth>0 && rendered.naturalHeight>0,'Managed image must decode');
            assert.ok(Math.abs(rendered.width/rendered.height-rendered.naturalWidth/rendered.naturalHeight)<0.02,'Managed image intrinsic aspect must be preserved');
          }
        }
        assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,`${route} ${width}: no horizontal overflow`);
      }
    }finally{await context.close();}
  }
}
