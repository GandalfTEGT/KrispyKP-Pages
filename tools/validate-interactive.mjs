import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

export function validateInteractiveStatic(root,result,record){
  const source=fs.readFileSync(path.join(root,'interactive/index.html'),'utf8');
  const files=fs.readdirSync(path.join(root,'interactive/assets')).sort();
  record(result,'interactive:limited-public-content',JSON.stringify(files)===JSON.stringify(['coming-soon.css','favicon.svg','logo.svg','social.png'])&&JSON.stringify(fs.readdirSync(path.join(root,'interactive')).sort())===JSON.stringify(['assets','index.html'])&&!/<script\b|<iframe\b/i.test(source),{message:'single holding route, four declared assets, no runtime scripts or portfolio subroutes'});
  record(result,'interactive:indexable',/name="robots" content="index,follow"/.test(source)&&!/(?:noindex|nofollow|noarchive|no-store)/i.test(source)&&source.includes('href="https://krispykp.com/interactive/"'),{message:'normal public canonical and index/follow metadata'});
  for(const name of ['logo.svg','favicon.svg']){const svg=fs.readFileSync(path.join(root,'interactive/assets',name),'utf8');record(result,'interactive:svg:'+name,/<svg\b/.test(svg)&&/viewBox=/.test(svg)&&!/<script\b|<foreignObject\b|(?:href|src)=["'](?:https?:|javascript:|data:)/i.test(svg),{message:'self-contained supplied vector asset'});}
}

export async function validateInteractiveBrowser(browser,baseUrl,{root,screenshots=false}={}){
  const cases=[];
  const recordCase=(kind,extra={})=>cases.push({kind,status:'PASS',...extra});
  for(const dpr of [1,2]){
    const ctx=await browser.newContext({deviceScaleFactor:dpr});
    const errors=[],outside=[];
    await ctx.route('**/*',route=>{if(route.request().url().startsWith(baseUrl))route.continue();else{outside.push(route.request().url());route.abort();}});
    const page=await ctx.newPage();page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});
    try{for(const width of [280,320,390,650,768,1024,1440,1920]){
      await page.setViewportSize({width,height:900});await page.goto(baseUrl+'/interactive/');
      assert.equal(await page.getByRole('heading',{name:'KrispyKP Interactive',level:1}).count(),1);
      assert.equal(await page.getByRole('heading',{name:'Coming Soon',level:2}).count(),1);
      assert.equal(await page.locator('script,iframe').count(),0);
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
      const logo=page.locator('.studio-logo');await logo.evaluate(e=>e.decode());
      const box=await logo.evaluate(e=>{const r=e.getBoundingClientRect();return {width:r.width,height:r.height,nw:e.naturalWidth,nh:e.naturalHeight};});assert.ok(Math.abs(box.width/box.height-box.nw/box.nh)<.01);
      assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'),'https://krispykp.com/interactive/');
      assert.equal(await page.locator('meta[name="robots"]').getAttribute('content'),'index,follow');
      assert.equal(await page.locator('meta[property="og:image"]').getAttribute('content'),'https://krispykp.com/interactive/assets/social.png');
      assert.equal(await page.locator('link[rel="stylesheet"]').evaluateAll(nodes=>nodes.length===1&&new URL(nodes[0].href).pathname==='/interactive/assets/coming-soon.css'),true);
      assert.equal(await page.locator('.back-link').getAttribute('href'),'/');
      assert.ok((await page.locator('main').textContent()).includes("We're building this space to share our projects and development updates. More information will be available as they're ready."));
      const control=await page.locator('.back-link').boundingBox();assert.ok(control.height>=44);
      await page.keyboard.press('Tab');assert.equal(await page.locator('.skip-link').evaluate(e=>e===document.activeElement),true);await page.keyboard.press('Enter');assert.equal(await page.locator('main').evaluate(e=>e===document.activeElement),true);await page.keyboard.press('Tab');assert.equal(await page.locator('.back-link').evaluate(e=>e===document.activeElement),true);assert.notEqual(await page.locator('.back-link').evaluate(e=>getComputedStyle(e).outlineStyle),'none');
      if(screenshots&&dpr===1&&[390,1440].includes(width)){const dir=path.join(root,'.validation/interactive');fs.mkdirSync(dir,{recursive:true});await page.screenshot({path:path.join(dir,'coming-soon-'+width+'.png'),fullPage:true});}
      recordCase('responsive-logo-meta-keyboard',{width,dpr});
    }
    const png=await page.evaluate(async()=>{const img=new Image();img.src='/interactive/assets/social.png';await img.decode();return [img.naturalWidth,img.naturalHeight];});assert.deepEqual(png,[1200,630]);assert.deepEqual(errors,[]);assert.deepEqual(outside,[]);
    }finally{await ctx.close();}
  }
  for(const settings of [{javaScriptEnabled:false},{reducedMotion:'reduce'}]){
    const ctx=await browser.newContext({viewport:{width:390,height:844},...settings}),page=await ctx.newPage();try{await page.goto(baseUrl+'/interactive/');assert.equal(await page.locator('.back-link').isVisible(),true);assert.equal(await page.evaluate(()=>document.getAnimations().length),0);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);recordCase('progressive-and-reduced-motion',{settings});}finally{await ctx.close();}
  }
  const ctx=await browser.newContext({viewport:{width:390,height:844}}),page=await ctx.newPage();
  await ctx.route('**/*',r=>r.request().url().startsWith(baseUrl)?r.continue():r.abort());
  try{await page.goto(baseUrl+'/interactive/');await page.locator('.back-link').click();await page.waitForURL(baseUrl+'/');const link=page.locator('a[href="/interactive/"]');assert.equal(await link.count(),1);await link.scrollIntoViewIfNeeded();assert.equal(await link.isVisible(),true);await link.click();await page.waitForURL(baseUrl+'/interactive/');assert.equal(await page.locator('script').count(),0);recordCase('parent-discovery-roundtrip');}finally{await ctx.close();}
  const receipt={status:'PASS',cases,browser:browser.version(),manual:['Physical input, true zoom, real assistive technology, non-Chromium and search/social crawlers remain unverified.']};if(root){fs.mkdirSync(path.join(root,'.validation'),{recursive:true});fs.writeFileSync(path.join(root,'.validation/interactive-browser.json'),JSON.stringify(receipt,null,2)+'\n');}return receipt;
}
