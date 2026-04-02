(function () {
  const sweepLayer = document.querySelector(".radar-sweep");
  const blipLayer = document.querySelector(".radar-blips");

  if (!sweepLayer || !blipLayer) return;

  const SWEEP_DURATION_MS = 4200;
  const BLIP_COUNT = 18;
  const TRIGGER_CHANCE = 0.72;

  const SWEEP_BRIGHT_CENTER_OFFSET_DEG = 165;
  const LEADING_WINDOW_DEG = 7;
  const TRAILING_WINDOW_DEG = 1;
  const REARM_GAP_DEG = 14;

  const blips = [];
  const startTime = performance.now();

  function normalizeAngle(deg) {
    return ((deg % 360) + 360) % 360;
  }

  function forwardDelta(fromDeg, toDeg) {
    return normalizeAngle(toDeg - fromDeg);
  }

  function getSweepAngle(now) {
    const elapsed = now - startTime;
    const progress = (elapsed % SWEEP_DURATION_MS) / SWEEP_DURATION_MS;
    return normalizeAngle((progress * 360) + SWEEP_BRIGHT_CENTER_OFFSET_DEG);
  }

  function setSweepRotation(sweepAngle) {
    sweepLayer.style.transform =
      `rotate(${sweepAngle - SWEEP_BRIGHT_CENTER_OFFSET_DEG}deg)`;
  }

  function viewportRadiusPx() {
    return Math.min(window.innerWidth, window.innerHeight) * 0.42;
  }

  function createBlip() {
    const el = document.createElement("div");
    el.className = "radar-blip";

    const radarRadius = viewportRadiusPx();
    const radius = Math.sqrt(Math.random()) * radarRadius;
    const theta = Math.random() * Math.PI * 2;

    const dx = Math.cos(theta) * radius;
    const dy = Math.sin(theta) * radius;

    el.style.left = `calc(50vw + ${dx}px)`;
    el.style.top = `calc(50vh + ${dy}px)`;

    blipLayer.appendChild(el);

    const angle = normalizeAngle((Math.atan2(dy, dx) * 180 / Math.PI) + 90);

    blips.push({
      el,
      angle,
      dx,
      dy,
      armed: true
    });
  }

  function activateBlip(blip) {
    blip.el.classList.remove("active");
    void blip.el.offsetWidth;
    blip.el.classList.add("active");
  }

  function positionBlips() {
    for (const blip of blips) {
      blip.el.style.left = `calc(50vw + ${blip.dx}px)`;
      blip.el.style.top = `calc(50vh + ${blip.dy}px)`;
    }
  }

  function tick(now) {
    const sweepAngle = getSweepAngle(now);
    setSweepRotation(sweepAngle);

    for (const blip of blips) {
      const ahead = forwardDelta(sweepAngle, blip.angle);

      const inTriggerBand =
        ahead <= LEADING_WINDOW_DEG ||
        ahead >= 360 - TRAILING_WINDOW_DEG;

      const farEnoughAway =
        ahead > REARM_GAP_DEG &&
        ahead < 360 - REARM_GAP_DEG;

      if (blip.armed && inTriggerBand) {
        if (Math.random() <= TRIGGER_CHANCE) {
          activateBlip(blip);
        }
        blip.armed = false;
      }

      if (!blip.armed && farEnoughAway) {
        blip.armed = true;
      }
    }

    requestAnimationFrame(tick);
  }

  for (let i = 0; i < BLIP_COUNT; i += 1) {
    createBlip();
  }

  window.addEventListener("resize", positionBlips);

  requestAnimationFrame(tick);
})();