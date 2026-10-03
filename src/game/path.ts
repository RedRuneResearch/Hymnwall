export const COLS = 16;
export const ROWS = 10;

export type Pt = { x: number; y: number };

export const WAYPOINTS: Pt[] = [
  { x: -0.6, y: 1.5 },
  { x: 13.5, y: 1.5 },
  { x: 13.5, y: 4.5 },
  { x: 2.5, y: 4.5 },
  { x: 2.5, y: 7.5 },
  { x: 16.35, y: 7.5 },
];

type Seg = Pt & {
  bx: number;
  by: number;
  len: number;
  start: number;
  dx: number;
  dy: number;
};

function build() {
  const segs: Seg[] = [];
  let acc = 0;
  for (let i = 0; i < WAYPOINTS.length - 1; i++) {
    const a = WAYPOINTS[i]!;
    const b = WAYPOINTS[i + 1]!;
    const len = Math.hypot(b.x - a.x, b.y - a.y);
    segs.push({
      x: a.x,
      y: a.y,
      bx: b.x,
      by: b.y,
      len,
      start: acc,
      dx: (b.x - a.x) / len,
      dy: (b.y - a.y) / len,
    });
    acc += len;
  }
  return { segs, length: acc };
}

export const PATH = build();

export function pointAt(dist: number): { x: number; y: number; dx: number; dy: number } {
  const d = Math.max(0, Math.min(PATH.length, dist));
  const last = PATH.segs[PATH.segs.length - 1]!;
  for (const s of PATH.segs) {
    if (d <= s.start + s.len || s === last) {
      const t = s.len === 0 ? 0 : Math.max(0, Math.min(1, (d - s.start) / s.len));
      return {
        x: s.x + (s.bx - s.x) * t,
        y: s.y + (s.by - s.y) * t,
        dx: s.dx,
        dy: s.dy,
      };
    }
  }
  return { x: last.bx, y: last.by, dx: last.dx, dy: last.dy };
}

export function buildPathMask(): boolean[][] {
  const mask = Array.from({ length: ROWS }, () => Array<boolean>(COLS).fill(false));
  const step = 0.04;
  for (const s of PATH.segs) {
    const n = Math.max(1, Math.ceil(s.len / step));
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const x = s.x + (s.bx - s.x) * t;
      const y = s.y + (s.by - s.y) * t;
      const c = Math.floor(x);
      const r = Math.floor(y);
      if (c >= 0 && r >= 0 && c < COLS && r < ROWS) mask[r]![c] = true;
    }
  }
  return mask;
}
