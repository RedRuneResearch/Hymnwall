import { TOWERS } from "./content";
import { PATH, WAYPOINTS } from "./path";
import { COLS, ROWS, isPath, type Sim } from "./sim";
import type { RaceId } from "./types";

const INK: Record<RaceId, { body: string; trim: string; dark: string }> = {
  human: { body: "#cfc6b6", trim: "#8d8678", dark: "#3a3832" },
  aelf: { body: "#d5e4ec", trim: "#7f9aab", dark: "#24343d" },
  dwarf: { body: "#d2b089", trim: "#8a5a38", dark: "#3a2618" },
  kithkin: { body: "#ead7b0", trim: "#a78458", dark: "#3d2e1c" },
  drakken: { body: "#d56a4e", trim: "#f0c2a8", dark: "#4a2218" },
  ork: { body: "#8ea06a", trim: "#d7d0b0", dark: "#24301c" },
  vaelfling: { body: "#c86d6d", trim: "#e7c2b4", dark: "#3d1e22" },
  halar: { body: "#efe8d8", trim: "#cbb98a", dark: "#3a3428" },
  xenoark: { body: "#1d2624", trim: "#8eae86", dark: "#0e1412" },
  mechforged: { body: "#9aa6b2", trim: "#d5dde4", dark: "#2a3440" },
};

function tileColor(c: number, r: number, path: boolean) {
  const n = Math.sin(c * 127.1 + r * 311.7) * 43758.5453;
  const h = n - Math.floor(n);
  if (path) return h > 0.5 ? "#171b22" : "#14181e";
  return h > 0.66 ? "#222833" : h > 0.33 ? "#1c222b" : "#191e26";
}

export function draw(canvas: HTMLCanvasElement, sim: Sim) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const w = Math.max(1, Math.round(rect.width * dpr));
  const h = Math.max(1, Math.round(rect.height * dpr));
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
  const shake = sim.shake;
  const sx = shake > 0 ? (Math.sin(sim.time * 48) * shake * w) / 140 : 0;
  const sy = shake > 0 ? (Math.cos(sim.time * 41) * shake * h) / 180 : 0;

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "#101318";
  ctx.fillRect(0, 0, w, h);
  ctx.setTransform(w / COLS, 0, 0, h / ROWS, sx, sy);

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      ctx.fillStyle = tileColor(c, r, isPath(c, r));
      ctx.fillRect(c + 0.03, r + 0.03, 0.94, 0.94);
    }
  }

  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(WAYPOINTS[0]!.x, WAYPOINTS[0]!.y);
  for (let i = 1; i < WAYPOINTS.length; i++) ctx.lineTo(WAYPOINTS[i]!.x, WAYPOINTS[i]!.y);
  ctx.strokeStyle = "#0c0e12";
  ctx.lineWidth = 0.86;
  ctx.stroke();
  ctx.strokeStyle = "#2a313c";
  ctx.lineWidth = 0.62;
  ctx.stroke();
  ctx.strokeStyle = "rgba(159, 176, 188, 0.85)";
  ctx.lineWidth = 0.045;
  ctx.stroke();

  ctx.fillStyle = "#9aa8b4";
  ctx.font = "600 0.28px Outfit, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("Breach", 0.12, 1.15);
  ctx.textAlign = "right";
  ctx.fillText("Gate", 15.85, 7.15);

  ctx.fillStyle = "#0e1218";
  roundRect(ctx, 14.55, 6.85, 1.35, 1.3, 0.08);
  ctx.fill();
  ctx.strokeStyle = "#9aab8c";
  ctx.lineWidth = 0.04;
  ctx.stroke();

  const armed = sim.armed;
  const hover = sim.hover;
  if (armed && hover && !isPath(hover.c, hover.r) && !sim.towers.some((t) => t.c === hover.c && t.r === hover.r)) {
    const range = TOWERS[armed].range * (sim.mods.range[armed] ?? 1);
    ring(ctx, hover.c + 0.5, hover.r + 0.5, range, "rgba(215, 211, 200, 0.08)", "rgba(215, 211, 200, 0.45)");
    ctx.globalAlpha = 0.55;
    drawTower(ctx, armed, 1, -Math.PI / 2, hover.c + 0.5, hover.r + 0.5);
    ctx.globalAlpha = 1;
  } else if (hover && isPath(hover.c, hover.r) && armed) {
    ctx.strokeStyle = "rgba(196, 92, 74, 0.8)";
    ctx.lineWidth = 0.05;
    ctx.strokeRect(hover.c + 0.08, hover.r + 0.08, 0.84, 0.84);
  }

  const selected = sim.towers.find((t) => t.id === sim.selectedId);
  if (selected) {
    ring(ctx, selected.c + 0.5, selected.r + 0.5, towerRange(sim, selected.race), "rgba(215, 211, 200, 0.07)", "rgba(215, 211, 200, 0.7)");
  }

  if (sim.guardianT > 0) drawGuardian(ctx, sim.guardianAngle, sim.guardianT);

  for (const b of sim.beams) {
    ctx.strokeStyle = INK[b.race].trim;
    ctx.globalAlpha = Math.max(0, b.life / 0.12);
    ctx.lineWidth = b.race === "mechforged" ? 0.07 : 0.04;
    ctx.beginPath();
    ctx.moveTo(b.x1, b.y1);
    ctx.lineTo(b.x2, b.y2);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  for (const s of sim.shots) {
    const ink = INK[s.race];
    ctx.fillStyle = ink.trim;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.race === "dwarf" ? 0.1 : 0.06, 0, Math.PI * 2);
    ctx.fill();
  }

  for (const c of sim.creeps) {
    const p = pointOn(c.dist);
    drawCreep(ctx, c.race, p.x, p.y, Math.atan2(p.dy, p.dx), c.scale, c.boss, c.flash > 0, c.hp / c.maxHp, c.poisonStacks > 0, c.burnT > 0);
    if (c.boss) drawBossBar(ctx, c.name, c.hp / c.maxHp);
  }

  for (const t of sim.towers) {
    const mark = t.id === sim.selectedId;
    drawTower(ctx, t.race, t.level, t.angle, t.c + 0.5, t.r + 0.5);
    if (mark) {
      ctx.strokeStyle = "rgba(231, 228, 220, 0.9)";
      ctx.lineWidth = 0.035;
      ctx.strokeRect(t.c + 0.12, t.r + 0.12, 0.76, 0.76);
    }
  }

  for (const p of sim.particles) {
    ctx.globalAlpha = Math.max(0, p.life / p.max);
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x, p.y, 0.05, 0.05);
  }
  ctx.globalAlpha = 1;

  ctx.font = "600 0.26px Outfit, sans-serif";
  ctx.textAlign = "center";
  for (const f of sim.floats) {
    ctx.globalAlpha = Math.max(0, f.life / f.max);
    ctx.fillStyle = f.bad ? "#c45c4a" : "#e7e4dc";
    ctx.fillText(f.text, f.x, f.y - (1 - f.life / f.max) * 0.3);
  }
  ctx.globalAlpha = 1;
}

function pointOn(dist: number) {
  const d = Math.max(0, Math.min(PATH.length, dist));
  const last = PATH.segs[PATH.segs.length - 1]!;
  for (const s of PATH.segs) {
    if (d <= s.start + s.len || s === last) {
      const t = s.len === 0 ? 0 : Math.max(0, Math.min(1, (d - s.start) / s.len));
      return { x: s.x + (s.bx - s.x) * t, y: s.y + (s.by - s.y) * t, dx: s.dx, dy: s.dy };
    }
  }
  return { x: last.bx, y: last.by, dx: last.dx, dy: last.dy };
}

function towerRange(sim: Sim, race: RaceId) {
  return TOWERS[race].range * (sim.mods.range[race] ?? 1);
}

function ring(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, fill: string, stroke: string) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.lineWidth = 0.03;
  ctx.strokeStyle = stroke;
  ctx.stroke();
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawTower(ctx: CanvasRenderingContext2D, race: RaceId, level: number, angle: number, x: number, y: number) {
  const ink = INK[race];
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = "rgba(0,0,0,0.28)";
  ctx.beginPath();
  ctx.ellipse(0, 0.22, 0.28, 0.1, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#2a3038";
  roundRect(ctx, -0.28, -0.16, 0.56, 0.38, 0.04);
  ctx.fill();
  ctx.fillStyle = ink.dark;
  ctx.fillRect(-0.22, -0.08, 0.44, 0.22);

  ctx.save();
  ctx.rotate(angle);
  ctx.fillStyle = ink.body;
  if (race === "dwarf") {
    roundRect(ctx, -0.08, -0.16, 0.34, 0.2, 0.03);
    ctx.fill();
    ctx.fillStyle = ink.trim;
    ctx.fillRect(0.18, -0.1, 0.16, 0.08);
  } else if (race === "mechforged") {
    ctx.fillRect(-0.06, -0.08, 0.34, 0.12);
    ctx.fillStyle = ink.trim;
    ctx.beginPath();
    ctx.arc(0.28, -0.02, 0.07, 0, Math.PI * 2);
    ctx.fill();
  } else if (race === "kithkin") {
    ctx.fillRect(-0.04, -0.06, 0.22, 0.08);
    ctx.beginPath();
    ctx.moveTo(0.16, -0.08);
    ctx.lineTo(0.32, -0.02);
    ctx.lineTo(0.16, 0.04);
    ctx.fill();
  } else if (race === "ork") {
    roundRect(ctx, -0.1, -0.14, 0.28, 0.26, 0.04);
    ctx.fill();
  } else if (race === "drakken") {
    ctx.beginPath();
    ctx.moveTo(0.28, 0);
    ctx.lineTo(-0.08, -0.12);
    ctx.lineTo(-0.08, 0.12);
    ctx.fill();
  } else if (race === "xenoark") {
    ctx.beginPath();
    ctx.ellipse(0.08, 0, 0.22, 0.08, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = ink.trim;
    ctx.fillRect(0.22, -0.02, 0.12, 0.04);
  } else if (race === "halar") {
    ctx.fillRect(-0.04, -0.05, 0.26, 0.08);
    ctx.strokeStyle = ink.trim;
    ctx.lineWidth = 0.03;
    ctx.beginPath();
    ctx.arc(0.02, -0.16, 0.08, 0, Math.PI * 2);
    ctx.stroke();
  } else if (race === "aelf") {
    ctx.fillRect(-0.02, -0.035, 0.36, 0.05);
  } else if (race === "vaelfling") {
    ctx.fillRect(-0.04, -0.05, 0.24, 0.08);
    ctx.fillStyle = ink.trim;
    ctx.beginPath();
    ctx.moveTo(0.2, 0);
    ctx.lineTo(0.34, -0.06);
    ctx.lineTo(0.34, 0.06);
    ctx.fill();
  } else {
    ctx.fillRect(-0.04, -0.05, 0.28, 0.08);
  }
  ctx.restore();

  ctx.fillStyle = ink.trim;
  for (let i = 0; i < level; i++) {
    ctx.fillRect(-0.16 + i * 0.12, -0.28, 0.08, 0.06);
  }
  ctx.restore();
}

function drawCreep(
  ctx: CanvasRenderingContext2D,
  race: RaceId,
  x: number,
  y: number,
  ang: number,
  scale: number,
  boss: boolean,
  flash: boolean,
  hp: number,
  poison: boolean,
  burn: boolean,
) {
  const ink = INK[race];
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = "rgba(0,0,0,0.3)";
  ctx.beginPath();
  ctx.ellipse(0, 0.16 * scale, 0.2 * scale, 0.07 * scale, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.rotate(ang);
  ctx.scale(scale, scale);
  ctx.fillStyle = flash ? "#f4f1ea" : ink.body;
  ctx.strokeStyle = ink.trim;
  ctx.lineWidth = 0.03;

  if (race === "human") {
    roundRect(ctx, -0.12, -0.1, 0.28, 0.2, 0.04);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0.12, 0, 0.09, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(0.16, -0.02, 0.16, 0.04);
  } else if (race === "aelf") {
    roundRect(ctx, -0.08, -0.07, 0.32, 0.14, 0.06);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(0.08, -0.07);
    ctx.lineTo(0.14, -0.16);
    ctx.lineTo(0.16, -0.07);
    ctx.fill();
    ctx.fillRect(0.18, -0.015, 0.2, 0.03);
  } else if (race === "dwarf") {
    roundRect(ctx, -0.16, -0.12, 0.32, 0.24, 0.04);
    ctx.fill();
    ctx.fillStyle = ink.trim;
    ctx.fillRect(-0.04, -0.02, 0.16, 0.1);
    ctx.fillStyle = flash ? "#f4f1ea" : ink.body;
    ctx.beginPath();
    ctx.arc(0.12, -0.02, 0.09, 0, Math.PI * 2);
    ctx.fill();
  } else if (race === "kithkin") {
    ctx.beginPath();
    ctx.ellipse(0, 0, 0.16, 0.1, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(0.02, -0.08);
    ctx.lineTo(0.06, -0.2);
    ctx.lineTo(0.12, -0.06);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-0.08, 0.04);
    ctx.quadraticCurveTo(-0.22, 0.12, -0.16, 0.18);
    ctx.stroke();
  } else if (race === "drakken") {
    ctx.beginPath();
    ctx.ellipse(0, 0, 0.18, 0.11, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(0.12, -0.06);
    ctx.lineTo(0.22, -0.16);
    ctx.lineTo(0.2, -0.02);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(0.05, -0.08);
    ctx.lineTo(-0.05, -0.2);
    ctx.lineTo(-0.12, -0.05);
    ctx.fill();
    ctx.fillRect(0.12, -0.03, 0.16, 0.05);
  } else if (race === "ork") {
    roundRect(ctx, -0.16, -0.13, 0.34, 0.26, 0.05);
    ctx.fill();
    ctx.fillStyle = ink.trim;
    ctx.fillRect(0.12, 0.02, 0.08, 0.04);
    ctx.fillRect(0.12, -0.06, 0.07, 0.035);
  } else if (race === "vaelfling") {
    roundRect(ctx, -0.1, -0.09, 0.26, 0.18, 0.06);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(0.02, -0.08);
    ctx.lineTo(0.08, -0.2);
    ctx.lineTo(0.12, -0.06);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-0.1, 0.06);
    ctx.quadraticCurveTo(-0.24, 0.1, -0.18, 0.16);
    ctx.stroke();
  } else if (race === "halar") {
    roundRect(ctx, -0.1, -0.1, 0.26, 0.2, 0.05);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(-0.02, -0.02, 0.16, 0.06, -0.8, 0, Math.PI * 2);
    ctx.ellipse(-0.02, 0.02, 0.16, 0.06, 0.8, 0, Math.PI * 2);
    ctx.fill();
  } else if (race === "xenoark") {
    ctx.beginPath();
    ctx.ellipse(0, 0, 0.2, 0.09, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(0.16, 0, 0.12, 0.07, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = ink.trim;
    ctx.fillRect(0.24, -0.015, 0.1, 0.03);
    ctx.beginPath();
    ctx.moveTo(-0.16, 0);
    ctx.lineTo(-0.32, 0.08);
    ctx.stroke();
  } else {
    roundRect(ctx, -0.16, -0.1, 0.32, 0.2, 0.03);
    ctx.fill();
    ctx.fillStyle = ink.dark;
    ctx.fillRect(-0.06, -0.04, 0.12, 0.08);
    ctx.fillStyle = ink.trim;
    ctx.fillRect(0.14, -0.03, 0.08, 0.06);
  }
  ctx.restore();

  if (race === "halar") {
    ctx.strokeStyle = ink.trim;
    ctx.lineWidth = 0.03;
    ctx.beginPath();
    ctx.arc(x, y - 0.28 * scale, 0.1 * scale, 0, Math.PI * 2);
    ctx.stroke();
  }

  const bw = 0.46 * scale;
  const by = y - 0.38 * scale;
  ctx.fillStyle = "#0c0e12";
  ctx.fillRect(x - bw / 2, by, bw, 0.06);
  ctx.fillStyle = hp < 0.35 ? "#c45c4a" : ink.trim;
  ctx.fillRect(x - bw / 2, by, bw * Math.max(0, hp), 0.06);
  if (poison) {
    ctx.fillStyle = "#8eae86";
    ctx.fillRect(x - bw / 2, by + 0.07, 0.08, 0.04);
  }
  if (burn) {
    ctx.fillStyle = "#d56a4e";
    ctx.fillRect(x - bw / 2 + 0.1, by + 0.07, 0.08, 0.04);
  }
  if (boss) {
    ctx.strokeStyle = ink.trim;
    ctx.lineWidth = 0.03;
    ctx.strokeRect(x - bw / 2 - 0.02, by - 0.02, bw + 0.04, 0.1);
  }
}

function drawGuardian(ctx: CanvasRenderingContext2D, angle: number, time: number) {
  const x = 8 + Math.cos(angle) * 0.35;
  const y = 4.15 + Math.sin(angle) * 0.18;
  const ink = INK.halar;
  ctx.save();
  ctx.translate(x, y);
  ctx.globalAlpha = 0.35 + 0.15 * Math.sin(time * 6);
  ctx.fillStyle = ink.trim;
  ctx.beginPath();
  ctx.ellipse(-0.05, -0.15, 0.55, 0.16, -0.7, 0, Math.PI * 2);
  ctx.ellipse(-0.05, 0.15, 0.55, 0.16, 0.7, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.fillStyle = ink.body;
  roundRect(ctx, -0.12, -0.16, 0.28, 0.32, 0.06);
  ctx.fill();
  ctx.strokeStyle = ink.trim;
  ctx.lineWidth = 0.035;
  ctx.beginPath();
  ctx.arc(0.02, -0.32, 0.12, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawBossBar(ctx: CanvasRenderingContext2D, name: string, hp: number) {
  ctx.fillStyle = "rgba(12,14,18,0.85)";
  roundRect(ctx, 4.2, 0.18, 7.6, 0.55, 0.08);
  ctx.fill();
  ctx.fillStyle = "#e7e4dc";
  ctx.font = "600 0.24px Outfit, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(name, 4.4, 0.42);
  ctx.fillStyle = "#2a3038";
  ctx.fillRect(4.4, 0.48, 7.2, 0.12);
  ctx.fillStyle = "#8eae86";
  ctx.fillRect(4.4, 0.48, 7.2 * Math.max(0, hp), 0.12);
}
