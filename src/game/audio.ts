let ctx: AudioContext | null = null;

export function unlockAudio() {
  if (typeof window === "undefined") return;
  if (!ctx) ctx = new AudioContext();
  if (ctx.state === "suspended") void ctx.resume();
}

function beep(freq: number, dur: number, gain: number, type: OscillatorType, delay = 0) {
  if (!ctx) return;
  const t = ctx.currentTime + delay;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g);
  g.connect(ctx.destination);
  o.start(t);
  o.stop(t + dur + 0.02);
}

export function playEvent(kind: string) {
  if (!ctx) return;
  switch (kind) {
    case "place":
      beep(196, 0.07, 0.04, "triangle");
      beep(330, 0.09, 0.03, "sine", 0.05);
      break;
    case "upgrade":
      beep(392, 0.08, 0.035, "sine");
      beep(523, 0.1, 0.03, "sine", 0.06);
      break;
    case "sell":
      beep(240, 0.08, 0.03, "triangle");
      break;
    case "wave":
      beep(146, 0.12, 0.04, "sine");
      beep(196, 0.14, 0.03, "sine", 0.08);
      break;
    case "leak":
      beep(90, 0.18, 0.05, "square");
      break;
    case "hymn":
      beep(440, 0.12, 0.03, "sine");
      beep(554, 0.14, 0.03, "sine", 0.08);
      beep(659, 0.2, 0.028, "sine", 0.16);
      break;
    case "victory":
      beep(392, 0.12, 0.035, "sine");
      beep(494, 0.12, 0.03, "sine", 0.1);
      beep(587, 0.22, 0.03, "sine", 0.2);
      break;
    case "defeat":
      beep(130, 0.22, 0.04, "triangle");
      beep(98, 0.28, 0.035, "triangle", 0.12);
      break;
    default:
      break;
  }
}
