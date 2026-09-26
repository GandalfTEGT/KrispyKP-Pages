import assert from "node:assert/strict";
import { RadarRTSSimulation } from "../data/radar-rts-engine.js";
import { STRUCTURES, UNITS, SUPERWEAPON, WORLD, MAPS, DIFFICULTIES } from "../data/radar-rts-definitions.js";
import { RadarRTSAudio } from "../data/radar-rts-audio.js";

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
ai.advance(DIFFICULTIES.normal.firstAttack);
check("ai:launches-bounded-attack", ai.ai.wave > 0 && ai.aliveUnits("enemy").length <= WORLD.maxUnitsPerSide);
check("ai:target-search-bounded", ai.metrics.targetEvaluations < 25000, String(ai.metrics.targetEvaluations));
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

// Explicit orders must remain effective while enemies are actively in range.
const orders = new RadarRTSSimulation({ scenario: "validation" });
const soldier = orders.addUnit("tank", "player", 1100, 900);
const foe = orders.addUnit("bulwark", "enemy", 1240, 900);
orders.updateCombatUnit(soldier, .1);
check("orders:auto-engaged-before-retreat", soldier.targetId === foe.id && orders.projectiles.length > 0);
orders.selection.add(soldier.id);
orders.issueMove(850, 900);
for (let i = 0; i < 20; i++) orders.updateCombatUnit(soldier, .1);
check("orders:retreat-interrupts-fire", soldier.x < 1020 && soldier.targetId === null && soldier.order.type === "move");
const secondFoe = orders.addUnit("rifle", "enemy", 1020, 1120);
orders.issueAttack(secondFoe.id); orders.updateCombatUnit(soldier, .1);
check("orders:new-attack-overrides-old-combat", soldier.targetId === secondFoe.id && soldier.order.targetId === secondFoe.id);
orders.issueMove(750, 950); orders.updateCombatUnit(soldier, .1);
check("orders:second-retreat-not-reacquired", soldier.targetId === null && soldier.order.type === "move");
orders.destroy();

const queues = new RadarRTSSimulation({ scenario: "validation" });
queues.addStructure("powerPlant", "player", 600, 600);
queues.addStructure("refinery", "player", 700, 1000, { includedHarvester: false });
const infantry = queues.addStructure("barracks", "player", 400, 600);
const vehicles = queues.addStructure("warFactory", "player", 400, 1100);
queues.queueUnit("marksman"); queues.queueUnit("rocket"); queues.queueUnit("bulwark"); queues.queueUnit("scout");
queues.updateProduction(2);
check("queues:simultaneous-independent-progress", infantry.queue[0].progress === 2 && vehicles.queue[0].progress === 2);
queues.toggleProduction(infantry.id); queues.updateProduction(1);
check("queues:independent-pause", infantry.queue[0].progress === 2 && vehicles.queue[0].progress === 3);
const refundBefore = queues.credits.player;
queues.cancelUnit(infantry.id);
check("queues:cancel-refund-isolated", queues.credits.player === refundBefore + Math.floor(UNITS.marksman.cost * .75) && infantry.queue[0].type === "rocket" && vehicles.queue[0].progress === 3);
queues.toggleProduction(infantry.id);
queues.aliveStructures("player", "powerPlant")[0].dead = true;
queues.updateProduction(1);
check("queues:both-slow-under-low-power", Math.abs(infantry.queue[0].progress - .35) < .001 && Math.abs(vehicles.queue[0].progress - 3.35) < .001);
queues.addStructure("powerPlant", "player", 600, 600);
queues.updateProduction(20);
check("queues:both-complete", queues.aliveUnits("player", "rocket").length === 1 && queues.aliveUnits("player", "bulwark").length === 1);
check("units:new-roles-distinct", UNITS.marksman.weapon.range > UNITS.rocket.weapon.range && UNITS.bulwark.speed < UNITS.tank.speed && UNITS.rocket.weapon.multipliers.bulwark > 1);
queues.destroy();

for (const map of Object.values(MAPS)) {
 const mapped = new RadarRTSSimulation({ mapId: map.id, difficulty: "easy" });
 check(`maps:${map.id}:dimensions-starts`, mapped.world.width === map.width && mapped.aliveStructures("player", "hq")[0].x === map.playerStart.x && mapped.aliveStructures("enemy", "hq")[0].y === map.enemyStart.y);
 check(`maps:${map.id}:resources-bounded`, mapped.resources.every(r => r.amount > 0 && r.x-r.radius > 0 && r.y-r.radius > 0 && r.x+r.radius < map.width && r.y+r.radius < map.height));
 check(`maps:${map.id}:initial-entities-bounded`, [...mapped.structures,...mapped.units].every(e=>e.x>=e.radius && e.y>=e.radius && e.x+e.radius<=map.width && e.y+e.radius<=map.height));
 check(`maps:${map.id}:initial-structures-clear`, mapped.structures.every(a=>mapped.structures.every(b=>a===b || Math.hypot(a.x-b.x,a.y-b.y)>=a.radius+b.radius+12)));
 const obstacle = map.obstacles[0];
 check(`maps:${map.id}:terrain-rejects-building`, !mapped.placementValidity("powerPlant","player",obstacle.x,obstacle.y).valid);
 const traveler = mapped.addUnit("scout","player",obstacle.x-obstacle.radius-130,obstacle.y);
 const destination = {x:obstacle.x+obstacle.radius+130,y:obstacle.y};
 let penetration=false;
 for(let i=0;i<250;i++){mapped.moveToward(traveler,destination,.1); if(Math.hypot(traveler.x-obstacle.x,traveler.y-obstacle.y)<obstacle.radius+traveler.radius) penetration=true;}
 check(`maps:${map.id}:terrain-detour`, !penetration && Math.hypot(traveler.x-destination.x,traveler.y-destination.y)<10);
 const ranged = mapped.addUnit("tank","player",obstacle.x-obstacle.radius-130,obstacle.y);
 let arrived=false;for(let i=0;i<400&&!arrived;i++)arrived=mapped.moveToward(ranged,destination,.1,90);
 check(`maps:${map.id}:ranged-route-reaches-real-target`, arrived && Math.hypot(ranged.x-destination.x,ranged.y-destination.y)<=91);
 mapped.selection.add(traveler.id);mapped.issueMove(obstacle.x,obstacle.y);
 check(`maps:${map.id}:terrain-click-uses-clear-ground`, Math.hypot(traveler.order.x-obstacle.x,traveler.order.y-obstacle.y)>obstacle.radius+traveler.radius);
 mapped.destroy();
}
check("maps:meaningfully-different", MAPS.crystalReach.width !== MAPS.splitBasin.width && MAPS.splitBasin.playerStart.y > MAPS.splitBasin.enemyStart.y);

for (const difficulty of Object.values(DIFFICULTIES)) {
 const mission = new RadarRTSSimulation({ difficulty: difficulty.id, seed: 17 });
 mission.aliveStructures("player","hq")[0].health = 1000000; // Isolate rebuilding from an undefended HQ loss.
 check(`difficulty:${difficulty.id}:no-health-cheat`, mission.aliveUnits("enemy", "tank")[0].health === UNITS.tank.health);
 const reactor = mission.aliveStructures("enemy", "powerPlant")[0];
 mission.applyDamage(reactor, reactor.health+1, "player");
 const funds = mission.credits.enemy;
 mission.updateAI(difficulty.decision+.1);
 check(`ai:${difficulty.id}:paid-rebuild`, mission.construction.enemy?.type === "powerPlant" && mission.credits.enemy <= funds - STRUCTURES.powerPlant.cost && !mission.aliveStructures("enemy","powerPlant").length);
 mission.advance(30);
 check(`ai:${difficulty.id}:reactor-replaced`, mission.aliveStructures("enemy","powerPlant").length > 0 && mission.metrics.aiBuildsPlaced > 0);
 const refinery = mission.aliveStructures("enemy","refinery")[0]; mission.applyDamage(refinery,refinery.health+1,"player");
 mission.credits.enemy = 5000; mission.advance(45);
 check(`ai:${difficulty.id}:economy-rebuilt`, mission.aliveStructures("enemy","refinery").length > 0);
 const factory = mission.aliveStructures("enemy","warFactory")[0]; mission.applyDamage(factory,factory.health+1,"player");
 mission.credits.enemy = 5000; mission.advance(50);
 check(`ai:${difficulty.id}:production-rebuilt`, mission.aliveStructures("enemy","warFactory").length > 0);
 check(`ai:${difficulty.id}:bounded-placement`, mission.metrics.aiPlacementAttempts <= Math.ceil(mission.time/2+1)*24);
 mission.destroy();
}
check("difficulty:pressure-varies", DIFFICULTIES.easy.firstAttack > DIFFICULTIES.normal.firstAttack && DIFFICULTIES.normal.firstAttack > DIFFICULTIES.hard.firstAttack && DIFFICULTIES.easy.waveSize < DIFFICULTIES.hard.waveSize);
const poor = new RadarRTSSimulation(); poor.credits.enemy = 0; poor.aliveStructures("enemy","powerPlant")[0].dead=true; poor.updateAI(20);
check("ai:no-free-rebuild", poor.construction.enemy === null); poor.destroy();

for (const mapId of Object.keys(MAPS)) for (const difficulty of Object.keys(DIFFICULTIES)) {
  const endurance = new RadarRTSSimulation({ mapId, difficulty, seed: 123 });
  endurance.aliveStructures("player","hq")[0].health = 1000000; // Keep a target alive to exercise sustained load.
  endurance.advance(360, .2);
  const state = endurance.snapshot();
  check(`endurance:${mapId}:${difficulty}:bounded`, state.units.length <= WORLD.maxUnitsPerSide*2 && state.projectiles.length<=WORLD.maxProjectiles && state.effects.length<=WORLD.maxEffects && state.soundEvents.length<=32 && state.credits.enemy>=0);
  check(`endurance:${mapId}:${difficulty}:world-valid`, state.time>=359 && state.units.every(unit=>Number.isFinite(unit.x)&&Number.isFinite(unit.y)&&unit.x>=0&&unit.y>=0&&unit.x<=state.world.width&&unit.y<=state.world.height));
  endurance.destroy();
}
const replayA = new RadarRTSSimulation({mapId:"splitBasin",difficulty:"hard",seed:54});
const replayB = new RadarRTSSimulation({mapId:"splitBasin",difficulty:"hard",seed:54});
replayA.advance(80);replayB.advance(80);
check("difficulty-and-map:seeded-replay", JSON.stringify(replayA.snapshot())===JSON.stringify(replayB.snapshot()));
replayA.destroy();replayB.destroy();

// Audio lifecycle and voice limits use a fake audio device, never play during validation.
let closed = false;
const param = () => ({setValueAtTime(){},exponentialRampToValueAtTime(){}});
const device = { state:"running",currentTime:0,destination:{},resume(){},suspend(){this.state="suspended";},close(){closed=true;},createOscillator(){return {frequency:param(),connect(){},disconnect(){},start(){},stop(){}};},createGain(){return {gain:param(),connect(){},disconnect(){}};} };
const sfx = new RadarRTSAudio({muted:false,contextFactory:()=>device});
check("audio:construction-dormant", sfx.snapshot().contextState === "none"); sfx.start();
for(let i=0;i<12;i++){device.currentTime+=.2;sfx.play("fire");}
check("audio:voices-capped", sfx.voices.size === 6); sfx.setMuted(true);
check("audio:mute-clears-and-suppresses", sfx.voices.size===0 && sfx.play("ready")===false);
sfx.destroy(); check("audio:exit-closes-device", closed && sfx.snapshot().contextState === "none");

console.log(`RADAR RTS PASS — ${checks.length} deterministic checks`);
