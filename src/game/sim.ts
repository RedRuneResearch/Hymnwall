import {
  CLEAR_BONUS,
  ENEMIES,
  HYMN_CD,
  HYMN_COST,
  HYMN_TIME,
  MAX_TOWER_LEVEL,
  START_GOLD,
  START_LIVES,
  TOWERS,
  WAVES,
  wavePreview,
  type EnemyDef,
  type TowerDef,
} from "./content";
import { HERO_BY_ID, modsFor, raceById } from "./lore";
import { PATH, buildPathMask, pointAt } from "./path";
import { COLS, ROWS } from "./path";
import type { EnemyId, GameEvent, Mods, Phase, RaceId, TargetMode } from "./types";

export type Creep = {
  id: number;
  enemy: EnemyId;
  race: RaceId;
  name: string;
  hp: number;
  maxHp: number;
  speed: number;
  armor: number;
  gold: number;
  leakLives: number;
  regen: number;
  boss: boolean;
  scale: number;
  dist: number;
  slowFactor: number;
  slowT: number;
  burnDps: number;
  burnT: number;
  poisonDps: number;
  poisonStacks: number;
  poisonT: number;
  flash: number;
  leaked: boolean;
  paid: boolean;
  credit: RaceId;
};

export type Tower = {
  id: number;
  race: RaceId;
  c: number;
  r: number;
  level: number;
  spent: number;
  cd: number;
  angle: number;
  mode: TargetMode;
};

export type Shot = {
  id: number;
  x: number;
  y: number;
  race: RaceId;
  speed: number;
  dmg: number;
  splash: number;
  pierce: number;
  burn: number;
  poison: number;
  slow: number;
  armorPen: number;
  targetId: number;
  ttl: number;
  hit: number[];
};

export type Beam = { x1: number; y1: number; x2: number; y2: number; life: number; race: RaceId };
export type Particle = { x: number; y: number; vx: number; vy: number; life: number; max: number; color: string };
export type FloatText = { x: number; y: number; text: string; life: number; max: number; bad: boolean };

export type HudSelected = {
  id: number;
  name: string;
  raceName: string;
  level: number;
  dmg: string;
  rate: string;
  range: string;
  special: string;
  upgradeCost: number | null;
  sell: number;
  mode: TargetMode;
};

export type Hud = {
  lives: number;
  maxLives: number;
  gold: number;
  phase: Phase;
  note: string;
  armed: RaceId | null;
  armedCost: number | null;
  hymnCd: number;
  hymnCost: number;
  hymnReady: boolean;
  guardian: boolean;
  kills: number;
  leaks: number;
  goldEarned: number;
  wavesCleared: number;
  speed: 1 | 2;
  paused: boolean;
  canCall: boolean;
  callLabel: string;
  waveName: string;
  waveIndex: number;
  waveCount: number;
  preview: string;
  patron: string;
  patronBonus: string;
  selected: HudSelected | null;
  creeps: number;
};

const mask = buildPathMask();

export function isPath(c: number, r: number) {
  return Boolean(mask[r]?.[c]);
}

function fmt(n: number) {
  const r = Math.round(n * 10) / 10;
  return Number.isInteger(r) ? String(r) : r.toFixed(1);
}

export class Sim {
  heroId: string;
  mods: Mods;
  gold = 0;
  lives = 0;
  maxLives = 0;
  phase: Phase = "play";
  towers: Tower[] = [];
  creeps: Creep[] = [];
  shots: Shot[] = [];
  beams: Beam[] = [];
  particles: Particle[] = [];
  floats: FloatText[] = [];
  events: GameEvent[] = [];
  note = "Place crews beside the pale road. They cannot stand on it.";
  noteT = 4;
  armed: RaceId | null = null;
  selectedId: number | null = null;
  hover: { c: number; r: number } | null = null;
  nextWave = 1;
  spawning = false;
  pendingClear = false;
  queue: { enemy: EnemyId; left: number; interval: number; timer: number; hpMul: number }[] = [];
  leakUsedThisWave = false;
  hymnCd = 0;
  hymnFree: boolean;
  guardianT = 0;
  guardianCd = 0;
  guardianAngle = 0;
  freeUpgrade: boolean;
  kills = 0;
  leaks = 0;
  goldEarned = 0;
  wavesCleared = 0;
  speed: 1 | 2 = 1;
  paused = false;
  time = 0;
  shake = 0;
  private ids = 1;

  constructor(heroId: string) {
    this.heroId = heroId;
    this.mods = modsFor(heroId);
    this.hymnFree = this.mods.freeHymn;
    this.freeUpgrade = this.mods.freeUpgrade;
    this.reset(false);
  }

  reset(keepNote = false) {
    this.mods = modsFor(this.heroId);
    this.gold = START_GOLD + this.mods.startGold;
    this.maxLives = START_LIVES + this.mods.lives;
    this.lives = this.maxLives;
    this.phase = "play";
    this.towers = [];
    this.creeps = [];
    this.shots = [];
    this.beams = [];
    this.particles = [];
    this.floats = [];
    this.events = [];
    this.armed = null;
    this.selectedId = null;
    this.nextWave = 1;
    this.spawning = false;
    this.pendingClear = false;
    this.queue = [];
    this.leakUsedThisWave = false;
    this.hymnCd = 0;
    this.hymnFree = this.mods.freeHymn;
    this.guardianT = 0;
    this.guardianCd = 0;
    this.freeUpgrade = this.mods.freeUpgrade;
    this.kills = 0;
    this.leaks = 0;
    this.goldEarned = 0;
    this.wavesCleared = 0;
    this.paused = false;
    this.time = 0;
    this.shake = 0;
    if (!keepNote) {
      this.note = "Place crews beside the pale road. They cannot stand on it.";
      this.noteT = 5;
    }
  }

  drainEvents() {
    const ev = this.events;
    this.events = [];
    return ev;
  }

  private say(text: string, t = 2.4) {
    this.note = text;
    this.noteT = t;
  }

  private nid() {
    this.ids += 1;
    return this.ids;
  }

  towerCost(race: RaceId) {
    return Math.max(20, TOWERS[race].cost + (this.mods.costDelta[race] ?? 0));
  }

  private stats(def: TowerDef, level: number) {
    const dmgMul = Math.pow(1.42, level - 1) * (this.mods.dmg[def.race] ?? 1);
    const rateMul = Math.pow(1.2, level - 1) * (this.mods.rate[def.race] ?? 1) * this.mods.allRate;
    const rangeMul = this.mods.range[def.race] ?? 1;
    const burnMul = this.mods.burnRace === def.race ? this.mods.burnMul : 1;
    return {
      damage: def.damage * dmgMul,
      rate: def.rate * rateMul,
      range: def.range * rangeMul,
      splash: def.splash * (this.mods.splash[def.race] ?? 1),
      pierce: def.pierce + (this.mods.pierce[def.race] ?? 0),
      burn: def.burn * burnMul,
      poison: def.poison * this.mods.poisonMul,
      armorPen: def.armorPen + (this.mods.armorPen[def.race] ?? 0),
      slow: def.slow ? this.mods.halarSlow : 0,
    };
  }

  upgradeCost(tower: Tower) {
    if (tower.level >= MAX_TOWER_LEVEL) return null;
    if (this.freeUpgrade) return 0;
    const base = TOWERS[tower.race].cost;
    const raw = tower.level === 1 ? base * 0.8 : base * 1.25;
    return Math.max(10, Math.round(raw * this.mods.upgradeMul));
  }

  sellValue(tower: Tower) {
    return Math.round(tower.spent * this.mods.sellMul);
  }

  arm(race: RaceId) {
    this.armed = this.armed === race ? null : race;
    if (this.armed) this.selectedId = null;
  }

  setMode(mode: TargetMode) {
    const t = this.towers.find((x) => x.id === this.selectedId);
    if (t) t.mode = mode;
  }

  setHover(c: number, r: number) {
    if (c < 0 || r < 0 || c >= COLS || r >= ROWS) this.hover = null;
    else this.hover = { c, r };
  }

  clearHover() {
    this.hover = null;
  }

  clickCell(c: number, r: number) {
    if (this.phase !== "play") return;
    if (c < 0 || r < 0 || c >= COLS || r >= ROWS) {
      this.selectedId = null;
      return;
    }
    const occupied = this.towers.find((t) => t.c === c && t.r === r);
    if (occupied) {
      this.selectedId = occupied.id;
      this.armed = null;
      return;
    }
    if (!this.armed) {
      this.selectedId = null;
      return;
    }
    if (isPath(c, r)) {
      this.say("The march owns this stone.");
      return;
    }
    const cost = this.towerCost(this.armed);
    if (this.gold < cost) {
      this.say("Not enough gold.");
      return;
    }
    this.gold -= cost;
    const tower: Tower = {
      id: this.nid(),
      race: this.armed,
      c,
      r,
      level: 1,
      spent: cost,
      cd: 0.2,
      angle: -Math.PI / 2,
      mode: "first",
    };
    this.towers.push(tower);
    this.selectedId = tower.id;
    this.armed = null;
    this.events.push("place");
    this.say(`${TOWERS[tower.race].name} holds.`);
  }

  upgradeSelected() {
    const t = this.towers.find((x) => x.id === this.selectedId);
    if (!t || this.phase !== "play") return;
    const cost = this.upgradeCost(t);
    if (cost === null) return;
    if (this.gold < cost) {
      this.say("Not enough gold to improve them.");
      return;
    }
    this.gold -= cost;
    t.level += 1;
    t.spent += cost;
    if (cost === 0) this.freeUpgrade = false;
    this.events.push("upgrade");
    this.say(`${TOWERS[t.race].name} improved. Rank ${t.level}.`);
  }

  sellSelected() {
    const i = this.towers.findIndex((x) => x.id === this.selectedId);
    if (i < 0 || this.phase !== "play") return;
    const t = this.towers[i]!;
    const refund = this.sellValue(t);
    this.gold += refund;
    this.towers.splice(i, 1);
    this.selectedId = null;
    this.events.push("sell");
    this.say(`Crew dismissed. +${refund} gold.`);
  }

  callWave() {
    if (this.phase !== "play" || this.spawning || this.nextWave > WAVES.length) return;
    this.paused = false;
    if (this.pendingClear && this.creeps.length === 0) {
      this.pendingClear = false;
      this.wavesCleared += 1;
      this.gold += CLEAR_BONUS;
      this.goldEarned += CLEAR_BONUS;
    }
    const wave = WAVES[this.nextWave - 1]!;
    this.queue = wave.groups.map((g) => ({
      enemy: g.enemy,
      left: g.count,
      interval: g.interval,
      timer: 0.15,
      hpMul: wave.hpMul * (g.hpMul ?? 1),
    }));
    this.spawning = true;
    this.pendingClear = false;
    this.leakUsedThisWave = false;
    this.events.push("wave");
    this.say(`${wave.name} takes the road.`);
  }

  castHymn() {
    if (this.phase !== "play") return;
    if (this.hymnCd > 0 || this.guardianT > 0) {
      this.say("The word is still cooling.");
      return;
    }
    const cost = this.hymnFree ? 0 : HYMN_COST;
    if (this.gold < cost) {
      this.say("Not enough gold to speak the Hymn Word.");
      return;
    }
    this.gold -= cost;
    this.hymnFree = false;
    this.hymnCd = HYMN_CD * this.mods.hymnCdMul;
    this.guardianT = HYMN_TIME;
    this.guardianCd = 0;
    this.events.push("hymn");
    this.say("A Hymn Word. Aether wings answer.");
  }

  togglePause() {
    if (this.phase !== "play") return;
    this.paused = !this.paused;
  }

  step(dtRaw: number) {
    const dt = this.paused || this.phase !== "play" ? 0 : Math.min(0.05, dtRaw) * this.speed;
    this.time += dt;
    if (this.noteT > 0) this.noteT = Math.max(0, this.noteT - dtRaw);
    this.shake = Math.max(0, this.shake - dtRaw);
    for (const p of this.particles) {
      p.life -= dtRaw;
      p.x += p.vx * dtRaw;
      p.y += p.vy * dtRaw;
    }
    this.particles = this.particles.filter((p) => p.life > 0);
    for (const f of this.floats) f.life -= dtRaw;
    this.floats = this.floats.filter((f) => f.life > 0);
    for (const b of this.beams) b.life -= dtRaw;
    this.beams = this.beams.filter((b) => b.life > 0);
    if (dt <= 0) return;

    if (this.hymnCd > 0) this.hymnCd = Math.max(0, this.hymnCd - dt);
    if (this.guardianT > 0) {
      this.guardianT = Math.max(0, this.guardianT - dt);
      this.guardianAngle += dt * 1.4;
      this.guardianCd = Math.max(0, this.guardianCd - dt);
      if (this.guardianCd === 0) this.fireGuardian();
    }

    this.spawn(dt);
    this.moveCreeps(dt);
    this.reap();
    if (this.phase !== "play") return;
    this.fireTowers(dt);
    this.moveShots(dt);
    this.reap();
    this.checkClear();
  }

  private spawn(dt: number) {
    if (!this.spawning) return;
    const group = this.queue[0];
    if (!group) {
      this.spawning = false;
      this.pendingClear = true;
      this.nextWave += 1;
      return;
    }
    group.timer -= dt;
    if (group.timer > 0) return;
    this.creeps.push(this.makeCreep(group.enemy, group.hpMul));
    group.left -= 1;
    group.timer += group.interval;
    if (group.left <= 0) this.queue.shift();
  }

  private makeCreep(id: EnemyId, hpMul: number): Creep {
    const def: EnemyDef = ENEMIES[id];
    const hp = Math.round(def.hp * hpMul);
    return {
      id: this.nid(),
      enemy: id,
      race: def.race,
      name: def.name,
      hp,
      maxHp: hp,
      speed: def.speed,
      armor: def.armor,
      gold: def.gold,
      leakLives: def.lives,
      regen: def.regen,
      boss: def.boss,
      scale: def.scale,
      dist: 0,
      slowFactor: 1,
      slowT: 0,
      burnDps: 0,
      burnT: 0,
      poisonDps: 0,
      poisonStacks: 0,
      poisonT: 0,
      flash: 0,
      leaked: false,
      paid: false,
      credit: def.race,
    };
  }

  private moveCreeps(dt: number) {
    for (const c of this.creeps) {
      if (c.flash > 0) c.flash -= dt;
      if (c.burnT > 0) {
        c.hp -= c.burnDps * dt;
        c.burnT -= dt;
        if (c.burnT <= 0) c.burnDps = 0;
      }
      if (c.poisonT > 0) {
        c.hp -= c.poisonDps * c.poisonStacks * dt;
        c.poisonT -= dt;
        if (c.poisonT <= 0) {
          c.poisonStacks = 0;
          c.poisonDps = 0;
        }
      } else if (c.regen > 0 && c.hp > 0 && c.hp < c.maxHp) {
        c.hp = Math.min(c.maxHp, c.hp + c.regen * dt);
      }
      if (c.slowT > 0) {
        c.slowT -= dt;
        if (c.slowT <= 0) c.slowFactor = 1;
      }
      if (c.hp <= 0) {
        this.reward(c, c.credit);
        continue;
      }
      c.dist += c.speed * c.slowFactor * dt;
      if (c.dist >= PATH.length) this.leak(c);
    }
  }

  private leak(c: Creep) {
    c.leaked = true;
    c.hp = 0;
    let loss = c.leakLives;
    if (this.mods.firstLeakFree && !this.leakUsedThisWave) {
      this.leakUsedThisWave = true;
      loss = 0;
      this.say("Hale spends a life the gate still owes.");
    } else {
      this.say(loss > 1 ? `${c.name} breaks the gate.` : "A body passes the gate.");
    }
    this.lives -= loss;
    this.leaks += 1;
    this.shake = Math.min(1, this.shake + 0.45);
    const end = pointAt(PATH.length);
    this.floats.push({
      x: end.x,
      y: end.y - 0.4,
      text: loss > 0 ? `−${loss}` : "held",
      life: 1.1,
      max: 1.1,
      bad: loss > 0,
    });
    if (loss > 0) this.events.push("leak");
    if (this.lives <= 0) {
      this.lives = 0;
      this.phase = "defeat";
      this.paused = false;
      this.events.push("defeat");
      this.say("The road is broken.");
    }
  }

  private pickTarget(x: number, y: number, range: number, mode: TargetMode, skip: number[] = []) {
    let best: Creep | null = null;
    let bestScore = 0;
    const r2 = range * range;
    for (const c of this.creeps) {
      if (c.hp <= 0 || skip.includes(c.id)) continue;
      const p = pointAt(c.dist);
      const d2 = (p.x - x) ** 2 + (p.y - y) ** 2;
      if (d2 > r2) continue;
      let score = 0;
      if (mode === "first") score = c.dist;
      else if (mode === "closest") score = -d2;
      else score = c.hp;
      if (!best || score > bestScore) {
        best = c;
        bestScore = score;
      }
    }
    return best;
  }

  private aim(tower: Tower, x: number, y: number, tx: number, ty: number, dt: number) {
    const want = Math.atan2(ty - y, tx - x);
    let d = want - tower.angle;
    while (d > Math.PI) d -= Math.PI * 2;
    while (d < -Math.PI) d += Math.PI * 2;
    tower.angle += d * Math.min(1, dt * 8);
  }

  private fireTowers(dt: number) {
    for (const tower of this.towers) {
      tower.cd = Math.max(0, tower.cd - dt);
      const def = TOWERS[tower.race];
      const st = this.stats(def, tower.level);
      const x = tower.c + 0.5;
      const y = tower.r + 0.5;
      const target = this.pickTarget(x, y, st.range, tower.mode);
      if (!target) continue;
      const p = pointAt(target.dist);
      this.aim(tower, x, y, p.x, p.y, dt);
      if (tower.cd > 0) continue;
      tower.cd = 1 / st.rate;
      if (def.beam) {
        this.hurt(target, st.damage, st.armorPen, tower.race);
        if (st.burn > 0) this.applyBurn(target, st.burn, tower.race);
        if (st.poison > 0) this.applyPoison(target, st.poison, tower.race);
        if (st.slow > 0) this.applySlow(target, st.slow);
        const extra = this.mods.slowOnRace;
        if (extra && extra.race === tower.race) this.applySlow(target, extra.factor);
        this.beams.push({ x1: x, y1: y, x2: p.x, y2: p.y, life: 0.12, race: tower.race });
        this.spark(p.x, p.y, tower.race);
      } else {
        this.shots.push({
          id: this.nid(),
          x,
          y,
          race: tower.race,
          speed: def.shotSpeed,
          dmg: st.damage,
          splash: st.splash,
          pierce: st.pierce,
          burn: st.burn,
          poison: st.poison,
          slow: st.slow || (this.mods.slowOnRace?.race === tower.race ? this.mods.slowOnRace.factor : 0),
          armorPen: st.armorPen,
          targetId: target.id,
          ttl: 2.6,
          hit: [],
        });
      }
    }
  }

  private fireGuardian() {
    const x = 8;
    const y = 4.2;
    const stRange = 5.6 * (this.mods.range.halar ?? 1);
    const dmg = 22 * (this.mods.dmg.halar ?? 1);
    const target = this.pickTarget(x, y, stRange, "first");
    if (!target) {
      this.guardianCd = 0.15;
      return;
    }
    const p = pointAt(target.dist);
    this.shots.push({
      id: this.nid(),
      x: x + Math.cos(this.guardianAngle) * 0.4,
      y: y + Math.sin(this.guardianAngle) * 0.15,
      race: "halar",
      speed: 11,
      dmg,
      splash: 0,
      pierce: 0,
      burn: 0,
      poison: 0,
      slow: this.mods.halarSlow,
      armorPen: 2,
      targetId: target.id,
      ttl: 2.2,
      hit: [],
    });
    this.guardianCd = 0.42;
    this.beams.push({
      x1: x,
      y1: y,
      x2: p.x,
      y2: p.y,
      life: 0.06,
      race: "halar",
    });
  }

  private moveShots(dt: number) {
    for (const s of this.shots) {
      s.ttl -= dt;
      const target = this.creeps.find((c) => c.id === s.targetId && c.hp > 0);
      if (!target) {
        s.ttl = -1;
        continue;
      }
      const p = pointAt(target.dist);
      const dx = p.x - s.x;
      const dy = p.y - s.y;
      const len = Math.hypot(dx, dy);
      if (len < 0.22) {
        if (this.impact(s, target)) s.ttl = -1;
        continue;
      }
      s.x += (dx / len) * s.speed * dt;
      s.y += (dy / len) * s.speed * dt;
    }
    this.shots = this.shots.filter((s) => s.ttl > 0);
  }

  private impact(s: Shot, primary: Creep) {
    this.hurt(primary, s.dmg, s.armorPen, s.race);
    if (s.burn > 0) this.applyBurn(primary, s.burn, s.race);
    if (s.poison > 0) this.applyPoison(primary, s.poison, s.race);
    if (s.slow > 0) this.applySlow(primary, s.slow);
    const p = pointAt(primary.dist);
    this.spark(p.x, p.y, s.race);
    if (s.splash > 0) {
      for (const c of this.creeps) {
        if (c.id === primary.id || c.hp <= 0) continue;
        const q = pointAt(c.dist);
        if ((q.x - p.x) ** 2 + (q.y - p.y) ** 2 <= s.splash * s.splash) {
          this.hurt(c, s.dmg * 0.62, s.armorPen * 0.5, s.race);
          if (s.burn > 0) this.applyBurn(c, s.burn * 0.7, s.race);
        }
      }
    }
    if (s.pierce > 0) {
      s.hit.push(primary.id);
      const next = this.pickTarget(p.x, p.y, 1.35, "closest", s.hit);
      if (next) {
        s.pierce -= 1;
        s.targetId = next.id;
        s.dmg *= 0.72;
        s.ttl = 1.2;
        s.x = p.x;
        s.y = p.y;
        return false;
      }
    }
    return true;
  }

  private hurt(c: Creep, raw: number, pen: number, race: RaceId) {
    if (c.hp <= 0 || c.leaked || c.paid) return;
    c.credit = race;
    const armor = Math.max(0, c.armor - pen);
    const dmg = Math.max(1, raw - armor);
    c.hp -= dmg;
    c.flash = 0.08;
    if (c.hp <= 0) this.reward(c, race);
  }

  private reward(c: Creep, race: RaceId) {
    if (c.paid || c.leaked) return;
    c.paid = true;
    let gold = Math.round(c.gold * this.mods.goldMul);
    if (this.mods.killGold && this.mods.killGold.race === race) gold += this.mods.killGold.extra;
    this.gold += gold;
    this.goldEarned += gold;
    this.kills += 1;
    const p = pointAt(Math.min(c.dist, PATH.length));
    this.floats.push({ x: p.x, y: p.y - 0.35, text: `+${gold}`, life: 0.8, max: 0.8, bad: false });
  }

  private applyBurn(c: Creep, dps: number, race: RaceId) {
    c.credit = race;
    c.burnDps = Math.max(c.burnDps, dps);
    c.burnT = Math.max(c.burnT, 2 * this.mods.burnDurMul);
  }

  private applyPoison(c: Creep, dps: number, race: RaceId) {
    c.credit = race;
    c.poisonDps = Math.max(c.poisonDps, dps);
    if (c.poisonStacks < this.mods.poisonMax) c.poisonStacks += 1;
    c.poisonT = 3;
  }

  private applySlow(c: Creep, factor: number) {
    c.slowFactor = Math.min(c.slowFactor, factor);
    c.slowT = Math.max(c.slowT, 1.45);
  }

  private spark(x: number, y: number, race: RaceId) {
    const color = race === "xenoark" ? "#9aaf86" : race === "drakken" || race === "vaelfling" ? "#e0a090" : "#d9d3c6";
    for (let i = 0; i < 3; i++) {
      if (this.particles.length > 90) break;
      const a = Math.random() * Math.PI * 2;
      const v = 0.6 + Math.random();
      this.particles.push({
        x,
        y,
        vx: Math.cos(a) * v,
        vy: Math.sin(a) * v,
        life: 0.25 + Math.random() * 0.15,
        max: 0.4,
        color,
      });
    }
  }

  private reap() {
    this.creeps = this.creeps.filter((c) => c.hp > 0 && !c.leaked);
  }

  private checkClear() {
    if (this.phase !== "play") return;
    if (!this.pendingClear || this.spawning || this.creeps.length > 0) return;
    this.pendingClear = false;
    this.wavesCleared += 1;
    this.gold += CLEAR_BONUS;
    this.goldEarned += CLEAR_BONUS;
    if (this.nextWave > WAVES.length) {
      this.phase = "victory";
      this.events.push("victory");
      this.say("The gate holds.");
      return;
    }
    this.say(`Road clear. +${CLEAR_BONUS} gold.`);
  }

  hud(): Hud {
    const hero = HERO_BY_ID[this.heroId];
    const inFight = this.spawning || this.creeps.length > 0 || this.pendingClear;
    let waveIndex = inFight ? (this.spawning ? this.nextWave : this.nextWave - 1) : this.nextWave;
    if (this.phase === "victory") waveIndex = WAVES.length;
    waveIndex = Math.max(1, Math.min(WAVES.length, waveIndex));
    const wave = WAVES[waveIndex - 1];
    const selectedTower = this.towers.find((t) => t.id === this.selectedId) ?? null;
    let selected: HudSelected | null = null;
    if (selectedTower) {
      const def = TOWERS[selectedTower.race];
      const st = this.stats(def, selectedTower.level);
      selected = {
        id: selectedTower.id,
        name: def.name,
        raceName: raceById(def.race).name,
        level: selectedTower.level,
        dmg: fmt(st.damage),
        rate: fmt(st.rate),
        range: fmt(st.range),
        special: def.special,
        upgradeCost: this.upgradeCost(selectedTower),
        sell: this.sellValue(selectedTower),
        mode: selectedTower.mode,
      };
    }
    const canCall = this.phase === "play" && !this.spawning && this.nextWave <= WAVES.length;
    const previewIndex = canCall ? this.nextWave - 1 : waveIndex - 1;
    return {
      lives: this.lives,
      maxLives: this.maxLives,
      gold: this.gold,
      phase: this.phase,
      note: this.noteT > 0 ? this.note : "",
      armed: this.armed,
      armedCost: this.armed ? this.towerCost(this.armed) : null,
      hymnCd: this.hymnCd,
      hymnCost: this.hymnFree ? 0 : HYMN_COST,
      hymnReady: this.phase === "play" && this.hymnCd <= 0 && this.guardianT <= 0 && this.gold >= (this.hymnFree ? 0 : HYMN_COST),
      guardian: this.guardianT > 0,
      kills: this.kills,
      leaks: this.leaks,
      goldEarned: this.goldEarned,
      wavesCleared: this.wavesCleared,
      speed: this.speed,
      paused: this.paused,
      canCall,
      callLabel: canCall ? `Call march ${this.nextWave}` : this.phase === "play" ? "March on the road" : "The road is still",
      waveName: this.phase === "victory" ? "The gate holds" : (wave?.name ?? "Held"),
      waveIndex,
      waveCount: WAVES.length,
      preview: wavePreview(previewIndex),
      patron: hero?.name ?? "Unsworn",
      patronBonus: hero?.bonus ?? "",
      selected,
      creeps: this.creeps.length,
    };
  }
}

export { COLS, ROWS, PATH, mask as PATH_MASK };
