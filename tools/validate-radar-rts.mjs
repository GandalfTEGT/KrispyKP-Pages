import assert from "node:assert/strict";
import { RadarRTSSimulation } from "../data/radar-rts-engine.js";
import { STRUCTURES, UNITS, SUPERWEAPON, WORLD } from "../data/radar-rts-definitions.js";

const checks = [];
const check = (name, condition, detail = "") => {
  assert.ok(condition, `${name}${detail ? `: ${detail}` : ""}`);
  checks.push(name);
};

function construct(sim, type, x, y) {
  const started = sim.startStructureBuild(type);
  check(`build:${type}:started`, started.available, started.reason);
  sim.advance(STRUCTURES[type].buildTime / (sim.power("player").low ? 0.35 : 1) + 0.3);
  check(`build:${type}:ready`, sim.pendingPlacement.player?.type === type);
  const placed = sim.placeStructure(x, y);
  check(`build:${type}:placed`, placed.placed, placed.reason);
  return placed.structure;
}

const sim = new RadarRTSSimulation({ scenario: "validation", seed: 42 });
let snap = sim.snapshot();
check("scenario:world-is-stable", snap.world.width === WORLD.width && snap.world.height === WORLD.height);
check("scenario:starts-with-command-hubs", snap.structures.filter(item => item.type === "hq").length === 2);
check("prerequisites:refinery-locked", !sim.availability("structure", "refinery").available);
check("placement:world-bounds-rejected", !sim.placementValidity("powerPlant", "player", -20, 800).valid);
check("placement:occupied-space-rejected", !sim.placementValidity("powerPlant", "player", 250, 800).valid);

const power = construct(sim, "powerPlant", 400, 640);
check("power:generated", sim.power("player").generated === STRUCTURES.hq.power + STRUCTURES.powerPlant.power);
const refinery = construct(sim, "refinery", 440, 960);
check("economy:refinery-includes-harvester", sim.aliveUnits("player", "harvester").length === 1);
const beforeHarvest = sim.credits.player;
const beforeResource = sim.resources.reduce((sum, item) => sum + item.amount, 0);
sim.advance(95);
check("economy:harvester-earns-credits", sim.credits.player > beforeHarvest, `${beforeHarvest} -> ${sim.credits.player}`);
check("economy:resource-visibly-depletes", sim.resources.reduce((sum, item) => sum + item.amount, 0) < beforeResource);

construct(sim, "barracks", 520, 720);
construct(sim, "warFactory", 200, 400);
construct(sim, "uplink", 80, 160);
const reservePower = construct(sim, "powerPlant", 760, 720);
check("tech:tank-unlocked", sim.availability("unit", "tank").available);
check("tech:rifle-unlocked", sim.availability("unit", "rifle").available);

const rifleCount = sim.aliveUnits("player", "rifle").length;
const tankCount = sim.aliveUnits("player", "tank").length;
check("production:rifle-queued", sim.queueUnit("rifle").available);
check("production:tank-queued", sim.queueUnit("tank").available);
sim.advance(1);
check("production:progress-exposed", sim.aliveStructures("player").some(item => item.queueProgress > 0));
sim.advance(Math.max(UNITS.rifle.buildTime, UNITS.tank.buildTime));
check("production:rifle-completed", sim.aliveUnits("player", "rifle").length > rifleCount);
check("production:tank-completed", sim.aliveUnits("player", "tank").length > tankCount);
const rocketCount = sim.aliveUnits("player", "rocket").length;
const scoutCount = sim.aliveUnits("player", "scout").length;
const creditsBeforeVariety = sim.credits.player;
check("variety:rocket-queued", sim.queueUnit("rocket").available);
check("variety:scout-queued", sim.queueUnit("scout").available);
check("variety:costs-enforced", sim.credits.player === creditsBeforeVariety - UNITS.rocket.cost - UNITS.scout.cost);
sim.advance(Math.max(UNITS.rocket.buildTime, UNITS.scout.buildTime) + 0.5);
check("variety:rocket-completed", sim.aliveUnits("player", "rocket").length > rocketCount);
check("variety:scout-completed", sim.aliveUnits("player", "scout").length > scoutCount);
check("variety:tactical-stats-differ", UNITS.rocket.weapon.range > UNITS.rifle.weapon.range && UNITS.scout.speed > UNITS.tank.speed && UNITS.scout.weapon.cooldown < UNITS.tank.weapon.cooldown);
check("variety:target-suitability-differs", UNITS.rocket.weapon.multipliers.tank > 1 && UNITS.scout.weapon.multipliers.tank < 1 && UNITS.scout.weapon.multipliers.rifle > 1);

const selectable = sim.aliveUnits("player").filter(item => item.type !== "harvester").slice(0, 3);
sim.selectBox(0, 0, 1000, 1200);
check("orders:multi-select", sim.selectedUnits().length >= selectable.length);
const oldPositions = sim.selectedUnits().map(item => ({ id: item.id, x: item.x, y: item.y }));
check("orders:move-issued", sim.issueMove(930, 800) > 0);
sim.advance(3);
check("orders:units-moved", oldPositions.some(old => { const current = sim.getEntity(old.id); return current && Math.hypot(current.x - old.x, current.y - old.y) > 20; }));

const target = sim.addUnit("rifle", "enemy", 980, 800);
sim.selectBox(700, 500, 1100, 1100);
check("combat:attack-issued", sim.issueAttack(target.id) > 0);
sim.advance(15);
check("combat:target-damaged-or-destroyed", !sim.getEntity(target.id) || sim.getEntity(target.id).health < target.maxHealth);

sim.advance(SUPERWEAPON.chargeTime + 1);
check("superweapon:charged", sim.superweapons.player.ready);
const enemyHq = sim.aliveStructures("enemy", "hq")[0];
const healthBeforeStorm = enemyHq.health;
const strike = sim.useSuperweapon(enemyHq.x, enemyHq.y);
check("superweapon:launches", strike.used);
check("superweapon:deals-area-damage", enemyHq.health < healthBeforeStorm);
check("superweapon:enters-recharge", !sim.superweapons.player.ready && sim.superweapons.player.launches === 1);

sim.applyDamage(power, power.health + 1, "enemy");
sim.applyDamage(reservePower, reservePower.health + 1, "enemy");
sim.applyDamage(refinery, refinery.health + 1, "enemy");
const playerPower = sim.power("player");
check("power:destruction-updates-grid", playerPower.generated === STRUCTURES.hq.power);
check("power:low-state", playerPower.low);
const chargeBefore = sim.superweapons.player.charge;
sim.advance(5);
check("power:low-pauses-superweapon", sim.superweapons.player.charge === chargeBefore);

sim.applyDamage(enemyHq, enemyHq.health + 1, "player");
snap = sim.snapshot();
check("outcome:victory", snap.status === "ended" && snap.outcome === "victory");
check("bounds:entity-caps", snap.units.filter(item => item.side === "player").length <= WORLD.maxUnitsPerSide && snap.structures.filter(item => item.side === "player").length <= WORLD.maxStructuresPerSide);
sim.destroy();
check("cleanup:destroyed", sim.status === "destroyed" && sim.units.length === 0 && sim.structures.length === 0);

const defeat = new RadarRTSSimulation({ scenario: "validation" });
const playerHq = defeat.aliveStructures("player", "hq")[0];
defeat.applyDamage(playerHq, playerHq.health + 1, "enemy");
check("outcome:defeat", defeat.snapshot().status === "ended" && defeat.snapshot().outcome === "defeat");
defeat.destroy();

const ai = new RadarRTSSimulation({ seed: 17 });
const enemyBefore = ai.aliveUnits("enemy").length;
ai.advance(10);
check("ai:uses-production-system", ai.aliveUnits("enemy").length > enemyBefore || ai.aliveStructures("enemy").some(item => item.queue.length));
ai.advance(10);
check("ai:launches-bounded-attack", ai.ai.wave > 0 && ai.aliveUnits("enemy").length <= WORLD.maxUnitsPerSide);
check("ai:target-search-bounded", ai.metrics.targetEvaluations < 5000, String(ai.metrics.targetEvaluations));
ai.destroy();

const targeting = new RadarRTSSimulation({ scenario: "validation", seed: 9 });
targeting.aliveUnits("player").forEach(unit => { unit.x = 80; unit.y = 80; });
const attacker = targeting.addUnit("tank", "enemy", 1100, 800);
const threat = targeting.addUnit("rocket", "player", 1040, 800);
const strategicHq = targeting.aliveStructures("player", "hq")[0];
attacker.order = { type: "attack", targetId: strategicHq.id };
attacker.targetId = strategicHq.id;
attacker.retargetClock = 0;
targeting.updateCombatUnit(attacker, 0.1);
check("ai:engages-nearby-player-unit", attacker.targetId === threat.id);
targeting.applyDamage(threat, threat.health + 1, "enemy");
attacker.retargetClock = 0;
targeting.updateCombatUnit(attacker, 0.1);
check("ai:dead-target-invalidated", attacker.targetId !== threat.id);
check("ai:resumes-strategic-structure-target", attacker.targetId === strategicHq.id);
targeting.destroy();

console.log(`RADAR RTS PASS — ${checks.length} deterministic checks`);
