(() => {
  "use strict";

  if (window.KRISPY_RADAR_GAME) return;

  const GAME_VERSION = "0.4.0";
  const STATES = Object.freeze({
    IDLE: "idle",
    TRANSITIONING_IN: "transitioning-in",
    PLAYING: "playing",
    PAUSED: "paused",
    GAME_OVER: "game-over",
    TRANSITIONING_OUT: "transitioning-out"
  });
  const LIMITS = Object.freeze({ enemies: 24, bullets: 36, particles: 48 });
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const transitionMs = () => (reducedMotion.matches ? 40 : 620);

  let state = STATES.IDLE;
  let previousState = STATES.IDLE;
  let overlay;
  let canvas;
  let ctx;
  let trigger;
  let pausePanel;
  let gameOverPanel;
  let statusLive;
  let scoreValue;
  let healthValue;
  let finalScoreValue;
  let pauseButton;
  let rafId = 0;
  let lastFrame = 0;
  let spawnClock = 0;
  let scrollY = 0;
  let lastFocused = null;
  let resizeRaf = 0;
  let lastResult = null;
  let pointerTarget = null;
  let pointerFiring = false;
  let mobileFiring = false;
  let joystickPointerId = null;
  let aimJoystickPointerId = null;
  const joystickInput = { x: 0, y: 0 };
  const aimJoystickInput = { x: 0, y: 0 };
  let nextEnemyId = 1;
  let rngState = 0x4b4b5001;
  const keys = new Set();
  const world = { width: 960, height: 540, scaleX: 1, scaleY: 1 };
  const player = { x: 480, y: 270, radius: 14, speed: 230, angle: -Math.PI / 2, health: 3, invulnerable: 0 };
  const bullets = [];
  const enemies = [];
  const particles = [];
  let score = 0;
  let fireCooldown = 0;
  let pauseOnStart = false;

  function setState(next) {
    previousState = state;
    state = next;
    if (overlay) overlay.dataset.gameState = next;
    document.body.dataset.radarGameState = next;
    updatePanels();
    updateTrigger();
  }

  function updateTrigger() {
    if (!trigger) return;
    const active = state !== STATES.IDLE;
    trigger.querySelector("span:last-child").textContent = active ? "Exit radar" : "Radar mode";
    trigger.setAttribute("aria-label", active ? "Exit Radar mode" : "Enter Radar mode");
    trigger.setAttribute("aria-pressed", String(active));
    trigger.disabled = state === STATES.TRANSITIONING_OUT;
  }
  function updatePanels() {
    if (!overlay) return;
    const paused = state === STATES.PAUSED;
    const over = state === STATES.GAME_OVER;
    pausePanel.hidden = !paused;
    gameOverPanel.hidden = !over;
    pauseButton.textContent = paused ? "Resume" : "Pause";
    pauseButton.setAttribute("aria-pressed", String(paused));
  }

  function announce(message) {
    if (!statusLive) return;
    statusLive.textContent = "";
    window.setTimeout(() => {
      statusLive.textContent = message;
    }, 20);
  }

  function createInterface() {
    trigger = document.createElement("button");
    trigger.type = "button";
    trigger.className = "radar-game-trigger";
    trigger.innerHTML = '<span aria-hidden="true" class="radar-game-trigger-dot"></span><span>Radar mode</span>';
    trigger.setAttribute("aria-haspopup", "dialog");
    trigger.setAttribute("aria-controls", "radarGameOverlay");
    trigger.addEventListener("click", () => {
      if (state === STATES.IDLE) activate();
      else exitGame();
    });

    overlay = document.createElement("div");
    overlay.id = "radarGameOverlay";
    overlay.className = "radar-game-overlay";
    overlay.hidden = true;
    overlay.dataset.gameState = STATES.IDLE;
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-labelledby", "radarGameTitle");
    overlay.innerHTML = `
      <div class="radar-game-chassis">
        <header class="radar-game-header">
          <div>
            <div class="radar-game-kicker">Tactical uplink // prototype</div>
            <h2 id="radarGameTitle">Radar Intercept</h2>
          </div>
          <div class="radar-game-actions">
            <button type="button" data-game-action="pause">Pause</button>
          </div>
        </header>
        <div class="radar-game-hud" aria-label="Game status">
          <span>Score <strong data-game-score>000000</strong></span>
          <span>Armour <strong data-game-health>3</strong></span>
          <span>Version <strong>${GAME_VERSION}</strong></span>
        </div>
        <div class="radar-game-screen">
          <canvas class="radar-game-canvas" width="960" height="540" aria-label="Radar Intercept game field"></canvas>
          <div class="radar-game-reticle" aria-hidden="true"></div>
          <div class="radar-game-panel radar-game-pause" hidden>
            <strong>Uplink paused</strong>
            <span>Resume when ready or exit safely to the website.</span>
            <button type="button" data-game-action="resume">Resume</button>
          </div>
          <div class="radar-game-panel radar-game-over" hidden>
            <strong>Signal lost</strong>
            <span>Final score: <b data-game-final-score>0</b></span>
            <div>
              <button type="button" data-game-action="restart">Restart</button>
              <button type="button" data-game-action="exit">Exit radar</button>
            </div>
          </div>
        </div>
        <div class="radar-game-help">
          <span><b>Move</b> WASD / arrow keys</span>
          <span><b>Fire</b> Space / click</span>
          <span><b>Exit</b> Escape</span>
        </div>
        <div class="radar-game-touch" aria-label="Touch game controls">
          <div class="radar-game-joystick" data-game-joystick="move" role="application" aria-label="Movement joystick. Touch, hold and drag to move.">
            <span class="radar-game-joystick-ring" aria-hidden="true"></span>
            <span class="radar-game-joystick-knob" aria-hidden="true"></span>
            <span class="radar-game-joystick-label" aria-hidden="true">MOVE</span>
          </div>
          <div class="radar-game-aim-cluster">
            <div class="radar-game-joystick radar-game-aim-stick" data-game-joystick="aim" role="application" aria-label="Aim and fire joystick. Touch, hold and drag to aim and fire.">
              <span class="radar-game-joystick-ring" aria-hidden="true"></span>
              <span class="radar-game-joystick-knob" aria-hidden="true"></span>
              <span class="radar-game-joystick-label" aria-hidden="true">AIM / FIRE</span>
            </div>
            <button type="button" class="radar-game-fire" data-game-fire>Fire</button>
          </div>
        </div>
      </div>
      <div class="sr-only" aria-live="polite" data-game-live></div>
    `;

    canvas = overlay.querySelector("canvas");
    ctx = canvas.getContext("2d");
    pausePanel = overlay.querySelector(".radar-game-pause");
    gameOverPanel = overlay.querySelector(".radar-game-over");
    statusLive = overlay.querySelector("[data-game-live]");
    scoreValue = overlay.querySelector("[data-game-score]");
    healthValue = overlay.querySelector("[data-game-health]");
    finalScoreValue = overlay.querySelector("[data-game-final-score]");
    pauseButton = overlay.querySelector('[data-game-action="pause"]');

    overlay.addEventListener("click", handleOverlayClick);
    canvas.tabIndex = 0;
    canvas.addEventListener("pointermove", updatePointerAim);
    canvas.addEventListener("pointerdown", startPointerFire);
    canvas.addEventListener("pointerup", stopPointerFire);
    canvas.addEventListener("pointercancel", stopPointerFire);
    canvas.addEventListener("lostpointercapture", stopPointerFire);
    setupJoystick(overlay.querySelector('[data-game-joystick="move"]'), "move");
    setupJoystick(overlay.querySelector('[data-game-joystick="aim"]'), "aim");
    setupFireControl(overlay.querySelector("[data-game-fire]"));
    document.body.append(trigger, overlay);
  }

  function setupJoystick(control, mode) {
    if (!control) return;
    const knob = control.querySelector(".radar-game-joystick-knob");
    const isAim = mode === "aim";
    const reset = (event) => {
      const activeId = isAim ? aimJoystickPointerId : joystickPointerId;
      if (event && activeId !== null && event.pointerId !== activeId) return;
      if (isAim) { aimJoystickPointerId = null; aimJoystickInput.x = 0; aimJoystickInput.y = 0; mobileFiring = false; }
      else { joystickPointerId = null; joystickInput.x = 0; joystickInput.y = 0; }
      knob.style.transform = "translate(-50%, -50%)";
    };
    const update = (event) => {
      const activeId = isAim ? aimJoystickPointerId : joystickPointerId;
      if (event.pointerId !== activeId) return;
      event.preventDefault();
      const rect = control.getBoundingClientRect();
      const radius = Math.max(1, Math.min(rect.width, rect.height) * 0.32);
      let x = event.clientX - (rect.left + rect.width / 2);
      let y = event.clientY - (rect.top + rect.height / 2);
      const length = Math.hypot(x, y);
      if (length > radius) { x = (x / length) * radius; y = (y / length) * radius; }
      const target = isAim ? aimJoystickInput : joystickInput;
      target.x = x / radius; target.y = y / radius;
      if (isAim && length > radius * 0.18) {
        player.angle = Math.atan2(target.y, target.x);
        pointerTarget = { x: player.x + Math.cos(player.angle) * 180, y: player.y + Math.sin(player.angle) * 180 };
        mobileFiring = true;
        fireBullet();
      }
      knob.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
    };
    control.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      if (state !== STATES.PLAYING) return;
      if (isAim) aimJoystickPointerId = event.pointerId; else joystickPointerId = event.pointerId;
      control.setPointerCapture?.(event.pointerId); update(event);
    });
    control.addEventListener("pointermove", update);
    control.addEventListener("pointerup", reset);
    control.addEventListener("pointercancel", reset);
    control.addEventListener("lostpointercapture", reset);
  }

  function setupFireControl(button) {
    if (!button) return;
    const stop = (event) => {
      event?.preventDefault();
      mobileFiring = false;
    };
    button.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      if (state !== STATES.PLAYING) return;
      button.setPointerCapture?.(event.pointerId);
      mobileFiring = true;
      fireBullet();
    });
    button.addEventListener("pointerup", stop);
    button.addEventListener("pointercancel", stop);
    button.addEventListener("lostpointercapture", stop);
  }

  function handleOverlayClick(event) {
    const action = event.target.closest("[data-game-action]")?.dataset.gameAction;
    if (!action) return;
    if (action === "exit") exitGame();
    else if (action === "pause") togglePause();
    else if (action === "resume") resumeGame();
    else if (action === "restart") restartGame();
  }

  function lockWebsite() {
    scrollY = window.scrollY;
    lastFocused = document.activeElement;
    document.documentElement.style.backgroundColor = "#031016";
    document.body.style.position = "fixed";
    document.body.style.inset = `-${scrollY}px 0 auto 0`;
    document.body.style.width = "100%";
    document.body.classList.add("radar-game-active");
    document.querySelectorAll(".shell > header, .shell > main, .shell > footer").forEach((element) => {
      element.inert = true;
    });
  }

  function prepareWebsiteRestore() {
    document.body.style.removeProperty("position");
    document.body.style.removeProperty("inset");
    document.body.style.removeProperty("width");
    window.scrollTo(0, scrollY);
    void document.documentElement.offsetHeight;
  }

  function finishWebsiteRestore() {
    document.querySelectorAll(".shell > header, .shell > main, .shell > footer").forEach((element) => {
      element.inert = false;
    });
    document.body.classList.remove("radar-game-active", "radar-game-visible");
    document.documentElement.style.removeProperty("background-color");
  }
  function activate() {
    if (state !== STATES.IDLE) return;
    pauseOnStart = false;
    lockWebsite();
    overlay.hidden = false;
    setState(STATES.TRANSITIONING_IN);
    requestAnimationFrame(() => document.body.classList.add("radar-game-visible"));
    window.setTimeout(() => {
      if (state !== STATES.TRANSITIONING_IN) return;
      resetGame();
      resizeCanvas();
      pauseButton.focus({ preventScroll: true });
      if (pauseOnStart || document.hidden) {
        setState(STATES.PAUSED);
        announce("Uplink paused while focus is away from the game.");
        return;
      }
      setState(STATES.PLAYING);
      lastFrame = performance.now();
      rafId = requestAnimationFrame(gameLoop);
      announce("Radar game active. Score zero. Armor three.");
    }, transitionMs());
  }

  function exitGame() {
    if (state === STATES.IDLE || state === STATES.TRANSITIONING_OUT) return;
    cancelAnimationFrame(rafId);
    rafId = 0;
    keys.clear();
    pointerFiring = false;
    mobileFiring = false;
    joystickPointerId = null;
    aimJoystickPointerId = null;
    joystickInput.x = 0;
    joystickInput.y = 0;
    aimJoystickInput.x = 0;
    aimJoystickInput.y = 0;
    setState(STATES.TRANSITIONING_OUT);
    prepareWebsiteRestore();
    requestAnimationFrame(() => document.body.classList.remove("radar-game-visible"));
    window.setTimeout(() => {
      overlay.hidden = true;
      finishWebsiteRestore();
      setState(STATES.IDLE);
      (lastFocused instanceof HTMLElement ? lastFocused : trigger).focus({ preventScroll: true });
      announce("Radar game closed.");
    }, transitionMs());
  }

  function resetGame() {
    score = 0;
    player.x = world.width / 2;
    player.y = world.height / 2;
    player.health = 3;
    player.angle = -Math.PI / 2;
    player.invulnerable = 0;
    bullets.length = 0;
    enemies.length = 0;
    particles.length = 0;
    spawnClock = 0;
    fireCooldown = 0;
    pointerTarget = null;
    pointerFiring = false;
    mobileFiring = false;
    joystickInput.x = 0;
    joystickInput.y = 0;
    aimJoystickInput.x = 0;
    aimJoystickInput.y = 0;
    aimJoystickPointerId = null;
    rngState = 0x4b4b5001;
    updateHud();
  }

  function restartGame() {
    if (state !== STATES.GAME_OVER) return;
    resetGame();
    setState(STATES.PLAYING);
    lastFrame = performance.now();
    rafId = requestAnimationFrame(gameLoop);
    announce("Radar game restarted. Score zero. Armor three.");
  }

  function pauseGame(reason = "Uplink paused.") {
    if (state === STATES.TRANSITIONING_IN) {
      pauseOnStart = true;
      return;
    }
    if (state !== STATES.PLAYING) return;
    cancelAnimationFrame(rafId);
    rafId = 0;
    keys.clear();
    joystickInput.x = 0;
    joystickInput.y = 0;
    aimJoystickInput.x = 0;
    aimJoystickInput.y = 0;
    aimJoystickPointerId = null;
    pointerFiring = false;
    mobileFiring = false;
    setState(STATES.PAUSED);
    announce(reason);
  }

  function resumeGame() {
    if (state !== STATES.PAUSED || document.hidden) return;
    setState(STATES.PLAYING);
    lastFrame = performance.now();
    rafId = requestAnimationFrame(gameLoop);
    canvas.focus?.({ preventScroll: true });
    announce("Uplink resumed.");
  }

  function togglePause() {
    if (state === STATES.PLAYING) pauseGame();
    else if (state === STATES.PAUSED) resumeGame();
  }

  function gameOver() {
    cancelAnimationFrame(rafId);
    rafId = 0;
    lastResult = Object.freeze({ score, gameVersion: GAME_VERSION });
    finalScoreValue.textContent = String(score);
    setState(STATES.GAME_OVER);
    const restart = gameOverPanel.querySelector('[data-game-action="restart"]');
    restart.focus({ preventScroll: true });
    announce(`Game over. Final score ${score}.`);
    window.dispatchEvent(new CustomEvent("krispykp:radar-game-complete", { detail: lastResult }));
  }

  function updateHud() {
    scoreValue.textContent = String(score).padStart(6, "0");
    healthValue.textContent = String(player.health);
  }

  function resizeCanvas() {
    if (!canvas || overlay.hidden) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(rect.width * dpr));
    canvas.height = Math.max(1, Math.round(rect.height * dpr));
    world.scaleX = canvas.width / world.width;
    world.scaleY = canvas.height / world.height;
    draw();
  }

  function random() {
    rngState = (rngState * 1664525 + 1013904223) >>> 0;
    return rngState / 4294967296;
  }

  function spawnEnemy() {
    if (enemies.length >= LIMITS.enemies) return;
    const edge = Math.floor(random() * 4);
    let x;
    let y;
    if (edge === 0) { x = -20; y = random() * world.height; }
    else if (edge === 1) { x = world.width + 20; y = random() * world.height; }
    else if (edge === 2) { x = random() * world.width; y = -20; }
    else { x = random() * world.width; y = world.height + 20; }
    enemies.push({ id: nextEnemyId++, type: "raider", x, y, radius: 12, speed: 52 + Math.min(score / 60, 58) });
  }

  function fireBullet() {
    if (state !== STATES.PLAYING || fireCooldown > 0 || bullets.length >= LIMITS.bullets) return;
    let angle = player.angle;
    if (pointerTarget) angle = Math.atan2(pointerTarget.y - player.y, pointerTarget.x - player.x);
    player.angle = angle;
    bullets.push({
      x: player.x + Math.cos(angle) * 18,
      y: player.y + Math.sin(angle) * 18,
      vx: Math.cos(angle) * 490,
      vy: Math.sin(angle) * 490,
      radius: 3,
      life: 1.4
    });
    fireCooldown = 0.18;
  }

  function updatePointerAim(event) {
    if (state !== STATES.PLAYING) return;
    const rect = canvas.getBoundingClientRect();
    pointerTarget = {
      x: ((event.clientX - rect.left) / rect.width) * world.width,
      y: ((event.clientY - rect.top) / rect.height) * world.height
    };
    player.angle = Math.atan2(pointerTarget.y - player.y, pointerTarget.x - player.x);
  }

  function startPointerFire(event) {
    if (state !== STATES.PLAYING || event.button !== 0) return;
    event.preventDefault();
    canvas.setPointerCapture?.(event.pointerId);
    updatePointerAim(event);
    pointerFiring = true;
    fireBullet();
  }

  function stopPointerFire(event) {
    if (event?.button !== undefined && event.button !== 0) return;
    pointerFiring = false;
  }

  function update(dt) {
    let dx = 0;
    let dy = 0;
    if (keys.has("arrowleft") || keys.has("a")) dx -= 1;
    if (keys.has("arrowright") || keys.has("d")) dx += 1;
    if (keys.has("arrowup") || keys.has("w")) dy -= 1;
    if (keys.has("arrowdown") || keys.has("s")) dy += 1;
    dx += joystickInput.x;
    dy += joystickInput.y;
    if (dx || dy) {
      const length = Math.hypot(dx, dy) || 1;
      dx /= length;
      dy /= length;
      player.x += dx * player.speed * dt;
      player.y += dy * player.speed * dt;
      player.angle = pointerTarget
        ? Math.atan2(pointerTarget.y - player.y, pointerTarget.x - player.x)
        : Math.atan2(dy, dx);
    }
    player.x = Math.max(player.radius, Math.min(world.width - player.radius, player.x));
    player.y = Math.max(player.radius, Math.min(world.height - player.radius, player.y));
    player.invulnerable = Math.max(0, player.invulnerable - dt);
    fireCooldown = Math.max(0, fireCooldown - dt);
    if (keys.has(" ") || pointerFiring || mobileFiring) fireBullet();

    spawnClock += dt;
    const spawnEvery = Math.max(0.42, 1.12 - score / 4000);
    while (spawnClock >= spawnEvery) {
      spawnClock -= spawnEvery;
      spawnEnemy();
    }

    bullets.forEach((bullet) => {
      bullet.x += bullet.vx * dt;
      bullet.y += bullet.vy * dt;
      bullet.life -= dt;
    });
    for (let i = bullets.length - 1; i >= 0; i -= 1) {
      const bullet = bullets[i];
      if (bullet.life <= 0 || bullet.x < -30 || bullet.x > world.width + 30 || bullet.y < -30 || bullet.y > world.height + 30) {
        bullets.splice(i, 1);
      }
    }

    enemies.forEach((enemy) => {
      const angle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
      enemy.x += Math.cos(angle) * enemy.speed * dt;
      enemy.y += Math.sin(angle) * enemy.speed * dt;
    });

    for (let enemyIndex = enemies.length - 1; enemyIndex >= 0; enemyIndex -= 1) {
      const enemy = enemies[enemyIndex];
      let destroyed = false;
      for (let bulletIndex = bullets.length - 1; bulletIndex >= 0; bulletIndex -= 1) {
        const bullet = bullets[bulletIndex];
        if (Math.hypot(enemy.x - bullet.x, enemy.y - bullet.y) <= enemy.radius + bullet.radius) {
          bullets.splice(bulletIndex, 1);
          enemies.splice(enemyIndex, 1);
          createBurst(enemy.x, enemy.y, "#7dff88");
          score += 100;
          updateHud();
          destroyed = true;
          break;
        }
      }
      if (destroyed) continue;
      if (Math.hypot(enemy.x - player.x, enemy.y - player.y) <= enemy.radius + player.radius && player.invulnerable <= 0) {
        enemies.splice(enemyIndex, 1);
        player.health -= 1;
        player.invulnerable = 1.1;
        createBurst(player.x, player.y, "#ff7373");
        updateHud();
        announce(`Armor ${player.health}. Score ${score}.`);
        if (player.health <= 0) {
          gameOver();
          return;
        }
      }
    }

    particles.forEach((particle) => {
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      particle.life -= dt;
    });
    for (let i = particles.length - 1; i >= 0; i -= 1) {
      if (particles[i].life <= 0) particles.splice(i, 1);
    }
  }

  function createBurst(x, y, color) {
    const count = Math.min(8, LIMITS.particles - particles.length);
    for (let i = 0; i < count; i += 1) {
      const angle = (Math.PI * 2 * i) / count;
      particles.push({ x, y, vx: Math.cos(angle) * 70, vy: Math.sin(angle) * 70, life: 0.45, color });
    }
  }

  function drawGrid() {
    ctx.strokeStyle = "rgba(97, 220, 255, 0.10)";
    ctx.lineWidth = 1;
    for (let x = 0; x <= world.width; x += 60) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, world.height); ctx.stroke();
    }
    for (let y = 0; y <= world.height; y += 60) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(world.width, y); ctx.stroke();
    }
    ctx.strokeStyle = "rgba(97, 220, 255, 0.18)";
    [90, 180, 270, 360].forEach((radius) => {
      ctx.beginPath(); ctx.arc(world.width / 2, world.height / 2, radius, 0, Math.PI * 2); ctx.stroke();
    });
    ctx.beginPath(); ctx.moveTo(world.width / 2, 0); ctx.lineTo(world.width / 2, world.height); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, world.height / 2); ctx.lineTo(world.width, world.height / 2); ctx.stroke();

    const sweep = (performance.now() / 2400) % (Math.PI * 2);
    const gradient = ctx.createLinearGradient(world.width / 2, world.height / 2, world.width / 2 + Math.cos(sweep) * 430, world.height / 2 + Math.sin(sweep) * 430);
    gradient.addColorStop(0, "rgba(97,220,255,.34)");
    gradient.addColorStop(1, "rgba(97,220,255,0)");
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(world.width / 2, world.height / 2);
    ctx.lineTo(world.width / 2 + Math.cos(sweep) * 520, world.height / 2 + Math.sin(sweep) * 520);
    ctx.stroke();
  }

  function drawCommandVehicle() {
    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.rotate(player.angle);
    ctx.fillStyle = "rgba(82, 230, 194, .18)";
    ctx.strokeStyle = "#8be3ff";
    ctx.lineWidth = 2.5;
    ctx.fillRect(-15, -12, 30, 24);
    ctx.strokeRect(-15, -12, 30, 24);
    ctx.fillStyle = "#061317";
    ctx.fillRect(-17, -14, 7, 28);
    ctx.fillRect(10, -14, 7, 28);
    ctx.strokeStyle = "rgba(82,230,194,.8)";
    ctx.beginPath(); ctx.arc(0, 0, 7, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(3, 0); ctx.lineTo(23, 0); ctx.stroke();
    ctx.fillStyle = "#52e6c2";
    ctx.fillRect(-3, -3, 6, 6);
    ctx.restore();
  }

  function drawHostile(enemy) {
    const angle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
    ctx.save();
    ctx.translate(enemy.x, enemy.y);
    ctx.rotate(angle);
    ctx.strokeStyle = "#ff738f";
    ctx.fillStyle = "rgba(255, 115, 143, .14)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(13, 0); ctx.lineTo(6, 10); ctx.lineTo(-11, 9); ctx.lineTo(-14, 0); ctx.lineTo(-11, -9); ctx.lineTo(6, -10); ctx.closePath();
    ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-4, 0); ctx.lineTo(15, 0); ctx.stroke();
    ctx.strokeStyle = "rgba(255,115,143,.45)";
    ctx.strokeRect(-18, -18, 36, 36);
    ctx.restore();
  }

  function draw() {
    if (!ctx) return;
    ctx.setTransform(world.scaleX, 0, 0, world.scaleY, 0, 0);
    ctx.clearRect(0, 0, world.width, world.height);
    ctx.fillStyle = "rgba(2, 12, 16, .72)";
    ctx.fillRect(0, 0, world.width, world.height);
    drawGrid();

    ctx.fillStyle = "#ffd36e";
    ctx.shadowColor = "rgba(255,211,110,.72)";
    ctx.shadowBlur = 10;
    bullets.forEach((bullet) => {
      ctx.beginPath(); ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2); ctx.fill();
    });
    ctx.shadowBlur = 0;
    enemies.forEach(drawHostile);

    particles.forEach((particle) => {
      ctx.globalAlpha = Math.max(0, particle.life / 0.45);
      ctx.fillStyle = particle.color;
      ctx.fillRect(particle.x - 2, particle.y - 2, 4, 4);
    });
    ctx.globalAlpha = 1;

    if (player.invulnerable <= 0 || Math.floor(player.invulnerable * 12) % 2 === 0) drawCommandVehicle();

    if (pointerTarget) {
      ctx.strokeStyle = "rgba(139,227,255,.55)";
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(pointerTarget.x, pointerTarget.y, 12, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(pointerTarget.x - 18, pointerTarget.y); ctx.lineTo(pointerTarget.x + 18, pointerTarget.y); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(pointerTarget.x, pointerTarget.y - 18); ctx.lineTo(pointerTarget.x, pointerTarget.y + 18); ctx.stroke();
    }

    ctx.fillStyle = "rgba(184,233,247,.72)";
    ctx.font = "12px Consolas, monospace";
    ctx.fillText("RADAR ONLINE // HOSTILE CONTACTS " + String(enemies.length).padStart(2, "0"), 18, 26);
  }
  function gameLoop(now) {
    if (state !== STATES.PLAYING) return;
    const dt = Math.min((now - lastFrame) / 1000, 0.05);
    lastFrame = now;
    update(dt);
    draw();
    if (state === STATES.PLAYING) rafId = requestAnimationFrame(gameLoop);
  }

  function handleKeyDown(event) {
    if (state === STATES.IDLE || state === STATES.TRANSITIONING_IN || state === STATES.TRANSITIONING_OUT) return;
    const key = event.key.toLowerCase();
    if (["arrowleft", "arrowright", "arrowup", "arrowdown", "w", "a", "s", "d", " ", "escape"].includes(key)) {
      event.preventDefault();
    }
    if (key === "escape") {
      exitGame();
      return;
    }
    if (state === STATES.PLAYING) keys.add(key);
    if (key === " " && state === STATES.PLAYING) fireBullet();
  }

  function handleKeyUp(event) {
    keys.delete(event.key.toLowerCase());
  }

  function handleVisibility() {
    if (document.hidden) pauseGame("Uplink paused while this page is hidden.");
  }

  function handleResize() {
    cancelAnimationFrame(resizeRaf);
    resizeRaf = requestAnimationFrame(resizeCanvas);
  }

  createInterface();
  window.addEventListener("keydown", handleKeyDown, { passive: false });
  window.addEventListener("keyup", handleKeyUp);
  window.addEventListener("blur", () => pauseGame("Uplink paused after focus moved away."));
  window.addEventListener("resize", handleResize);
  document.addEventListener("visibilitychange", handleVisibility);

  window.KRISPY_RADAR_GAME = Object.freeze({
    activate,
    exit: exitGame,
    pause: pauseGame,
    resume: resumeGame,
    restart: restartGame,
    getState: () => state,
    getPreviousState: () => previousState,
    getLastResult: () => lastResult,
    getSnapshot: () => Object.freeze({ state, score, health: player.health, enemies: enemies.length, bullets: bullets.length, gameVersion: GAME_VERSION })
  });
})();
