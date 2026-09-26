import assert from "node:assert/strict";

export async function validateRadarRemediation(browser, baseUrl, { captureDir = null } = {}) {
  const context = await browser.newContext({viewport:{width:1920,height:1080}});
  const page = await context.newPage();
  const errors=[];
  page.on("pageerror",error=>errors.push(error.message));
  page.on("console",message=>{if(message.type()==="error" && message.location().url?.startsWith(baseUrl))errors.push(message.text());});
  await page.route("**/*",route=>route.request().url().startsWith(baseUrl)?route.continue():route.abort());
  try {
    await page.goto(baseUrl);
    await page.locator(".radar-game-trigger").click();
    await page.waitForFunction(()=>window.KRISPY_RADAR_GAME.getState()==="menu");
    assert.equal(await page.evaluate(()=>window.KRISPY_RADAR_GAME.getSnapshot().audio.contextState),"none","menu created audio");
    assert.equal(await page.locator(".radar-rts-shell").evaluate(el=>getComputedStyle(el).animationName),"radar-uplink","entry animation missing");
    await page.locator("[data-difficulty]").selectOption("easy");
    await page.locator("[data-map]").selectOption("splitBasin");
    await page.locator('[data-action="sfx"]').click();
    await page.locator('[data-action="start"]').click();
    let snap=await page.evaluate(()=>window.KRISPY_RADAR_GAME.getSnapshot());
    assert.equal(snap.simulation.mapId,"splitBasin");assert.equal(snap.simulation.difficulty,"easy");assert.equal(snap.audio.contextState,"none","muted start created audio");
    await page.locator('[data-action="restart"]').first().click();
    assert.equal(await page.evaluate(()=>window.KRISPY_RADAR_GAME.getSnapshot().simulation.mapId),"splitBasin","restart lost map choice");
    await page.keyboard.press("Escape");await page.waitForFunction(()=>window.KRISPY_RADAR_GAME.getState()==="idle");
    assert.equal(await page.evaluate(()=>window.KRISPY_RADAR_GAME.getSnapshot().audio.voices),0);
    await page.reload();await page.locator(".radar-game-trigger").click();await page.waitForFunction(()=>window.KRISPY_RADAR_GAME.getState()==="menu");
    assert.equal(await page.locator('[data-action="sfx"]').getAttribute("aria-pressed"),"true","mute preference did not persist");
    await page.locator("[data-difficulty]").selectOption("easy");
    await page.locator('[data-action="start"]').click();
    await page.locator('[data-id="powerPlant"]').click();
    await page.waitForFunction(()=>window.KRISPY_RADAR_GAME.getSnapshot().simulation.pendingPlacement.player?.type==="powerPlant");
    await page.waitForFunction(()=>document.querySelector('[data-id="powerPlant"]').dataset.ready==="true");
    await page.evaluate(()=>window.KRISPY_RADAR_GAME.command.placeStructure(400,640));
    for(const width of [1899,1900,1920,2560]){
      await page.setViewportSize({width,height:width===2560?1440:1080});
      const button=page.locator('[data-id="barracks"]');await button.hover();
      const handle=await button.elementHandle(),before=await button.boundingBox();
      await page.waitForTimeout(300);
      assert(await handle.evaluate(el=>el.isConnected),`hover detached at ${width}`);
      assert.deepEqual(await button.boundingBox(),before,`hover hitbox shifted at ${width}`);
      const credits=await page.evaluate(()=>window.KRISPY_RADAR_GAME.getSnapshot().simulation.credits.player);
      await page.mouse.down();await page.waitForTimeout(180);await page.mouse.up();
      snap=await page.evaluate(()=>window.KRISPY_RADAR_GAME.getSnapshot());
      assert.equal(snap.simulation.construction.player?.type,"barracks",`held click missed at ${width}`);
      assert.equal(snap.simulation.credits.player,credits-500,`click charged more than once at ${width}`);
      await page.waitForTimeout(180);
      assert(Number(await button.getAttribute("data-progress"))>0,"radar sweep progress absent");
      assert((await button.getAttribute("style")).includes("--radar-progress"),"radial progress value absent");
      await page.locator("[data-cancel]").click();
    }
    await page.locator('[data-action="sfx"]').click();
    assert.equal(await page.evaluate(()=>window.KRISPY_RADAR_GAME.getSnapshot().audio.muted),false);
    await page.locator('[data-action="restart"]').first().click();
    assert((await page.evaluate(()=>window.KRISPY_RADAR_GAME.getSnapshot().audio.voices))<=6);
    await page.keyboard.press("Escape");await page.waitForFunction(()=>window.KRISPY_RADAR_GAME.getState()==="idle");
    assert.equal(await page.evaluate(()=>window.KRISPY_RADAR_GAME.getSnapshot().audio.contextState),"none","audio survived exit");
    await page.clock.install();
    await page.locator(".radar-game-trigger").click();await page.waitForFunction(()=>window.KRISPY_RADAR_GAME.getState()==="menu");
    await page.locator('[data-action="sfx"]').click(); // mute before accelerating the clock
    await page.locator('[data-action="start"]').click();
    const construct = async (type,x,y,ms) => {
      const started=await page.evaluate(type=>window.KRISPY_RADAR_GAME.command.startStructure(type),type);
      assert(started.available,`${type}: ${started.reason}`);
      await page.clock.runFor(ms);
      const result=await page.evaluate(([x,y])=>window.KRISPY_RADAR_GAME.command.placeStructure(x,y),[x,y]);
      assert(result.placed,`${type} placement: ${result.reason}`);
    };
    await construct("powerPlant",400,640,5300);
    await construct("refinery",440,960,8300);
    await construct("barracks",520,720,5300);
    await page.clock.runFor(20000);
    await construct("warFactory",200,400,10300);
    for(let i=0;i<4 && await page.evaluate(()=>window.KRISPY_RADAR_GAME.getSnapshot().simulation.credits.player)<920;i++)await page.clock.runFor(10000);
    await page.locator('[data-tab="infantry"]').click();await page.locator('[data-id="marksman"]').click();
    await page.locator('[data-tab="vehicles"]').click();await page.locator('[data-id="scout"]').click();
    await page.clock.runFor(700);
    assert(Number(await page.locator('[data-progress="infantry"]').getAttribute("value"))>0,"infantry HUD did not advance");
    assert(Number(await page.locator('[data-progress="vehicles"]').getAttribute("value"))>0,"vehicle HUD did not advance simultaneously");
    await page.locator('[data-queue-action="pause"]').click();await page.clock.runFor(500);
    assert((await page.locator('[data-hud="vehicles-detail"]').textContent()).includes("paused"),"queue pause not exposed");
    await page.locator('[data-tab="infantry"]').click();
    assert((await page.locator('[data-hud="infantry-detail"]').textContent()).includes("queued"),"other queue disappeared");
    if (captureDir) {
      await page.locator('[data-queue-action="pause"]').click();
      for (const [width,height] of [[2560,1440],[1920,1080],[1440,900],[1024,768],[390,844],[844,390]]) {
        await page.setViewportSize({width,height});await page.clock.runFor(150);
        await page.screenshot({path:`${captureDir}/queues-${width}.png`});
      }
    }
    await page.locator('[data-queue-action="cancel"]').click();await page.clock.runFor(200);
    assert.equal(await page.locator('[data-hud="infantry"]').textContent(),"Idle","cancel did not clear infantry queue");
    assert((await page.locator('[data-hud="vehicles-detail"]').textContent()).includes("paused"),"cancel affected vehicle queue");
    await page.keyboard.press("Escape");await page.clock.runFor(250);await page.clock.resume();
    await page.emulateMedia({reducedMotion:"reduce"});
    await page.locator(".radar-game-trigger").click();await page.waitForFunction(()=>window.KRISPY_RADAR_GAME.getState()==="menu");
    assert.equal(await page.locator(".radar-rts-shell").evaluate(el=>getComputedStyle(el).animationName),"none","entry ignores reduced motion");
    await page.keyboard.press("Escape");await page.waitForFunction(()=>window.KRISPY_RADAR_GAME.getState()==="idle");
    // Storage denial must not block the menu, mute or gameplay.
    await page.addInitScript(()=>{Object.defineProperty(window,"localStorage",{get(){throw new Error("storage disabled");}});});
    await page.reload();await page.locator(".radar-game-trigger").click();await page.waitForFunction(()=>window.KRISPY_RADAR_GAME.getState()==="menu");
    await page.locator('[data-action="sfx"]').click();await page.locator('[data-action="start"]').click();
    assert.equal(await page.evaluate(()=>window.KRISPY_RADAR_GAME.getSnapshot().audio.muted),true);
    await page.keyboard.press("Escape");await page.waitForFunction(()=>window.KRISPY_RADAR_GAME.getState()==="idle");
    assert.deepEqual(errors,[],"first-party Radar errors");
    return "wide-screen stable hover/held click/exactly-one charge at 1899/1900/1920/2560; radial progress; paid build/economy to simultaneous queue HUD/pause/cancel; entry/reduced motion; map/difficulty/restart; dormant audio, mute persistence, storage denial and cleanup passed";
  } finally {await context.close();}
}
