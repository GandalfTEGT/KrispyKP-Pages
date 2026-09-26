import {
  RADAR_RTS_VERSION,
  WORLD,
  STRUCTURES,
  UNITS,
  RESOURCE_FIELDS,
  SUPERWEAPON,
  SIDES,
  definitionFor
} from "./radar-rts-definitions.js";

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const sqDistance = (a, b) => (a.x - b.x) ** 2 + (a.y - b.y) ** 2;

function seeded(seed) {
  let state = seed >>> 0 || 1;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

function opposing(side) {
  return side === SIDES.PLAYER ? SIDES.ENEMY : SIDES.PLAYER;
}

export class RadarRTSSimulation {
  constructor({ seed = 0x4b4b5018, scenario = "standard" } = {}) {
    this.version = RADAR_RTS_VERSION;
    this.world = { ...WORLD };
    this.random = seeded(seed);
    this.scenario = scenario;
    this.time = 0;
    this.nextId = 1;
    this.status = "playing";
    this.outcome = null;
    this.credits = scenario === "validation" ? { player: 20000, enemy: 20000 } : { player: 4200, enemy: 5200 };
    this.structures = [];
    this.units = [];
    this.resources = RESOURCE_FIELDS.map((field, index) => ({
      id: `resource-${index + 1}`,
      ...field,
      initialAmount: field.amount
    }));
    this.projectiles = [];
    this.effects = [];
    this.selection = new Set();
    this.construction = { player: null, enemy: null };
    this.pendingPlacement = { player: null, enemy: null };
    this.superweapons = {
      player: { charge: 0, ready: false, launches: 0 },
      enemy: { charge: 0, ready: false, launches: 0 }
    };
    this.ai = { decisionClock: 4, attackClock: 12, wave: 0 };
    this.events = [];
    this.initializeScenario();
  }

  id(prefix) {
    return `${prefix}-${this.nextId++}`;
  }

  initializeScenario() {
    this.addStructure("hq", SIDES.PLAYER, 250, 800);
    this.addUnit("rifle", SIDES.PLAYER, 370, 750);
    this.addUnit("rifle", SIDES.PLAYER, 370, 850);

    if (this.scenario === "validation") {
      this.addStructure("hq", SIDES.ENEMY, 2150, 800);
      this.emit("Deterministic validation scenario online.");
      return;
    }

    this.addStructure("hq", SIDES.ENEMY, 2150, 800);
    this.addStructure("powerPlant", SIDES.ENEMY, 2020, 620);
    const refinery = this.addStructure("refinery", SIDES.ENEMY, 2030, 1030, { includedHarvester: false });
    this.addStructure("barracks", SIDES.ENEMY, 2210, 610);
    this.addStructure("warFactory", SIDES.ENEMY, 2190, 1030);
    this.addStructure("turret", SIDES.ENEMY, 1900, 800);
    this.addUnit("harvester", SIDES.ENEMY, refinery.x - 100, refinery.y + 15);
    this.addUnit("rifle", SIDES.ENEMY, 1870, 690);
    this.addUnit("rifle", SIDES.ENEMY, 1870, 910);
    this.addUnit("tank", SIDES.ENEMY, 1810, 800);
    this.emit("Mission online. Establish power and a harvesting economy.");
  }

  emit(message, kind = "info") {
    this.events.push({ id: this.id("event"), time: this.time, message, kind });
    if (this.events.length > 24) this.events.splice(0, this.events.length - 24);
  }

  addStructure(type, side, x, y, options = {}) {
    const definition = STRUCTURES[type];
    if (!definition) return null;
    if (this.structures.filter(item => item.side === side && !item.dead).length >= WORLD.maxStructuresPerSide) return null;
    const structure = {
      id: this.id("structure"), kind: "structure", type, side, x, y,
      health: definition.health, maxHealth: definition.health, radius: definition.radius,
      cooldown: 0, queue: [], queueProgress: 0, dead: false
    };
    this.structures.push(structure);
    if (type === "refinery" && options.includedHarvester !== false) {
      this.addUnit("harvester", side, x + (side === SIDES.PLAYER ? 105 : -105), y);
    }
    return structure;
  }

  addUnit(type, side, x, y) {
    const definition = UNITS[type];
    if (!definition) return null;
    if (this.units.filter(item => item.side === side && !item.dead).length >= WORLD.maxUnitsPerSide) return null;
    const unit = {
      id: this.id("unit"), kind: "unit", type, side, x, y,
      health: definition.health, maxHealth: definition.health, radius: definition.radius,
      angle: side === SIDES.PLAYER ? 0 : Math.PI,
      order: null, targetId: null, cooldown: 0, dead: false,
      cargo: 0, harvestState: type === "harvester" ? "seeking" : null,
      resourceId: null, refineryId: null
    };
    this.units.push(unit);
    return unit;
  }

  getEntity(id) {
    return this.units.find(item => item.id === id && !item.dead) ||
      this.structures.find(item => item.id === id && !item.dead) || null;
  }

  aliveStructures(side, type = null) {
    return this.structures.filter(item => !item.dead && item.side === side && (!type || item.type === type));
  }

  aliveUnits(side, type = null) {
    return this.units.filter(item => !item.dead && item.side === side && (!type || item.type === type));
  }

  hasPrerequisites(side, prerequisites = []) {
    return prerequisites.every(type => this.aliveStructures(side, type).length > 0);
  }

  power(side) {
    const alive = this.aliveStructures(side);
    const generated = alive.reduce((sum, item) => sum + (STRUCTURES[item.type].power || 0), 0);
    const used = alive.reduce((sum, item) => sum + (STRUCTURES[item.type].powerUse || 0), 0);
    return { generated, used, available: generated - used, low: used > generated };
  }

  availability(kind, type, side = SIDES.PLAYER) {
    const definition = definitionFor(kind, type);
    if (!definition) return { available: false, reason: "Unknown option" };
    if (!this.hasPrerequisites(side, definition.prerequisites)) {
      const missing = definition.prerequisites.find(item => !this.aliveStructures(side, item).length);
      return { available: false, reason: `Requires ${STRUCTURES[missing]?.name || missing}` };
    }
    if (this.credits[side] < definition.cost) return { available: false, reason: `Need ${definition.cost - this.credits[side]} credits` };
    if (kind === "structure" && (this.construction[side] || this.pendingPlacement[side])) {
      return { available: false, reason: this.pendingPlacement[side] ? "Place current structure" : "Construction queue occupied" };
    }
    if (kind === "unit") {
      const producer = this.aliveStructures(side, definition.producer).find(item => item.queue.length < 5);
      if (!producer) return { available: false, reason: `No available ${STRUCTURES[definition.producer]?.name || "producer"}` };
    }
    return { available: true, reason: "Ready" };
  }

  startStructureBuild(type, side = SIDES.PLAYER) {
    const check = this.availability("structure", type, side);
    if (!check.available) return check;
    const definition = STRUCTURES[type];
    this.credits[side] -= definition.cost;
    this.construction[side] = { type, progress: 0, duration: definition.buildTime, cost: definition.cost };
    if (side === SIDES.PLAYER) this.emit(`${definition.name} construction started.`);
    return { available: true, reason: "Construction started" };
  }

  cancelConstruction(side = SIDES.PLAYER) {
    const job = this.construction[side] || this.pendingPlacement[side];
    if (!job) return false;
    const refund = Math.floor(job.cost * 0.75);
    this.credits[side] += refund;
    this.construction[side] = null;
    this.pendingPlacement[side] = null;
    if (side === SIDES.PLAYER) this.emit(`Construction cancelled. ${refund} credits refunded.`);
    return true;
  }

  placementValidity(type, side, x, y) {
    const definition = STRUCTURES[type];
    if (!definition) return { valid: false, reason: "Unknown structure" };
    const margin = definition.radius + 12;
    if (x < margin || y < margin || x > WORLD.width - margin || y > WORLD.height - margin) {
      return { valid: false, reason: "Outside battlefield" };
    }
    const anchors = this.aliveStructures(side);
    if (!anchors.some(anchor => distance(anchor, { x, y }) <= 350 + anchor.radius)) {
      return { valid: false, reason: "Outside base control radius" };
    }
    const occupied = [...this.structures, ...this.units].some(entity => !entity.dead && distance(entity, { x, y }) < entity.radius + definition.radius + 12);
    if (occupied) return { valid: false, reason: "Placement obstructed" };
    const resourceOverlap = this.resources.some(node => node.amount > 0 && distance(node, { x, y }) < node.radius * 0.72 + definition.radius);
    if (resourceOverlap) return { valid: false, reason: "Resource field obstructs placement" };
    return { valid: true, reason: "Valid placement" };
  }

  placeStructure(x, y, side = SIDES.PLAYER) {
    const pending = this.pendingPlacement[side];
    if (!pending) return { placed: false, reason: "No structure ready" };
    const snapped = { x: Math.round(x / WORLD.grid) * WORLD.grid, y: Math.round(y / WORLD.grid) * WORLD.grid };
    const check = this.placementValidity(pending.type, side, snapped.x, snapped.y);
    if (!check.valid) return { placed: false, reason: check.reason };
    const structure = this.addStructure(pending.type, side, snapped.x, snapped.y);
    this.pendingPlacement[side] = null;
    if (side === SIDES.PLAYER) this.emit(`${STRUCTURES[pending.type].name} deployed.`);
    return { placed: true, reason: "Placed", structure };
  }

  queueUnit(type, side = SIDES.PLAYER) {
    const check = this.availability("unit", type, side);
    if (!check.available) return check;
    const definition = UNITS[type];
    const producer = this.aliveStructures(side, definition.producer).sort((a, b) => a.queue.length - b.queue.length)[0];
    this.credits[side] -= definition.cost;
    producer.queue.push({ type, progress: 0, duration: definition.buildTime, cost: definition.cost });
    if (side === SIDES.PLAYER) this.emit(`${definition.name} added to production.`);
    return { available: true, reason: "Queued", producerId: producer.id };
  }

  cancelUnit(producerId, index = 0, side = SIDES.PLAYER) {
    const producer = this.getEntity(producerId);
    if (!producer || producer.kind !== "structure" || producer.side !== side || !producer.queue[index]) return false;
    const [job] = producer.queue.splice(index, 1);
    this.credits[side] += Math.floor(job.cost * 0.75);
    if (index === 0) producer.queueProgress = 0;
    return true;
  }

  selectAt(x, y, { append = false, side = SIDES.PLAYER } = {}) {
    const candidates = [...this.units, ...this.structures]
      .filter(item => !item.dead && item.side === side && sqDistance(item, { x, y }) <= (item.radius + 12) ** 2)
      .sort((a, b) => sqDistance(a, { x, y }) - sqDistance(b, { x, y }));
    if (!append) this.selection.clear();
    const entity = candidates[0];
    if (entity) {
      if (append && this.selection.has(entity.id)) this.selection.delete(entity.id);
      else this.selection.add(entity.id);
    }
    return entity || null;
  }

  selectBox(x1, y1, x2, y2, { append = false, side = SIDES.PLAYER } = {}) {
    if (!append) this.selection.clear();
    const minX = Math.min(x1, x2), maxX = Math.max(x1, x2);
    const minY = Math.min(y1, y2), maxY = Math.max(y1, y2);
    this.aliveUnits(side).forEach(unit => {
      if (unit.x >= minX && unit.x <= maxX && unit.y >= minY && unit.y <= maxY) this.selection.add(unit.id);
    });
    return this.selection.size;
  }

  clearSelection() {
    this.selection.clear();
  }

  selectedUnits(side = SIDES.PLAYER) {
    return this.aliveUnits(side).filter(unit => this.selection.has(unit.id));
  }

  issueMove(x, y, side = SIDES.PLAYER) {
    const selected = this.selectedUnits(side);
    const columns = Math.max(1, Math.ceil(Math.sqrt(selected.length)));
    selected.forEach((unit, index) => {
      const row = Math.floor(index / columns);
      const column = index % columns;
      const spacing = Math.max(34, unit.radius * 2.5);
      const offsetX = (column - (columns - 1) / 2) * spacing;
      const rows = Math.ceil(selected.length / columns);
      const offsetY = (row - (rows - 1) / 2) * spacing;
      unit.order = {
        type: "move",
        x: clamp(x + offsetX, unit.radius, WORLD.width - unit.radius),
        y: clamp(y + offsetY, unit.radius, WORLD.height - unit.radius)
      };
      unit.targetId = null;
    });
    if (selected.length) this.emit(`${selected.length} unit${selected.length === 1 ? "" : "s"} moving.`);
    return selected.length;
  }

  issueAttack(targetId, side = SIDES.PLAYER) {
    const target = this.getEntity(targetId);
    if (!target || target.side === side) return 0;
    const selected = this.selectedUnits(side).filter(unit => UNITS[unit.type].weapon);
    selected.forEach(unit => {
      unit.order = { type: "attack", targetId };
      unit.targetId = targetId;
    });
    if (selected.length) this.emit(`Attack order confirmed: ${definitionFor(target.kind, target.type).name}.`, "alert");
    return selected.length;
  }

  entityAt(x, y, side = null) {
    return [...this.units, ...this.structures]
      .filter(item => !item.dead && (!side || item.side === side) && sqDistance(item, { x, y }) <= (item.radius + 10) ** 2)
      .sort((a, b) => sqDistance(a, { x, y }) - sqDistance(b, { x, y }))[0] || null;
  }

  useSuperweapon(x, y, side = SIDES.PLAYER) {
    const weapon = this.superweapons[side];
    if (!weapon.ready || !this.aliveStructures(side, SUPERWEAPON.prerequisite).length || this.power(side).low) {
      return { used: false, reason: this.power(side).low ? "Low power" : "Ion Storm not ready" };
    }
    const targetSide = opposing(side);
    [...this.aliveUnits(targetSide), ...this.aliveStructures(targetSide)].forEach(entity => {
      const falloff = clamp(1 - distance(entity, { x, y }) / SUPERWEAPON.radius, 0, 1);
      if (falloff > 0) this.applyDamage(entity, SUPERWEAPON.damage * (0.35 + falloff * 0.65), side);
    });
    this.addEffect("ion", x, y, 1.35, SUPERWEAPON.radius);
    weapon.charge = 0;
    weapon.ready = false;
    weapon.launches += 1;
    this.emit("ION STORM DEPLOYED.", "success");
    return { used: true, reason: "Ion Storm deployed" };
  }

  addEffect(type, x, y, life = 0.5, radius = 24) {
    if (this.effects.length >= WORLD.maxEffects) this.effects.shift();
    this.effects.push({ id: this.id("effect"), type, x, y, life, maxLife: life, radius });
  }

  fire(attacker, target, weapon) {
    if (this.projectiles.length >= WORLD.maxProjectiles) return;
    const angle = Math.atan2(target.y - attacker.y, target.x - attacker.x);
    this.projectiles.push({
      id: this.id("projectile"), side: attacker.side, sourceId: attacker.id, targetId: target.id,
      x: attacker.x, y: attacker.y, vx: Math.cos(angle) * weapon.projectileSpeed,
      vy: Math.sin(angle) * weapon.projectileSpeed, damage: weapon.damage,
      life: Math.max(0.4, weapon.range / weapon.projectileSpeed + 0.5)
    });
    attacker.cooldown = weapon.cooldown;
  }

  applyDamage(entity, amount, sourceSide) {
    if (!entity || entity.dead) return;
    entity.health -= amount;
    this.addEffect("hit", entity.x, entity.y, 0.24, Math.min(30, entity.radius));
    if (entity.health > 0) return;
    entity.dead = true;
    entity.health = 0;
    this.selection.delete(entity.id);
    this.addEffect("destroy", entity.x, entity.y, 0.9, entity.radius * 1.7);
    if (entity.kind === "structure") {
      entity.queue.forEach(job => { this.credits[entity.side] += Math.floor(job.cost * 0.5); });
      entity.queue.length = 0;
      if (entity.type === "hq") {
        this.outcome = sourceSide === SIDES.PLAYER ? "victory" : "defeat";
        this.status = "ended";
        this.emit(this.outcome === "victory" ? "Enemy Command Hub destroyed. Victory." : "Command Hub destroyed. Defeat.", this.outcome);
      } else if (entity.side === SIDES.PLAYER) {
        this.emit(`${STRUCTURES[entity.type].name} destroyed.`, "alert");
      }
    }
  }

  nearestResource(unit) {
    return this.resources.filter(node => node.amount > 1).sort((a, b) => sqDistance(unit, a) - sqDistance(unit, b))[0] || null;
  }

  nearestRefinery(unit) {
    return this.aliveStructures(unit.side, "refinery").sort((a, b) => sqDistance(unit, a) - sqDistance(unit, b))[0] || null;
  }

  obstacleVector(unit, destination) {
    let steerX = 0, steerY = 0;
    const obstacles = this.structures.filter(item => !item.dead && item.id !== destination?.id);
    obstacles.forEach(obstacle => {
      const dx = unit.x - obstacle.x, dy = unit.y - obstacle.y;
      const d = Math.hypot(dx, dy) || 1;
      const safe = unit.radius + obstacle.radius + 18;
      if (d < safe * 1.45) {
        const force = (safe * 1.45 - d) / (safe * 1.45);
        steerX += (dx / d) * force * 1.8;
        steerY += (dy / d) * force * 1.8;
      }
    });
    return { x: steerX, y: steerY };
  }

  moveToward(unit, destination, dt, stopRange = 4) {
    const definition = UNITS[unit.type];
    const dx = destination.x - unit.x, dy = destination.y - unit.y;
    const d = Math.hypot(dx, dy);
    if (d <= stopRange) return true;
    const avoid = this.obstacleVector(unit, destination);
    let vx = dx / d + avoid.x, vy = dy / d + avoid.y;
    const mag = Math.hypot(vx, vy) || 1;
    vx /= mag; vy /= mag;
    const step = Math.min(d - stopRange, definition.speed * dt);
    unit.x = clamp(unit.x + vx * step, unit.radius, WORLD.width - unit.radius);
    unit.y = clamp(unit.y + vy * step, unit.radius, WORLD.height - unit.radius);
    unit.angle = Math.atan2(vy, vx);
    return d - step <= stopRange + 0.5;
  }

  updateHarvester(unit, dt) {
    const definition = UNITS.harvester;
    if (unit.order?.type === "move") {
      if (this.moveToward(unit, unit.order, dt, 5)) unit.order = null;
      return;
    }
    if (unit.cargo >= definition.cargoCapacity - 0.5 && !["returning", "unloading"].includes(unit.harvestState)) {
      unit.harvestState = "returning";
    }
    if (unit.harvestState === "seeking" || unit.harvestState === "idle") {
      const resource = this.nearestResource(unit);
      if (!resource) { unit.harvestState = "depleted"; return; }
      unit.resourceId = resource.id;
      unit.harvestState = "to-resource";
    }
    if (unit.harvestState === "to-resource") {
      const resource = this.resources.find(item => item.id === unit.resourceId && item.amount > 0) || this.nearestResource(unit);
      if (!resource) { unit.harvestState = "depleted"; return; }
      unit.resourceId = resource.id;
      if (this.moveToward(unit, resource, dt, resource.radius * 0.48)) unit.harvestState = "harvesting";
      return;
    }
    if (unit.harvestState === "harvesting") {
      const resource = this.resources.find(item => item.id === unit.resourceId && item.amount > 0);
      if (!resource) { unit.harvestState = "seeking"; return; }
      const amount = Math.min(resource.amount, definition.harvestRate * dt, definition.cargoCapacity - unit.cargo);
      resource.amount -= amount;
      unit.cargo += amount;
      if (unit.cargo >= definition.cargoCapacity - 0.5 || resource.amount <= 0.5) unit.harvestState = "returning";
      return;
    }
    if (unit.harvestState === "returning") {
      const refinery = this.nearestRefinery(unit);
      if (!refinery) { unit.harvestState = "no-refinery"; return; }
      unit.refineryId = refinery.id;
      if (this.moveToward(unit, refinery, dt, refinery.radius + unit.radius + 4)) unit.harvestState = "unloading";
      return;
    }
    if (unit.harvestState === "no-refinery") {
      if (this.nearestRefinery(unit)) unit.harvestState = "returning";
      return;
    }
    if (unit.harvestState === "unloading") {
      const refinery = this.getEntity(unit.refineryId);
      if (!refinery) { unit.harvestState = "no-refinery"; return; }
      const amount = Math.min(unit.cargo, definition.unloadRate * dt);
      unit.cargo -= amount;
      this.credits[unit.side] += amount;
      if (unit.cargo <= 0.5) {
        unit.cargo = 0;
        unit.harvestState = "seeking";
        if (unit.side === SIDES.PLAYER) this.emit("Harvester delivery received.", "success");
      }
    }
  }

  acquireTarget(unit) {
    const weapon = UNITS[unit.type].weapon;
    if (!weapon) return null;
    const enemies = [...this.aliveUnits(opposing(unit.side)), ...this.aliveStructures(opposing(unit.side))];
    return enemies.filter(item => distance(unit, item) <= weapon.range + 90)
      .sort((a, b) => sqDistance(unit, a) - sqDistance(unit, b))[0] || null;
  }

  updateCombatUnit(unit, dt) {
    const definition = UNITS[unit.type];
    const weapon = definition.weapon;
    if (!weapon) return;
    let target = unit.targetId ? this.getEntity(unit.targetId) : null;
    if (!target || target.side === unit.side) {
      target = this.acquireTarget(unit);
      unit.targetId = target?.id || null;
      if (unit.order?.type === "attack" && !target) unit.order = null;
    }
    if (target) {
      const range = weapon.range + target.radius;
      if (distance(unit, target) > range) {
        this.moveToward(unit, target, dt, Math.max(8, range * 0.82));
      } else if (unit.cooldown <= 0) {
        this.fire(unit, target, weapon);
      }
      return;
    }
    if (unit.order?.type === "move" && this.moveToward(unit, unit.order, dt, 5)) unit.order = null;
  }

  updateUnits(dt) {
    this.units.forEach(unit => {
      if (unit.dead) return;
      unit.cooldown = Math.max(0, unit.cooldown - dt);
      if (unit.type === "harvester") this.updateHarvester(unit, dt);
      else this.updateCombatUnit(unit, dt);
    });

    const alive = this.units.filter(unit => !unit.dead);
    for (let i = 0; i < alive.length; i += 1) {
      for (let j = i + 1; j < alive.length; j += 1) {
        const a = alive[i], b = alive[j];
        const dx = b.x - a.x, dy = b.y - a.y;
        const d = Math.hypot(dx, dy) || 1;
        const min = a.radius + b.radius + 3;
        if (d < min) {
          const push = (min - d) * 0.22;
          a.x = clamp(a.x - dx / d * push, a.radius, WORLD.width - a.radius);
          a.y = clamp(a.y - dy / d * push, a.radius, WORLD.height - a.radius);
          b.x = clamp(b.x + dx / d * push, b.radius, WORLD.width - b.radius);
          b.y = clamp(b.y + dy / d * push, b.radius, WORLD.height - b.radius);
        }
      }
    }
  }

  updateStructures(dt) {
    this.structures.forEach(structure => {
      if (structure.dead) return;
      structure.cooldown = Math.max(0, structure.cooldown - dt);
      if (structure.type === "turret" && !this.power(structure.side).low) {
        const weapon = STRUCTURES.turret.weapon;
        const target = [...this.aliveUnits(opposing(structure.side)), ...this.aliveStructures(opposing(structure.side))]
          .filter(item => distance(structure, item) <= weapon.range + item.radius)
          .sort((a, b) => sqDistance(structure, a) - sqDistance(structure, b))[0];
        if (target && structure.cooldown <= 0) this.fire(structure, target, weapon);
      }
    });
  }

  updateConstruction(dt) {
    [SIDES.PLAYER, SIDES.ENEMY].forEach(side => {
      const job = this.construction[side];
      if (!job) return;
      const speed = this.power(side).low ? 0.35 : 1;
      job.progress += dt * speed;
      if (job.progress >= job.duration) {
        this.construction[side] = null;
        this.pendingPlacement[side] = job;
        if (side === SIDES.PLAYER) this.emit(`${STRUCTURES[job.type].name} ready for placement.`, "success");
      }
    });
  }

  updateProduction(dt) {
    this.structures.forEach(producer => {
      if (producer.dead || !producer.queue.length) return;
      const job = producer.queue[0];
      const speed = this.power(producer.side).low ? 0.35 : 1;
      job.progress += dt * speed;
      producer.queueProgress = clamp(job.progress / job.duration, 0, 1);
      if (job.progress < job.duration) return;
      const angle = producer.side === SIDES.PLAYER ? 0 : Math.PI;
      const spawnDistance = producer.radius + UNITS[job.type].radius + 28;
      const unit = this.addUnit(job.type, producer.side,
        clamp(producer.x + Math.cos(angle) * spawnDistance, 20, WORLD.width - 20),
        clamp(producer.y + Math.sin(angle) * spawnDistance, 20, WORLD.height - 20));
      producer.queue.shift();
      producer.queueProgress = 0;
      if (!unit) this.credits[producer.side] += job.cost;
      else if (producer.side === SIDES.PLAYER) this.emit(`${UNITS[job.type].name} ready.`, "success");
    });
  }

  updateProjectiles(dt) {
    this.projectiles.forEach(projectile => {
      projectile.life -= dt;
      const target = this.getEntity(projectile.targetId);
      if (target) {
        const angle = Math.atan2(target.y - projectile.y, target.x - projectile.x);
        const speed = Math.hypot(projectile.vx, projectile.vy);
        projectile.vx = Math.cos(angle) * speed;
        projectile.vy = Math.sin(angle) * speed;
      }
      projectile.x += projectile.vx * dt;
      projectile.y += projectile.vy * dt;
      if (target && distance(projectile, target) <= target.radius + 8) {
        this.applyDamage(target, projectile.damage, projectile.side);
        projectile.life = 0;
      }
    });
    this.projectiles = this.projectiles.filter(item => item.life > 0 && item.x >= 0 && item.y >= 0 && item.x <= WORLD.width && item.y <= WORLD.height);
  }

  updateSuperweapons(dt) {
    [SIDES.PLAYER, SIDES.ENEMY].forEach(side => {
      const weapon = this.superweapons[side];
      if (weapon.ready) return;
      if (!this.aliveStructures(side, SUPERWEAPON.prerequisite).length || this.power(side).low) return;
      const duration = weapon.launches ? SUPERWEAPON.rechargeTime : SUPERWEAPON.chargeTime;
      weapon.charge = clamp(weapon.charge + dt / duration, 0, 1);
      if (weapon.charge >= 1) {
        weapon.ready = true;
        if (side === SIDES.PLAYER) this.emit("Ion Storm ready. Select a world target.", "success");
      }
    });
  }

  updateEffects(dt) {
    this.effects.forEach(effect => { effect.life -= dt; });
    this.effects = this.effects.filter(effect => effect.life > 0).slice(-WORLD.maxEffects);
  }

  updateAI(dt) {
    if (this.status !== "playing" || this.scenario === "validation") return;
    this.ai.decisionClock -= dt;
    this.ai.attackClock -= dt;
    if (this.ai.decisionClock <= 0) {
      this.ai.decisionClock = 5 + this.random() * 3;
      const enemyPower = this.power(SIDES.ENEMY);
      if (enemyPower.low && this.availability("structure", "powerPlant", SIDES.ENEMY).available) {
        this.startStructureBuild("powerPlant", SIDES.ENEMY);
      }
      const choices = this.aliveStructures(SIDES.ENEMY, "warFactory").length ? ["tank", "rifle", "rifle"] : ["rifle"];
      const type = choices[Math.floor(this.random() * choices.length)];
      this.queueUnit(type, SIDES.ENEMY);
    }
    const pending = this.pendingPlacement.enemy;
    if (pending) {
      const hq = this.aliveStructures(SIDES.ENEMY, "hq")[0];
      for (let attempt = 0; attempt < 16; attempt += 1) {
        const angle = this.random() * Math.PI * 2;
        const radius = 170 + this.random() * 150;
        const result = this.placeStructure(hq.x + Math.cos(angle) * radius, hq.y + Math.sin(angle) * radius, SIDES.ENEMY);
        if (result.placed) break;
      }
    }
    if (this.ai.attackClock <= 0) {
      this.ai.attackClock = 17 + this.random() * 7;
      this.ai.wave += 1;
      const target = this.aliveStructures(SIDES.PLAYER, "hq")[0];
      const attackers = this.aliveUnits(SIDES.ENEMY).filter(unit => unit.type !== "harvester").slice(0, 10);
      attackers.forEach((unit, index) => {
        unit.order = { type: "attack", targetId: target?.id };
        unit.targetId = target?.id || null;
        if (!target) unit.order = { type: "move", x: 260, y: 700 + index * 30 };
      });
    }
  }

  update(dt) {
    if (this.status !== "playing") return;
    const step = clamp(Number(dt) || 0, 0, 0.25);
    if (!step) return;
    this.time += step;
    this.updateConstruction(step);
    this.updateProduction(step);
    this.updateUnits(step);
    this.updateStructures(step);
    this.updateProjectiles(step);
    this.updateSuperweapons(step);
    this.updateEffects(step);
    this.updateAI(step);
    this.units = this.units.filter(item => !item.dead);
    this.structures = this.structures.filter(item => !item.dead);
  }

  advance(seconds, step = 0.1) {
    const target = this.time + Math.max(0, seconds);
    while (this.time < target && this.status === "playing") this.update(Math.min(step, target - this.time));
    return this.snapshot();
  }

  snapshot() {
    const power = { player: this.power(SIDES.PLAYER), enemy: this.power(SIDES.ENEMY) };
    return {
      version: this.version,
      time: this.time,
      status: this.status,
      outcome: this.outcome,
      world: { width: WORLD.width, height: WORLD.height },
      credits: { player: Math.floor(this.credits.player), enemy: Math.floor(this.credits.enemy) },
      power,
      selectedIds: [...this.selection],
      construction: {
        player: this.construction.player ? { ...this.construction.player } : null,
        enemy: this.construction.enemy ? { ...this.construction.enemy } : null
      },
      pendingPlacement: {
        player: this.pendingPlacement.player ? { ...this.pendingPlacement.player } : null,
        enemy: this.pendingPlacement.enemy ? { ...this.pendingPlacement.enemy } : null
      },
      superweapons: {
        player: { ...this.superweapons.player }, enemy: { ...this.superweapons.enemy }
      },
      structures: this.structures.filter(item => !item.dead).map(item => ({
        ...item, queue: item.queue.map(job => ({ ...job }))
      })),
      units: this.units.filter(item => !item.dead).map(item => ({ ...item, order: item.order ? { ...item.order } : null })),
      resources: this.resources.map(item => ({ ...item })),
      projectiles: this.projectiles.map(item => ({ ...item })),
      effects: this.effects.map(item => ({ ...item })),
      events: this.events.slice(-8).map(item => ({ ...item }))
    };
  }

  destroy() {
    this.status = "destroyed";
    this.selection.clear();
    this.projectiles.length = 0;
    this.effects.length = 0;
    this.units.length = 0;
    this.structures.length = 0;
    this.events.length = 0;
  }
}

export function createRadarRTSSimulation(options) {
  return new RadarRTSSimulation(options);
}
