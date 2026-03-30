(function () {
  const blipLayer = document.querySelector(".radar-blips");
  if (!blipLayer) return;

  const SWEEP_DURATION_MS = 4200;
  const BLIP_COUNT = 18;
  const TRIGGER_WINDOW_DEG = 9;
  const REARM_WINDOW_DEG = 18;
  const TRIGGER_CHANCE = 0.72;

  const blips = [];

  function normalizeAngle(deg) {
    return ((deg % 360) + 360) % 360;
  }

  function angleDelta(a, b) {
    const diff = Math.abs(normalizeAngle(a) - normalizeAngle(b));
    return Math.min(diff, 360 - diff);
  }

  function getSweepAngle(now) {
    const progress = (now % SWEEP_DURATION_MS) / SWEEP_DURATION_MS;

    // Matches the CSS conic-gradient sweep orientation:
    // visual bright head is effectively offset from the raw rotation
    return normalizeAngle((progress * 360) + 180);
  }

  function createBlip() {
    const el = document.createElement("div");
    el.className = "radar-blip";

    // Keep blips mostly inside the circular radar area
    const radius = Math.sqrt(Math.random()) * 42;
    const theta = Math.random() * Math.PI * 2;

    const x = 50 + Math.cos(theta) * radius;
    const y = 50 + Math.sin(theta) * radius;

    el.style.left = x + "%";
    el.style.top = y + "%";

    blipLayer.appendChild(el);

    const dx = x - 50;
    const dy = y - 50;

    // 0deg = up, increasing clockwise, aligned to CSS sweep logic
    const angle = normalizeAngle((Math.atan2(dy, dx) * 180 / Math.PI) + 90);

    blips.push({
      el,
      angle,
      armed: true
    });
  }

  function activateBlip(blip) {
    blip.el.classList.remove("active");
    void blip.el.offsetWidth;
    blip.el.classList.add("active");
  }

  function tick(now) {
    const sweepAngle = getSweepAngle(now);

    for (const blip of blips) {
      const delta = angleDelta(sweepAngle, blip.angle);

      if (blip.armed && delta <= TRIGGER_WINDOW_DEG) {
        if (Math.random() <= TRIGGER_CHANCE) {
          activateBlip(blip);
        }
        blip.armed = false;
      }

      if (!blip.armed && delta >= REARM_WINDOW_DEG) {
        blip.armed = true;
      }
    }

    requestAnimationFrame(tick);
  }

  for (let i = 0; i < BLIP_COUNT; i += 1) {
    createBlip();
  }

  requestAnimationFrame(tick);
})();