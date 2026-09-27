import assert from "node:assert/strict";
import { RadarRTSSimulation } from "../data/radar-rts-engine.js";
import { STRUCTURES, UNITS, SUPERWEAPON, WORLD, MAPS, DIFFICULTIES } from "../data/radar-rts-definitions.js";
import { RadarRTSAudio } from "../data/radar-rts-audio.js";
import { FACTIONS, ECONOMY, TERRAIN_TYPES, entityVisual } from "../data/radar-rts-definitions.js";
import { RadarRTSVoice } from "../data/radar-rts-voice.js";
import { hotkeyCommand, edgeVelocity, DEFAULT_BINDINGS, bindKey, readSettings, saveSettings, normaliseSettings, groupCommand, ControlGroups } from "../data/radar-rts-input.js";

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

const queueClicks = new RadarRTSSimulation({ scenario: "validation" });
queueClicks.addStructure("powerPlant", "player", 600, 600); const clickBarracks = queueClicks.addStructure("barracks", "player", 400, 600); const otherBarracks = queueClicks.addStructure("barracks", "player", 800, 600);
queueClicks.queueUnit("rifle", "player", clickBarracks.id); queueClicks.toggleProduction(clickBarracks.id); queueClicks.queueUnit("rifle", "player", clickBarracks.id);
check("queues:left-add-resumes", clickBarracks.queue.length === 2 && clickBarracks.productionPaused === false);
check("queues:selected-producer-targeted", otherBarracks.queue.length === 0);
queueClicks.toggleProduction(clickBarracks.id); queueClicks.cancelUnit(clickBarracks.id); queueClicks.cancelUnit(clickBarracks.id);
check("queues:repeated-cancel-clears-and-resets", clickBarracks.queue.length === 0 && clickBarracks.productionPaused === false);
queueClicks.destroy();

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

// 1.3 economy transfers integer crystal units, preserving the fractional time accumulator only.
for (const dt of [1/60, .017, .1, .25]) {
  const bank = new RadarRTSSimulation({scenario:"validation"});
  const plant=bank.addStructure("refinery","player",700,900,{includedHarvester:false});
  const truck=bank.addUnit("harvester","player",800,900);
  const resource=bank.resources[0]; const initial=resource.amount;
  truck.resourceId=resource.id;truck.harvestState="harvesting";
  while(truck.harvestState==="harvesting")bank.updateHarvester(truck,dt);
  check(`integer:${dt}:full-load-exact`,truck.cargo===500&&resource.amount===initial-500);
  truck.refineryId=plant.id;truck.harvestState="unloading";const credits=bank.credits.player;
  let integers=true;while(truck.harvestState==="unloading"){bank.updateHarvester(truck,dt);integers&&=Number.isInteger(bank.credits.player)&&Number.isInteger(truck.cargo);}
  check(`integer:${dt}:delivery-exact`,integers&&bank.credits.player===credits+500&&bank.snapshot().credits.player===bank.credits.player);
  bank.addStructure("powerPlant","player",1000,900);bank.addStructure("barracks","player",1200,900);
  const before=bank.credits.player;bank.queueUnit("rifle");bank.cancelUnit(bank.aliveStructures("player","barracks")[0].id);
  check(`integer:${dt}:refund-exact`,bank.credits.player===before-120+90);
  bank.destroy();
}
const ownership=new RadarRTSSimulation({scenario:"validation",factionId:"obsidian"});
check("ownership:faction-independent",Object.keys(FACTIONS).length>=2&&ownership.controllers.commander.factionId==="obsidian"&&ownership.controllers.rival.factionId==="aurora");
check("ownership:all-entities-explicit",[...ownership.units,...ownership.structures].every(e=>e.controllerId&&e.factionId&&e.teamId));
const owned=ownership.aliveUnits("player")[0],foreign=ownership.addUnit("rifle","enemy",900,900);
check("commands:reject-foreign-control",!ownership.dispatch({controllerId:"commander",type:"move",entityIds:[foreign.id],args:{x:100,y:100}}).accepted&&foreign.order===null);
check("commands:reject-unknown-controller",!ownership.dispatch({controllerId:"unknown",type:"move",entityIds:[owned.id],args:{x:100,y:100}}).accepted);
check("commands:reject-nonfinite",!ownership.dispatch({controllerId:"commander",type:"move",entityIds:[owned.id],args:{x:NaN,y:100}}).accepted);
check("commands:owned-unit-moves",ownership.dispatch({controllerId:"commander",type:"move",entityIds:[owned.id],args:{x:100,y:100}}).accepted&&owned.order.x===100);
ownership.dispatch({controllerId:"commander",type:"stop",entityIds:[owned.id]});check("commands:stop-clears-order",owned.order===null);
const repair=ownership.addStructure("powerPlant","player",600,600);repair.health-=100;
ownership.credits.player=50;ownership.toggleRepair(repair.id);ownership.updateStructures(1);
check("repair:paid-over-time",repair.health===repair.maxHealth-80&&ownership.credits.player===40&&repair.repairing);
ownership.toggleRepair(repair.id);const health=repair.health;ownership.updateStructures(1);check("repair:cancel",repair.health===health);
ownership.credits.player=1;ownership.toggleRepair(repair.id);ownership.updateStructures(1);
check("repair:empty-wallet-stops",ownership.credits.player===0&&!repair.repairing&&repair.health===health+2);
ownership.credits.player=100;ownership.toggleRepair(repair.id);ownership.updateStructures(10);
check("repair:full-stops-no-overcharge",repair.health===repair.maxHealth&&!repair.repairing&&Number.isInteger(ownership.credits.player));
const enemyBuilding=ownership.aliveStructures("enemy","hq")[0];enemyBuilding.health-=50;
check("repair:reject-enemy",!ownership.toggleRepair(enemyBuilding.id));
const producer=ownership.addStructure("barracks","player",900,600);ownership.credits.player=500;ownership.queueUnit("rifle");const beforeSell=ownership.credits.player;
check("sell:paid-defined-refund",ownership.sellStructure(producer.id)&&ownership.credits.player===beforeSell+Math.floor(500*ECONOMY.sellRefund)+90);
check("sell:prerequisite-immediate",!ownership.availability("unit","rifle").available&&producer.queue.length===0);
const powerBefore=ownership.power("player").generated;ownership.sellStructure(repair.id);
check("sell:power-immediate",ownership.power("player").generated===powerBefore-110);
check("sell:enemy-and-hq-protected",!ownership.sellStructure(enemyBuilding.id)&&!ownership.sellStructure(ownership.aliveStructures("player","hq")[0].id));
const uplink=ownership.addStructure("uplink","player",900,1000);ownership.superweapons.player.ready=true;ownership.superweapons.player.charge=1;ownership.sellStructure(uplink.id);
check("sell:superweapon-invalidated",!ownership.superweapons.player.ready&&ownership.superweapons.player.charge===0);
check("sell:collision-removed",!ownership.aliveStructures("player").includes(uplink));ownership.destroy();
for(const mapId of Object.keys(MAPS))for(const difficulty of ["normal","hard"]){
 const mission=new RadarRTSSimulation({mapId,difficulty,seed:75});
 mission.advance(8);
 const site=mission.construction.enemy;
 check(`ai-visible:${mapId}:${difficulty}:site-progress`,Boolean(site?.site)&&site.progress>0&&site.progress<site.duration);
 check(`terrain:${mapId}:${difficulty}:separate-passability`,mission.terrain.every(t=>TERRAIN_TYPES[t.type]&&typeof t.passable==="boolean"&&Number.isInteger(t.variant))&&mission.terrain.some(t=>t.passable)&&mission.obstacles.every(t=>!t.passable));
 mission.advance(140);
 check(`ai-expand:${mapId}:${difficulty}:paid-refineries`,mission.aliveStructures("enemy","refinery").length>=2&&mission.metrics.aiBuildsStarted>=2&&Number.isInteger(mission.credits.enemy));
 check(`ai-expand:${mapId}:${difficulty}:harvesters`,mission.aliveUnits("enemy","harvester").length>=2&&mission.aliveUnits("enemy","harvester").length<=4);
 check(`ai-activity:${mapId}:${difficulty}:outside-base`,mission.aliveUnits("enemy").some(u=>u.type!=="harvester"&&u.activity&&Math.hypot(u.x-mission.map.enemyStart.x,u.y-mission.map.enemyStart.y)>400));
 mission.destroy();
}
check("input:edge-diagonal-bounded",Math.hypot(...Object.values(edgeVelocity({x:0,y:0},1000,800)))<=1.001);
check("input:outside-stops",edgeVelocity({x:1001,y:0},1000,800).x===0);
check("input:typing-not-hotkey",hotkeyCommand({key:"r",target:{tagName:"INPUT"}})===null);
check("input:central-repair-hotkey",hotkeyCommand({key:"r"})==="repair");
let speechTime=0,cancellations=0;const spoken=[];
const synth={getVoices:()=>[{lang:"en-GB",localService:true}],speak:s=>spoken.push(s),cancel:()=>cancellations++};
const voice=new RadarRTSVoice({enabled:true,synth,utterance:text=>({text}),now:()=>speechTime});
check("voice:local-starter",voice.play("select")&&spoken.length===1);
check("voice:chatter-bounded",!voice.play("order")&&spoken.length===1);
check("voice:urgent-priority",voice.play("baseAttack")&&cancellations===1&&spoken.length===2);
voice.pause();check("voice:pause-cleans",!voice.active&&!voice.play("victory"));voice.resume();speechTime=16000;
voice.play("ready");voice.setEnabled(false);check("voice:mute-cleans",!voice.active&&!voice.play("order"));voice.destroy();
check("voice:destroy-cleans",!voice.snapshot().speaking&&!voice.enabled);
const remoteVoice=new RadarRTSVoice({enabled:true,synth:{...synth,getVoices:()=>[{lang:"en-US",localService:false}]},utterance:text=>({text})});
check("voice:never-remote",!remoteVoice.play("select"));remoteVoice.destroy();


// 1.4 command semantics, bounded personnel and persisted control model.
{
const tactical = new RadarRTSSimulation({scenario:"validation",seed:71});
const soldier=tactical.aliveUnits("player")[0]; soldier.x=600;soldier.y=700;
const foe=tactical.addUnit("rifle","enemy",740,700);
const order=(type,args={})=>tactical.dispatch({controllerId:"commander",type,args,entityIds:[soldier.id]});
check("orders:attack-move-owned",order("attack-move",{x:1000,y:700}).accepted);
tactical.updateCombatUnit(soldier,.1);check("orders:attack-move-engages",soldier.targetId===foe.id&&soldier.order.type==="attack-move");
tactical.applyDamage(foe,10000,"player");const ax=soldier.x;tactical.updateCombatUnit(soldier,.2);
check("orders:attack-move-resumes",soldier.x>ax&&soldier.order.type==="attack-move");
order("guard",{x:600,y:700});const threat=tactical.addUnit("rifle","enemy",700,700);tactical.updateCombatUnit(soldier,.1);
check("orders:guard-defends",soldier.targetId===threat.id);
soldier.x=1000;soldier.y=700;tactical.updateCombatUnit(soldier,.2);check("orders:guard-leash",soldier.x<1000&&soldier.targetId===null);
order("scatter");check("orders:scatter-spreads",soldier.order.type==="move"&&Math.hypot(soldier.order.x-soldier.x,soldier.order.y-soldier.y)>100);
order("move",{x:1200,y:700});tactical.updateCombatUnit(soldier,.1);check("orders:explicit-retreat-overrides",soldier.order.type==="move"&&!soldier.targetId);
const friend=tactical.addUnit("rifle","player",soldier.x+60,soldier.y);soldier.cooldown=0;
order("force-fire",{x:friend.x,y:friend.y});tactical.updateCombatUnit(soldier,.1);tactical.updateProjectiles(.1);
check("orders:force-fire-friendly-target",friend.health<friend.maxHealth);
soldier.cooldown=0;order("force-fire",{x:soldier.x+80,y:soldier.y+70});tactical.updateCombatUnit(soldier,.1);
check("orders:force-fire-ground",tactical.projectiles.some(p=>p.ground));
check("orders:reject-invalid-target-location",!order("guard",{x:Infinity,y:1}).accepted);
check("orders:foreign-ownership",!tactical.dispatch({controllerId:"rival",type:"scatter",entityIds:[soldier.id]}).accepted);
for(const cause of ["sold","destroyed"]) for(const side of ["player","enemy"]) {
 const crew=new RadarRTSSimulation({scenario:"validation",seed:21});const barracks=crew.addStructure("barracks",side,700,700);
 const before=crew.aliveUnits(side).length;
 if(cause==="sold")crew.sellStructure(barracks.id,side);else crew.applyDamage(barracks,9999,side==="player"?"enemy":"player");
 const survivors=crew.aliveUnits(side).filter(u=>u.survivorOf===barracks.id);
 check(`crew:${cause}:${side}:bounded`,survivors.length<=2&&(cause!=="sold"||survivors.length===2));
 check(`crew:${cause}:${side}:ownership`,survivors.every(u=>u.side===side&&u.controllerId===barracks.controllerId));
 crew.spawnSurvivors(barracks,cause);check(`crew:${cause}:${side}:once`,crew.aliveUnits(side).length===before+survivors.length);
 const unmanned=crew.addStructure("turret",side,1000,1000);crew.applyDamage(unmanned,9999,"player");check(`crew:${cause}:${side}:unmanned`,!crew.units.some(u=>u.survivorOf===unmanned.id));crew.destroy();
}
const cap=new RadarRTSSimulation({scenario:"validation"});while(cap.aliveUnits("player").length<WORLD.maxUnitsPerSide)cap.addUnit("rifle","player",500,500);
const cappedBuilding=cap.addStructure("barracks","player",800,800);cap.sellStructure(cappedBuilding.id);check("crew:global-cap",cap.aliveUnits("player").length===WORLD.maxUnitsPerSide);cap.destroy();
check("terrain:explicit-semantics",Object.values(TERRAIN_TYPES).every(t=>["gameplay","visual"].includes(t.category)&&typeof t.buildable==="boolean"&&Number.isFinite(t.movement)&&t.meaning));
check("terrain:base-foundation-visual",Object.values(MAPS).every(m=>m.foundation.type==="concrete"&&!m.foundation.gameplay)&&TERRAIN_TYPES.concrete.category==="visual");
check("terrain:rock-blocks-resource-reserved",!TERRAIN_TYPES.rock.passable&&!TERRAIN_TYPES.rock.buildable&&!TERRAIN_TYPES.resource.buildable);
check("factions:distinct-provisional-marks",FACTIONS.aurora.color!==FACTIONS.obsidian.color&&FACTIONS.aurora.marking!==FACTIONS.obsidian.marking);
for (const [kind,definitions] of [["unit",UNITS],["structure",STRUCTURES]]) for(const type of Object.keys(definitions)) {
 const a=entityVisual(kind,type,"aurora"),o=entityVisual(kind,type,"obsidian");
 check(`visual-contract:${kind}:${type}:independent`,a.world.key!==a.portrait.key&&a.world.key!==o.world.key&&a.portrait.key!==o.portrait.key);
 check(`visual-contract:${kind}:${type}:unapproved-unloaded`,a.world.source===null&&o.world.source===null&&a.portrait.source===null&&a.world.drawWidth===null&&a.world.canvasHeight===null);
}
check("bindings:conflict-rejected",Boolean(bindKey(DEFAULT_BINDINGS,"repair","s").error));
check("bindings:browser-key-rejected",Boolean(bindKey(DEFAULT_BINDINGS,"repair","F5").error));
const rebound=bindKey(DEFAULT_BINDINGS,"repair","z").bindings;
check("bindings:reassign-functional",hotkeyCommand({key:"z"},rebound)==="repair"&&hotkeyCommand({key:"r"},rebound)===null);
check("bindings:browser-chords-preserved",hotkeyCommand({key:"s",ctrlKey:true})===null&&groupCommand({key:"1",code:"Digit1",ctrlKey:true})===null);
check("bindings:escape-hierarchy",hotkeyCommand({key:"Escape",target:{tagName:"INPUT"}})==="escape");
let stored="";const store={getItem:()=>stored,setItem:(_k,v)=>stored=v};const preferences=normaliseSettings({edgeScroll:false,edgeSpeed:950,edgeMargin:60,middlePan:false,rightDragPan:true,mouseModel:"classic-left",bindings:rebound,sfxVolume:.2,voiceVolume:.4});saveSettings(preferences,store);
check("settings:roundtrip",JSON.stringify(readSettings(store))===JSON.stringify(preferences));
check("settings:denied-fallback",readSettings({getItem(){throw Error("denied")}}).edgeSpeed===700);
check("settings:edge-zone-roundtrip",readSettings(store).edgeMargin===60&&readSettings(store).rightDragPan===true);
check("settings:edge-zone-defaults",normaliseSettings().edgeMargin===44&&normaliseSettings().rightDragPan===false);
check("settings:edge-zone-bounds",normaliseSettings({edgeMargin:2}).edgeMargin===20&&normaliseSettings({edgeMargin:900}).edgeMargin===72);
saveSettings(preferences,{setItem(){throw Error("denied")}});check("settings:denied-save-session",preferences.edgeSpeed===950);
check("settings:bounds-invalid",normaliseSettings({edgeSpeed:90000,sfxVolume:-3,bindings:{repair:"F5"}}).edgeSpeed===1400&&normaliseSettings({sfxVolume:-3}).sfxVolume===0);
const groups=new ControlGroups();groups.assign(1,[soldier,threat,friend]);let recalled=groups.recall(1,tactical.units,10);
check("groups:ownership",recalled.ids.includes(soldier.id)&&!recalled.ids.includes(threat.id));
friend.dead=true;recalled=groups.recall(1,tactical.units,200);check("groups:dead-pruned-double-center",recalled.center&&!recalled.ids.includes(friend.id));
groups.clear();check("groups:teardown",groups.recall(1,tactical.units,400).ids.length===0);
check("groups:browser-safe-assign",groupCommand({key:"!",code:"Digit1",shiftKey:true}).assign);
tactical.destroy();
speechTime=30000;const arbitration=new RadarRTSVoice({enabled:true,synth,utterance:text=>({text}),now:()=>speechTime});arbitration.play("order");const cancelBefore=cancellations;
arbitration.play("production");arbitration.play("production");check("voice:routine-queues-not-cuts",cancellations===cancelBefore&&arbitration.queue.length===1);
arbitration.active.speech.onend();check("voice:queue-drains",arbitration.active.speech.text.includes("operational")&&arbitration.queue.length===0);
arbitration.play("repair");speechTime+=7000;arbitration.active.speech.onend();check("voice:stale-dropped",!arbitration.active&&arbitration.queue.length===0);
arbitration.play("select");arbitration.play("baseAttack");check("voice:critical-interrupts",arbitration.active.priority===5&&cancellations===cancelBefore+1);
arbitration.play("ready");arbitration.pause();check("voice:pause-clears-queue",!arbitration.active&&!arbitration.queue.length);arbitration.destroy();

}
console.log(`RADAR RTS PASS — ${checks.length} deterministic checks`);
