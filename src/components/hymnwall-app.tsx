import { BookOpen, Pause, Play } from "lucide-react";
import { useEffect, useRef, useState, type PointerEvent } from "react";
import { TOWERS } from "../game/content";
import { playEvent, unlockAudio } from "../game/audio";
import { RACE_ORDER, RACES, raceById } from "../game/lore";
import { draw } from "../game/render";
import { COLS, ROWS, Sim, type Hud } from "../game/sim";
import type { RaceId, TargetMode } from "../game/types";

type Screen = "title" | "codex" | "patron" | "battle";

declare global {
  interface Window {
    __hymn?: () => Hud;
  }
}

export function HymnwallApp() {
  const [screen, setScreen] = useState<Screen>("title");
  const [heroId, setHeroId] = useState<string | null>(null);
  const [best, setBest] = useState(0);

  useEffect(() => {
    try {
      setBest(Number(localStorage.getItem("hymnwall-best") || "0"));
    } catch {
      /* ignore */
    }
  }, []);

  return (
    <div className="app" data-screen={screen}>
      {screen === "title" ? (
        <Title
          best={best}
          onDefend={() => setScreen("patron")}
          onCodex={() => setScreen("codex")}
        />
      ) : null}
      {screen === "codex" || screen === "patron" ? (
        <Peoples
          mode={screen}
          onBack={() => setScreen("title")}
          onSwear={
            screen === "patron"
              ? (id) => {
                  setHeroId(id);
                  setScreen("battle");
                }
              : undefined
          }
        />
      ) : null}
      {screen === "battle" && heroId ? (
        <Battle heroId={heroId} onRetire={() => setScreen("patron")} onBest={(n) => setBest((b) => Math.max(b, n))} />
      ) : null}
    </div>
  );
}

function Title({ best, onDefend, onCodex }: { best: number; onDefend: () => void; onCodex: () => void }) {
  return (
    <main className="screen">
      <div className="title-wrap">
        <p className="kicker">The last gate</p>
        <h1>Hymnwall</h1>
        <p className="lede">
          Ten peoples hold one pale road. Place their crews beside the march, spend gold from what you kill,
          and speak a Hymn Word if the Lost Kings still answer.
        </p>
        <div className="row">
          <button className="btn btn-primary" onClick={onDefend}>
            Defend the gate
          </button>
          <button className="btn btn-ghost" onClick={onCodex}>
            Read the peoples
          </button>
        </div>
        {best > 0 ? <p className="meta">Furthest march held: {best} of 12</p> : <p className="meta">Twelve marches. Twenty lives. The road does not wait politely.</p>}
      </div>
    </main>
  );
}

function Peoples({
  mode,
  onBack,
  onSwear,
  embed = false,
}: {
  mode: "codex" | "patron";
  onBack: () => void;
  onSwear?: (id: string) => void;
  embed?: boolean;
}) {
  const [race, setRace] = useState<RaceId>("human");
  const [hero, setHero] = useState<string | null>(null);
  const profile = raceById(race);

  return (
    <main className={embed ? "embed" : "screen"}>
      <div className="book">
        <div className="book-head">
          <div>
            <p className="kicker">{mode === "patron" ? "Choose a patron" : "Codex"}</p>
            <h2>{mode === "patron" ? "Who holds your oath" : "The ten peoples"}</h2>
          </div>
          <button className="btn btn-ghost" onClick={onBack}>
            Back
          </button>
        </div>
        <div className="race-tabs" role="tablist" aria-label="Peoples">
          {RACES.map((r) => (
            <button
              key={r.id}
              className="race-tab"
              role="tab"
              aria-selected={r.id === race}
              aria-pressed={r.id === race}
              onClick={() => {
                setRace(r.id);
                setHero(null);
              }}
            >
              {r.name}
            </button>
          ))}
        </div>
        <div className="book-grid">
          <article className="panel">
            <p className="kicker">{profile.epithet}</p>
            <h2>{profile.name}</h2>
            {(mode === "codex" ? profile.lore : profile.lore.slice(0, 1)).map((p) => (
              <p key={p.slice(0, 24)}>{p}</p>
            ))}
            <p className="mark">Mark: {profile.mark}</p>
          </article>
          <div className="heroes">
            {profile.heroes.map((h) => (
              <button
                key={h.id}
                className="hero"
                aria-pressed={hero === h.id}
                onClick={() => setHero(h.id)}
              >
                <strong>{h.name}</strong>
                <span>{h.title}</span>
                {mode === "codex" ? <span>{h.blurb}</span> : null}
                <small>{h.bonus}</small>
              </button>
            ))}
            {onSwear ? (
              <button className="btn btn-primary" disabled={!hero} onClick={() => hero && onSwear(hero)}>
                Swear this banner
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </main>
  );
}

function Battle({
  heroId,
  onRetire,
  onBest,
}: {
  heroId: string;
  onRetire: () => void;
  onBest: (n: number) => void;
}) {
  const simRef = useRef<Sim | null>(null);
  if (!simRef.current || simRef.current.heroId !== heroId) simRef.current = new Sim(heroId);
  const sim = simRef.current;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hud, setHud] = useState<Hud>(() => sim.hud());
  const [codex, setCodex] = useState(false);
  const saved = useRef(false);

  useEffect(() => {
    window.__hymn = () => sim.hud();
    let frame = 0;
    let last = performance.now();
    let acc = 0;
    let lastPhase = sim.phase;
    const loop = (now: number) => {
      const raw = Math.min(0.05, (now - last) / 1000);
      last = now;
      sim.step(raw);
      const canvas = canvasRef.current;
      if (canvas) draw(canvas, sim);
      for (const ev of sim.drainEvents()) playEvent(ev);
      acc += raw;
      const phaseNow = sim.phase;
      if (acc > 0.12 || phaseNow !== lastPhase) {
        acc = 0;
        lastPhase = phaseNow;
        setHud(sim.hud());
      }
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    const onVis = () => {
      if (document.visibilityState === "visible") unlockAudio();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("visibilitychange", onVis);
      if (window.__hymn) delete window.__hymn;
    };
  }, [sim]);

  useEffect(() => {
    if ((hud.phase === "victory" || hud.phase === "defeat") && !saved.current) {
      saved.current = true;
      onBest(hud.wavesCleared);
      try {
        const prev = Number(localStorage.getItem("hymnwall-best") || "0");
        if (hud.wavesCleared > prev) localStorage.setItem("hymnwall-best", String(hud.wavesCleared));
      } catch {
        /* ignore */
      }
    }
  }, [hud.phase, hud.wavesCleared, onBest]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "BUTTON" || tag === "A" || tag === "INPUT") return;
      if (e.key === " ") {
        e.preventDefault();
        sim.callWave();
        setHud(sim.hud());
      } else if (e.key === "p") {
        sim.togglePause();
        setHud(sim.hud());
      } else if (e.key === "Escape") {
        if (sim.armed) sim.armed = null;
        else if (sim.selectedId) sim.selectedId = null;
        else sim.togglePause();
        setHud(sim.hud());
      } else if (e.key >= "1" && e.key <= "9") {
        const race = RACE_ORDER[Number(e.key) - 1];
        if (race) sim.arm(race);
        setHud(sim.hud());
      } else if (e.key === "0") {
        const race = RACE_ORDER[9];
        if (race) sim.arm(race);
        setHud(sim.hud());
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sim]);

  function sync() {
    setHud(sim.hud());
  }

  function cellOf(e: PointerEvent<HTMLCanvasElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * COLS;
    const y = ((e.clientY - rect.top) / rect.height) * ROWS;
    return { c: Math.floor(x), r: Math.floor(y) };
  }

  const ended = hud.phase !== "play";

  return (
    <div className="battle">
      <header className="topbar">
        <div className="stat" aria-label="Lives remaining">
          <span>Lives</span>
          <b>
            {hud.lives}
            <span>/{hud.maxLives}</span>
          </b>
        </div>
        <div className="stat" aria-label="Gold">
          <span>Gold</span>
          <b>{hud.gold}</b>
        </div>
        <div className="stat">
          <span>March</span>
          <b>
            {hud.waveIndex}/{hud.waveCount}
          </b>
        </div>
        <div className="grow" />
        <button
          className="icon-btn"
          aria-label={hud.paused ? "Resume" : "Pause"}
          onClick={() => {
            sim.togglePause();
            sync();
          }}
        >
          {hud.paused ? <Play size={18} /> : <Pause size={18} />}
        </button>
        <button
          className="btn btn-ghost"
          onClick={() => {
            sim.speed = sim.speed === 1 ? 2 : 1;
            sync();
          }}
        >
          {hud.speed === 1 ? "Speed 1×" : "Speed 2×"}
        </button>
        <button
          className="icon-btn"
          aria-label="Open codex"
          onClick={() => {
            sim.paused = true;
            setCodex(true);
            sync();
          }}
        >
          <BookOpen size={18} />
        </button>
      </header>
      <div className="stage">
        <div className="board-wrap">
          <canvas
            ref={canvasRef}
            className="board"
            aria-label="Hymnwall battlefield"
            onPointerDown={(e) => {
              unlockAudio();
              e.currentTarget.setPointerCapture(e.pointerId);
              const cell = cellOf(e);
              sim.clickCell(cell.c, cell.r);
              sync();
            }}
            onPointerMove={(e) => {
              const cell = cellOf(e);
              sim.setHover(cell.c, cell.r);
            }}
            onPointerLeave={() => sim.clearHover()}
          />
        </div>
        <aside className="side">
          <p className="patron-line">
            Patron {hud.patron}. {hud.patronBonus}
          </p>
          <div className="actions">
            <button
              className="btn btn-primary"
              disabled={!hud.canCall}
              onClick={() => {
                unlockAudio();
                sim.callWave();
                sync();
              }}
            >
              {hud.callLabel}
            </button>
            <button
              className="btn btn-ghost"
              disabled={!hud.hymnReady}
              onClick={() => {
                unlockAudio();
                sim.castHymn();
                sync();
              }}
            >
              {hud.guardian ? "Wings are out" : hud.hymnCd > 0 ? `Hymn ${Math.ceil(hud.hymnCd)}s` : `Hymn Word · ${hud.hymnCost === 0 ? "free" : hud.hymnCost}`}
            </button>
          </div>
          <p className="note">{hud.note || hud.waveName}</p>
          <p className="preview">{hud.canCall ? `Next: ${hud.preview}` : hud.preview}</p>
          <div className="tower-list" role="list" aria-label="Tower crews">
            {RACE_ORDER.map((race) => {
              const def = TOWERS[race];
              const cost = sim.towerCost(race);
              const afford = hud.gold >= cost;
              return (
                <button
                  key={race}
                  className="tower-btn"
                  role="listitem"
                  aria-pressed={hud.armed === race}
                  disabled={!afford && hud.armed !== race}
                  onClick={() => {
                    unlockAudio();
                    sim.arm(race);
                    sync();
                  }}
                >
                  <span className="tower-name">{def.name}</span>
                  <span className="tower-cost">{cost}</span>
                  <span className="tower-meta">
                    {raceById(race).name} · {def.special} · range {def.range}
                  </span>
                </button>
              );
            })}
          </div>
          {hud.selected ? (
            <div className="select-panel">
              <h3>
                {hud.selected.name} · rank {hud.selected.level}
              </h3>
              <p className="preview">
                {hud.selected.raceName} · {hud.selected.dmg} damage · {hud.selected.rate}/s · range {hud.selected.range} · {hud.selected.special}
              </p>
              <div className="modes" role="group" aria-label="Targeting">
                {(
                  [
                    ["first", "Foremost"],
                    ["closest", "Nearest"],
                    ["strongest", "Strongest"],
                  ] as [TargetMode, string][]
                ).map(([mode, label]) => (
                  <button
                    key={mode}
                    aria-pressed={hud.selected?.mode === mode}
                    onClick={() => {
                      sim.setMode(mode);
                      sync();
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="actions">
                <button
                  className="btn btn-primary"
                  disabled={hud.selected.upgradeCost === null || hud.gold < (hud.selected.upgradeCost ?? 0)}
                  onClick={() => {
                    unlockAudio();
                    sim.upgradeSelected();
                    sync();
                  }}
                >
                  {hud.selected.upgradeCost === null
                    ? "Rank three"
                    : hud.selected.upgradeCost === 0
                      ? "Upgrade · free"
                      : `Upgrade · ${hud.selected.upgradeCost}`}
                </button>
                <button
                  className="btn btn-ghost"
                  onClick={() => {
                    unlockAudio();
                    sim.sellSelected();
                    sync();
                  }}
                >
                  Sell · {hud.selected.sell}
                </button>
              </div>
            </div>
          ) : (
            <p className="preview">Tap a crew, then a stone beside the road. Upgrades raise damage and rate of fire. Keys 1–0 arm crews. Space calls the march.</p>
          )}
        </aside>
      </div>
      <p className="sr-only" aria-live="polite">
        {ended ? (hud.phase === "victory" ? "Victory. The gate holds." : "Defeat. The road is broken.") : `${hud.lives} lives, ${hud.gold} gold, march ${hud.waveIndex}`}
      </p>
      {ended ? (
        <div className="overlay" role="dialog" aria-modal="true" aria-labelledby="end-title">
          <div className="modal">
            <p className="kicker">{hud.phase === "victory" ? "Victory" : "The gate fails"}</p>
            <h2 id="end-title">{hud.phase === "victory" ? "The gate holds." : "The road is broken."}</h2>
            <p>
              {hud.phase === "victory"
                ? "Twelve marches spent themselves on the Hymnwall. The word, for now, keeps."
                : "Something reached the far arch. The crews can be called again."}
            </p>
            <dl className="stats-end">
              <div>
                <dt>Marches held</dt>
                <dd>{hud.wavesCleared}</dd>
              </div>
              <div>
                <dt>Kills</dt>
                <dd>{hud.kills}</dd>
              </div>
              <div>
                <dt>Gold earned</dt>
                <dd>{hud.goldEarned}</dd>
              </div>
              <div>
                <dt>Leaks</dt>
                <dd>{hud.leaks}</dd>
              </div>
            </dl>
            <div className="actions">
              <button
                className="btn btn-primary"
                onClick={() => {
                  saved.current = false;
                  sim.reset();
                  sync();
                }}
              >
                Defend again
              </button>
              <button className="btn btn-ghost" onClick={onRetire}>
                Another patron
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {codex && !ended ? (
        <div className="overlay">
          <div className="modal modal-wide">
            <Peoples
              mode="codex"
              embed
              onBack={() => {
                setCodex(false);
                sim.paused = false;
                sync();
              }}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
