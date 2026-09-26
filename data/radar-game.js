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
      const [engine, renderer, definitions] = await Promise.all([
        import(moduleUrl("radar-rts-engine.js")),
        import(moduleUrl("radar-rts-renderer.js")),
        import(moduleUrl("radar-rts-definitions.js"))
      ]);
      session.modules = { ...engine, ...renderer, ...definitions };
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
          <div class="radar-rts-actions"><button data-action="pause">Pause</button><button data-action="restart">Restart</button><button data-action="exit" class="danger">Exit</button></div>
        </header>
        <div class="radar-rts-hud" aria-label="Strategic status">
          <div class="primary"><span>Credits</span><strong data-hud="credits">—</strong><small>Available funds</small></div>
          <div class="primary" data-power-cell><span>Power</span><strong data-hud="power">—</strong><small data-hud="power-state">Grid offline</small></div>
          <div><span>Construction</span><strong data-hud="construction">Idle</strong><progress data-progress="construction" max="100" value="0"></progress><small data-hud="construction-detail">No active build</small></div>
          <div><span>Production</span><strong data-hud="production">Idle</strong><progress data-progress="production" max="100" value="0"></progress><small data-hud="production-detail">No unit queued</small></div>
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
            <div class="radar-rts-options" data-options></div>
            <div class="radar-rts-mobile-tools"><button data-action="clear-selection">Clear selection</button><button data-action="center-base">Center base</button></div>
            <div class="radar-rts-orders"><strong>Orders</strong><span>Mouse: drag select, right-click order, wheel zoom. Touch: tap select/order, drag pan, pinch zoom; tap more friendly units to add them.</span></div>
          </aside>
          <section class="radar-rts-start" data-panel="start" aria-labelledby="radarStartTitle">
            <div class="radar-rts-start-card"><span class="radar-rts-kicker">KrispyKP tactical prototype</span><h3 id="radarStartTitle">RADAR COMMAND</h3><p class="version">Version 1.1.0</p><p>Establish power, harvest crystal, build a strike force and destroy the hostile Command Hub.</p><div class="radar-rts-start-actions"><button data-action="start" class="start">Start game</button><button data-action="help" aria-expanded="false">Controls</button><button data-action="exit" class="danger">Exit Radar</button></div><div class="radar-rts-start-help" data-start-help hidden><p><b>Desktop:</b> click or drag to select, right-click to order, wheel/WASD to navigate.</p><p><b>Touch:</b> tap units and targets, drag the world to pan, pinch to zoom. Friendly taps build a selection.</p></div></div>
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
      bindInterface();
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

  function startGame() {
    if (session.state !== STATES.MENU) return;
    session.engine = new session.modules.RadarRTSSimulation();
    session.renderer = new session.modules.RadarRTSRenderer(
      session.overlay.querySelector(".radar-game-screen"),
      session.overlay.querySelector(".radar-rts-minimap")
    );
    session.renderer.centerOn(430, 800);
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
      pointerWorld: session.pointerWorld,
      placement: session.placement,
      dragBox: session.dragBox,
      superTarget: session.targeting ? session.pointerWorld : null
    });
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

    const producers = snapshot.structures.filter(item => item.side === "player" && item.queue.length);
    const producer = producers[0];
    const job = producer?.queue[0];
    if (job) {
      const percent = job.progress / job.duration * 100;
      const queued = producers.reduce((sum, item) => sum + item.queue.length, 0);
      session.overlay.querySelector('[data-hud="production"]').textContent = session.modules.UNITS[job.type].name;
      session.overlay.querySelector('[data-hud="production-detail"]').textContent = `${Math.floor(percent)}% · ${queued} queued${power.low ? " · slowed" : ""}`;
      setProgress("production", percent);
    } else {
      session.overlay.querySelector('[data-hud="production"]').textContent = "Idle";
      session.overlay.querySelector('[data-hud="production-detail"]').textContent = "No unit queued";
      setProgress("production", 0);
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
    const signature = `${tab}|${snapshot.credits.player}|${snapshot.power.player.low}|${snapshot.construction.player?.progress.toFixed(1)}|${snapshot.pendingPlacement.player?.type}|${snapshot.superweapons.player.charge.toFixed(2)}|${snapshot.structures.map(item => `${item.type}:${item.queue.map(job => `${job.type}:${job.progress.toFixed(1)}`).join("-")}`).join(",")}`;
    if (!force && container.dataset.signature === signature) return;
    container.dataset.signature = signature;
    container.innerHTML = optionDefinitions(tab).map(item => {
      const check = item.kind === "special"
        ? { available: snapshot.superweapons.player.ready, reason: snapshot.superweapons.player.ready ? "Ready to target" : `Charging ${Math.floor(snapshot.superweapons.player.charge * 100)}%` }
        : session.engine.availability(item.kind, item.id);
      return `<button class="radar-rts-option" data-kind="${item.kind}" data-id="${item.id}" ${check.available ? "" : "disabled"}><b>${item.name}</b><span>${item.cost ? `${item.cost} cr · ` : ""}${item.role}</span><em>${check.reason}</em></button>`;
    }).join("") + (snapshot.construction.player || snapshot.pendingPlacement.player
      ? '<button class="radar-rts-option cancel" data-cancel><b>Cancel construction</b><span>75% refund</span></button>'
      : "");
    container.querySelectorAll("[data-id]").forEach(button => { button.onclick = () => build(button.dataset.kind, button.dataset.id); });
    container.querySelector("[data-cancel]")?.addEventListener("click", () => { session.engine.cancelConstruction(); refreshOptions(true); });
  }

  function build(kind, id) {
    let result;
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
    announce("Mission paused.");
  }
  function resume() {
    if (session.state !== STATES.PAUSED) return;
    session.lastFrame = performance.now();
    setState(STATES.PLAYING);
    announce("Mission resumed.");
  }
  function endMission(outcome) {
    setState(STATES.ENDED);
    const panel = session.overlay.querySelector('[data-panel="outcome"]');
    panel.hidden = false;
    panel.querySelector("[data-outcome-title]").textContent = outcome === "victory" ? "VICTORY" : "DEFEAT";
    panel.querySelector("[data-outcome-copy]").textContent = outcome === "victory" ? "The hostile Command Hub has been destroyed." : "Your Command Hub was destroyed.";
    announce(panel.querySelector("h3").textContent);
  }
  function restart() {
    if (!session.engine || [STATES.MENU, STATES.LOADING].includes(session.state)) return;
    session.engine.destroy();
    session.engine = new session.modules.RadarRTSSimulation();
    session.renderer.centerOn(430, 800);
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
    session.engine = null;
    session.renderer = null;
    session.pointers.clear();
    session.pinch = null;
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
    version: "1.1.0",
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
