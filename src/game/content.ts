import type { EnemyId, RaceId } from "./types";

export type TowerDef = {
  race: RaceId;
  name: string;
  cost: number;
  range: number;
  damage: number;
  rate: number;
  splash: number;
  pierce: number;
  burn: number;
  poison: number;
  slow: boolean;
  armorPen: number;
  beam: boolean;
  shotSpeed: number;
  special: string;
  blurb: string;
};

export type EnemyDef = {
  id: EnemyId;
  race: RaceId;
  name: string;
  plural: string;
  hp: number;
  speed: number;
  armor: number;
  gold: number;
  lives: number;
  regen: number;
  boss: boolean;
  scale: number;
};

export type WaveGroup = { enemy: EnemyId; count: number; interval: number; hpMul?: number };

export type WaveDef = {
  name: string;
  hpMul: number;
  groups: WaveGroup[];
};

export const TOWERS: Record<RaceId, TowerDef> = {
  human: {
    race: "human",
    name: "Linehold",
    cost: 60,
    range: 3.15,
    damage: 15,
    rate: 1.05,
    splash: 0,
    pierce: 0,
    burn: 0,
    poison: 0,
    slow: false,
    armorPen: 0,
    beam: false,
    shotSpeed: 9,
    special: "Reliable bolts",
    blurb: "Steady human crews. The grammar of the wall.",
  },
  aelf: {
    race: "aelf",
    name: "Starlance",
    cost: 105,
    range: 4.65,
    damage: 17,
    rate: 0.82,
    splash: 0,
    pierce: 1,
    burn: 0,
    poison: 0,
    slow: false,
    armorPen: 0,
    beam: false,
    shotSpeed: 12,
    special: "Pierces an extra foe",
    blurb: "Long aether lances that pass through the first body.",
  },
  dwarf: {
    race: "dwarf",
    name: "Anvil Mortar",
    cost: 135,
    range: 3.25,
    damage: 36,
    rate: 0.4,
    splash: 1.15,
    pierce: 0,
    burn: 0,
    poison: 0,
    slow: false,
    armorPen: 1,
    beam: false,
    shotSpeed: 5.2,
    special: "Splash",
    blurb: "Short, loud, and meant for a crowd.",
  },
  kithkin: {
    race: "kithkin",
    name: "Whisker Post",
    cost: 45,
    range: 2.35,
    damage: 6,
    rate: 2.55,
    splash: 0,
    pierce: 0,
    burn: 0,
    poison: 0,
    slow: false,
    armorPen: 0,
    beam: false,
    shotSpeed: 11,
    special: "Very fast",
    blurb: "Cheap nests. The pause between shots is the small thing.",
  },
  drakken: {
    race: "drakken",
    name: "Ember Roost",
    cost: 150,
    range: 2.9,
    damage: 16,
    rate: 0.68,
    splash: 0.85,
    pierce: 0,
    burn: 6,
    poison: 0,
    slow: false,
    armorPen: 0,
    beam: false,
    shotSpeed: 7,
    special: "Splash and burn",
    blurb: "Measured dragon-fire. The stone remembers it.",
  },
  ork: {
    race: "ork",
    name: "Waaagh Pit",
    cost: 75,
    range: 2.15,
    damage: 28,
    rate: 0.55,
    splash: 0,
    pierce: 0,
    burn: 0,
    poison: 0,
    slow: false,
    armorPen: 1,
    beam: false,
    shotSpeed: 7.5,
    special: "Hard close hit",
    blurb: "A contract Ork and a very short argument.",
  },
  vaelfling: {
    race: "vaelfling",
    name: "Brand Spire",
    cost: 110,
    range: 3.7,
    damage: 11,
    rate: 0.92,
    splash: 0,
    pierce: 0,
    burn: 8,
    poison: 0,
    slow: false,
    armorPen: 0,
    beam: false,
    shotSpeed: 8.5,
    special: "Burn",
    blurb: "Heat with a clause. The clause is pain.",
  },
  halar: {
    race: "halar",
    name: "Hymn Choir",
    cost: 185,
    range: 4.15,
    damage: 12,
    rate: 0.7,
    splash: 0,
    pierce: 0,
    burn: 0,
    poison: 0,
    slow: true,
    armorPen: 0,
    beam: false,
    shotSpeed: 10,
    special: "Slows the march",
    blurb: "Lost Kings who still answer. They unhurry the road.",
  },
  xenoark: {
    race: "xenoark",
    name: "Brood Spire",
    cost: 95,
    range: 3.25,
    damage: 7,
    rate: 1.25,
    splash: 0,
    pierce: 0,
    burn: 0,
    poison: 5,
    slow: false,
    armorPen: 1,
    beam: false,
    shotSpeed: 8,
    special: "Poison",
    blurb: "A broken nerve of the brood, aimed outward. Trust is extra.",
  },
  mechforged: {
    race: "mechforged",
    name: "Relic Lens",
    cost: 210,
    range: 5.05,
    damage: 48,
    rate: 0.33,
    splash: 0,
    pierce: 0,
    burn: 0,
    poison: 0,
    slow: false,
    armorPen: 8,
    beam: true,
    shotSpeed: 0,
    special: "Beam, ignores most armor",
    blurb: "A Magikii machine still parsing the order: hold.",
  },
};

export const ENEMIES: Record<EnemyId, EnemyDef> = {
  levy: {
    id: "levy",
    race: "human",
    name: "Human levy",
    plural: "Human levies",
    hp: 48,
    speed: 1.12,
    armor: 0,
    gold: 9,
    lives: 1,
    regen: 0,
    boss: false,
    scale: 1,
  },
  runner: {
    id: "runner",
    race: "kithkin",
    name: "Kithkin runner",
    plural: "Kithkin runners",
    hp: 28,
    speed: 1.9,
    armor: 0,
    gold: 7,
    lives: 1,
    regen: 0,
    boss: false,
    scale: 0.86,
  },
  raider: {
    id: "raider",
    race: "ork",
    name: "Ork raider",
    plural: "Ork raiders",
    hp: 78,
    speed: 1.02,
    armor: 1,
    gold: 12,
    lives: 1,
    regen: 0,
    boss: false,
    scale: 1.08,
  },
  shield: {
    id: "shield",
    race: "dwarf",
    name: "Dwarf shield",
    plural: "Dwarf shields",
    hp: 130,
    speed: 0.7,
    armor: 4,
    gold: 16,
    lives: 1,
    regen: 0,
    boss: false,
    scale: 1.02,
  },
  skirmisher: {
    id: "skirmisher",
    race: "aelf",
    name: "Aelf skirmisher",
    plural: "Aelf skirmishers",
    hp: 36,
    speed: 1.58,
    armor: 0,
    gold: 10,
    lives: 1,
    regen: 0,
    boss: false,
    scale: 1.05,
  },
  hexer: {
    id: "hexer",
    race: "vaelfling",
    name: "Vaelfling hexer",
    plural: "Vaelfling hexers",
    hp: 60,
    speed: 1.22,
    armor: 0,
    gold: 13,
    lives: 1,
    regen: 0,
    boss: false,
    scale: 1,
  },
  wyrm: {
    id: "wyrm",
    race: "drakken",
    name: "Drakken wyrm",
    plural: "Drakken wyrms",
    hp: 160,
    speed: 0.88,
    armor: 2,
    gold: 18,
    lives: 2,
    regen: 0,
    boss: false,
    scale: 1.16,
  },
  hunter: {
    id: "hunter",
    race: "xenoark",
    name: "Xenoark hunter",
    plural: "Xenoark hunters",
    hp: 66,
    speed: 1.34,
    armor: 1,
    gold: 12,
    lives: 1,
    regen: 2.2,
    boss: false,
    scale: 1.05,
  },
  remnant: {
    id: "remnant",
    race: "mechforged",
    name: "Mechforged remnant",
    plural: "Mechforged remnants",
    hp: 210,
    speed: 0.6,
    armor: 7,
    gold: 22,
    lives: 2,
    regen: 0,
    boss: false,
    scale: 1.12,
  },
  fallen: {
    id: "fallen",
    race: "halar",
    name: "Fallen Hal'ar",
    plural: "Fallen Hal'ar",
    hp: 250,
    speed: 0.78,
    armor: 3,
    gold: 26,
    lives: 2,
    regen: 0,
    boss: false,
    scale: 1.14,
  },
  maw: {
    id: "maw",
    race: "xenoark",
    name: "The Unnamed Maw",
    plural: "The Unnamed Maw",
    hp: 1900,
    speed: 0.5,
    armor: 5,
    gold: 140,
    lives: 5,
    regen: 4,
    boss: true,
    scale: 1.7,
  },
};

export const WAVES: WaveDef[] = [
  { name: "The Levy", hpMul: 1, groups: [{ enemy: "levy", count: 8, interval: 0.78 }] },
  { name: "Whisker Dust", hpMul: 1.05, groups: [{ enemy: "runner", count: 12, interval: 0.42 }] },
  {
    name: "Unsworn",
    hpMul: 1.15,
    groups: [
      { enemy: "raider", count: 8, interval: 0.7 },
      { enemy: "levy", count: 4, interval: 0.55 },
    ],
  },
  { name: "Anvil March", hpMul: 1.2, groups: [{ enemy: "shield", count: 7, interval: 1.05 }] },
  { name: "Pale Current", hpMul: 1.32, groups: [{ enemy: "skirmisher", count: 14, interval: 0.38 }] },
  {
    name: "Brand Clauses",
    hpMul: 1.45,
    groups: [
      { enemy: "hexer", count: 8, interval: 0.62 },
      { enemy: "raider", count: 6, interval: 0.55 },
    ],
  },
  { name: "Ash Roost", hpMul: 1.55, groups: [{ enemy: "wyrm", count: 7, interval: 0.95 }] },
  {
    name: "Brood Heat",
    hpMul: 1.7,
    groups: [
      { enemy: "hunter", count: 12, interval: 0.48 },
      { enemy: "runner", count: 8, interval: 0.36 },
    ],
  },
  {
    name: "Word-Made",
    hpMul: 1.85,
    groups: [
      { enemy: "remnant", count: 6, interval: 1.1 },
      { enemy: "levy", count: 6, interval: 0.5 },
    ],
  },
  {
    name: "Fallen Kings",
    hpMul: 2,
    groups: [
      { enemy: "fallen", count: 5, interval: 1.15 },
      { enemy: "hexer", count: 8, interval: 0.5 },
    ],
  },
  {
    name: "All Oaths Break",
    hpMul: 2.2,
    groups: [
      { enemy: "raider", count: 6, interval: 0.45 },
      { enemy: "shield", count: 4, interval: 0.7 },
      { enemy: "wyrm", count: 4, interval: 0.75 },
      { enemy: "hunter", count: 6, interval: 0.4 },
    ],
  },
  {
    name: "The Unnamed Maw",
    hpMul: 1.7,
    groups: [
      { enemy: "hunter", count: 8, interval: 0.42 },
      { enemy: "maw", count: 1, interval: 1.2, hpMul: 1.15 },
      { enemy: "remnant", count: 4, interval: 0.85 },
    ],
  },
];

export const START_GOLD = 200;
export const START_LIVES = 20;
export const HYMN_COST = 80;
export const HYMN_CD = 42;
export const HYMN_TIME = 12;
export const CLEAR_BONUS = 20;
export const MAX_TOWER_LEVEL = 3;

export function wavePreview(index: number): string {
  const wave = WAVES[index];
  if (!wave) return "The road is quiet.";
  const bits = wave.groups.map((g) => {
    const e = ENEMIES[g.enemy];
    return g.count === 1 ? e.name : `${g.count} ${e.plural}`;
  });
  return bits.join(" · ");
}
