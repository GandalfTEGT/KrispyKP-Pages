(function () {
  const sweepLayer = document.querySelector(".radar-sweep");
  const blipLayer = document.querySelector(".radar-blips");

  if (!sweepLayer || !blipLayer) return;

  const SWEEP_DURATION_MS = 4200;
  const BLIP_COUNT = 18;
  const TRIGGER_WINDOW_DEG = 9;
  const REARM_WINDOW_DEG = 18;
  const TRIGGER_CHANCE = 0.72;
  const SWEEP_HEAD_OFFSET_DEG = 154;

  const blips = [];
  const startTime = performance.now();

  function normalizeAngle(deg) {
    return ((deg % 360) + 360) % 360;
  }

  function angleDelta(a, b) {
    const diff = Math.abs(normalizeAngle(a) - normalizeAngle(b));
    return Math.min(diff, 360 - diff);
  }

  function getSweepAngle(now) {
    const elapsed = now - startTime;
    const progress = (elapsed % SWEEP_DURATION_MS) / SWEEP_DURATION_MS;
    return normalizeAngle((progress * 360) + SWEEP_HEAD_OFFSET_DEG);
  }

  function setSweepRotation(angle) {
    sweepLayer.style.transform = `rotate(${angle - SWEEP_HEAD_OFFSET_DEG}deg)`;
  }

  function createBlip() {
    const el = document.createElement("div");
    el.className = "radar-blip";

    const radius = Math.sqrt(Math.random()) * 42;
    const theta = Math.random() * Math.PI * 2;

    const x = 50 + Math.cos(theta) * radius;
    const y = 50 + Math.sin(theta) * radius;

    el.style.left = x + "%";
    el.style.top = y + "%";

    blipLayer.appendChild(el);

    const dx = x - 50;
    const dy = y - 50;

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

    setSweepRotation(sweepAngle);

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