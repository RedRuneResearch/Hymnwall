export type RaceId =
  | "human"
  | "aelf"
  | "dwarf"
  | "kithkin"
  | "drakken"
  | "ork"
  | "vaelfling"
  | "halar"
  | "xenoark"
  | "mechforged";

export type EnemyId =
  | "levy"
  | "runner"
  | "raider"
  | "shield"
  | "skirmisher"
  | "hexer"
  | "wyrm"
  | "hunter"
  | "remnant"
  | "fallen"
  | "maw";

export type TargetMode = "first" | "closest" | "strongest";

export type Phase = "play" | "victory" | "defeat";

export type GameEvent =
  | "place"
  | "upgrade"
  | "sell"
  | "wave"
  | "leak"
  | "hymn"
  | "victory"
  | "defeat";

export type Mods = {
  goldMul: number;
  startGold: number;
  lives: number;
  firstLeakFree: boolean;
  allRate: number;
  rate: Partial<Record<RaceId, number>>;
  range: Partial<Record<RaceId, number>>;
  dmg: Partial<Record<RaceId, number>>;
  costDelta: Partial<Record<RaceId, number>>;
  pierce: Partial<Record<RaceId, number>>;
  splash: Partial<Record<RaceId, number>>;
  armorPen: Partial<Record<RaceId, number>>;
  burnMul: number;
  burnRace: RaceId | null;
  burnDurMul: number;
  poisonMul: number;
  poisonMax: number;
  slowOnRace: { race: RaceId; factor: number } | null;
  halarSlow: number;
  upgradeMul: number;
  sellMul: number;
  hymnCdMul: number;
  freeHymn: boolean;
  freeUpgrade: boolean;
  killGold: { race: RaceId; extra: number } | null;
};

export type Hero = {
  id: string;
  race: RaceId;
  name: string;
  title: string;
  blurb: string;
  bonus: string;
};

export type RaceProfile = {
  id: RaceId;
  name: string;
  epithet: string;
  lore: string[];
  mark: string;
  heroes: Hero[];
};
