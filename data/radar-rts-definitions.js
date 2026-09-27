export const RADAR_RTS_VERSION = "1.5.0";

export const WORLD = Object.freeze({
  width: 4800,
  height: 3200,
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
    survivors: { type: "rifle", sold: 1, destroyed: 1, chance: .4 },
    prerequisites: ["powerPlant"], role: "Processes crystal; includes one harvester"
  }),
  barracks: Object.freeze({
    id: "barracks", name: "Field Barracks", short: "Barracks", cost: 500, buildTime: 5,
    health: 720, radius: 52, footprint: 104, power: 0, powerUse: 20,
    survivors: { type: "rifle", sold: 2, destroyed: 2, chance: .5 },
    prerequisites: ["powerPlant"], role: "Produces infantry"
  }),
  warFactory: Object.freeze({
    id: "warFactory", name: "Vehicle Bay", short: "Factory", cost: 1800, buildTime: 10,
    health: 1250, radius: 78, footprint: 156, power: 0, powerUse: 40,
    survivors: { type: "rifle", sold: 1, destroyed: 1, chance: .5 },
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
    id: "crystalReach", name: "Crystal Reach", width: 4800, height: 3200,
    groundTerrain: "ground",
    description: "Open frontier, forward crystal routes and distant bases. 4800 × 3200.",
    playerStart: { x: 250, y: 800 }, enemyStart: { x: 4330, y: 2330 },
    resources: [...RESOURCE_FIELDS.slice(0, 6), { x: 3920, y: 2000, amount: 16000, radius: 165 }, { x: 3920, y: 2810, amount: 16000, radius: 165 }, { x: 3050, y: 2250, amount: 22000, radius: 180 }],
    obstacles: [{ x: 1520, y: 620, radius: 90 }, { x: 2250, y: 1720, radius: 115 }, { x: 3300, y: 1250, radius: 140 }],
    terrain: [{ x: 2100, y: 900, radius: 270, type: "rough", passable: true, variant: 1 }, { x: 3400, y: 2750, radius: 210, type: "rough", passable: true, variant: 2 }],
    foundation: { type: "concrete", radius: 220, purpose: "base-foundation", gameplay: false },
    baseRadius: 420, mobileZoom: 0.65, desktopZoom: 1
  }),
  splitBasin: Object.freeze({
    id: "splitBasin", name: "Split Basin", width: 4400, height: 3800,
    groundTerrain: "ground",
    description: "Diagonal bases, ridge passages and a contested central basin. 4400 × 3800.",
    playerStart: { x: 300, y: 2800 }, enemyStart: { x: 3950, y: 700 },
    resources: [
      { x: 620, y: 3300, amount: 16000, radius: 165 }, { x: 700, y: 2300, amount: 16000, radius: 160 },
      { x: 3500, y: 250, amount: 16000, radius: 165 }, { x: 3550, y: 1200, amount: 16000, radius: 160 },
      { x: 2200, y: 1400, amount: 22000, radius: 180 }, { x: 2050, y: 2550, amount: 22000, radius: 180 }
    ],
    obstacles: [{ x: 1380, y: 1280, radius: 130 }, { x: 2500, y: 2020, radius: 180 }, { x: 1700, y: 2150, radius: 140 }],
    terrain: [{ x: 2900, y: 2750, radius: 300, type: "rough", passable: true, variant: 2 }, { x: 1200, y: 3000, radius: 200, type: "rough", passable: true, variant: 1 }],
    foundation: { type: "concrete", radius: 220, purpose: "base-foundation", gameplay: false },
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

export const ECONOMY = Object.freeze({ cancelRefund: .75, sellRefund: .5, repairCreditsPerSecond: 10, repairHealthPerCredit: 2 });
// Asset keys are stable replacement slots for the independent artwork project.
const sharedFaction = { units: Object.keys(UNITS), structures: Object.keys(STRUCTURES), costs: {}, prerequisites: {}, power: {}, abilities: ["repair", "sell"], superweapon: "ionStorm", aiPreferences: {}, audio: "radar-starter" };
export const FACTIONS = Object.freeze({
  aurora: Object.freeze({ ...sharedFaction, id: "aurora", name: "Aurora Compact", description: "Frontier engineers. Shared provisional roster and balance.", art: "aurora", color: "#72e9ff", marking: "A" }),
  obsidian: Object.freeze({ ...sharedFaction, id: "obsidian", name: "Obsidian Union", description: "Expeditionary command. Shared provisional roster and balance.", art: "obsidian", color: "#d2a4ff", marking: "O" })
});
// Stable separate slots, not file URLs or approval of external review artwork.
// Canvas dimensions/anchors belong to each asset, never collision radii. Null means
// unresolved until integration; the current vector fallback does not consume sprites.
export const ENTITY_VISUALS = Object.freeze(Object.fromEntries(Object.keys(FACTIONS).map(factionId => [factionId,
  Object.freeze(Object.fromEntries([...[...Object.keys(STRUCTURES)].map(id => ["structure",id]), ...Object.keys(UNITS).map(id => ["unit",id])].map(([kind,id]) => [`${kind}:${id}`, Object.freeze({
    world: Object.freeze({ key: `${factionId}/${kind}/${id}/world`, source: null, canvasWidth: null, canvasHeight: null, drawWidth: null, drawHeight: null, anchor: null, facingPolicy: "vector-heading", accent: FACTIONS[factionId].color }),
    portrait: Object.freeze({ key: `${factionId}/${kind}/${id}/portrait`, source: null, canvasWidth: null, canvasHeight: null, fallbackIcon: id })
  })])))
])));
export function entityVisual(kind, type, factionId) {
  return ENTITY_VISUALS[factionId]?.[`${kind}:${type}`] || ENTITY_VISUALS.aurora[`${kind}:${type}`];
}
export const TERRAIN_TYPES = Object.freeze({
  ground: { category: "gameplay", movement: 1, buildable: true, meaning: "Open ground: normal movement and construction", passable: true, color: "#102329", asset: "terrain/ground" },
  rock: { category: "gameplay", movement: 0, buildable: false, meaning: "Rock: blocks units and construction", passable: false, color: "#303b42", asset: "terrain/rock" },
  rough: { category: "visual", movement: 1, buildable: true, meaning: "Ground variation: no movement, cover or construction bonus", passable: true, color: "#14272b", asset: "terrain/rough" },
  concrete: { category: "visual", movement: 1, buildable: true, meaning: "Base foundation marking: visual only, no building restriction or bonus", passable: true, color: "#1b3038", asset: "terrain/concrete" },
  resource: { category: "gameplay", movement: 1, buildable: false, meaning: "Finite harvestable crystal; construction excluded", passable: true, color: "#103c39", asset: "terrain/resource" }
});

export function terrainForMap(map) {
  return [
    ...map.obstacles.map((o, i) => ({ ...o, type: "rock", passable: false, variant: i % 3 })),
    ...map.resources.map((r, i) => ({ x: r.x, y: r.y, radius: r.radius, type: "resource", passable: true, variant: i % 3 })),
    ...[map.playerStart, map.enemyStart].map(p => ({ ...p, radius: map.foundation.radius, type: map.foundation.type, purpose: map.foundation.purpose, passable: true, variant: 0 })),
    ...(map.terrain || [])
  ];
}

export function definitionFor(kind, type) {
  return kind === "structure" ? STRUCTURES[type] : UNITS[type];
}

export function allBuildDefinitions() {
  return [...Object.values(STRUCTURES).filter(item => item.id !== "hq"), ...Object.values(UNITS)];
}
