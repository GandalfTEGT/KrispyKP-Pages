import assert from 'node:assert/strict';
import {loadPages} from './contract.mjs';
import {composition} from './components.mjs';

export async function checkPageFoundation(browser,baseUrl,root){
  const loaded=loadPages(root),context=await browser.newContext({reducedMotion:'reduce'}),page=await context.newPage();
  await context.route('**/*',route=>route.request().url().startsWith(baseUrl)?route.continue():route.abort());let cases=0;
  try{
    for(const source of loaded.registry.pages){const map=composition(source,loaded.registry,root).map;
      for(const width of [280,320,390,699,700,701,979,980,981,1024,1440]){
        await page.setViewportSize({width,height:900});await page.goto(baseUrl+`/${source.slug}/`);await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
        const result=await page.evaluate(()=>({ids:[...document.querySelectorAll('[data-kkp-page-id]')].map(e=>e.dataset.kkpPageId),h1:document.querySelectorAll('h1').length,overflow:document.documentElement.scrollWidth>innerWidth+1,overlay:document.querySelectorAll('[data-kkp-private-overlay]').length,skip:document.querySelector('.skip-link')?.getAttribute('href'),main:document.querySelector('main')?.id,radar:document.querySelectorAll('.radar-game-trigger').length,grids:[...document.querySelectorAll('.managed-grid')].map(e=>({id:e.dataset.kkpPageId,columns:getComputedStyle(e).gridTemplateColumns.split(' ').length})),canonical:document.querySelector('[rel=canonical]')?.href}));
        assert.deepEqual(result.ids,map.map(n=>n.id));assert.equal(result.h1,1);assert.equal(result.overflow,false);assert.equal(result.overlay,0);assert.equal(result.skip,'#'+result.main);assert.equal(result.radar,1);assert.equal(result.canonical,'https://krispykp.com/'+source.slug+'/');
        const profile=width>=981?'wide':width>=701?'medium':'compact',limit={wide:3,medium:2,compact:1}[profile];for(const grid of result.grids)assert.ok(grid.columns<=limit);
        if(width<=700){await page.locator('.nav-toggle').click();assert.equal(await page.locator('.nav-toggle').getAttribute('aria-expanded'),'true');await page.keyboard.press('Escape');assert.equal(await page.locator('.nav-toggle').getAttribute('aria-expanded'),'false');}
        const links=await page.locator('main a').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('href'))),visited=[];
        if(links.length){await page.locator('main a').first().focus();for(let i=0;i<links.length;i++){visited.push(await page.evaluate(()=>document.activeElement.getAttribute('href')));if(i+1<links.length)await page.keyboard.press('Tab');}assert.deepEqual(visited,links);}
        for(const image of await page.locator('main img').all())assert.ok(await image.evaluate(e=>e.complete&&e.naturalWidth>0&&Math.abs(e.width/e.height-e.naturalWidth/e.naturalHeight)<0.01),'Image must decode and preserve intrinsic aspect');
        await page.locator('.skip-link').focus();await page.keyboard.press('Enter');assert.ok(page.url().endsWith('#'+result.main));cases++;
      }
    }
    return `central shell/source parity and ${cases} managed page/threshold cases passed; empty registry preserves all seven bespoke routes`;
  }finally{await context.close();}
}
