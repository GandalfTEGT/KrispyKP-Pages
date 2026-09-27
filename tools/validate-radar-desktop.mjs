import assert from "node:assert/strict";

export async function validateRadarDesktop(browser, baseUrl, { captureDir = null } = {}) {
  const context = await browser.newContext({viewport:{width:1920,height:1080}});
  const page = await context.newPage(), errors=[];
  page.on("pageerror", e=>errors.push(e.message));
  page.on("dialog", dialog=>{errors.push("Unexpected native dialog");dialog.dismiss();});
  await page.route("**/*",route=>route.request().url().startsWith(baseUrl)?route.continue():route.abort());
  const state=()=>page.evaluate(()=>window.KRISPY_RADAR_GAME.getSnapshot());
  const capture=async name=>{if(captureDir)await page.screenshot({path:`${captureDir}/${name}.png`});};
  try {
    await page.goto(baseUrl);
    await page.evaluate(()=>scrollTo(0,500)); const savedScroll=await page.evaluate(()=>scrollY);
    await page.locator(".radar-game-trigger").click();
    await page.waitForTimeout(180);
    assert.equal((await state()).simulation,null,"entry started a match");
    assert(await page.locator("body>.shell>main").evaluate(el=>getComputedStyle(el).transform!=="none"),"website panels did not fly forward");
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),"entry overflow");
    await capture("entry-midpoint");
    await page.waitForFunction(()=>window.KRISPY_RADAR_GAME.getState()==="menu");
    assert(await page.locator("body>.shell").evaluate(el=>el.inert),"website interaction not isolated");
    assert.equal(await page.locator("body>.radar-sweep").evaluate(el=>getComputedStyle(el).display),"block","existing radar background hidden");
    await page.locator("[data-faction]").selectOption("obsidian");
    await page.waitForTimeout(220);
    await capture("menu-1920");
    await page.locator('[data-action="sfx"]').click();
    await page.locator('[data-action="start"]').click();
    assert.equal((await state()).simulation.controllers.find(c=>c.type==="local").factionId,"obsidian");
    assert.equal(await page.locator(".radar-rts-hud").count(),0,"redundant top HUD remains");
    assert(await page.locator(".radar-rts-command [data-hud=credits]").isVisible());
    const canvas=page.locator(".radar-game-screen"), box=await canvas.boundingBox();
    const beforeEdge=(await state()).camera.x;
    await page.mouse.move(box.x+box.width-2,box.y+box.height/2);await page.waitForTimeout(450);
    assert((await state()).camera.x>beforeEdge+50,"edge scrolling did not move");
    await page.locator('button[data-tab="structures"]').hover(); const stopped=(await state()).camera.x;await page.waitForTimeout(200);
    assert.equal((await state()).camera.x,stopped,"edge scrolling leaked into sidebar");
    await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down({button:"middle"});await page.mouse.move(box.x+box.width/2-130,box.y+box.height/2+30);await page.mouse.up({button:"middle"});
    assert((await state()).camera.x>stopped+100,"middle pan failed");
    await page.keyboard.press("Home");
    await page.keyboard.press("r");assert.equal(await page.locator('[data-action="repair"]').getAttribute("aria-pressed"),"true");
    await page.keyboard.press("r");assert.equal(await page.locator('[data-action="repair"]').getAttribute("aria-pressed"),"false");
    // Observe real AI construction in the active browser, without injecting buildings or funds.
    await page.clock.install();
    for(let i=0;i<20&&!(await state()).simulation.construction.enemy?.site;i++)await page.clock.runFor(1000);
    await page.clock.runFor(250);
    let snap=await state();assert(snap.simulation.construction.enemy?.site,`AI build site absent at runtime (${snap.lifecycle}, ${snap.simulation.time}s)`);
    const site=snap.simulation.construction.enemy.site, map=await page.locator(".radar-rts-minimap").boundingBox();
    await page.mouse.click(map.x+site.x/snap.simulation.world.width*map.width,map.y+site.y/snap.simulation.world.height*map.height);
    await page.clock.runFor(80);await capture("ai-construction");
    assert(snap.simulation.construction.enemy.progress>0,"AI construction instant/invisible");
    await page.clock.runFor(45000);snap=await state();
    assert(snap.simulation.structures.filter(s=>s.side==="enemy"&&s.type==="refinery").length>=2,"runtime AI refinery expansion absent");
    assert(snap.simulation.units.filter(u=>u.side==="enemy"&&u.type==="harvester").length>=2,"runtime AI harvesters absent");
    await capture("ai-expansion");
    await page.locator('[data-id="powerPlant"]').click();await page.clock.runFor(5500);
    assert((await page.evaluate(()=>window.KRISPY_RADAR_GAME.command.placeStructure(400,640))).placed,"player reactor placement failed");
    await page.locator('[data-action="center-base"]').click();await page.clock.runFor(150);
    await page.locator('[data-action="sell"]').click();
    snap=await state();const balance=snap.simulation.credits.player, camera=snap.camera;
    await page.mouse.click(box.x+(400-camera.x)*camera.zoom,box.y+(640-camera.y)*camera.zoom);
    await page.clock.runFor(100);
    assert.equal((await state()).simulation.credits.player,balance+300,"sell control did not refund exactly once");
    assert(!(await state()).simulation.structures.some(s=>s.side==="player"&&s.type==="powerPlant"),"sold reactor survived");
    await page.locator('[data-action="command-menu"]').click();
    assert(await page.locator('[data-panel="pause"]').isVisible(),"Command menu did not offer resume, quit and leave choices");
    assert.equal(await page.locator('[data-panel="pause"] button').count(),3,"Command menu choices changed");
    await page.locator('[data-panel="pause"] [data-action="quit-match"]').click();
    snap=await state();assert.equal(snap.lifecycle,"menu");assert.equal(snap.simulation,null);assert.equal(snap.animationActive,false);assert.equal(snap.audio.contextState,"none");assert.equal(snap.voice.speaking,false);
    await page.clock.runFor(1000);assert.equal((await state()).simulation,null,"menu restarted simulation");
    await page.locator("[data-map]").selectOption("splitBasin");await page.locator("[data-faction]").selectOption("aurora");
    await page.locator('[data-action="start"]').click();assert.equal((await state()).simulation.mapId,"splitBasin");
    for(const [width,height] of [[2560,1440],[1920,1080],[1440,1000],[1200,1000]]){
      await page.setViewportSize({width,height});await page.clock.runFor(160);
      assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`overflow ${width}`);
      await capture(`game-${width}`);
    }
    await page.setViewportSize({width:1920,height:1080});await page.clock.runFor(100);
    await page.keyboard.press("Escape");assert.equal((await state()).lifecycle,"paused");await page.locator('[data-panel="pause"] [data-action="exit"]').click();await page.clock.runFor(400);await capture("exit-midpoint");await page.clock.runFor(600);await page.clock.resume();
    await page.waitForFunction(()=>window.KRISPY_RADAR_GAME.getState()==="idle");
    assert.equal(await page.evaluate(()=>scrollY),savedScroll,"exit lost scroll");
    assert(await page.locator(".radar-game-trigger").evaluate(el=>document.activeElement===el),"exit lost focus");
    assert.equal(await page.locator("body>.shell").evaluate(el=>el.inert),false);
    assert.equal(await page.locator("body>.shell>main").evaluate(el=>el.getAnimations().length),0,"transition animation leaked");
    await page.emulateMedia({reducedMotion:"reduce"});await page.locator(".radar-game-trigger").click();await page.waitForFunction(()=>window.KRISPY_RADAR_GAME.getState()==="menu");
    assert.equal((await state()).simulation,null);await page.keyboard.press("Escape");await page.waitForFunction(()=>window.KRISPY_RADAR_GAME.getState()==="idle");
    assert.deepEqual(errors,[]);
    return "desktop edge/middle pan, sidebar, factions, real paid AI construction/expansion, Command menu resume/quit/leave choices, immediate teardown/restart, spatial entry/exit restoration, reduced motion and supported-size overflow passed";
  } finally { await context.close(); }
}
