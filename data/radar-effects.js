(function () {
  const sweepLayer = document.querySelector(".radar-sweep");
  const blipLayer = document.querySelector(".radar-blips");

  if (!sweepLayer || !blipLayer) return;

  const SWEEP_DURATION_MS = 4200;
  const BLIP_COUNT = 18;
  const TRIGGER_CHANCE = 0.72;

  /*
    Calibration:
    This is the angle of the brightest visible part of the sweep
    relative to the raw rotation angle.
  */
  const SWEEP_BRIGHT_CENTER_OFFSET_DEG = 154;

  /*
    Detection band around the bright center.
    Because the sweep is visually wide, a slightly asymmetric band
    usually feels better than a perfectly symmetric one.
  */
  const LEADING_WINDOW_DEG = 6;
  const TRAILING_WINDOW_DEG = 3;
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

    // 0deg = up, increasing clockwise
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
      // How far ahead the blip is in the sweep's direction of travel
      const ahead = forwardDelta(sweepAngle, blip.angle);

      // Trigger when the blip lies just ahead of the bright center,
      // or just behind it after the center has passed.
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

  requestAnimationFrame(tick);
})();