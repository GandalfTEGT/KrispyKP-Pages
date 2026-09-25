(() => {
  "use strict";

  if (window.KRISPY_RADAR_GAME) return;

  const GAME_VERSION = "kkp-016-prototype-1";
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
  let nextEnemyId = 1;
  let rngState = 0x4b4b5001;
  const keys = new Set();
  const touchDirections = new Set();
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
    trigger.addEventListener("click", activate);

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
            <button type="button" data-game-action="exit">Exit radar</button>
          </div>
        </header>
        <div class="radar-game-hud" aria-label="Game status">
          <span>Score <strong data-game-score>000000</strong></span>
          <span>Armor <strong data-game-health>3</strong></span>
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
          <div class="radar-game-dpad">
            <button type="button" data-direction="up" aria-label="Move up">▲</button>
            <button type="button" data-direction="left" aria-label="Move left">◀</button>
            <button type="button" data-direction="down" aria-label="Move down">▼</button>
            <button type="button" data-direction="right" aria-label="Move right">▶</button>
          </div>
          <button type="button" class="radar-game-fire" data-game-action="fire">Fire</button>
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
    canvas.addEventListener("pointerdown", handleCanvasPointer);
    overlay.querySelectorAll("[data-direction]").forEach(bindDirectionButton);
    document.body.append(trigger, overlay);
  }

  function bindDirectionButton(button) {
    const direction = button.dataset.direction;
    const press = (event) => {
      event.preventDefault();
      if (state !== STATES.PLAYING) return;
      button.setPointerCapture?.(event.pointerId);
      touchDirections.add(direction);
    };
    const release = (event) => {
      event.preventDefault();
      touchDirections.delete(direction);
    };
    button.addEventListener("pointerdown", press);
    button.addEventListener("pointerup", release);
    button.addEventListener("pointercancel", release);
    button.addEventListener("lostpointercapture", release);
  }

  function handleOverlayClick(event) {
    const action = event.target.closest("[data-game-action]")?.dataset.gameAction;
    if (!action) return;
    if (action === "exit") exitGame();
    else if (action === "pause") togglePause();
    else if (action === "resume") resumeGame();
    else if (action === "restart") restartGame();
    else if (action === "fire") fireBullet();
  }

  function lockWebsite() {
    scrollY = window.scrollY;
    lastFocused = document.activeElement;
    trigger.disabled = true;
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
    document.body.classList.add("radar-game-active");
    document.querySelectorAll(".shell > header, .shell > main, .shell > footer").forEach((element) => {
      element.inert = true;
    });
  }

  function unlockWebsite() {
    document.querySelectorAll(".shell > header, .shell > main, .shell > footer").forEach((element) => {
      element.inert = false;
    });
    document.body.classList.remove("radar-game-active", "radar-game-visible");
    trigger.disabled = false;
    document.body.style.removeProperty("position");
    document.body.style.removeProperty("top");
    document.body.style.removeProperty("width");
    const restoreY = scrollY;
    window.scrollTo(0, restoreY);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => window.scrollTo(0, restoreY));
    });
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
    touchDirections.clear();
    setState(STATES.TRANSITIONING_OUT);
    document.body.classList.remove("radar-game-visible");
    window.setTimeout(() => {
      overlay.hidden = true;
      unlockWebsite();
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
    touchDirections.clear();
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
    enemies.push({ id: nextEnemyId++, x, y, radius: 11, speed: 52 + Math.min(score / 60, 58) });
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

  function handleCanvasPointer(event) {
    if (state !== STATES.PLAYING) return;
    const rect = canvas.getBoundingClientRect();
    pointerTarget = {
      x: ((event.clientX - rect.left) / rect.width) * world.width,
      y: ((event.clientY - rect.top) / rect.height) * world.height
    };
    fireBullet();
  }

  function update(dt) {
    let dx = 0;
    let dy = 0;
    if (keys.has("arrowleft") || keys.has("a") || touchDirections.has("left")) dx -= 1;
    if (keys.has("arrowright") || keys.has("d") || touchDirections.has("right")) dx += 1;
    if (keys.has("arrowup") || keys.has("w") || touchDirections.has("up")) dy -= 1;
    if (keys.has("arrowdown") || keys.has("s") || touchDirections.has("down")) dy += 1;
    if (dx || dy) {
      const length = Math.hypot(dx, dy) || 1;
      dx /= length;
      dy /= length;
      player.x += dx * player.speed * dt;
      player.y += dy * player.speed * dt;
      player.angle = Math.atan2(dy, dx);
      pointerTarget = null;
    }
    player.x = Math.max(player.radius, Math.min(world.width - player.radius, player.x));
    player.y = Math.max(player.radius, Math.min(world.height - player.radius, player.y));
    player.invulnerable = Math.max(0, player.invulnerable - dt);
    fireCooldown = Math.max(0, fireCooldown - dt);
    if (keys.has(" ")) fireBullet();

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
    ctx.strokeStyle = "rgba(79, 210, 255, 0.12)";
    ctx.lineWidth = 1;
    for (let x = 0; x <= world.width; x += 60) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, world.height); ctx.stroke();
    }
    for (let y = 0; y <= world.height; y += 60) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(world.width, y); ctx.stroke();
    }
    ctx.strokeStyle = "rgba(79, 210, 255, 0.2)";
    [90, 180].forEach((radius) => {
      ctx.beginPath(); ctx.arc(world.width / 2, world.height / 2, radius, 0, Math.PI * 2); ctx.stroke();
    });
    ctx.beginPath(); ctx.moveTo(world.width / 2, 0); ctx.lineTo(world.width / 2, world.height); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, world.height / 2); ctx.lineTo(world.width, world.height / 2); ctx.stroke();
  }

  function draw() {
    if (!ctx) return;
    ctx.setTransform(world.scaleX, 0, 0, world.scaleY, 0, 0);
    ctx.clearRect(0, 0, world.width, world.height);
    ctx.fillStyle = "#031016";
    ctx.fillRect(0, 0, world.width, world.height);
    drawGrid();

    ctx.fillStyle = "#ffd36e";
    bullets.forEach((bullet) => {
      ctx.beginPath(); ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2); ctx.fill();
    });

    enemies.forEach((enemy) => {
      ctx.save();
      ctx.translate(enemy.x, enemy.y);
      ctx.rotate(Math.atan2(player.y - enemy.y, player.x - enemy.x));
      ctx.strokeStyle = "#ff7373";
      ctx.fillStyle = "rgba(255, 115, 115, 0.18)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.rect(-enemy.radius, -enemy.radius, enemy.radius * 2, enemy.radius * 2);
      ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-6, 0); ctx.lineTo(7, 0); ctx.stroke();
      ctx.restore();
    });

    particles.forEach((particle) => {
      ctx.globalAlpha = Math.max(0, particle.life / 0.45);
      ctx.fillStyle = particle.color;
      ctx.fillRect(particle.x - 2, particle.y - 2, 4, 4);
    });
    ctx.globalAlpha = 1;

    if (player.invulnerable <= 0 || Math.floor(player.invulnerable * 12) % 2 === 0) {
      ctx.save();
      ctx.translate(player.x, player.y);
      ctx.rotate(player.angle);
      ctx.fillStyle = "rgba(139, 227, 255, 0.22)";
      ctx.strokeStyle = "#8be3ff";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(18, 0); ctx.lineTo(-12, -11); ctx.lineTo(-7, 0); ctx.lineTo(-12, 11); ctx.closePath();
      ctx.fill(); ctx.stroke();
      ctx.restore();
    }
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