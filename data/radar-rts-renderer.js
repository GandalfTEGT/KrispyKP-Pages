import { STRUCTURES, UNITS, WORLD, SUPERWEAPON } from "./radar-rts-definitions.js";

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

export class RadarRTSRenderer {
  constructor(canvas, minimap) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d", { alpha: false });
    this.minimap = minimap;
    this.mapCtx = minimap.getContext("2d");
    this.camera = { x: 0, y: 0, zoom: 1 };
    this.size = { width: 1, height: 1, dpr: 1 };
    this.resize();
  }

  resize() {
    const box = this.canvas.getBoundingClientRect();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    this.size = { width: Math.max(1, box.width), height: Math.max(1, box.height), dpr };
    this.canvas.width = Math.round(this.size.width * dpr);
    this.canvas.height = Math.round(this.size.height * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const mapBox = this.minimap.getBoundingClientRect();
    this.minimap.width = Math.max(1, Math.round(mapBox.width * dpr));
    this.minimap.height = Math.max(1, Math.round(mapBox.height * dpr));
    this.mapCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.clampCamera();
  }

  viewSize() {
    return { width: this.size.width / this.camera.zoom, height: this.size.height / this.camera.zoom };
  }

  clampCamera() {
    const view = this.viewSize();
    this.camera.x = clamp(this.camera.x, 0, Math.max(0, WORLD.width - view.width));
    this.camera.y = clamp(this.camera.y, 0, Math.max(0, WORLD.height - view.height));
  }

  centerOn(x, y) {
    const view = this.viewSize();
    this.camera.x = x - view.width / 2;
    this.camera.y = y - view.height / 2;
    this.clampCamera();
  }

  pan(dx, dy) {
    this.camera.x += dx / this.camera.zoom;
    this.camera.y += dy / this.camera.zoom;
    this.clampCamera();
  }

  screenToWorld(x, y) {
    return { x: this.camera.x + x / this.camera.zoom, y: this.camera.y + y / this.camera.zoom };
  }

  worldToScreen(x, y) {
    return { x: (x - this.camera.x) * this.camera.zoom, y: (y - this.camera.y) * this.camera.zoom };
  }

  entityAtScreen(snapshot, x, y) {
    const point = this.screenToWorld(x, y);
    return [...snapshot.units, ...snapshot.structures]
      .filter(entity => Math.hypot(entity.x - point.x, entity.y - point.y) <= entity.radius + 9)
      .sort((a, b) => Math.hypot(a.x - point.x, a.y - point.y) - Math.hypot(b.x - point.x, b.y - point.y))[0] || null;
  }

  drawGrid(ctx) {
    const view = this.viewSize();
    const startX = Math.floor(this.camera.x / WORLD.grid) * WORLD.grid;
    const startY = Math.floor(this.camera.y / WORLD.grid) * WORLD.grid;
    ctx.strokeStyle = "rgba(84, 210, 225, .055)";
    ctx.lineWidth = 1 / this.camera.zoom;
    ctx.beginPath();
    for (let x = startX; x <= this.camera.x + view.width; x += WORLD.grid) {
      ctx.moveTo(x, this.camera.y); ctx.lineTo(x, this.camera.y + view.height);
    }
    for (let y = startY; y <= this.camera.y + view.height; y += WORLD.grid) {
      ctx.moveTo(this.camera.x, y); ctx.lineTo(this.camera.x + view.width, y);
    }
    ctx.stroke();
  }

  drawResource(ctx, node) {
    if (node.amount <= 0) return;
    const strength = .25 + .75 * (node.amount / node.initialAmount);
    ctx.save();
    ctx.globalAlpha = strength;
    ctx.fillStyle = "#58eef0";
    for (let i = 0; i < 13; i += 1) {
      const angle = i * 2.4;
      const radius = (i % 4) * node.radius * .19;
      const x = node.x + Math.cos(angle) * radius;
      const y = node.y + Math.sin(angle) * radius;
      ctx.beginPath();
      ctx.moveTo(x, y - 11); ctx.lineTo(x + 7, y + 8); ctx.lineTo(x - 7, y + 8); ctx.closePath(); ctx.fill();
    }
    ctx.strokeStyle = "rgba(88,238,240,.45)";
    ctx.beginPath(); ctx.arc(node.x, node.y, node.radius * .72, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  }

  drawHealth(ctx, entity) {
    if (entity.health >= entity.maxHealth) return;
    const width = Math.max(28, entity.radius * 1.7);
    const x = entity.x - width / 2;
    const y = entity.y - entity.radius - 13;
    ctx.fillStyle = "rgba(0,0,0,.75)"; ctx.fillRect(x, y, width, 5);
    ctx.fillStyle = entity.health / entity.maxHealth > .35 ? "#7dff88" : "#ff667a";
    ctx.fillRect(x, y, width * Math.max(0, entity.health / entity.maxHealth), 5);
  }

  drawStructure(ctx, entity, selected) {
    const def = STRUCTURES[entity.type];
    ctx.save();
    ctx.translate(entity.x, entity.y);
    ctx.fillStyle = entity.side === "player" ? "#153d47" : "#491c29";
    ctx.strokeStyle = entity.side === "player" ? "#67e8ff" : "#ff6075";
    ctx.lineWidth = selected ? 4 : 2;
    ctx.beginPath();
    ctx.rect(-entity.radius * .84, -entity.radius * .72, entity.radius * 1.68, entity.radius * 1.44);
    ctx.fill(); ctx.stroke();
    ctx.strokeStyle = "rgba(230,250,255,.42)";
    ctx.beginPath(); ctx.moveTo(-entity.radius * .55, 0); ctx.lineTo(entity.radius * .55, 0); ctx.stroke();
    ctx.fillStyle = "#dff8ff"; ctx.font = `700 ${Math.max(10, entity.radius * .22)}px system-ui`;
    ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(def.short, 0, 0);
    ctx.restore();
    if (selected) {
      ctx.strokeStyle = "#fff49a"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(entity.x, entity.y, entity.radius + 9, 0, Math.PI * 2); ctx.stroke();
    }
    this.drawHealth(ctx, entity);
  }

  drawUnit(ctx, entity, selected) {
    const def = UNITS[entity.type];
    ctx.save();
    ctx.translate(entity.x, entity.y); ctx.rotate(entity.angle || 0);
    ctx.fillStyle = entity.side === "player" ? "#72e9ff" : "#ff667a";
    ctx.strokeStyle = "#071217"; ctx.lineWidth = 2;
    if (entity.type === "tank" || entity.type === "harvester") {
      ctx.fillRect(-entity.radius, -entity.radius * .65, entity.radius * 2, entity.radius * 1.3);
      ctx.strokeRect(-entity.radius, -entity.radius * .65, entity.radius * 2, entity.radius * 1.3);
      ctx.fillStyle = entity.side === "player" ? "#dffaff" : "#ffdbe1";
      ctx.fillRect(0, -3, entity.radius * 1.15, 6);
    } else {
      ctx.beginPath(); ctx.arc(0, 0, entity.radius, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(entity.radius * 1.5, 0); ctx.stroke();
    }
    ctx.restore();
    if (entity.type === "harvester" && entity.cargo > 0) {
      ctx.strokeStyle = "#fff071"; ctx.lineWidth = 3; ctx.beginPath();
      ctx.arc(entity.x, entity.y, entity.radius + 4, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (entity.cargo / def.cargoCapacity)); ctx.stroke();
    }
    if (selected) {
      ctx.strokeStyle = "#fff49a"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(entity.x, entity.y, entity.radius + 7, 0, Math.PI * 2); ctx.stroke();
    }
    this.drawHealth(ctx, entity);
  }

  render(snapshot, ui = {}) {
    const ctx = this.ctx;
    const { width, height } = this.size;
    ctx.setTransform(this.size.dpr, 0, 0, this.size.dpr, 0, 0);
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, "#06171a"); gradient.addColorStop(1, "#10141b");
    ctx.fillStyle = gradient; ctx.fillRect(0, 0, width, height);
    ctx.save();
    ctx.scale(this.camera.zoom, this.camera.zoom);
    ctx.translate(-this.camera.x, -this.camera.y);
    this.drawGrid(ctx);
    snapshot.resources.forEach(node => this.drawResource(ctx, node));
    const selected = new Set(snapshot.selectedIds);
    snapshot.structures.forEach(entity => this.drawStructure(ctx, entity, selected.has(entity.id)));
    snapshot.units.forEach(entity => this.drawUnit(ctx, entity, selected.has(entity.id)));
    snapshot.projectiles.forEach(projectile => {
      ctx.fillStyle = projectile.side === "player" ? "#fff49a" : "#ff8494";
      ctx.beginPath(); ctx.arc(projectile.x, projectile.y, 4, 0, Math.PI * 2); ctx.fill();
    });
    snapshot.effects.forEach(effect => {
      ctx.strokeStyle = effect.type === "ion" ? "rgba(125,240,255,.8)" : "rgba(255,221,120,.62)";
      ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(effect.x, effect.y, effect.radius * (1.2 - effect.life * .2), 0, Math.PI * 2); ctx.stroke();
    });
    if (ui.pointerWorld && snapshot.pendingPlacement.player) {
      const def = STRUCTURES[snapshot.pendingPlacement.player.type];
      const valid = ui.placement?.valid;
      ctx.fillStyle = valid ? "rgba(125,255,136,.2)" : "rgba(255,88,110,.2)";
      ctx.strokeStyle = valid ? "#7dff88" : "#ff586e";
      ctx.beginPath(); ctx.arc(ui.pointerWorld.x, ui.pointerWorld.y, def.radius, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    }
    if (ui.superTarget) {
      ctx.strokeStyle = "#fff171"; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(ui.superTarget.x, ui.superTarget.y, SUPERWEAPON.radius, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.restore();
    if (ui.dragBox) {
      ctx.fillStyle = "rgba(103,232,255,.12)"; ctx.strokeStyle = "#67e8ff"; ctx.lineWidth = 1;
      const x = Math.min(ui.dragBox.x1, ui.dragBox.x2), y = Math.min(ui.dragBox.y1, ui.dragBox.y2);
      ctx.fillRect(x, y, Math.abs(ui.dragBox.x2 - ui.dragBox.x1), Math.abs(ui.dragBox.y2 - ui.dragBox.y1));
      ctx.strokeRect(x, y, Math.abs(ui.dragBox.x2 - ui.dragBox.x1), Math.abs(ui.dragBox.y2 - ui.dragBox.y1));
    }
    this.renderMinimap(snapshot);
  }

  renderMinimap(snapshot) {
    const ctx = this.mapCtx;
    const box = this.minimap.getBoundingClientRect();
    const w = box.width, h = box.height;
    ctx.setTransform(this.size.dpr, 0, 0, this.size.dpr, 0, 0);
    ctx.fillStyle = "#031012"; ctx.fillRect(0, 0, w, h);
    const sx = w / WORLD.width, sy = h / WORLD.height;
    snapshot.resources.filter(node => node.amount > 0).forEach(node => {
      ctx.fillStyle = "rgba(88,238,240,.55)"; ctx.beginPath(); ctx.arc(node.x * sx, node.y * sy, 3, 0, Math.PI * 2); ctx.fill();
    });
    [...snapshot.structures, ...snapshot.units].forEach(entity => {
      ctx.fillStyle = entity.side === "player" ? "#7df0ff" : "#ff6075";
      const size = entity.kind === "structure" ? 4 : 2;
      ctx.fillRect(entity.x * sx - size / 2, entity.y * sy - size / 2, size, size);
    });
    const view = this.viewSize();
    ctx.strokeStyle = "#fff49a"; ctx.lineWidth = 1;
    ctx.strokeRect(this.camera.x * sx, this.camera.y * sy, view.width * sx, view.height * sy);
  }

  minimapToWorld(clientX, clientY) {
    const box = this.minimap.getBoundingClientRect();
    return { x: clamp((clientX - box.left) / box.width, 0, 1) * WORLD.width, y: clamp((clientY - box.top) / box.height, 0, 1) * WORLD.height };
  }
}
