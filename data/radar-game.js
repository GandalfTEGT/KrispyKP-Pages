(() => {
  "use strict";
  if (window.KRISPY_RADAR_GAME) return;

  const rootUrl = document.currentScript?.src || new URL("data/radar-game.js", document.baseURI).href;
  const moduleUrl = name => new URL(name, rootUrl).href;
  const STATES = Object.freeze({
    IDLE: "idle",
    LOADING: "loading",
    MENU: "menu",
    PLAYING: "playing",
    PAUSED: "paused",
    ENDED: "ended",
    EXITING: "exiting"
  });
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const supportedViewport = () => innerWidth >= 1200 && innerHeight >= 1000;
  const session = {
    state: STATES.IDLE,
    trigger: null,
    overlay: null,
    engine: null,
    renderer: null,
    modules: null,
    audio: null,
    muted: false,
    preferenceLoaded: false,
    matchOptions: { mapId: "crystalReach", difficulty: "normal", factionId: "aurora" },
    settings: null, groups: null, orderTool: null, rightPan: null, viewportPaused: false, queueTarget: null,
    voice: null, voiceEnabled: false, tool: null, edgePoint: null, middlePan: null,
    siteAnimations: [], siteNodes: [], transitionToken: 0, previousOverflow: "",
    lastLowPower: false,
    raf: 0,
    lastFrame: 0,
    lastHud: 0,
    resizeRaf: 0,
    scrollY: 0,
    focus: null,
    profile: "desktop",
    pointerWorld: null,
    placement: null,
    dragBox: null,
    pointerId: null,
    pointerStart: null,
    pointerMoved: false,
    pointers: new Map(),
    pinch: null,
    targeting: false,
    keys: new Set(),
    listeners: [],
    lastEventId: null
  };

  const listen = (node, type, handler, options) => {
    node.addEventListener(type, handler, options);
    session.listeners.push(() => node.removeEventListener(type, handler, options));
  };
  const classifyProfile = () => {
    if (innerWidth <= 560 && innerHeight >= innerWidth) return "mobile-portrait";
    if (innerHeight <= 520 && innerWidth > innerHeight) return "mobile-landscape";
    if (innerWidth < 1100) return "tablet";
    if (innerWidth >= 1900) return "desktop-large";
    return "desktop";
  };
  const setState = next => {
    session.state = next;
    if (session.overlay) session.overlay.dataset.gameState = next;
    document.body.dataset.radarGameState = next;
    updateButtons();
  };
  const announce = message => {
    const node = session.overlay?.querySelector(".radar-rts-live");
    if (!node) return;
    node.textContent = "";
    clearTimeout(session.announceTimer);
    session.announceTimer = setTimeout(() => { node.textContent = message; }, 16);
  };

  function installTrigger() {
    const trigger = document.createElement("button");
    trigger.type = "button";
    trigger.className = "radar-game-trigger";
    trigger.innerHTML = '<span class="radar-game-trigger-dot" aria-hidden="true"></span><span data-radar-trigger-label>Radar Command</span>';
    trigger.setAttribute("aria-label", "Open Radar RTS");
    trigger.setAttribute("aria-haspopup", "dialog");
    trigger.setAttribute("aria-controls", "radarGameOverlay");
    trigger.addEventListener("click", activate);
    document.body.append(trigger);
    session.trigger = trigger;
    updateAvailability();
    window.addEventListener("resize", updateAvailability);
  }

  function updateAvailability() {
    if (!session.trigger) return;
    const available = supportedViewport();
    session.trigger.disabled = !available;
    session.trigger.querySelector('[data-radar-trigger-label]').textContent = available ? "Radar Command" : "Radar Command requires a larger desktop viewport";
    session.trigger.setAttribute("aria-label", available ? "Open Radar Command" : "Radar Command requires a viewport at least 1200 by 1000 pixels");
  }

  async function loadModules() {
    if (!session.modules) {
      const [engine, renderer, definitions, audio, icons, input, voice] = await Promise.all([
        import(moduleUrl("radar-rts-engine.js")),
        import(moduleUrl("radar-rts-renderer.js")),
        import(moduleUrl("radar-rts-definitions.js")),
        import(moduleUrl("radar-rts-audio.js")),
        import(moduleUrl("radar-rts-icons.js")),
        import(moduleUrl("radar-rts-input.js")), import(moduleUrl("radar-rts-voice.js"))
      ]);
      session.modules = { ...engine, ...renderer, ...definitions, ...audio, ...icons, ...input, ...voice };
    }
    return session.modules;
  }

  function makeOverlay() {
    const overlay = document.createElement("div");
    overlay.id = "radarGameOverlay";
    overlay.className = "radar-game-overlay radar-rts";
    overlay.dataset.profile = classifyProfile();
    overlay.dataset.gameState = STATES.LOADING;
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-labelledby", "radarGameTitle");
    overlay.innerHTML = `
      <div class="radar-rts-shell">
        <header class="radar-rts-header">
          <div><span class="radar-rts-kicker">Tactical uplink // live simulation</span><h2 id="radarGameTitle">RADAR COMMAND</h2></div>
          <div class="radar-rts-actions"><button data-action="sfx" aria-pressed="false">SFX on</button><button data-action="voice" aria-pressed="false">Voice off</button><button data-action="pause">Pause</button><button data-action="restart">Restart</button><button data-action="exit" class="danger">Exit</button></div>
        </header>
        <main class="radar-rts-main">
          <section class="radar-rts-battlefield" aria-label="Tactical battlefield">
            <canvas class="radar-game-screen" tabindex="0" aria-label="Radar RTS battlefield"></canvas>
            <div class="radar-rts-toast" aria-live="polite"></div>
            <div class="radar-rts-modal" data-panel="pause" hidden><h3>COMMAND MENU</h3><p>The simulation is paused. Resume the battle, quit this match, or leave Radar Command.</p><button data-action="resume">Resume game</button><button data-action="quit-match">Quit match</button><button data-action="exit">Leave Radar</button></div>
            <div class="radar-rts-modal" data-panel="viewport" hidden><h3>VIEWPORT TOO SMALL</h3><p>Radar Command requires at least 1200 × 1000. Restore the window size to continue.</p><button data-action="exit">Leave Radar</button></div>
            <div class="radar-rts-modal" data-panel="outcome" hidden><h3 data-outcome-title>MISSION COMPLETE</h3><p data-outcome-copy></p><button data-action="restart">Restart</button><button data-action="menu">Return to Command</button><button data-action="exit">Return to site</button></div>
          </section>
          <aside class="radar-rts-command" aria-label="Command console">
            <div class="radar-rts-economy"><div class="radar-rts-credit" aria-label="Credits"><i data-icon="credits"></i><strong data-hud="credits">0</strong><small>CR</small></div><div class="radar-rts-power" data-power-cell><i data-icon="powerPlant"></i><meter data-power-meter min="0" max="100" value="0" aria-label="Power consumption"></meter><strong data-hud="power-state">POWER</strong><small data-hud="power">—</small></div></div>
            <div class="radar-rts-construction"><strong data-hud="construction">Idle</strong><progress data-progress="construction" max="100" value="0" aria-label="Structure construction"></progress><small data-hud="construction-detail">No active build</small></div>
            <div class="radar-rts-tool-row"><button data-action="repair" aria-pressed="false" title="R: toggle repair, 10 CR/s for 20 HP/s"><i data-icon="repair"></i>Repair</button><button data-action="sell" aria-pressed="false" title="X: sell an owned structure for 50%; queued units refund 75%"><i data-icon="sell"></i>Sell</button><button data-action="command-menu">Command menu</button></div>
            <div class="radar-rts-map-wrap"><canvas class="radar-rts-minimap" aria-label="Battlefield minimap"></canvas><span>MINIMAP // TAP TO NAVIGATE</span></div>
            <div class="radar-rts-faction" data-faction-badge></div><div class="radar-rts-selection" data-selection>No units selected</div>
            <div class="radar-rts-tabs" role="tablist" aria-label="Production categories"><button role="tab" aria-selected="true" data-tab="structures">Build</button><button role="tab" aria-selected="false" data-tab="infantry">Infantry</button><button role="tab" aria-selected="false" data-tab="vehicles">Vehicles</button><button role="tab" aria-selected="false" data-tab="special">Special</button></div>
            <div class="radar-rts-queues" data-queues></div><div class="radar-rts-options" data-options></div>
            <div class="radar-rts-orders" aria-label="Unit orders">
              <button data-action="center-base" title="Center base"><i data-icon="hq"></i>Base</button>
              <button data-action="stop" title="Stop selected units"><i data-icon="stop"></i>Stop</button>
              <button data-action="guard" title="Defend a location"><i data-icon="guard"></i>Guard</button>
              <button data-action="scatter" title="Spread selected units"><i data-icon="scatter"></i>Scatter</button>
              <button data-action="attack-move" title="Move and engage threats"><i data-icon="attack"></i>Attack move</button>
              <button data-action="force-fire" title="Fire at a location; friendly targets can be hit"><i data-icon="special"></i>Force fire</button>
            </div>
          </aside>
          <section class="radar-rts-start" data-panel="start" aria-labelledby="radarStartTitle">
            <div class="radar-rts-start-card"><span class="radar-rts-kicker">Tactical browser RTS</span><h3 id="radarStartTitle">RADAR COMMAND</h3><p class="version">Version 1.5.0 · Public release candidate</p><p>Establish power, harvest crystal, build a strike force and destroy the hostile Command Hub.</p><div class="radar-rts-setup"><label>Difficulty<select data-difficulty aria-describedby="radarDifficultyInfo"></select><small id="radarDifficultyInfo"></small></label><label>Battlefield<select data-map aria-describedby="radarMapInfo"></select><small id="radarMapInfo"></small></label><label>Faction<select data-faction aria-describedby="radarFactionInfo"></select><small id="radarFactionInfo"></small></label></div><p class="radar-faction-note">Current factions share the same units and balance.</p><div class="radar-rts-start-actions"><button data-action="start" class="start">Start game</button><button data-action="settings">Settings</button><button data-action="help" aria-expanded="false">Quick controls</button><button data-action="exit" class="danger">Leave Radar</button></div><div class="radar-rts-start-help" data-start-help hidden><p>Left click selects; drag selects a group. Right click orders or cancels a target. Pan at battlefield edges or with middle-drag; optional right-drag is in Settings. Use the minimap to jump, the sidebar to produce, and Escape for the game menu.</p></div></div>
          </section>
          <section class="radar-rts-settings" data-panel="settings" hidden aria-labelledby="radarSettingsTitle">
            <div class="radar-rts-settings-card"><h3 id="radarSettingsTitle">COMMAND SETTINGS</h3>
              <div class="radar-settings-grid">
                <fieldset><legend>Controls</legend>
                  <label>Mouse actions<select data-setting="mouseModel"><option value="right-action">Left selects / right orders</option><option value="classic-left">Left selects + orders / right cancels</option></select></label>
                  <label><input type="checkbox" data-setting="edgeScroll"> Edge scrolling</label>
                  <label>Edge speed <output data-edge-speed></output><input type="range" min="150" max="1400" step="50" data-setting="edgeSpeed"></label>
                  <label>Edge activation zone <output data-edge-margin></output><input type="range" min="20" max="72" step="4" data-setting="edgeMargin"></label>
                  <label><input type="checkbox" data-setting="middlePan"> Middle-mouse pan</label>
                  <label><input type="checkbox" data-setting="rightDragPan"> Right-drag camera pan</label>
                  <p>Push toward the battlefield edges to scroll; the sidebar is excluded. Right-drag pans only after a movement threshold, so a normal right click still orders. Browsers cannot track the pointer after it leaves the window.</p>
                </fieldset>
                <fieldset><legend>Audio</legend>
                  <label><input type="checkbox" data-setting="sfxEnabled"> Sound effects</label>
                  <label>SFX volume<input type="range" min="0" max="1" step=".05" data-setting="sfxVolume"></label>
                  <label><input type="checkbox" data-setting="voiceEnabled"> Local voice feedback</label>
                  <label>Voice volume<input type="range" min="0" max="1" step=".05" data-setting="voiceVolume"></label>
                  <p>Original phrases with an installed local English voice. No remote voice service.</p>
                </fieldset>
              </div>
              <fieldset><legend>Hotkeys</legend><p>Choose unique letter keys, Space, Home or End. Shift+1–9 assigns groups; 1–9 recalls; double-tap centres. Browser Ctrl/Alt/Meta shortcuts remain available.</p><div data-bindings class="radar-bindings"></div></fieldset>
              <p data-settings-status role="status"></p><button data-action="reset-settings">Restore defaults</button><button data-action="settings-close">Back to Command</button>
            </div>
          </section>
        </main>
        <footer class="radar-rts-footer"><span data-status>Awaiting mission start.</span><span class="radar-focus-status">ESC: cancel target / Command</span></footer>
        <span class="radar-rts-live sr-only" aria-live="assertive"></span>
      </div>`;
    document.body.append(overlay);
    session.overlay = overlay;
    session.profile = overlay.dataset.profile;
  }

  async function activate() {
    if (session.state !== STATES.IDLE || !supportedViewport()) return;
    setState(STATES.LOADING);
    session.trigger.disabled = true;
    session.focus = document.activeElement;
    session.scrollY = scrollY;
    session.previousOverflow = document.body.style.overflow;
    session.scrollX = scrollX;
    const html = document.documentElement;
    session.rootStyles = { overflow: html.style.overflow, overscrollBehavior: html.style.overscrollBehavior, scrollbarGutter: html.style.scrollbarGutter };
    html.style.scrollbarGutter = "stable"; html.style.overflow = "hidden"; html.style.overscrollBehavior = "none";
    const token = ++session.transitionToken;
    session.siteNodes = [...document.querySelectorAll("body > .shell")].map(node => ({ node, inert: node.inert }));
    session.siteNodes.forEach(item => { item.node.inert = true; });
    document.body.style.overflow = "hidden";
    const departure = transitionSite(true);
    document.body.classList.add("radar-game-active");
    makeOverlay();
    try {
      await loadModules();
      await departure;
      if (session.state !== STATES.LOADING || token !== session.transitionToken) return;
      if (!session.preferenceLoaded) { session.muted = session.modules.readSfxMuted(); session.voiceEnabled = session.modules.readVoiceEnabled(); session.settings = session.modules.readSettings(); session.groups = new session.modules.ControlGroups(); session.preferenceLoaded = true; }
      configureMenu();
      bindInterface();
      // Flush the hidden start frame so cached modules still get an intentional entry transition.
      void session.overlay.offsetWidth;
      document.body.classList.add("radar-game-visible");
      document.body.style.overflow = "hidden";
      setState(STATES.MENU);
      session.overlay.querySelector('[data-action="start"]').focus();
      announce("Radar Command menu open. Simulation has not started.");
    } catch (error) {
      console.error("Radar RTS failed to initialise", error);
      exitGame();
    }
  }

  function bindInterface() {
    session.overlay.querySelectorAll("[data-action]").forEach(button => listen(button, "click", () => handleAction(button.dataset.action)));
    session.overlay.querySelectorAll("[data-tab]").forEach(button => listen(button, "click", () => setTab(button.dataset.tab)));
    listen(session.overlay.querySelector("[data-options]"), "click", event => {
      const button = event.target.closest("button");
      if (!button || button.disabled || session.state !== STATES.PLAYING) return;
      if (button.hasAttribute("data-cancel")) session.engine.cancelConstruction();
      else if (button.dataset.id) build(button.dataset.kind, button.dataset.id);
      refreshOptions();
    });
    listen(session.overlay.querySelector("[data-queues]"), "click", event => {
      const button = event.target.closest("button");
      if (!button || session.state !== STATES.PLAYING) return;
      if (button.dataset.queueAction === "detail") { session.queueDetail = button.dataset.producer; session.queueTarget = button.dataset.producer; }
      else if (button.dataset.queueAction === "pause") session.engine.toggleProduction(button.dataset.producer);
      else session.engine.cancelUnit(button.dataset.producer);
      updateHud(session.engine.snapshot());
    });
    listen(session.overlay.querySelector("[data-queues]"), "contextmenu", event => {
      const button = event.target.closest('[data-queue-action="detail"]');
      if (!button || session.state !== STATES.PLAYING) return;
      event.preventDefault();
      const producer = button.dataset.producer;
      session.queueDetail = producer; session.queueTarget = producer;
      const item = session.engine.getEntity(producer);
      if (!item?.queue.length) return;
      const wasPaused = item.productionPaused;
      if (wasPaused) session.engine.cancelUnit(producer);
      else session.engine.toggleProduction(producer);
      updateHud(session.engine.snapshot());
      announce(!wasPaused ? "Production paused. Right click again to remove a queued unit." : item.queue.length ? "Queued unit removed; 75% refunded." : "Production queue cleared.");
    });
    const canvas = session.overlay.querySelector(".radar-game-screen");
    listen(canvas, "contextmenu", event => event.preventDefault());
    listen(canvas, "pointerdown", pointerDown);
    listen(canvas, "pointermove", pointerMove);
    listen(canvas, "pointerup", pointerUp);
    listen(canvas, "pointercancel", pointerUp);
    listen(canvas, "wheel", wheelZoom, { passive: false });
    listen(canvas, "pointerleave", () => { session.edgePoint = null; });
    listen(canvas, "auxclick", event => { if (event.button === 1) event.preventDefault(); });
    listen(canvas, "lostpointercapture", () => { session.middlePan = null; session.rightPan = null; session.edgePoint = null; });
    const minimap = session.overlay.querySelector(".radar-rts-minimap");
    listen(minimap, "pointerdown", event => {
      if (!session.renderer || session.state !== STATES.PLAYING) return;
      event.preventDefault();
      const point = session.renderer.minimapToWorld(event.clientX, event.clientY);
      session.renderer.centerOn(point.x, point.y);
    });
    listen(window, "pointermove", event => {
      if (!session.renderer || session.state !== STATES.PLAYING || event.pointerType !== "mouse" || session.middlePan) return;
      const box = canvas.getBoundingClientRect();
      const inSide = event.clientX >= box.right && event.clientY >= box.top;
      const inVertical = event.clientY >= box.top && event.clientY <= innerHeight;
      session.edgePoint = !inSide && inVertical && event.clientX >= 0 ? { x: Math.max(0,Math.min(box.width,event.clientX-box.left)), y: Math.max(0,Math.min(box.height,event.clientY-box.top)) } : null;
    });
    listen(document, "mouseleave", () => { session.edgePoint = null; });
    listen(window, "scroll", () => { if (![STATES.IDLE,STATES.EXITING].includes(session.state) && (scrollY !== session.scrollY || scrollX !== session.scrollX)) scrollTo({left:session.scrollX,top:session.scrollY,behavior:"instant"}); });
    listen(session.overlay.querySelector('[data-panel="settings"]'), "change", settingsChanged);
    listen(window, "keydown", keyDown);
    listen(window, "keyup", event => session.keys.delete(event.key.toLowerCase()));
    listen(window, "resize", resized);
    if (window.speechSynthesis?.addEventListener) listen(window.speechSynthesis, "voiceschanged", updateVoiceButton);
    listen(window, "blur", () => { if (session.state === STATES.PLAYING) pause(); });
    listen(document, "visibilitychange", () => { if (document.hidden && session.state === STATES.PLAYING) pause(); });
    setTab("structures");
  }

  function configureMenu() {
    const { MAPS, DIFFICULTIES, FACTIONS, radarIcon } = session.modules;
    const difficulty = session.overlay.querySelector("[data-difficulty]"), map = session.overlay.querySelector("[data-map]"), faction = session.overlay.querySelector("[data-faction]");
    faction.innerHTML = Object.values(FACTIONS).map(item => `<option value="${item.id}">${item.name}</option>`).join("");
    faction.value = session.matchOptions.factionId;
    difficulty.innerHTML = Object.values(DIFFICULTIES).map(item => `<option value="${item.id}">${item.name}</option>`).join("");
    map.innerHTML = Object.values(MAPS).map(item => `<option value="${item.id}">${item.name}</option>`).join("");
    difficulty.value = session.matchOptions.difficulty; map.value = session.matchOptions.mapId;
    const update = () => {
      session.matchOptions = { difficulty: difficulty.value, mapId: map.value, factionId: faction.value };
      session.overlay.querySelector("#radarFactionInfo").textContent = FACTIONS[faction.value].description;
      session.overlay.querySelector("#radarDifficultyInfo").textContent = DIFFICULTIES[difficulty.value].description;
      session.overlay.querySelector("#radarMapInfo").textContent = MAPS[map.value].description;
    };
    listen(faction, "change", update); listen(difficulty, "change", update); listen(map, "change", update); update();
    session.overlay.querySelectorAll("[data-tab]").forEach(button => { button.innerHTML = radarIcon(button.dataset.tab) + `<span>${button.textContent}</span>`; });
    session.overlay.querySelectorAll("progress").forEach(el => { if (!el.hasAttribute("aria-label")) el.setAttribute("aria-label", el.dataset.progress + " progress"); });
    session.overlay.querySelectorAll("[data-icon]").forEach(el => { el.innerHTML = radarIcon(el.dataset.icon); });
    updateSfxButton(); updateVoiceButton(); updateControlHints();
  }

  function updateControlHints() {
    session.overlay.querySelectorAll('[data-action]').forEach(button => {
      const action = button.dataset.action, command = session.modules.COMMANDS[action];
      if (!command) return;
      const key = session.settings.bindings[action];
      button.title = `${key === " " ? "Space" : key.toUpperCase()}: ${command[0]}${action === "repair" ? "; 10 CR/s for 20 HP/s" : action === "sell" ? "; 50% refund, click once to sell; right-click cancels" : ""}`;
    });
  }

  async function transitionSite(departing) {
    session.siteAnimations.forEach(animation => animation.cancel()); session.siteAnimations = [];
    const generation = (session.siteTransitionGeneration || 0) + 1;
    session.siteTransitionGeneration = generation;
    const nodes = [...document.querySelectorAll("body > .shell > header, body > .shell > main, body > .shell > footer")];
    document.body.classList.remove("radar-site-away");
    for (const node of nodes) {
      const box = node.getBoundingClientRect();
      const origin = `${innerWidth / 2 - box.left}px ${innerHeight / 2 - box.top}px`;
      const normal = { transform: "perspective(900px) translateZ(0) scale(1)", opacity: 1, transformOrigin: origin };
      const away = { transform: "perspective(900px) translateZ(700px) scale(1.25)", opacity: 0, transformOrigin: origin };
      const frames = reducedMotion.matches ? [{ opacity: departing ? 1 : 0 }, { opacity: departing ? 0 : 1 }] : departing ? [normal, away] : [away, normal];
      session.siteAnimations.push(node.animate(frames, { duration: reducedMotion.matches ? 80 : 700, easing: "cubic-bezier(.3,.05,.25,1)", fill: "both" }));
    }
    await Promise.all(session.siteAnimations.map(animation => animation.finished.catch(() => {})));
    if (generation !== session.siteTransitionGeneration) return;
    document.body.classList.toggle("radar-site-away", departing);
    session.siteAnimations.forEach(animation => animation.cancel()); session.siteAnimations = [];
  }

  function updateVoiceButton() {
    const button = session.overlay?.querySelector('[data-action="voice"]');
    if (!button) return;
    const available = Boolean(window.speechSynthesis?.getVoices().some(v => v.localService && /^en(?:-|_)/i.test(v.lang)));
    button.textContent = session.voiceEnabled ? "Voice on" : "Voice off";
    button.setAttribute("aria-pressed", String(session.voiceEnabled));
    button.title = available ? "Optional local system voice; no remote speech service" : "No local English voice available; game remains usable without voices";
    button.setAttribute("aria-label", `${session.voiceEnabled ? "Disable" : "Enable"} voice feedback${available ? "" : "; no local English voice currently available"}`);
  }

  function cancelTargeting() {
    const active = Boolean(session.tool || session.orderTool || session.targeting || (session.engine?.pendingPlacement.player && !session.placementCancelled));
    session.tool = null; session.orderTool = null; session.targeting = false;
    if (session.engine?.pendingPlacement.player) session.placementCancelled = true;
    session.placement = null;
    if (session.overlay) {
      delete session.overlay.dataset.tool;
      session.overlay.querySelectorAll('[data-action="repair"],[data-action="sell"]').forEach(b => b.setAttribute("aria-pressed","false"));
    }
    if (active) announce("Targeting cancelled. Ready structure remains available in Build.");
    return active;
  }

  function showSettings(open) {
    if (session.state !== STATES.MENU) return;
    const panel = session.overlay.querySelector('[data-panel="settings"]');
    panel.hidden = !open; session.overlay.querySelector('[data-panel="start"]').hidden = open;
    if (!open) { session.overlay.querySelector('[data-action="settings"]').focus(); return; }
    panel.querySelectorAll('[data-setting]').forEach(control => {
      const key = control.dataset.setting;
      const value = key === "sfxEnabled" ? !session.muted : key === "voiceEnabled" ? session.voiceEnabled : session.settings[key];
      if (control.type === "checkbox") control.checked = value; else control.value = value;
    });
    panel.querySelector('[data-edge-speed]').textContent = `${session.settings.edgeSpeed} px/s`;
    panel.querySelector('[data-edge-margin]').textContent = `${session.settings.edgeMargin} px`;
    const keys = [..."abcdefghijklmnopqrstuvwxyz", " ", "Home", "End"];
    panel.querySelector('[data-bindings]').innerHTML = Object.entries(session.modules.COMMANDS).map(([id,[name]]) => `<label>${name}<select data-binding="${id}">${keys.map(k => `<option value="${k}" ${session.settings.bindings[id] === k ? "selected" : ""}>${k === " " ? "Space" : k.toUpperCase()}</option>`).join("")}</select></label>`).join("");
    panel.querySelector('[data-setting]').focus();
  }

  function settingsChanged(event) {
    const control = event.target;
    if (control.dataset.binding) {
      const result = session.modules.bindKey(session.settings.bindings, control.dataset.binding, control.value);
      const status = session.overlay.querySelector('[data-settings-status]');
      status.textContent = result.error || "Hotkey saved.";
      if (result.error) { control.value = session.settings.bindings[control.dataset.binding]; return; }
      session.settings.bindings = result.bindings;
    } else if (control.dataset.setting) {
      const key = control.dataset.setting, value = control.type === "checkbox" ? control.checked : control.type === "range" ? Number(control.value) : control.value;
      if (key === "sfxEnabled") { session.muted = !value; session.modules.saveSfxMuted(session.muted); updateSfxButton(); }
      else if (key === "voiceEnabled") { session.voiceEnabled = value; session.modules.saveVoiceEnabled(value); updateVoiceButton(); }
      else session.settings[key] = value;
      session.overlay.querySelector('[data-edge-speed]').textContent = `${session.settings.edgeSpeed} px/s`;
      session.overlay.querySelector('[data-edge-margin]').textContent = `${session.settings.edgeMargin} px`;
    }
    session.modules.saveSettings(session.settings); updateControlHints();
  }

  function returnToMenu() {
    if (!session.engine || [STATES.MENU, STATES.EXITING].includes(session.state)) return;
    session.groups?.clear();
    cancelAnimationFrame(session.raf); cancelAnimationFrame(session.resizeRaf); clearTimeout(session.announceTimer); session.raf = 0;
    session.engine.destroy(); session.engine = null; session.renderer = null;
    session.audio?.destroy(); session.audio = null; session.voice?.destroy(); session.voice = null;
    resetInput(); session.lastEventId = null;
    session.overlay.querySelector('[data-panel="outcome"]').hidden = true;
    session.overlay.querySelector('[data-panel="start"]').hidden = false;
    setState(STATES.MENU);
    session.overlay.querySelector('[data-action="start"]').focus();
    announce("Command menu. Match ended.");
  }

  function updateSfxButton() {
    const button = session.overlay?.querySelector('[data-action="sfx"]');
    if (button) { button.textContent = session.muted ? "SFX off" : "SFX on"; button.setAttribute("aria-pressed", String(session.muted)); button.setAttribute("aria-label", session.muted ? "Unmute sound effects" : "Mute sound effects"); }
  }

  function resetCamera() {
    const map = session.engine.map;
    session.renderer.world = session.engine.world;
    session.renderer.setZoomAt(session.profile.startsWith("mobile") ? map.mobileZoom : map.desktopZoom);
    session.renderer.centerOn(map.playerStart.x + 180, map.playerStart.y);
  }

  function resetInput() {
    session.pointers.clear(); session.pinch = null; session.keys.clear();
    session.edgePoint = null; session.middlePan = null; session.rightPan = null; session.tool = null; session.orderTool = null; session.queueTarget = null;
    if (session.overlay) { delete session.overlay.dataset.tool; session.overlay.querySelectorAll("[data-action=repair],[data-action=sell]").forEach(el => el.setAttribute("aria-pressed", "false")); }
    session.pointerStart = null; session.pointerId = null; session.pointerMoved = false;
    session.dragBox = null; session.pointerWorld = null; session.placement = null; session.targeting = false; session.placementCancelled = false;
  }

  function startGame() {
    if (session.state !== STATES.MENU || !supportedViewport()) return;
    session.engine = new session.modules.RadarRTSSimulation(session.matchOptions);
    session.renderer = new session.modules.RadarRTSRenderer(
      session.overlay.querySelector(".radar-game-screen"),
      session.overlay.querySelector(".radar-rts-minimap"), session.engine.world
    );
    resetCamera(); resetInput(); session.groups.clear();
    session.audio = new session.modules.RadarRTSAudio({ muted: session.muted, volume: session.settings.sfxVolume });
    session.audio.start(); session.audio.play("start");
    session.voice = new session.modules.RadarRTSVoice({ enabled: session.voiceEnabled, volume: session.settings.voiceVolume });
    session.lastLowPower = false;
    session.lastEventId = null;
    session.targeting = false;
    session.overlay.querySelector('[data-panel="start"]').hidden = true;
    setState(STATES.PLAYING);
    session.overlay.querySelector(".radar-game-screen").focus();
    session.lastFrame = performance.now();
    session.raf = requestAnimationFrame(frame);
    updateHud(session.engine.snapshot());
    announce("Mission started. Establish power and a harvesting economy.");
  }

  function pointInCanvas(event) {
    const box = session.renderer.canvas.getBoundingClientRect();
    return { x: event.clientX - box.left, y: event.clientY - box.top };
  }
  const touchPoints = () => [...session.pointers.values()];
  const centroid = points => ({ x: points.reduce((sum, p) => sum + p.x, 0) / points.length, y: points.reduce((sum, p) => sum + p.y, 0) / points.length });
  const pointDistance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

  function pointerDown(event) {
    if (session.state !== STATES.PLAYING || event.button > 2) return;
    const point = pointInCanvas(event);
    if (event.button === 1 && !session.settings.middlePan) { event.preventDefault(); return; }
    try { event.currentTarget.setPointerCapture?.(event.pointerId); } catch { /* Synthetic validation pointers are not browser-active pointers. */ }
    if (event.button === 1) { event.preventDefault(); session.middlePan = point; session.edgePoint = null; return; }
    if (event.button === 2) {
      event.preventDefault();
      try { event.currentTarget.setPointerCapture?.(event.pointerId); } catch { }
      session.rightPan = { pointerId: event.pointerId, start: point, last: point, moved: false };
      session.edgePoint = null;
      return;
    }
    if (event.pointerType === "touch") {
      event.preventDefault();
      session.pointers.set(event.pointerId, point);
      session.pointerId = event.pointerId;
      session.pointerStart = { ...point, time: performance.now() };
      session.pointerMoved = false;
      if (session.pointers.size === 2) {
        const points = touchPoints();
        session.pinch = { distance: pointDistance(points[0], points[1]), zoom: session.renderer.camera.zoom, centroid: centroid(points) };
        session.pointerMoved = true;
      }
      return;
    }
    session.pointerId = event.pointerId;
    session.pointerStart = point;
    session.pointerMoved = false;
    session.dragBox = { x1: point.x, y1: point.y, x2: point.x, y2: point.y };
  }

  function pointerMove(event) {
    if (!session.renderer) return;
    const point = pointInCanvas(event);
    session.pointerWorld = session.renderer.screenToWorld(point.x, point.y);
    if (session.rightPan?.pointerId === event.pointerId) {
      const distance = pointDistance(point, session.rightPan.start);
      if (session.settings.rightDragPan && (session.rightPan.moved || distance > 9)) {
        event.preventDefault(); session.rightPan.moved = true;
        session.renderer.pan(session.rightPan.last.x - point.x, session.rightPan.last.y - point.y);
      }
      session.rightPan.last = point; return;
    }
    if (event.pointerType === "mouse" && !session.middlePan) session.edgePoint = point;
    if (session.middlePan) { event.preventDefault(); session.renderer.pan(session.middlePan.x - point.x, session.middlePan.y - point.y); session.middlePan = point; return; }
    const pending = session.engine?.pendingPlacement.player;
    session.placement = pending && !session.placementCancelled
      ? session.engine.placementValidity(pending.type, "player", Math.round(session.pointerWorld.x / 40) * 40, Math.round(session.pointerWorld.y / 40) * 40)
      : null;
    if (event.pointerType === "touch" && session.pointers.has(event.pointerId)) {
      event.preventDefault();
      session.pointers.set(event.pointerId, point);
      if (session.pointers.size >= 2) {
        const points = touchPoints().slice(0, 2);
        const center = centroid(points);
        const distance = Math.max(1, pointDistance(points[0], points[1]));
        if (!session.pinch) session.pinch = { distance, zoom: session.renderer.camera.zoom, centroid: center };
        session.renderer.pan(session.pinch.centroid.x - center.x, session.pinch.centroid.y - center.y);
        session.renderer.setZoomAt(session.pinch.zoom * distance / Math.max(1, session.pinch.distance), center.x, center.y);
        session.pinch.centroid = center;
        session.pointerMoved = true;
      } else if (session.pointerStart) {
        const moved = pointDistance(point, session.pointerStart);
        if (moved > 6 || session.pointerMoved) {
          session.renderer.pan(session.pointerStart.x - point.x, session.pointerStart.y - point.y);
          session.pointerStart = { ...point, time: session.pointerStart.time };
          session.pointerMoved = true;
        }
      }
      return;
    }
    if (event.pointerId !== session.pointerId || !session.pointerStart || !session.dragBox) return;
    session.dragBox.x2 = point.x;
    session.dragBox.y2 = point.y;
    session.pointerMoved = pointDistance(point, session.pointerStart) > 12;
  }

  function pointerUp(event) {
    if (!session.renderer || session.state !== STATES.PLAYING) return;
    const point = pointInCanvas(event);
    if (event.button === 1 || session.middlePan) { session.middlePan = null; session.edgePoint = null; return; }
    if (event.pointerType === "touch") {
      const wasPinching = Boolean(session.pinch) || session.pointers.size > 1;
      const start = session.pointerStart;
      session.pointers.delete(event.pointerId);
      if (session.pointers.size < 2) session.pinch = null;
      if (!wasPinching && !session.pointerMoved && start && performance.now() - start.time < 600) handleWorldTap(point, false, true);
      if (!session.pointers.size) {
        session.pointerId = null;
        session.pointerStart = null;
        session.pointerMoved = false;
      } else {
        const [remaining] = touchPoints();
        session.pointerId = [...session.pointers.keys()][0];
        session.pointerStart = { ...remaining, time: performance.now() };
      }
      return;
    }
    if (event.button === 2 || session.rightPan?.pointerId === event.pointerId) {
      const pan = session.rightPan; session.rightPan = null; session.edgePoint = null;
      if (event.type !== "pointercancel" && !pan?.moved) {
        if (!cancelTargeting()) {
          if (session.settings.mouseModel === "classic-left") session.engine?.clearSelection();
          else issueOrderAt(event);
        }
      }
      return;
    }
    if (event.type === "pointercancel") { session.pointerStart = null; session.dragBox = null; return; }
    if (event.pointerId !== session.pointerId || !session.pointerStart) return;
    if (session.pointerMoved && session.dragBox) {
      const a = session.renderer.screenToWorld(session.dragBox.x1, session.dragBox.y1);
      const b = session.renderer.screenToWorld(session.dragBox.x2, session.dragBox.y2);
      session.engine.selectBox(a.x, a.y, b.x, b.y, { append: event.shiftKey });
    } else handleWorldTap(point, event.shiftKey, false);
    session.pointerId = null;
    session.pointerStart = null;
    session.dragBox = null;
    session.pointerMoved = false;
  }

  function handleWorldTap(point, append, touch) {
    const world = session.renderer.screenToWorld(point.x, point.y);
    if (session.tool) {
      const tool = session.tool;
      const entity = session.engine.entityAt(world.x, world.y, "player");
      if (!entity || entity.kind !== "structure") { announce("Select an owned structure."); return; }
      if (tool === "sell" && entity.type === "hq") { announce("The Command Hub cannot be sold."); return; }

      const result = session.engine.dispatch({ controllerId: "commander", type: tool, args: { id: entity.id } });
      announce(result.accepted ? `${tool} command accepted.` : "Unavailable: damaged structures can be repaired; the Command Hub cannot be sold.");
      if (tool === "sell" && result.accepted) cancelTargeting();
      updateHud(session.engine.snapshot()); return;
    }
    if (session.orderTool) {
      const accepted = dispatchOrder(session.orderTool, world); cancelTargeting(); announce(accepted ? "Order confirmed." : "Select combat units first."); return;
    }
    if (session.engine.pendingPlacement.player && !session.placementCancelled) {
      const result = session.engine.placeStructure(world.x, world.y);
      announce(result.reason);
      return;
    }
    if (session.targeting) {
      const result = session.engine.useSuperweapon(world.x, world.y);
      session.targeting = false;
      announce(result.reason);
      return;
    }
    const entity = session.engine.entityAt(world.x, world.y);
    if (entity?.side === "player") {
      const additive = append || (touch && session.engine.selectedUnits().length > 0);
      session.engine.selectAt(world.x, world.y, { append: additive });
    } else if (session.engine.selectedUnits().length && (touch || session.settings.mouseModel === "classic-left")) {
      if (entity?.side === "enemy") dispatchOrder("attack", { targetId: entity.id });
      else dispatchOrder("move", world);
    } else session.engine.clearSelection();
  }

  function issueOrderAt(event) {
    if (session.state !== STATES.PLAYING) return;
    const point = pointInCanvas(event);
    const world = session.renderer.screenToWorld(point.x, point.y);
    const target = session.engine.entityAt(world.x, world.y, "enemy");
    const count = target ? dispatchOrder("attack", { targetId: target.id }) : dispatchOrder("move", world);
    announce(count ? (target ? "Attack order confirmed." : "Move order confirmed.") : "Select combat units first.");
  }

  function wheelZoom(event) {
    if (session.state !== STATES.PLAYING) return;
    event.preventDefault();
    const point = pointInCanvas(event);
    session.renderer.setZoomAt(session.renderer.camera.zoom * Math.exp(-event.deltaY * 0.0012), point.x, point.y);
  }

  function dispatchOrder(type, args = {}) {
    return session.engine?.dispatch({ controllerId: "commander", type, args, entityIds: session.engine.selectedUnits().map(unit => unit.id) }).accepted;
  }

  function keyDown(event) {
    if ([STATES.IDLE, STATES.EXITING].includes(session.state)) return;
    if (event.key === "Tab") {
      const controls = [...session.overlay.querySelectorAll('button:not(:disabled),select,input,canvas[tabindex]')].filter(el => el.getClientRects().length && getComputedStyle(el).visibility !== "hidden" && !el.closest("[hidden]"));
      const first = controls[0], last = controls.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      return;
    }
    const settingsOpen = !session.overlay.querySelector('[data-panel="settings"]').hidden;
    if (event.key === "Escape") { event.preventDefault(); if (settingsOpen) showSettings(false); else if (!cancelTargeting()) session.state === STATES.MENU ? exitGame() : session.state === STATES.PAUSED ? resume() : pause(); return; }
    if (settingsOpen) return;
    if (session.state === STATES.PLAYING) {
      const group = session.modules.groupCommand(event);
      if (group && !event.repeat) {
        event.preventDefault();
        if (group.assign) { session.groups.assign(group.number, session.engine.selectedUnits()); announce(`Group ${group.number} assigned.`); }
        else {
          const recall = session.groups.recall(group.number, session.engine.aliveUnits("player"), performance.now());
          session.engine.selection = new Set(recall.ids);
          const units = session.engine.selectedUnits();
          if (recall.center && units.length) session.renderer.centerOn(units.reduce((n,u)=>n+u.x,0)/units.length, units.reduce((n,u)=>n+u.y,0)/units.length);
        }
        return;
      }
    }
    const command = session.modules?.hotkeyCommand(event, session.settings.bindings);
    if (!command && !/^(INPUT|SELECT|TEXTAREA|BUTTON)$/.test(event.target?.tagName || "") && ["PageUp","PageDown","Home","End"," "].includes(event.key)) event.preventDefault();
    if (!command) return;
    event.preventDefault();
    if (command.startsWith("camera-")) session.keys.add(event.key.toLowerCase());
    else if (!event.repeat) handleAction(command);
  }

  function updateCamera(dt) {
    const speed = session.settings.edgeSpeed * dt;
    const edge = session.settings.edgeScroll && !session.pointerStart && !session.middlePan && !session.rightPan ? session.modules.edgeVelocity(session.edgePoint, session.renderer.size.width, session.renderer.size.height, session.settings.edgeMargin) : {x:0,y:0};
    session.renderer.pan(edge.x * speed, edge.y * speed);
    if (session.keys.has("arrowleft")) session.renderer.pan(-speed, 0);
    if (session.keys.has("arrowright")) session.renderer.pan(speed, 0);
    if (session.keys.has("arrowup")) session.renderer.pan(0, -speed);
    if (session.keys.has("arrowdown")) session.renderer.pan(0, speed);
  }

  function frame(now) {
    if (!session.engine || [STATES.IDLE, STATES.EXITING, STATES.MENU].includes(session.state)) return;
    const dt = Math.min(0.1, Math.max(0, (now - session.lastFrame) / 1000));
    session.lastFrame = now;
    if (session.state === STATES.PLAYING) {
      updateCamera(dt);
      session.engine.update(dt);
    }
    const snapshot = session.engine.snapshot();
    renderSnapshot(snapshot);
    if (session.state === STATES.PLAYING) { session.audio?.consume(snapshot.soundEvents); session.voice?.consume(snapshot.soundEvents); }
    if (now - session.lastHud > 120) {
      updateHud(snapshot);
      session.lastHud = now;
    }
    if (snapshot.status === "ended" && session.state !== STATES.ENDED) endMission(snapshot.outcome);
    session.raf = requestAnimationFrame(frame);
  }

  function renderSnapshot(snapshot) {
    session.renderer.render(snapshot, {
      reducedMotion: reducedMotion.matches,
      pointerWorld: session.pointerWorld,
      placement: session.placement, placementCancelled: session.placementCancelled,
      dragBox: session.dragBox,
      superTarget: session.targeting ? session.pointerWorld : null, tool: session.tool || session.orderTool
    });
  }

  function setProgress(name, value) {
    const progress = session.overlay.querySelector(`[data-progress="${name}"]`);
    progress.value = Math.max(0, Math.min(100, value));
  }

  function updateStrategicHud(snapshot) {
    const power = snapshot.power.player;
    session.overlay.querySelector('[data-hud="credits"]').textContent = String(snapshot.credits.player);
    session.overlay.querySelector('[data-hud="power"]').textContent = `${power.used} used / ${power.generated} capacity`;
    const powerCell = session.overlay.querySelector("[data-power-cell]");
    powerCell.dataset.lowPower = String(power.low);
    const meter = session.overlay.querySelector("[data-power-meter]");
    meter.max = Math.max(1, power.generated, power.used); meter.value = power.used;
    meter.setAttribute("aria-label", `Power: ${power.used} consumed, ${power.generated} generated${power.low ? ", LOW POWER" : ""}`);
    powerCell.style.setProperty("--power-fill", `${Math.min(100, power.used / Math.max(1, power.generated) * 100)}%`);
    if (power.low && !session.lastLowPower) { session.audio?.play("low"); session.voice?.play("low"); }
    session.lastLowPower = power.low;
    session.overlay.querySelector('[data-hud="power-state"]').textContent = power.low ? "⚠ LOW POWER" : "POWER ONLINE";

    const construction = snapshot.construction.player;
    const pending = snapshot.pendingPlacement.player;
    if (pending) {
      session.overlay.querySelector('[data-hud="construction"]').textContent = "Ready to place";
      session.overlay.querySelector('[data-hud="construction-detail"]').textContent = session.modules.STRUCTURES[pending.type].name;
      setProgress("construction", 100);
    } else if (construction) {
      const percent = construction.progress / construction.duration * 100;
      const speed = power.low ? 0.35 : 1;
      const remaining = Math.max(0, (construction.duration - construction.progress) / speed);
      session.overlay.querySelector('[data-hud="construction"]').textContent = session.modules.STRUCTURES[construction.type].name;
      session.overlay.querySelector('[data-hud="construction-detail"]').textContent = `${Math.floor(percent)}% · ${remaining.toFixed(1)}s${power.low ? " · slowed" : ""}`;
      setProgress("construction", percent);
    } else {
      session.overlay.querySelector('[data-hud="construction"]').textContent = "Idle";
      session.overlay.querySelector('[data-hud="construction-detail"]').textContent = "No active build";
      setProgress("construction", 0);
    }

  }

  function updateHud(snapshot) {
    updateStrategicHud(snapshot);
    const faction = session.modules.FACTIONS[snapshot.controllers.find(c => c.id === "commander").factionId];
    const badge = session.overlay.querySelector("[data-faction-badge]");
    badge.textContent = `${faction.marking} // ${faction.name} · Your command`;
    badge.style.color = faction.color;
    const selected = [...snapshot.units, ...snapshot.structures].filter(item => snapshot.selectedIds.includes(item.id));
    session.overlay.querySelector("[data-selection]").innerHTML = selected.length
      ? `<b>${selected.length} selected</b><span>${selected.slice(0, 4).map(item => (session.modules.UNITS[item.type] || session.modules.STRUCTURES[item.type]).name).join(" · ")}</span>`
      : "No units selected";
    const latestEvent = snapshot.events.at(-1);
    if (latestEvent && latestEvent.id !== session.lastEventId) {
      session.lastEventId = latestEvent.id;
      session.overlay.querySelector(".radar-rts-toast").textContent = latestEvent.message;
      session.overlay.querySelector("[data-status]").textContent = latestEvent.message;
    }
    refreshOptions();
  }

  function setTab(tab) {
    if (!session.overlay) return;
    session.overlay.dataset.tab = tab;
    session.overlay.querySelectorAll("[data-tab]").forEach(button => button.setAttribute("aria-selected", String(button.dataset.tab === tab)));
    refreshOptions(true);
  }

  function optionDefinitions(tab) {
    const { STRUCTURES, UNITS, SUPERWEAPON } = session.modules;
    if (tab === "structures") return Object.values(STRUCTURES).filter(item => item.id !== "hq").map(item => ({ ...item, kind: "structure" }));
    if (tab === "infantry") return Object.values(UNITS).filter(item => item.producer === "barracks").map(item => ({ ...item, kind: "unit" }));
    if (tab === "vehicles") return Object.values(UNITS).filter(item => item.producer === "warFactory").map(item => ({ ...item, kind: "unit" }));
    return [{ ...SUPERWEAPON, kind: "special", cost: 0, role: "Area strike; requires a powered Storm Uplink" }];
  }

  function refreshOptions(force = false) {
    if (!session.engine || !session.overlay) return;
    const container = session.overlay.querySelector("[data-options]");
    const tab = session.overlay.dataset.tab || "structures";
    const snapshot = session.engine.snapshot();
    // Create controls only when the category changes. Progress must never detach a hovered/pressed node.
    if (container.dataset.tab !== tab) {
      container.dataset.tab = tab;
      container.innerHTML = optionDefinitions(tab).map(item => `<button class="radar-rts-option" data-kind="${item.kind}" data-id="${item.id}" title="${item.name}: ${item.role}"><i class="radar-production-icon">${session.modules.radarIcon(item.id)}<i class="radar-sweep"></i></i><b>${item.name}</b><span>${item.cost ? `${item.cost} CR` : "Ion array"}</span><em></em></button>`).join("") + (tab === "structures" ? '<button class="radar-rts-option cancel" data-cancel><b>Cancel build</b><span>75% refund</span></button>' : "");
    }
    optionDefinitions(tab).forEach(item => {
      const check = item.kind === "special"
        ? { available: snapshot.superweapons.player.ready && !snapshot.power.player.low, reason: snapshot.superweapons.player.ready ? "Ready to target" : snapshot.structures.some(s => s.type === "uplink" && s.side === "player") ? `Charging ${Math.floor(snapshot.superweapons.player.charge * 100)}%` : "Requires Storm Uplink" }
        : session.engine.availability(item.kind, item.id);
      const producer = snapshot.structures.find(s => s.side === "player" && s.queue[0]?.type === item.id);
      const job = item.kind === "structure" ? (snapshot.construction.player?.type === item.id ? snapshot.construction.player : null) : producer?.queue[0];
      const ready = snapshot.pendingPlacement.player?.type === item.id || (item.kind === "special" && snapshot.superweapons.player.ready);
      const progress = ready ? 1 : item.kind === "special" ? snapshot.superweapons.player.charge : job ? job.progress / job.duration : 0;
      const button = container.querySelector(`[data-id="${item.id}"]`);
      const visual = session.modules.entityVisual(item.kind, item.id, session.matchOptions.factionId);
      if (visual) button.dataset.portraitKey = visual.portrait.key;
      button.disabled = session.state !== STATES.PLAYING || (!check.available && !ready);
      button.dataset.ready = String(ready);
      button.dataset.progress = String(Math.round(progress * 100));
      button.style.setProperty("--radar-progress", `${progress * 360}deg`);
      button.classList.toggle("is-producing", Boolean(job) || (item.kind === "special" && progress > 0));
      const status = ready ? "READY — select target" : job ? `${Math.floor(progress * 100)}%${producer?.productionPaused ? " · paused" : snapshot.power.player.low ? " · slowed" : ""}` : check.reason;
      button.querySelector("em").textContent = ready && item.kind === "structure" ? "READY — place on battlefield" : status;
      button.setAttribute("aria-label", `${item.name}. ${item.cost || 0} credits. ${button.querySelector("em").textContent}`);
    });
    const cancel = container.querySelector("[data-cancel]");
    if (cancel) { cancel.hidden = !(snapshot.construction.player || snapshot.pendingPlacement.player); cancel.disabled = session.state !== STATES.PLAYING; }
    refreshQueues(snapshot, tab);
  }

  function refreshQueues(snapshot, tab) {
    const container = session.overlay.querySelector("[data-queues]");
    const type = tab === "infantry" ? "barracks" : tab === "vehicles" ? "warFactory" : null;
    const producers = snapshot.structures.filter(s => s.side === "player" && s.type === type);
    for (const node of container.querySelectorAll("[data-queue-row]")) if (!producers.some(p => p.id === node.dataset.queueRow)) node.remove();
    if (!producers.some(p => p.id === session.queueDetail)) session.queueDetail = producers[0]?.id;
    if (!producers.some(p => p.id === session.queueTarget)) session.queueTarget = null;
    producers.forEach((producer, index) => {
      let row = container.querySelector(`[data-queue-row="${producer.id}"]`);
      if (!row) {
        row = document.createElement("div"); row.dataset.queueRow = producer.id;
        row.innerHTML = `<button data-producer="${producer.id}" data-queue-action="detail"><i class="radar-production-icon"><i data-unit-icon></i><i class="radar-sweep"></i></i><b></b><span></span></button><progress class="sr-only" max="100" value="0"></progress>`;
        container.append(row);
      }
      const job = producer.queue[0], percent = job ? Math.floor(job.progress / job.duration * 100) : 0;
      const state = producer.productionPaused ? "PAUSED" : job ? snapshot.power.player.low ? "LOW POWER" : `${percent}%` : "READY";
      const name = job ? session.modules.UNITS[job.type].name : session.modules.STRUCTURES[type].name;
      const button = row.querySelector("button");
      button.classList.toggle("is-producing", Boolean(job)); button.style.setProperty("--radar-progress", `${percent * 3.6}deg`);
      button.setAttribute("aria-pressed", String(session.queueDetail === producer.id));
      button.setAttribute("aria-label", `${session.modules.STRUCTURES[type].short} ${index+1}: ${name}, ${state}, ${producer.queue.length} queued. Right click pauses; right click again removes one queued unit. Adding a unit resumes production.`);
      button.title = button.getAttribute("aria-label");
      const icon = row.querySelector('[data-unit-icon]'); if (icon.dataset.type !== (job?.type || type)) { icon.dataset.type = job?.type || type; icon.innerHTML = session.modules.radarIcon(icon.dataset.type); }
      row.querySelector("b").textContent = `${index+1} · ${producer.queue.length} Q`;
      row.querySelector("span").textContent = state;
      const progress = row.querySelector("progress"); progress.value = percent; progress.setAttribute("aria-label", `${session.modules.STRUCTURES[type].name} production`);
      button.disabled = session.state !== STATES.PLAYING;
    });
    let detail = container.querySelector('[data-queue-detail]');
    if (!detail) { detail = document.createElement("div"); detail.dataset.queueDetail = ""; detail.innerHTML = '<span></span><small>Right click pauses; each later right click removes one unit. Adding a unit resumes.</small>'; container.append(detail); }
    container.append(detail);
    const selected = producers.find(p => p.id === session.queueDetail);
    if (selected) {
      const job = selected.queue[0]; detail.querySelector('span').textContent = job ? `${session.modules.UNITS[job.type].name} · ${selected.queue.length} queued${selected.productionPaused ? " · PAUSED" : ""}` : "Queue ready for production";
    }
    container.hidden = !producers.length;
  }

  function build(kind, id) {
    let result;
    if (session.engine.pendingPlacement.player?.type === id) { session.placementCancelled = false; announce("Place the ready structure on the battlefield."); return; }
    if (kind === "structure") session.placementCancelled = false;
    if (kind === "structure" || kind === "unit") result = session.engine.dispatch({ controllerId: "commander", type: kind === "structure" ? "build" : "produce", args: { type: id, producerId: kind === "unit" ? session.queueTarget : null } });
    else {
      session.targeting = true;
      result = { reason: "Select an Ion Storm target." };
    }
    announce(result.reason || (result.accepted ? "Order accepted." : "Order unavailable."));
    updateHud(session.engine.snapshot());
    refreshOptions(true);
  }

  function centerBase() {
    const hq = session.engine?.aliveStructures("player", "hq")[0];
    if (hq) session.renderer.centerOn(hq.x, hq.y);
  }

  function handleAction(action) {
    if (action === "exit") exitGame();
    else if (action === "start") startGame();
    else if (action === "command-menu") pause();
    else if (action === "quit-match") returnToMenu();
    else if (action === "menu") returnToMenu();
    else if (action === "settings") showSettings(true);
    else if (action === "settings-close") showSettings(false);
    else if (action === "reset-settings") { session.settings = session.modules.normaliseSettings(); session.muted = false; session.voiceEnabled = false; session.modules.saveSettings(session.settings); session.modules.saveSfxMuted(false); session.modules.saveVoiceEnabled(false); updateSfxButton(); updateVoiceButton(); showSettings(true); session.overlay.querySelector('[data-settings-status]').textContent = "Defaults restored."; }
    else if (action === "build-tab") setTab("structures");
    else if (action === "select-army" && session.engine) session.engine.selection = new Set(session.engine.aliveUnits("player").filter(u => session.modules.UNITS[u.type].weapon).map(u => u.id));
    else if (action === "scatter" && session.state === STATES.PLAYING) dispatchOrder("scatter");
    else if (["guard", "force-fire", "attack-move", "special"].includes(action) && session.state === STATES.PLAYING) {
      cancelTargeting();
      if (action === "special") { build("special", "ionStorm"); return; }
      session.orderTool = action; session.overlay.dataset.tool = action;
      announce(`Select a location for ${action}. Right click or Escape cancels.`);
    }
    else if (action === "stop" && session.state === STATES.PLAYING) dispatchOrder("stop");
    else if (["repair", "sell"].includes(action) && session.state === STATES.PLAYING) {
      session.tool = session.tool === action ? null : action; session.targeting = false; session.orderTool = null;
      session.overlay.dataset.tool = session.tool || "";
      session.overlay.querySelectorAll("[data-action=repair],[data-action=sell]").forEach(el => el.setAttribute("aria-pressed", String(el.dataset.action === session.tool)));
      announce(session.tool ? `Select an owned structure to ${session.tool}.` : "Tool cancelled.");
    }
    else if (action === "voice") {
      session.voiceEnabled = !session.voiceEnabled; session.modules.saveVoiceEnabled(session.voiceEnabled);
      session.voice?.setEnabled(session.voiceEnabled); updateVoiceButton();
      if (session.voiceEnabled && !window.speechSynthesis?.getVoices().some(v => v.localService && /^en(?:-|_)/i.test(v.lang))) {
        session.overlay.querySelector("[data-status]").textContent = "Voice enabled; no local English voice is installed. Text and SFX remain available.";
        announce("No local English voice available. Text and sound effects remain available.");
      }
    }
    else if (action === "sfx") {
      session.muted = !session.muted; session.modules.saveSfxMuted(session.muted);
      session.audio?.setMuted(session.muted); updateSfxButton();
    }
    else if (action === "help") {
      const help = session.overlay.querySelector("[data-start-help]");
      help.hidden = !help.hidden;
      session.overlay.querySelector('[data-action="help"]').setAttribute("aria-expanded", String(!help.hidden));
    } else if (action === "pause") session.state === STATES.PAUSED ? resume() : pause();
    else if (action === "resume") resume();
    else if (action === "restart") restart();
    else if (action === "clear-selection") session.engine?.clearSelection();
    else if (action === "center-base") centerBase();
  }

  function updateButtons() {
    if (!session.overlay) return;
    session.overlay.querySelectorAll('[data-action="pause"]').forEach(button => {
      button.textContent = session.state === STATES.PAUSED ? "Resume" : "Pause";
      button.setAttribute("aria-pressed", String(session.state === STATES.PAUSED));
      button.disabled = [STATES.MENU, STATES.LOADING, STATES.ENDED].includes(session.state);
    });
    session.overlay.querySelectorAll('[data-action="restart"]').forEach(button => { button.disabled = [STATES.MENU, STATES.LOADING].includes(session.state); });
    const pausePanel = session.overlay.querySelector('[data-panel="pause"]');
    if (pausePanel) pausePanel.hidden = session.state !== STATES.PAUSED || session.viewportPaused;
  }

  function pause() {
    if (session.state !== STATES.PLAYING) return;
    setState(STATES.PAUSED);
    resetInput(); session.audio?.pause(); session.voice?.pause();
    session.overlay.querySelector('[data-panel="pause"] button')?.focus();
    announce("Mission paused.");
  }
  function resume() {
    if (session.state !== STATES.PAUSED) return;
    session.lastFrame = performance.now();
    setState(STATES.PLAYING);
    session.audio?.start(); session.voice?.resume();
    session.overlay.querySelector(".radar-game-screen")?.focus();
    announce("Mission resumed.");
  }
  function endMission(outcome) {
    setState(STATES.ENDED);
    session.audio?.play(outcome); session.voice?.play(outcome);
    const panel = session.overlay.querySelector('[data-panel="outcome"]');
    panel.hidden = false;
    panel.querySelector("[data-outcome-title]").textContent = outcome === "victory" ? "VICTORY" : "DEFEAT";
    panel.querySelector("[data-outcome-copy]").textContent = outcome === "victory" ? "The hostile Command Hub has been destroyed." : "Your Command Hub was destroyed.";
    announce(panel.querySelector("h3").textContent);
  }
  function restart() {
    if (!session.engine || [STATES.MENU, STATES.LOADING].includes(session.state)) return;
    session.engine.destroy();
    session.engine = new session.modules.RadarRTSSimulation(session.matchOptions);
    resetInput(); resetCamera(); session.groups.clear();
    session.audio?.destroy(); session.voice?.destroy();
    session.audio = new session.modules.RadarRTSAudio({ muted: session.muted, volume: session.settings.sfxVolume });
    session.audio.start(); session.audio.play("start");
    session.voice = new session.modules.RadarRTSVoice({ enabled: session.voiceEnabled, volume: session.settings.voiceVolume }); session.lastLowPower = false;
    session.overlay.querySelector('[data-panel="outcome"]').hidden = true;
    session.targeting = false;
    session.lastEventId = null;
    session.lastFrame = performance.now();
    setState(STATES.PLAYING);
    updateHud(session.engine.snapshot());
    announce("Mission restarted.");
  }

  function resized() {
    cancelAnimationFrame(session.resizeRaf);
    session.resizeRaf = requestAnimationFrame(() => {
      session.profile = classifyProfile();
      if (session.overlay) session.overlay.dataset.profile = session.profile;
      const supported = supportedViewport();
      const viewportPanel = session.overlay?.querySelector('[data-panel="viewport"]');
      if (!supported && session.engine && [STATES.PLAYING,STATES.PAUSED].includes(session.state)) {
        if (session.state === STATES.PLAYING) { session.viewportPaused = true; pause(); }
        if (viewportPanel) { viewportPanel.hidden = false; viewportPanel.querySelector("button")?.focus(); }
      } else if (supported && session.viewportPaused && session.state === STATES.PAUSED) {
        session.viewportPaused = false; if (viewportPanel) viewportPanel.hidden = true; resume();
      } else if (supported && viewportPanel) viewportPanel.hidden = true;
      if (!session.renderer) return;
      const view = session.renderer.viewSize();
      const center = { x: session.renderer.camera.x + view.width / 2, y: session.renderer.camera.y + view.height / 2 };
      session.renderer.resize();
      session.renderer.centerOn(center.x, center.y);
      // Resizing clears both canvas buffers; repaint within this same frame,
      // including while paused, rather than exposing a blank frame.
      if (session.engine) renderSnapshot(session.engine.snapshot());
    });
  }

  async function exitGame() {
    if ([STATES.IDLE, STATES.EXITING].includes(session.state)) return;
    ++session.transitionToken;
    if (session.overlay) session.overlay.hidden = true; // Hide current presentation before releasing menu-only state rules.
    setState(STATES.EXITING);
    clearTimeout(session.announceTimer);
    cancelAnimationFrame(session.raf);
    cancelAnimationFrame(session.resizeRaf);
    session.raf = 0;
    session.listeners.splice(0).forEach(remove => remove());
    session.engine?.destroy();
    session.audio?.destroy(); session.audio = null; session.voice?.destroy(); session.voice = null;
    session.engine = null;
    session.renderer = null;
    resetInput(); session.groups?.clear();
    document.body.classList.remove("radar-game-visible");
    await new Promise(resolve => setTimeout(resolve, reducedMotion.matches ? 60 : 160));
    await transitionSite(false);
    session.overlay?.remove();
    session.overlay = null;
    document.body.classList.remove("radar-game-active");
    document.body.style.overflow = session.previousOverflow;
    Object.assign(document.documentElement.style, session.rootStyles);
    session.siteNodes.forEach(item => { item.node.inert = item.inert; }); session.siteNodes = [];
    delete document.body.dataset.radarGameState;
    scrollTo({ left: session.scrollX, top: session.scrollY, behavior: "instant" });
    updateAvailability();
    setState(STATES.IDLE);
    session.focus?.isConnected ? session.focus.focus({ preventScroll: true }) : session.trigger.focus({ preventScroll: true });
  }

  window.KRISPY_RADAR_GAME = {
    version: "1.5.0",
    activate,
    start: startGame,
    exit: exitGame,
    pause,
    resume,
    restart,
    returnToMenu,
    getState: () => session.state,
    getSnapshot: () => ({
      lifecycle: session.state,
      settings: session.settings ? structuredClone(session.settings) : null,
      targeting: session.tool || session.orderTool || (session.targeting ? "ion" : null),
      profile: session.profile,
      animationActive: Boolean(session.raf),
      audio: session.audio?.snapshot() || { muted: session.muted, contextState: "none", voices: 0 },
      voice: session.voice?.snapshot() || { enabled: session.voiceEnabled, available: false, speaking: false },
      camera: session.renderer ? { ...session.renderer.camera } : null,
      simulation: session.engine?.snapshot() || null
    }),
    command: {
      dispatch: command => session.engine?.dispatch(command),
      startStructure: type => session.engine?.startStructureBuild(type),
      placeStructure: (x, y) => session.engine?.placeStructure(x, y),
      queueUnit: type => session.engine?.queueUnit(type),
      select: (x, y, append = false) => session.engine?.selectAt(x, y, { append }),
      move: (x, y) => session.engine?.issueMove(x, y),
      attack: id => session.engine?.issueAttack(id),
      superweapon: (x, y) => session.engine?.useSuperweapon(x, y)
    }
  };

  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", installTrigger, { once: true }) : installTrigger();
})();
