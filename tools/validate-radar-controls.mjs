import assert from "node:assert/strict";

export async function validateRadarControls(browser, baseUrl, {captureDir=null,onProgress=()=>{}}={}) {
  const context=await browser.newContext({viewport:{width:1920,height:1080}}), page=await context.newPage(), errors=[];
  page.on("pageerror",e=>errors.push(e.message));
  page.on("dialog",d=>{errors.push(`Native ${d.type()}`);d.dismiss();});
  await page.route("**/*",r=>r.request().url().startsWith(baseUrl)?r.continue():r.abort());
  const state=()=>page.evaluate(()=>window.KRISPY_RADAR_GAME.getSnapshot());
  const shot=async name=>{if(captureDir)await page.screenshot({path:`${captureDir}/${name}.png`});};
  const menu=async()=>{await page.locator(".radar-game-trigger").click();await page.waitForFunction(()=>window.KRISPY_RADAR_GAME.getState()==="menu");};
  try {
    await page.goto(baseUrl);await page.evaluate(()=>scrollTo({top:500,behavior:"instant"}));const scroll=await page.evaluate(()=>scrollY);
    await menu();await page.mouse.move(700,500);await page.mouse.wheel(0,1100);await page.waitForTimeout(100);
    assert.equal(await page.evaluate(()=>scrollY),scroll,"menu wheel moved website");
    await page.evaluate(()=>{
      window.radarExitFrames=[];
      const sample=()=>{const o=document.querySelector(".radar-game-overlay"),side=document.querySelector(".radar-rts-command");
        if(!o)return;
        window.radarExitFrames.push({state:o.dataset.gameState,visible:!!side?.checkVisibility({checkOpacity:true,checkVisibilityCSS:true})});requestAnimationFrame(sample);};requestAnimationFrame(sample);
    });
    await page.locator('[data-panel=start] [data-action=exit]').click();await page.waitForFunction(()=>window.KRISPY_RADAR_GAME.getState()==="idle");
    assert(await page.evaluate(()=>window.radarExitFrames.every(f=>!f.visible)),"menu exit flashed gameplay sidebar");
    assert.equal(await page.evaluate(()=>scrollY),scroll);
    await menu();await page.locator('[data-action=settings]').click();
    assert(await page.locator('[data-panel=settings]').isVisible());
    await page.locator('[data-setting=edgeScroll]').uncheck();
    await page.locator('[data-setting=middlePan]').uncheck();
    await page.locator('[data-setting=rightDragPan]').check();
    await page.locator('[data-setting=edgeSpeed]').fill("950");await page.locator('[data-setting=edgeSpeed]').dispatchEvent("change");
    await page.locator('[data-setting=edgeMargin]').fill("60");await page.locator('[data-setting=edgeMargin]').dispatchEvent("change");
    await page.locator('[data-setting=sfxEnabled]').uncheck();
    await page.locator('[data-setting=sfxVolume]').fill("0.3");await page.locator('[data-setting=sfxVolume]').dispatchEvent("change");
    await page.locator('[data-binding=repair]').selectOption("s");
    assert((await page.locator('[data-settings-status]').textContent()).includes("already"));
    await page.locator('[data-binding=repair]').selectOption("z");
    for(const [width,height] of [[2560,1440],[1920,1080],[1440,900]]){await page.setViewportSize({width,height});await shot(`settings-${width}`);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));}
    await page.setViewportSize({width:1920,height:1080});
    await page.keyboard.press("Escape");assert.equal((await state()).lifecycle,"menu");
    await page.locator('[data-faction]').selectOption("obsidian");await page.locator('[data-difficulty]').selectOption("easy");
    await page.locator('[data-action=start]').click();await page.waitForTimeout(180);
    assert((await page.locator('[data-faction-badge]').textContent()).includes("Obsidian"));
    let snap=await state();const canvas=page.locator('.radar-game-screen'), box=await canvas.boundingBox();
    await page.mouse.move(box.x+box.width-1,box.y+box.height/2);await page.waitForTimeout(220);
    assert.equal((await state()).camera.x,snap.camera.x,"disabled edge scrolling moved");
    await page.mouse.move(box.x+400,box.y+300);await page.mouse.down({button:"middle"});await page.mouse.move(box.x+300,box.y+300);await page.mouse.up({button:"middle"});
    assert.equal((await state()).camera.x,snap.camera.x,"disabled middle pan moved");
    await canvas.focus();await page.keyboard.press("z");assert.equal((await state()).targeting,"repair");
    await page.mouse.click(box.x+300,box.y+300,{button:"right"});assert.equal((await state()).targeting,null,"right click did not cancel repair");
    await canvas.focus();await page.keyboard.press("x");await page.keyboard.press("Escape");assert.equal((await state()).lifecycle,"playing");assert.equal((await state()).targeting,null);
    assert.equal(await canvas.evaluate(el=>getComputedStyle(el).outlineStyle),"none","amber battlefield box remains");
    assert((await page.locator('.radar-focus-status').evaluate(el=>getComputedStyle(el,'::before').content)).includes("BATTLEFIELD"));
    // Browser commands exercise selection/orders; engine-only tests cover combat consequences.
    const clickWorld=async (x,y,options={})=>{const v=await state(),b=await canvas.boundingBox();await page.mouse.click(b.x+(x-v.camera.x)*v.camera.zoom,b.y+(y-v.camera.y)*v.camera.zoom,options);};
    const unit=snap.simulation.units.find(u=>u.side==="player");await clickWorld(unit.x,unit.y);
    assert((await state()).simulation.selectedIds.includes(unit.id));
    await page.mouse.click(box.x+650,box.y+500,{button:"right"});
    const clickOrder=(await state()).simulation.units.find(u=>u.id===unit.id).order;
    assert.equal(clickOrder?.type,"move","stationary right click did not order");
    const cameraBeforeDrag=(await state()).camera;
    await page.mouse.move(box.x+600,box.y+450);await page.mouse.down({button:"right"});await page.mouse.move(box.x+480,box.y+450,{steps:4});await page.mouse.up({button:"right"});
    const afterRightDrag=await state();assert(afterRightDrag.camera.x>cameraBeforeDrag.x+80,"enabled right-drag did not pan");
    assert.deepEqual(afterRightDrag.simulation.units.find(u=>u.id===unit.id).order,clickOrder,"right-drag issued an accidental order");
    await page.keyboard.press("Shift+1");await clickWorld(500,800);assert.equal((await state()).simulation.selectedIds.length,0,"empty left-click did not deselect");
    await page.keyboard.press("1");assert((await state()).simulation.selectedIds.includes(unit.id),"group recall failed");
    await page.keyboard.press("a");await clickWorld(700,800);assert.equal((await state()).simulation.units.find(u=>u.id===unit.id).order?.type,"attack-move");
    await page.keyboard.press("g");await clickWorld(600,800);assert.equal((await state()).simulation.units.find(u=>u.id===unit.id).order?.type,"guard");
    await page.keyboard.press("d");assert.equal((await state()).simulation.units.find(u=>u.id===unit.id).order?.type,"move");
    await page.keyboard.press("f");await clickWorld(700,850);assert.equal((await state()).simulation.units.find(u=>u.id===unit.id).order?.type,"force-fire");
    await page.keyboard.press("s");assert.equal((await state()).simulation.units.find(u=>u.id===unit.id).order,null);
    await page.keyboard.press("PageDown");await page.mouse.wheel(0,300);assert.equal(await page.evaluate(()=>scrollY),scroll,"game controls scrolled page");
    await page.keyboard.press("Escape");snap=await state();assert.equal(snap.lifecycle,"paused");assert(await page.locator('[data-panel=pause]').isVisible());
    await page.locator('[data-panel=pause] [data-action=quit-match]').click();snap=await state();assert.equal(snap.lifecycle,"menu");assert.equal(snap.simulation,null);assert.equal(snap.animationActive,false);assert.equal(snap.audio.contextState,"none");
    await page.locator('[data-action=start]').click();await canvas.focus();await page.keyboard.press("1");assert.equal((await state()).simulation.selectedIds.length,0,"groups leaked between matches");
    await page.locator('[data-action=exit]').first().click();await page.waitForFunction(()=>window.KRISPY_RADAR_GAME.getState()==="idle");
    assert.equal(await page.evaluate(()=>scrollY),scroll);assert.equal(await page.evaluate(()=>document.documentElement.style.overflow),"");
    await page.reload();await menu();assert.equal((await state()).settings.edgeSpeed,950);assert.equal((await state()).settings.edgeMargin,60);assert.equal((await state()).settings.rightDragPan,true);assert.equal((await state()).settings.bindings.repair,"z");assert.equal((await state()).settings.sfxVolume,.3);
    await page.locator('[data-action=settings]').click();await page.locator('[data-action=reset-settings]').click();
    snap=await state();assert.equal(snap.settings.edgeSpeed,700);assert.equal(snap.settings.edgeMargin,44);assert.equal(snap.settings.rightDragPan,false);assert.equal(snap.settings.edgeScroll,true);assert.equal(snap.settings.bindings.repair,"r");
    assert((await page.locator('[data-settings-status]').textContent()).includes("Defaults restored"));
    await page.locator('[data-setting=mouseModel]').selectOption("classic-left");await page.locator('[data-setting=edgeScroll]').check();await page.locator('[data-setting=middlePan]').check();await page.locator('[data-action=settings-close]').click();
    await page.locator('[data-difficulty]').selectOption("easy");await page.locator('[data-action=start]').click();
    snap=await state();const unit2=snap.simulation.units.find(u=>u.side==="player");await clickWorld(unit2.x,unit2.y);await clickWorld(600,800);
    assert.equal((await state()).simulation.units.find(u=>u.id===unit2.id).order?.type,"move","alternative mouse model failed");
    await page.locator('[data-action=exit]').first().click();await page.waitForFunction(()=>window.KRISPY_RADAR_GAME.getState()==="idle");
    // Isolated production fixture: same shipped engine/build rules, existing validation
    // scenario (20,000 starting credits, no AI). Avoid tying UI layout coverage to a
    // ten-minute undefended match. Real paid AI/economy remains covered separately.
    await page.route('**/radar-rts-engine.js',async route=>{
      const response=await route.fetch();const source=await response.text();
      assert(source.includes('scenario = "standard"'));
      await route.fulfill({response,body:source.replace('scenario = "standard"','scenario = "validation"')});
    });
    await page.reload();await menu();await page.locator('[data-action=start]').click();
    await page.clock.install();
    const construct=async type=>{
      let result;
      onProgress({building:type,time:(await state()).simulation.time,credits:(await state()).simulation.credits.player});
      for(let attempt=0;attempt<35;attempt++) {result=await page.evaluate(t=>window.KRISPY_RADAR_GAME.command.startStructure(t),type);if(result.available)break;await page.clock.runFor(10000);}
      assert(result.available,`${type} could not be afforded`);
      for(let attempt=0;attempt<60 && !(await state()).simulation.pendingPlacement.player;attempt++)await page.clock.runFor(1000);
      const placed=await page.evaluate(type=>{
        const preferred=type==="refinery"?[[440,960]]:type==="powerPlant"?[[400,640],[700,740],[850,780]]:[];
        for(const [x,y] of preferred){if(window.KRISPY_RADAR_GAME.command.placeStructure(x,y).placed)return true;}
        for(let y=440;y<=1320;y+=40)for(let x=120;x<=1000;x+=40){const r=window.KRISPY_RADAR_GAME.command.placeStructure(x,y);if(r.placed)return true;}return false;
      },type);assert(placed,`${type} no valid placement`);
    };
    await construct("powerPlant");await construct("refinery");
    for(let i=0;i<3;i++)await construct("barracks");
    await construct("powerPlant");for(let i=0;i<3;i++)await construct("warFactory");await construct("powerPlant");
    const types=[['infantry','barracks','rifle'],['vehicles','warFactory','scout']];
    for(const [tab,type,unitType] of types){
      for(let attempts=0;attempts<35&&(await state()).simulation.credits.player<1800;attempts++)await page.clock.runFor(10000);
      await page.locator(`[data-tab="${tab}"]`).click();
      for(let i=0;i<3;i++)await page.locator(`[data-id="${unitType}"]`).click();await page.clock.runFor(150);
      assert.equal(await page.locator('[data-queue-row]').count(),3);
      const factories=(await state()).simulation.structures.filter(s=>s.side==="player"&&s.type===type);
      assert(factories.every(s=>s.queue.length===1),"factories lost independent queues");
      const secondQueue=page.locator('[data-queue-action=detail]').nth(1);
      await secondQueue.click({button:"right"});await page.clock.runFor(100);
      assert((await state()).simulation.structures.find(s=>s.id===factories[1].id).productionPaused);
      await page.locator(`[data-id="${unitType}"]`).click();await page.clock.runFor(100);
      let secondFactory=(await state()).simulation.structures.find(s=>s.id===factories[1].id);
      assert.equal(secondFactory.queue.length,2,"left click did not add to the selected queue");
      assert.equal(secondFactory.productionPaused,false,"left click did not resume the paused queue");
      await secondQueue.click({button:"right"});await page.clock.runFor(100);
      assert((await state()).simulation.structures.find(s=>s.id===factories[1].id).productionPaused,"first right click on resumed queue did not pause");
      await secondQueue.click({button:"right"});await page.clock.runFor(100);
      assert.equal((await state()).simulation.structures.find(s=>s.id===factories[1].id).queue.length,1,"second right click did not remove one unit");
      await secondQueue.click({button:"right"});await page.clock.runFor(100);
      secondFactory=(await state()).simulation.structures.find(s=>s.id===factories[1].id);
      assert.equal(secondFactory.queue.length,0,"repeated right clicks did not cancel the queue");
      assert.equal(secondFactory.productionPaused,false,"empty queue retained paused state");
      assert(await page.locator('[data-queues]').evaluate(el=>el.scrollHeight<=el.clientHeight+1),"compact queues scroll vertically");
      for(const [width,height] of [[2560,1440],[1920,1080],[1440,1000]]){
        await page.setViewportSize({width,height});await page.clock.runFor(160);
        assert(await canvas.evaluate(el=>{
          const pixels=el.getContext('2d').getImageData(0,0,el.width,el.height).data;
          for(let i=0;i<pixels.length;i+=4)if(pixels[i]+pixels[i+1]+pixels[i+2]>40)return true;
          return false;
        }),"battlefield remained blank after resize");
        await shot(`${tab}-3-queues-${width}`);
      }
    }
    await page.setViewportSize({width:1920,height:1080});await page.clock.runFor(100);await page.locator('[data-action=exit]').first().click();await page.clock.runFor(1000);await page.clock.resume();
    await page.waitForFunction(()=>window.KRISPY_RADAR_GAME.getState()==="idle");
    await page.unroute('**/radar-rts-engine.js');
    await page.addInitScript(()=>{Object.defineProperty(window,"localStorage",{get(){throw Error("disabled");}});});await page.reload();await menu();await page.locator('[data-action=settings]').click();await page.locator('[data-setting=edgeScroll]').uncheck();await page.locator('[data-binding=repair]').selectOption("z");await page.locator('[data-action=settings-close]').click();
    assert.equal((await state()).settings.edgeScroll,false);await page.locator('[data-action=start]').click();await canvas.focus();await page.keyboard.press("z");assert.equal((await state()).targeting,"repair");
    await page.locator('[data-action=exit]').first().click();await page.waitForFunction(()=>window.KRISPY_RADAR_GAME.getState()==="idle");
    assert.deepEqual(errors,[]);
    return "menu-exit frames, scroll lock/restoration, no native dialogs, configurable controls/settings persistence/restore-defaults/denial, hotkeys/groups/orders, faction/focus feedback and three independent Barracks/Vehicle Bay queues with left-add/resume and right-pause/remove passed";
  } finally {await context.close();}
}
