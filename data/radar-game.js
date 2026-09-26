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
    matchOptions: { mapId: "crystalReach", difficulty: "normal" },
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
    setTimeout(() => { node.textContent = message; }, 16);
  };

  function installTrigger() {
    const trigger = document.createElement("button");
    trigger.type = "button";
    trigger.className = "radar-game-trigger";
    trigger.innerHTML = '<span class="radar-game-trigger-dot" aria-hidden="true"></span><span>Radar RTS</span>';
    trigger.setAttribute("aria-label", "Open Radar RTS");
    trigger.setAttribute("aria-haspopup", "dialog");
    trigger.setAttribute("aria-controls", "radarGameOverlay");
    trigger.addEventListener("click", activate);
    document.body.append(trigger);
    session.trigger = trigger;
  }

  async function loadModules() {
    if (!session.modules) {
      const [engine, renderer, definitions, audio, icons] = await Promise.all([
        import(moduleUrl("radar-rts-engine.js")),
        import(moduleUrl("radar-rts-renderer.js")),
        import(moduleUrl("radar-rts-definitions.js")),
        import(moduleUrl("radar-rts-audio.js")),
        import(moduleUrl("radar-rts-icons.js"))
      ]);
      session.modules = { ...engine, ...renderer, ...definitions, ...audio, ...icons };
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
          <div class="radar-rts-actions"><button data-action="sfx" aria-pressed="false">SFX on</button><button data-action="pause">Pause</button><button data-action="restart">Restart</button><button data-action="exit" class="danger">Exit</button></div>
        </header>
        <div class="radar-rts-hud" aria-label="Strategic status">
          <div class="primary"><span>Credits</span><strong data-hud="credits">—</strong><small>Available funds</small></div>
          <div class="primary" data-power-cell><span>Power</span><strong data-hud="power">—</strong><small data-hud="power-state">Grid offline</small></div>
          <div><span>Construction</span><strong data-hud="construction">Idle</strong><progress data-progress="construction" max="100" value="0"></progress><small data-hud="construction-detail">No active build</small></div>
          <div><span>Infantry</span><strong data-hud="infantry">Idle</strong><progress aria-label="Infantry production" data-progress="infantry" max="100" value="0"></progress><small data-hud="infantry-detail">No unit queued</small></div>
          <div><span>Vehicles</span><strong data-hud="vehicles">Idle</strong><progress aria-label="Vehicle production" data-progress="vehicles" max="100" value="0"></progress><small data-hud="vehicles-detail">No unit queued</small></div>
          <div><span>Ion Storm</span><strong data-hud="storm">Locked</strong><progress data-progress="storm" max="100" value="0"></progress><small data-hud="storm-detail">Requires Storm Uplink</small></div>
        </div>
        <main class="radar-rts-main">
          <section class="radar-rts-battlefield" aria-label="Tactical battlefield">
            <canvas class="radar-game-screen" tabindex="0" aria-label="Radar RTS battlefield"></canvas>
            <div class="radar-rts-toast" aria-live="polite"></div>
            <div class="radar-rts-modal" data-panel="pause" hidden><h3>UPLINK PAUSED</h3><p>The simulation is suspended.</p><button data-action="resume">Resume mission</button></div>
            <div class="radar-rts-modal" data-panel="outcome" hidden><h3 data-outcome-title>MISSION COMPLETE</h3><p data-outcome-copy></p><button data-action="restart">Restart</button><button data-action="exit">Return to site</button></div>
          </section>
          <aside class="radar-rts-command" aria-label="Command console">
            <div class="radar-rts-map-wrap"><canvas class="radar-rts-minimap" aria-label="Battlefield minimap"></canvas><span>MINIMAP // TAP TO NAVIGATE</span></div>
            <div class="radar-rts-selection" data-selection>No units selected</div>
            <div class="radar-rts-tabs" role="tablist" aria-label="Production categories"><button role="tab" aria-selected="true" data-tab="structures">Build</button><button role="tab" aria-selected="false" data-tab="infantry">Infantry</button><button role="tab" aria-selected="false" data-tab="vehicles">Vehicles</button><button role="tab" aria-selected="false" data-tab="special">Special</button></div>
            <div class="radar-rts-queues" data-queues></div><div class="radar-rts-options" data-options></div>
            <div class="radar-rts-mobile-tools"><button data-action="clear-selection">Clear selection</button><button data-action="center-base">Center base</button></div>
            <div class="radar-rts-orders"><strong>Orders</strong><span>Mouse: drag select, right-click order, wheel zoom. Touch: tap select/order, drag pan, pinch zoom; tap more friendly units to add them.</span></div>
          </aside>
          <section class="radar-rts-start" data-panel="start" aria-labelledby="radarStartTitle">
            <div class="radar-rts-start-card"><span class="radar-rts-kicker">KrispyKP tactical prototype</span><h3 id="radarStartTitle">RADAR COMMAND</h3><p class="version">Version 1.2.0</p><p>Establish power, harvest crystal, build a strike force and destroy the hostile Command Hub.</p><div class="radar-rts-setup"><label>Difficulty<select data-difficulty aria-describedby="radarDifficultyInfo"></select><small id="radarDifficultyInfo"></small></label><label>Battlefield<select data-map aria-describedby="radarMapInfo"></select><small id="radarMapInfo"></small></label></div><div class="radar-rts-start-actions"><button data-action="start" class="start">Start game</button><button data-action="help" aria-expanded="false">Controls</button><button data-action="exit" class="danger">Exit Radar</button></div><div class="radar-rts-start-help" data-start-help hidden><p><b>Desktop:</b> click or drag to select, right-click to order, wheel/WASD to navigate. A move order disengages from combat.</p><p><b>Touch:</b> tap units and targets, drag to pan, pinch to zoom. Friendly taps build a selection.</p></div></div>
          </section>
        </main>
        <footer class="radar-rts-footer"><span data-status>Awaiting mission start.</span><span>ESC exits safely</span></footer>
        <span class="radar-rts-live sr-only" aria-live="assertive"></span>
      </div>`;
    document.body.append(overlay);
    session.overlay = overlay;
    session.profile = overlay.dataset.profile;
  }

  async function activate() {
    if (session.state !== STATES.IDLE) return;
    setState(STATES.LOADING);
    session.trigger.disabled = true;
    session.focus = document.activeElement;
    session.scrollY = scrollY;
    document.body.classList.add("radar-game-active");
    makeOverlay();
    try {
      await loadModules();
      if (session.state !== STATES.LOADING) return;
      if (!session.preferenceLoaded) { session.muted = session.modules.readSfxMuted(); session.preferenceLoaded = true; }
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
      if (button.dataset.queueAction === "pause") session.engine.toggleProduction(button.dataset.producer);
      else session.engine.cancelUnit(button.dataset.producer);
      updateHud(session.engine.snapshot());
    });
    const canvas = session.overlay.querySelector(".radar-game-screen");
    listen(canvas, "contextmenu", event => { event.preventDefault(); issueOrderAt(event); });
    listen(canvas, "pointerdown", pointerDown);
    listen(canvas, "pointermove", pointerMove);
    listen(canvas, "pointerup", pointerUp);
    listen(canvas, "pointercancel", pointerUp);
    listen(canvas, "wheel", wheelZoom, { passive: false });
    const minimap = session.overlay.querySelector(".radar-rts-minimap");
    listen(minimap, "pointerdown", event => {
      if (!session.renderer || session.state !== STATES.PLAYING) return;
      event.preventDefault();
      const point = session.renderer.minimapToWorld(event.clientX, event.clientY);
      session.renderer.centerOn(point.x, point.y);
    });
    listen(window, "keydown", keyDown);
    listen(window, "keyup", event => session.keys.delete(event.key.toLowerCase()));
    listen(window, "resize", resized);
    listen(window, "blur", () => { if (session.state === STATES.PLAYING) pause(); });
    listen(document, "visibilitychange", () => { if (document.hidden && session.state === STATES.PLAYING) pause(); });
    setTab("structures");
  }

  function configureMenu() {
    const { MAPS, DIFFICULTIES, radarIcon } = session.modules;
    const difficulty = session.overlay.querySelector("[data-difficulty]"), map = session.overlay.querySelector("[data-map]");
    difficulty.innerHTML = Object.values(DIFFICULTIES).map(item => `<option value="${item.id}">${item.name}</option>`).join("");
    map.innerHTML = Object.values(MAPS).map(item => `<option value="${item.id}">${item.name}</option>`).join("");
    difficulty.value = session.matchOptions.difficulty; map.value = session.matchOptions.mapId;
    const update = () => {
      session.matchOptions = { difficulty: difficulty.value, mapId: map.value };
      session.overlay.querySelector("#radarDifficultyInfo").textContent = DIFFICULTIES[difficulty.value].description;
      session.overlay.querySelector("#radarMapInfo").textContent = MAPS[map.value].description;
    };
    listen(difficulty, "change", update); listen(map, "change", update); update();
    session.overlay.querySelectorAll("[data-tab]").forEach(button => { button.innerHTML = radarIcon(button.dataset.tab) + `<span>${button.textContent}</span>`; });
    session.overlay.querySelectorAll("progress").forEach(el => { if (!el.hasAttribute("aria-label")) el.setAttribute("aria-label", el.dataset.progress + " progress"); });
    updateSfxButton();
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
    session.pointerStart = null; session.pointerId = null; session.pointerMoved = false;
    session.dragBox = null; session.pointerWorld = null; session.placement = null; session.targeting = false;
  }

  function startGame() {
    if (session.state !== STATES.MENU) return;
    session.engine = new session.modules.RadarRTSSimulation(session.matchOptions);
    session.renderer = new session.modules.RadarRTSRenderer(
      session.overlay.querySelector(".radar-game-screen"),
      session.overlay.querySelector(".radar-rts-minimap"), session.engine.world
    );
    resetCamera(); resetInput();
    session.audio = new session.modules.RadarRTSAudio({ muted: session.muted });
    session.audio.start(); session.audio.play("start");
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
    if (session.state !== STATES.PLAYING || event.button > 0) return;
    const point = pointInCanvas(event);
    try { event.currentTarget.setPointerCapture?.(event.pointerId); } catch { /* Synthetic validation pointers are not browser-active pointers. */ }
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
    const pending = session.engine?.pendingPlacement.player;
    session.placement = pending
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
    if (session.engine.pendingPlacement.player) {
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
    } else if (session.engine.selectedUnits().length) {
      if (entity?.side === "enemy") session.engine.issueAttack(entity.id);
      else session.engine.issueMove(world.x, world.y);
    } else session.engine.clearSelection();
  }

  function issueOrderAt(event) {
    if (session.state !== STATES.PLAYING) return;
    const point = pointInCanvas(event);
    const world = session.renderer.screenToWorld(point.x, point.y);
    const target = session.engine.entityAt(world.x, world.y, "enemy");
    const count = target ? session.engine.issueAttack(target.id) : session.engine.issueMove(world.x, world.y);
    announce(count ? (target ? "Attack order confirmed." : "Move order confirmed.") : "Select combat units first.");
  }

  function wheelZoom(event) {
    if (session.state !== STATES.PLAYING) return;
    event.preventDefault();
    const point = pointInCanvas(event);
    session.renderer.setZoomAt(session.renderer.camera.zoom * Math.exp(-event.deltaY * 0.0012), point.x, point.y);
  }

  function keyDown(event) {
    if (session.state === STATES.IDLE) return;
    if (event.key === "Escape") {
      event.preventDefault();
      exitGame();
      return;
    }
    if (event.key === " " && session.state !== STATES.MENU && !/input|button/i.test(document.activeElement?.tagName || "")) {
      event.preventDefault();
      session.state === STATES.PAUSED ? resume() : pause();
      return;
    }
    session.keys.add(event.key.toLowerCase());
  }

  function updateCamera(dt) {
    const speed = 520 * dt;
    if (session.keys.has("a") || session.keys.has("arrowleft")) session.renderer.pan(-speed, 0);
    if (session.keys.has("d") || session.keys.has("arrowright")) session.renderer.pan(speed, 0);
    if (session.keys.has("w") || session.keys.has("arrowup")) session.renderer.pan(0, -speed);
    if (session.keys.has("s") || session.keys.has("arrowdown")) session.renderer.pan(0, speed);
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
    session.renderer.render(snapshot, {
      reducedMotion: reducedMotion.matches,
      pointerWorld: session.pointerWorld,
      placement: session.placement,
      dragBox: session.dragBox,
      superTarget: session.targeting ? session.pointerWorld : null
    });
    session.audio?.consume(snapshot.soundEvents);
    if (now - session.lastHud > 120) {
      updateHud(snapshot);
      session.lastHud = now;
    }
    if (snapshot.status === "ended" && session.state !== STATES.ENDED) endMission(snapshot.outcome);
    session.raf = requestAnimationFrame(frame);
  }

  function setProgress(name, value) {
    const progress = session.overlay.querySelector(`[data-progress="${name}"]`);
    progress.value = Math.max(0, Math.min(100, value));
  }

  function updateStrategicHud(snapshot) {
    const power = snapshot.power.player;
    session.overlay.querySelector('[data-hud="credits"]').textContent = String(snapshot.credits.player).padStart(4, "0");
    session.overlay.querySelector('[data-hud="power"]').textContent = `${power.generated} / ${power.used}`;
    const powerCell = session.overlay.querySelector("[data-power-cell]");
    powerCell.dataset.lowPower = String(power.low);
    if (power.low && !session.lastLowPower) session.audio?.play("low");
    session.lastLowPower = power.low;
    session.overlay.querySelector('[data-hud="power-state"]').textContent = power.low ? "LOW POWER — systems slowed" : `${Math.max(0, power.available)} reserve`;

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

    for (const [category, type] of [["infantry", "barracks"], ["vehicles", "warFactory"]]) {
      const producers = snapshot.structures.filter(item => item.side === "player" && item.type === type);
      const producer = producers.find(item => item.queue.length), job = producer?.queue[0];
      const percent = job ? job.progress / job.duration * 100 : 0;
      session.overlay.querySelector(`[data-hud="${category}"]`).textContent = job ? session.modules.UNITS[job.type].short : "Idle";
      session.overlay.querySelector(`[data-hud="${category}-detail"]`).textContent = job ? `${Math.floor(percent)}% · ${producers.reduce((sum, item) => sum + item.queue.length, 0)} queued${producer.productionPaused ? " · paused" : power.low ? " · slowed" : ""}` : `Requires ${session.modules.STRUCTURES[type].short}`;
      if (!job && producers.length) session.overlay.querySelector(`[data-hud="${category}-detail"]`).textContent = "Queue available";
      setProgress(category, percent);
    }

    const storm = snapshot.superweapons.player;
    const hasUplink = snapshot.structures.some(item => item.side === "player" && item.type === session.modules.SUPERWEAPON.prerequisite);
    session.overlay.querySelector('[data-hud="storm"]').textContent = storm.ready ? "READY" : hasUplink ? `${Math.floor(storm.charge * 100)}%` : "Locked";
    session.overlay.querySelector('[data-hud="storm-detail"]').textContent = storm.ready ? "Select Special to target" : power.low && hasUplink ? "Paused by low power" : hasUplink ? "Charging" : "Requires Storm Uplink";
    setProgress("storm", storm.charge * 100);
  }

  function updateHud(snapshot) {
    updateStrategicHud(snapshot);
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
      container.innerHTML = optionDefinitions(tab).map(item => `<button class="radar-rts-option" data-kind="${item.kind}" data-id="${item.id}" title="${item.name}: ${item.role}"><i class="radar-production-icon">${session.modules.radarIcon(item.id)}<i class="radar-sweep"></i></i><b>${item.name}</b><span>${item.cost ? `${item.cost} cr · ` : ""}${item.role}</span><em></em></button>`).join("") + (tab === "structures" ? '<button class="radar-rts-option cancel" data-cancel><b>Cancel build</b><span>75% refund</span></button>' : "");
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
    for (const producer of producers) {
      let row = container.querySelector(`[data-queue-row="${producer.id}"]`);
      if (!row) {
        row = document.createElement("div"); row.dataset.queueRow = producer.id;
        row.innerHTML = `<span></span><button data-producer="${producer.id}" data-queue-action="pause">Pause queue</button><button data-producer="${producer.id}" data-queue-action="cancel" title="Cancel current unit; 75% refund">Cancel unit</button>`;
        container.append(row);
      }
      row.querySelector("span").textContent = producer.queue.length ? producer.queue.map(j => session.modules.UNITS[j.type].short).join(" → ") : `${session.modules.STRUCTURES[type].short} queue empty`;
      row.querySelector('[data-queue-action="pause"]').textContent = producer.productionPaused ? "Resume queue" : "Pause queue";
      row.querySelector('[data-queue-action="pause"]').setAttribute("aria-pressed", String(producer.productionPaused));
      row.querySelectorAll("button").forEach(button => { button.disabled = !producer.queue.length || session.state !== STATES.PLAYING; });
    }
    container.hidden = producers.length === 0;
  }

  function build(kind, id) {
    let result;
    if (session.engine.pendingPlacement.player?.type === id) { announce("Place the ready structure on the battlefield."); return; }
    if (kind === "structure") result = session.engine.startStructureBuild(id);
    else if (kind === "unit") result = session.engine.queueUnit(id);
    else {
      session.targeting = true;
      result = { reason: "Select an Ion Storm target." };
    }
    announce(result.reason);
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
    if (pausePanel) pausePanel.hidden = session.state !== STATES.PAUSED;
  }

  function pause() {
    if (session.state !== STATES.PLAYING) return;
    setState(STATES.PAUSED);
    resetInput(); session.audio?.pause();
    announce("Mission paused.");
  }
  function resume() {
    if (session.state !== STATES.PAUSED) return;
    session.lastFrame = performance.now();
    setState(STATES.PLAYING);
    session.audio?.start();
    announce("Mission resumed.");
  }
  function endMission(outcome) {
    setState(STATES.ENDED);
    session.audio?.play(outcome);
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
    resetInput(); resetCamera();
    session.audio?.destroy();
    session.audio = new session.modules.RadarRTSAudio({ muted: session.muted });
    session.audio.start(); session.audio.play("start"); session.lastLowPower = false;
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
      if (!session.renderer) return;
      const view = session.renderer.viewSize();
      const center = { x: session.renderer.camera.x + view.width / 2, y: session.renderer.camera.y + view.height / 2 };
      session.renderer.resize();
      session.renderer.centerOn(center.x, center.y);
    });
  }

  async function exitGame() {
    if ([STATES.IDLE, STATES.EXITING].includes(session.state)) return;
    setState(STATES.EXITING);
    cancelAnimationFrame(session.raf);
    cancelAnimationFrame(session.resizeRaf);
    session.raf = 0;
    session.listeners.splice(0).forEach(remove => remove());
    session.engine?.destroy();
    session.audio?.destroy(); session.audio = null;
    session.engine = null;
    session.renderer = null;
    resetInput();
    document.body.classList.remove("radar-game-visible");
    await new Promise(resolve => setTimeout(resolve, reducedMotion.matches ? 0 : 180));
    session.overlay?.remove();
    session.overlay = null;
    document.body.classList.remove("radar-game-active");
    document.body.style.overflow = "";
    delete document.body.dataset.radarGameState;
    scrollTo(0, session.scrollY);
    session.trigger.disabled = false;
    setState(STATES.IDLE);
    session.focus?.isConnected ? session.focus.focus() : session.trigger.focus();
  }

  window.KRISPY_RADAR_GAME = {
    version: "1.2.0",
    activate,
    start: startGame,
    exit: exitGame,
    pause,
    resume,
    restart,
    getState: () => session.state,
    getSnapshot: () => ({
      lifecycle: session.state,
      profile: session.profile,
      animationActive: Boolean(session.raf),
      audio: session.audio?.snapshot() || { muted: session.muted, contextState: "none", voices: 0 },
      camera: session.renderer ? { ...session.renderer.camera } : null,
      simulation: session.engine?.snapshot() || null
    }),
    command: {
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
