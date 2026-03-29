(function () {
  const blipLayer = document.querySelector(".radar-blips");
  if (!blipLayer) return;

  const SWEEP_DURATION_MS = 4200;
  const BLIP_COUNT = 18;
  const SWEEP_HEAD_START_ANGLE = 350;
  const TRIGGER_CHANCE = 0.78;

  const blips = [];
  let cycleTimer = null;

  function normalizeAngle(deg) {
    return ((deg % 360) + 360) % 360;
  }

  function buildBlip() {
    const el = document.createElement("div");
    el.className = "radar-blip";

    const radius = Math.sqrt(Math.random()) * 42;
    const angle = Math.random() * Math.PI * 2;

    const x = 50 + Math.cos(angle) * radius;
    const y = 50 + Math.sin(angle) * radius;

    el.style.left = x + "%";
    el.style.top = y + "%";
    blipLayer.appendChild(el);

    const dx = x - 50;
    const dy = y - 50;

    const radarAngle = normalizeAngle((Math.atan2(dy, dx) * 180 / Math.PI) + 90);

    blips.push({
      el,
      angle: radarAngle
    });
  }

  function triggerBlip(blip) {
    blip.el.classList.remove("active");
    requestAnimationFrame(() => {
      blip.el.classList.add("active");
    });
  }

  function scheduleSweepCycle() {
    blips.forEach((blip) => {
      if (Math.random() > TRIGGER_CHANCE) return;

      const relativeAngle = normalizeAngle(blip.angle - SWEEP_HEAD_START_ANGLE);
      const delay = (relativeAngle / 360) * SWEEP_DURATION_MS;

      setTimeout(() => {
        triggerBlip(blip);
      }, delay);
    });

    cycleTimer = setTimeout(scheduleSweepCycle, SWEEP_DURATION_MS);
  }

  for (let i = 0; i < BLIP_COUNT; i += 1) {
    buildBlip();
  }

  scheduleSweepCycle();

  window.addEventListener("beforeunload", () => {
    if (cycleTimer) clearTimeout(cycleTimer);
  });
})();