export const RADAR_RTS_VERSION = "1.1.0";

export const WORLD = Object.freeze({
  width: 2400,
  height: 1600,
  grid: 40,
  maxUnitsPerSide: 42,
  maxStructuresPerSide: 24,
  maxProjectiles: 96,
  maxEffects: 120
});

export const STRUCTURES = Object.freeze({
  hq: Object.freeze({
    id: "hq", name: "Command Hub", short: "HQ", cost: 0, buildTime: 0,
    health: 1700, radius: 78, footprint: 156, power: 25, powerUse: 0,
    prerequisites: [], role: "Construction and base expansion"
  }),
  powerPlant: Object.freeze({
    id: "powerPlant", name: "Pulse Reactor", short: "Power", cost: 600, buildTime: 5,
    health: 650, radius: 55, footprint: 110, power: 110, powerUse: 0,
    prerequisites: ["hq"], role: "+110 power"
  }),
  refinery: Object.freeze({
    id: "refinery", name: "Crystal Refinery", short: "Refinery", cost: 1500, buildTime: 8,
    health: 1050, radius: 72, footprint: 144, power: 0, powerUse: 30,
    prerequisites: ["powerPlant"], role: "Processes crystal; includes one harvester"
  }),
  barracks: Object.freeze({
    id: "barracks", name: "Field Barracks", short: "Barracks", cost: 500, buildTime: 5,
    health: 720, radius: 52, footprint: 104, power: 0, powerUse: 20,
    prerequisites: ["powerPlant"], role: "Produces infantry"
  }),
  warFactory: Object.freeze({
    id: "warFactory", name: "Vehicle Bay", short: "Factory", cost: 1800, buildTime: 10,
    health: 1250, radius: 78, footprint: 156, power: 0, powerUse: 40,
    prerequisites: ["refinery"], role: "Produces vehicles"
  }),
  turret: Object.freeze({
    id: "turret", name: "Sentinel Turret", short: "Turret", cost: 800, buildTime: 6,
    health: 700, radius: 42, footprint: 84, power: 0, powerUse: 25,
    prerequisites: ["barracks"], role: "Base defence",
    weapon: Object.freeze({ range: 245, damage: 32, cooldown: 0.72, projectileSpeed: 620 })
  }),
  uplink: Object.freeze({
    id: "uplink", name: "Storm Uplink", short: "Uplink", cost: 2500, buildTime: 14,
    health: 900, radius: 62, footprint: 124, power: 0, powerUse: 60,
    prerequisites: ["warFactory", "powerPlant"], role: "Charges Ion Storm superweapon"
  })
});

export const UNITS = Object.freeze({
  rifle: Object.freeze({
    id: "rifle", name: "Ranger Squad", short: "Ranger", cost: 120, buildTime: 3,
    health: 110, radius: 12, speed: 88, turnSpeed: 5.4,
    producer: "barracks", prerequisites: ["barracks"], role: "Anti-infantry",
    weapon: Object.freeze({ range: 150, damage: 15, cooldown: 0.62, projectileSpeed: 560 })
  }),
  rocket: Object.freeze({
    id: "rocket", name: "Lancer Team", short: "Lancer", cost: 360, buildTime: 5,
    health: 145, radius: 14, speed: 70, turnSpeed: 4.2,
    producer: "barracks", prerequisites: ["barracks", "refinery"], role: "Long-range anti-armour infantry",
    weapon: Object.freeze({
      range: 225, damage: 48, cooldown: 1.35, projectileSpeed: 390,
      multipliers: Object.freeze({ tank: 1.5, scout: 1.2, harvester: 1.15, structure: 1.1, rifle: 0.65, rocket: 0.7 })
    })
  }),
  tank: Object.freeze({
    id: "tank", name: "Vanguard Tank", short: "Tank", cost: 900, buildTime: 8,
    health: 520, radius: 24, speed: 58, turnSpeed: 2.8,
    producer: "warFactory", prerequisites: ["warFactory"], role: "Armoured assault",
    weapon: Object.freeze({ range: 210, damage: 72, cooldown: 1.55, projectileSpeed: 430 })
  }),
  scout: Object.freeze({
    id: "scout", name: "Jackal Scout", short: "Jackal", cost: 480, buildTime: 5.5,
    health: 260, radius: 19, speed: 108, turnSpeed: 4.8,
    producer: "warFactory", prerequisites: ["warFactory"], role: "Fast anti-infantry raider",
    weapon: Object.freeze({
      range: 155, damage: 12, cooldown: 0.3, projectileSpeed: 650,
      multipliers: Object.freeze({ rifle: 1.45, rocket: 1.4, tank: 0.42, harvester: 0.7, structure: 0.55 })
    })
  }),
  harvester: Object.freeze({
    id: "harvester", name: "Crystal Harvester", short: "Harvester", cost: 1200, buildTime: 9,
    health: 680, radius: 28, speed: 48, turnSpeed: 2.1,
    producer: "warFactory", prerequisites: ["refinery", "warFactory"], role: "Harvests crystal",
    cargoCapacity: 500, harvestRate: 85, unloadRate: 320
  })
});

export const RESOURCE_FIELDS = Object.freeze([
  Object.freeze({ x: 650, y: 360, amount: 9000, radius: 165 }),
  Object.freeze({ x: 1160, y: 280, amount: 7600, radius: 145 }),
  Object.freeze({ x: 1710, y: 420, amount: 9000, radius: 170 }),
  Object.freeze({ x: 560, y: 1180, amount: 7600, radius: 150 }),
  Object.freeze({ x: 1220, y: 1020, amount: 10500, radius: 180 }),
  Object.freeze({ x: 1870, y: 1190, amount: 7600, radius: 150 })
]);

export const SUPERWEAPON = Object.freeze({
  id: "ionStorm",
  name: "Ion Storm",
  chargeTime: 70,
  radius: 205,
  damage: 720,
  rechargeTime: 85,
  prerequisite: "uplink"
});

export const SIDES = Object.freeze({ PLAYER: "player", ENEMY: "enemy" });

export function definitionFor(kind, type) {
  return kind === "structure" ? STRUCTURES[type] : UNITS[type];
}

export function allBuildDefinitions() {
  return [...Object.values(STRUCTURES).filter(item => item.id !== "hq"), ...Object.values(UNITS)];
}
