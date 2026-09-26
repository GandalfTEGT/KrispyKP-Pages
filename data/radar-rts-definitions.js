export const RADAR_RTS_VERSION = "1.2.0";

export const WORLD = Object.freeze({
  width: 3400,
  height: 2200,
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
      multipliers: Object.freeze({ tank: 1.5, bulwark: 1.6, scout: 1.2, harvester: 1.15, structure: 1.1, rifle: 0.65, rocket: 0.7, marksman: 0.7 })
    })
  }),
  marksman: Object.freeze({
    id: "marksman", name: "Kestrel Team", short: "Kestrel", cost: 440, buildTime: 6,
    health: 85, radius: 12, speed: 76, turnSpeed: 5,
    producer: "barracks", prerequisites: ["barracks", "refinery"], role: "Fragile long-range infantry support",
    weapon: Object.freeze({ range: 295, damage: 38, cooldown: 1.4, projectileSpeed: 720,
      multipliers: Object.freeze({ rifle: 1.4, rocket: 1.4, marksman: 1.4, tank: 0.28, bulwark: 0.2, structure: 0.25 }) })
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
      multipliers: Object.freeze({ rifle: 1.45, rocket: 1.4, marksman: 1.5, tank: 0.42, bulwark: 0.3, harvester: 0.7, structure: 0.55 })
    })
  }),
  bulwark: Object.freeze({
    id: "bulwark", name: "Bastion Crawler", short: "Bastion", cost: 1500, buildTime: 13,
    health: 1100, radius: 31, speed: 36, turnSpeed: 1.7,
    producer: "warFactory", prerequisites: ["warFactory", "barracks"], role: "Slow siege armour; vulnerable to Lancers",
    weapon: Object.freeze({ range: 190, damage: 115, cooldown: 2.4, projectileSpeed: 340,
      multipliers: Object.freeze({ structure: 1.3, rifle: 0.45, rocket: 0.55, marksman: 0.45 }) })
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
  Object.freeze({ x: 1870, y: 1190, amount: 7600, radius: 150 }),
  Object.freeze({ x: 2780, y: 1050, amount: 10000, radius: 165 }),
  Object.freeze({ x: 2760, y: 1850, amount: 10000, radius: 165 })
]);

export const DIFFICULTIES = Object.freeze({
  easy: Object.freeze({ id: "easy", name: "Easy", description: "Long preparation window; smaller, slower waves.", credits: 3600, decision: 10, firstAttack: 125, waveInterval: 65, waveSize: 4, production: 0.8, construction: 0.8, retarget: 1.5, defences: 1 }),
  normal: Object.freeze({ id: "normal", name: "Normal", description: "Balanced economy, rebuilding and sustained pressure.", credits: 5200, decision: 6, firstAttack: 65, waveInterval: 40, waveSize: 7, production: 1, construction: 1, retarget: 0.9, defences: 2 }),
  hard: Object.freeze({ id: "hard", name: "Hard", description: "Earlier waves, faster production and extra defences.", credits: 6200, decision: 4, firstAttack: 35, waveInterval: 26, waveSize: 10, production: 1.15, construction: 1.1, retarget: 0.7, defences: 3 })
});

export const MAPS = Object.freeze({
  crystalReach: Object.freeze({
    id: "crystalReach", name: "Crystal Reach", width: 3400, height: 2200,
    description: "Wide open routes and scattered crystal reserves. 3400 × 2200.",
    playerStart: { x: 250, y: 800 }, enemyStart: { x: 3150, y: 1400 },
    resources: RESOURCE_FIELDS, obstacles: [{ x: 1520, y: 620, radius: 90 }, { x: 2250, y: 1720, radius: 115 }],
    baseRadius: 420, mobileZoom: 0.65, desktopZoom: 1
  }),
  splitBasin: Object.freeze({
    id: "splitBasin", name: "Split Basin", width: 3000, height: 2600,
    description: "Diagonal bases, central ridges and contested basin resources. 3000 × 2600.",
    playerStart: { x: 300, y: 1800 }, enemyStart: { x: 2670, y: 700 },
    resources: [
      { x: 620, y: 2300, amount: 14000, radius: 165 }, { x: 700, y: 1300, amount: 10000, radius: 160 },
      { x: 2400, y: 250, amount: 14000, radius: 165 }, { x: 2300, y: 1300, amount: 10000, radius: 160 },
      { x: 1450, y: 900, amount: 16000, radius: 180 }, { x: 1550, y: 1730, amount: 16000, radius: 180 }
    ],
    obstacles: [{ x: 1380, y: 1280, radius: 130 }, { x: 1700, y: 1420, radius: 110 }, { x: 1150, y: 1950, radius: 85 }],
    baseRadius: 420, mobileZoom: 0.65, desktopZoom: 1
  })
});

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
