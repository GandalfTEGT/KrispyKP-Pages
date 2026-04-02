(function () {
  const sweepLayer = document.querySelector(".radar-sweep");
  const blipLayer = document.querySelector(".radar-blips");

  if (!sweepLayer || !blipLayer) return;

  const SWEEP_DURATION_MS = 4200;
  const BLIP_COUNT = 18;
  const TRIGGER_CHANCE = 0.72;

  /*
    This is the angle of the BRIGHTEST PART of the sweep relative to the
    raw rotation. Tweak this for calibration.
  */
  const SWEEP_BRIGHT_CENTER_OFFSET_DEG = 154;

  const blips = [];
  const startTime = performance.now();

  function normalizeAngle(deg) {
    return ((deg % 360) + 360) % 360;
  }

  function shortestSignedAngle(from, to) {
    const a = normalizeAngle(from);
    const b = normalizeAngle(to);
    let diff = b - a;

    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;

    return diff;
  }

  function getSweepAngle(now) {
    const elapsed = now - startTime;
    const progress = (elapsed % SWEEP_DURATION_MS) / SWEEP_DURATION_MS;
    return normalizeAngle((progress * 360) + SWEEP_BRIGHT_CENTER_OFFSET_DEG);
  }

  function setSweepRotation(angle) {
    sweepLayer.style.transform = `rotate(${angle - SWEEP_BRIGHT_CENTER_OFFSET_DEG}deg)`;
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

    // 0deg = up, clockwise positive
    const angle = normalizeAngle((Math.atan2(dy, dx) * 180 / Math.PI) + 90);

    blips.push({
      el,
      angle,
      armed: true,
      lastDiff: null
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
      const diff = shortestSignedAngle(sweepAngle, blip.angle);

      if (blip.lastDiff !== null) {
        const crossed =
          (blip.lastDiff > 0 && diff <= 0) ||
          (blip.lastDiff < 0 && diff >= 0);

        if (blip.armed && crossed) {
          if (Math.random() <= TRIGGER_CHANCE) {
            activateBlip(blip);
          }
          blip.armed = false;
        }

        /*
          Rearm once the sweep has moved well away from the blip again.
          This prevents repeated firing while the sweep is near the same angle.
        */
        if (!blip.armed && Math.abs(diff) > 20) {
          blip.armed = true;
        }
      }

      blip.lastDiff = diff;
    }

    requestAnimationFrame(tick);
  }

  for (let i = 0; i < BLIP_COUNT; i += 1) {
    createBlip();
  }

  requestAnimationFrame(tick);
})();