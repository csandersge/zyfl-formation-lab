"use client";

import { useEffect, useMemo, useState } from "react";

type Tab = "play" | "team" | "help";
type Phase = 1 | 2;
type PlayerLabel = "Y" | "X" | "Z";
type FormationName = "Right" | "Left" | "Rip" | "Liz" | "Rock" | "Lex";
type Cell = `${number}-${number}`;
type HelmetId = "basic" | "stripe" | "wing" | "lightning";
type Mastery = Record<FormationName, number>;

const FORMATION_NAMES: FormationName[] = ["Right", "Rip", "Rock", "Left", "Liz", "Lex"];
const EMPTY_MASTERY: Mastery = { Right: 0, Rip: 0, Rock: 0, Left: 0, Liz: 0, Lex: 0 };
const PLAYER_ORDER: PlayerLabel[] = ["Y", "X", "Z"];

const FORMATIONS: Record<FormationName, {
  players: Record<PlayerLabel, Cell>;
  explanation: string;
  short: string;
}> = {
  Right: {
    players: { Y: "1-13", X: "1-2", Z: "2-18" },
    explanation: "Right: Y is a TE right, X is wide left on the ball, and Z is wide right off the ball.",
    short: "TE right",
  },
  Left: {
    players: { Y: "1-7", X: "2-2", Z: "1-18" },
    explanation: "Left: Y is a TE left, X is wide left off the ball, and Z is wide right on the ball.",
    short: "TE left",
  },
  Rip: {
    players: { Y: "2-13", X: "1-2", Z: "1-18" },
    explanation: "Rip: Y is a wing back on the right outside hip of the tackle; X and Z are wide.",
    short: "Wing right",
  },
  Liz: {
    players: { Y: "2-7", X: "1-2", Z: "1-18" },
    explanation: "Liz: Y is a wing back on the left outside hip of the tackle; X and Z are wide.",
    short: "Wing left",
  },
  Rock: {
    players: { Y: "2-16", X: "1-2", Z: "1-18" },
    explanation: "Rock: Y is the slot receiver to the right; X and Z are wide.",
    short: "Slot right",
  },
  Lex: {
    players: { Y: "2-4", X: "1-2", Z: "1-18" },
    explanation: "Lex: Y is the slot receiver to the left; X and Z are wide.",
    short: "Slot left",
  },
};

const SELECTABLE: Cell[] = [
  "1-2", "1-4", "1-7", "1-13", "1-16", "1-18",
  "2-2", "2-4", "2-7", "2-13", "2-16", "2-18",
  "6-8", "6-12",
];
const LANDMARKS = [
  { label: "9", after: 2 }, { label: "7", after: 6 }, { label: "5", after: 7 },
  { label: "3", after: 8 }, { label: "1", after: 9 }, { label: "0", after: 10 },
  { label: "2", after: 11 }, { label: "4", after: 12 }, { label: "6", after: 13 },
  { label: "8", after: 17 },
];
const FIXED = [
  { label: "LT", row: 1, col: 8 }, { label: "LG", row: 1, col: 9 },
  { label: "C", row: 1, col: 10 }, { label: "RG", row: 1, col: 11 },
  { label: "RT", row: 1, col: 12 }, { label: "QB", row: 4, col: 10 },
  { label: "F", row: 6, col: 10 },
];
const HELMETS: { id: HelmetId; name: string; cost: number }[] = [
  { id: "basic", name: "Basic", cost: 0 },
  { id: "stripe", name: "Stripe", cost: 30 },
  { id: "wing", name: "Wing", cost: 60 },
  { id: "lightning", name: "Lightning", cost: 100 },
];

function clampMastery(value: unknown): number {
  return typeof value === "number" ? Math.max(0, Math.min(5, Math.floor(value))) : 0;
}

function readMastery(value: unknown): Mastery {
  const source = value && typeof value === "object" ? value as Partial<Mastery> : {};
  return Object.fromEntries(FORMATION_NAMES.map((name) => [name, clampMastery(source[name])])) as Mastery;
}

function phaseMastered(mastery: Mastery) {
  return FORMATION_NAMES.every((name) => mastery[name] >= 5);
}

function pickWeightedFormation(mastery: Mastery, previous?: FormationName, repeatCount = 0) {
  const pool = FORMATION_NAMES.flatMap((name) => {
    if (name === previous && repeatCount >= 2) return [];
    const weight = mastery[name] >= 5 ? 1 : 6 - mastery[name];
    return Array.from({ length: weight }, () => name);
  });
  return pool[Math.floor(Math.random() * pool.length)] ?? "Right";
}

export default function Home() {
  const [tab, setTab] = useState<Tab>("play");
  const [phase, setPhase] = useState<Phase>(1);
  const [formation, setFormation] = useState<FormationName>("Right");
  const [repeatCount, setRepeatCount] = useState(1);
  const [currentPlayer, setCurrentPlayer] = useState<PlayerLabel>("Y");
  const [placements, setPlacements] = useState<Partial<Record<PlayerLabel, Cell>>>({});
  const [selected, setSelected] = useState<Cell | null>(null);
  const [answered, setAnswered] = useState(false);
  const [resultCorrect, setResultCorrect] = useState<boolean | null>(null);
  const [p1Mastery, setP1Mastery] = useState<Mastery>(EMPTY_MASTERY);
  const [p2Mastery, setP2Mastery] = useState<Mastery>(EMPTY_MASTERY);
  const [phase2Unlocked, setPhase2Unlocked] = useState(false);
  const [celebration, setCelebration] = useState<string | null>(null);
  const [coins, setCoins] = useState(0);
  const [teamName, setTeamName] = useState("My Team");
  const [primary, setPrimary] = useState("#18a957");
  const [secondary, setSecondary] = useState("#f4c542");
  const [unlocked, setUnlocked] = useState<HelmetId[]>(["basic"]);
  const [helmet, setHelmet] = useState<HelmetId>("basic");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("zyfl-progress") || "{}");
      const savedP1 = readMastery(saved.phase1Mastery);
      const savedP2 = readMastery(saved.phase2Mastery);
      setP1Mastery(savedP1);
      setP2Mastery(savedP2);
      setPhase2Unlocked(Boolean(saved.phase2Unlocked) || phaseMastered(savedP1));
      if (typeof saved.coins === "number") setCoins(saved.coins);
      if (typeof saved.teamName === "string") setTeamName(saved.teamName);
      if (typeof saved.primary === "string") setPrimary(saved.primary);
      if (typeof saved.secondary === "string") setSecondary(saved.secondary);
      if (Array.isArray(saved.unlocked)) setUnlocked(saved.unlocked);
      if (typeof saved.helmet === "string") setHelmet(saved.helmet);
      setFormation(pickWeightedFormation(savedP1));
    } catch {
      setFormation(pickWeightedFormation(EMPTY_MASTERY));
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem("zyfl-progress", JSON.stringify({
      version: 2,
      phase1Mastery: p1Mastery,
      phase1Mastered: phaseMastered(p1Mastery),
      phase2Unlocked,
      phase2Mastery: p2Mastery,
      phase2Mastered: phaseMastered(p2Mastery),
      coins, teamName, primary, secondary, unlocked, helmet,
    }));
  }, [p1Mastery, p2Mastery, phase2Unlocked, coins, teamName, primary, secondary, unlocked, helmet, ready]);

  useEffect(() => {
    if (!celebration) return;
    const timer = window.setTimeout(() => setCelebration(null), 2800);
    return () => window.clearTimeout(timer);
  }, [celebration]);

  const activeMastery = phase === 1 ? p1Mastery : p2Mastery;
  const correctCell = FORMATIONS[formation].players[currentPlayer];
  const instruction = phase === 1
    ? "Place the Y player."
    : currentPlayer === "Y" ? "Place the Y player."
      : currentPlayer === "X" ? "Correct. Now place X."
        : "Correct. Now place Z.";

  const boardStatus = useMemo(() => {
    if (!answered) return instruction;
    if (resultCorrect) {
      return phase === 1 ? "Touchdown! You earned 10 coins." : "Formation complete! You earned 30 coins.";
    }
    return `The blue ${currentPlayer} shows the correct location. Try a new play when ready.`;
  }, [answered, currentPlayer, instruction, phase, resultCorrect]);

  function recordMastery(targetPhase: Phase) {
    if (targetPhase === 1) {
      setP1Mastery((current) => {
        const wasMastered = current[formation] >= 5;
        const next = { ...current, [formation]: Math.min(5, current[formation] + 1) };
        if (!wasMastered && next[formation] === 5) setCelebration(`${formation} mastered!`);
        if (!phase2Unlocked && phaseMastered(next)) {
          setPhase2Unlocked(true);
          setCelebration("Phase 2 unlocked! Now place Y, X, and Z.");
        }
        return next;
      });
    } else {
      setP2Mastery((current) => {
        const wasMastered = current[formation] >= 5;
        const next = { ...current, [formation]: Math.min(5, current[formation] + 1) };
        if (!wasMastered && next[formation] === 5) setCelebration(`${formation} mastered in Phase 2!`);
        return next;
      });
    }
  }

  function chooseCell(cell: Cell) {
    if (answered) return;
    const correct = cell === correctCell;
    setSelected(cell);
    setPlacements((current) => ({ ...current, [currentPlayer]: cell }));

    if (!correct) {
      setResultCorrect(false);
      setAnswered(true);
      return;
    }

    setCoins((value) => value + 10);
    setResultCorrect(true);

    if (phase === 1) {
      setAnswered(true);
      recordMastery(1);
      return;
    }

    const playerIndex = PLAYER_ORDER.indexOf(currentPlayer);
    if (playerIndex < PLAYER_ORDER.length - 1) {
      setCurrentPlayer(PLAYER_ORDER[playerIndex + 1]);
      setSelected(null);
      setResultCorrect(null);
    } else {
      setAnswered(true);
      recordMastery(2);
    }
  }

  function resetPlay(nextPhase = phase) {
    const mastery = nextPhase === 1 ? p1Mastery : p2Mastery;
    const nextFormation = pickWeightedFormation(mastery, formation, repeatCount);
    setRepeatCount(nextFormation === formation ? repeatCount + 1 : 1);
    setFormation(nextFormation);
    setCurrentPlayer("Y");
    setPlacements({});
    setSelected(null);
    setAnswered(false);
    setResultCorrect(null);
  }

  function choosePhase(nextPhase: Phase) {
    if (nextPhase === 2 && !phase2Unlocked) return;
    setPhase(nextPhase);
    resetPlay(nextPhase);
  }

  function markerAt(cell: Cell): { label: PlayerLabel; reveal?: boolean } | null {
    const placed = (Object.entries(placements) as [PlayerLabel, Cell][])
      .find(([, placedCell]) => placedCell === cell);
    if (placed) return { label: placed[0] };
    if (answered && resultCorrect === false && correctCell === cell) return { label: currentPlayer, reveal: true };
    return null;
  }

  function unlockHelmet(id: HelmetId, cost: number) {
    if (unlocked.includes(id)) {
      setHelmet(id);
      return;
    }
    if (coins < cost) return;
    setCoins((value) => value - cost);
    setUnlocked((items) => [...items, id]);
    setHelmet(id);
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <button className="brand" onClick={() => setTab("play")} aria-label="ZYFL Formation Lab home">
          <span className="brand-ball">◆</span>
          <span><b>ZYFL</b><small>FORMATION LAB</small></span>
        </button>
        <nav aria-label="Main navigation">
          {(["play", "team", "help"] as Tab[]).map((item) => (
            <button key={item} className={tab === item ? "nav-active" : ""} onClick={() => setTab(item)}>
              {item === "play" ? "Play" : item === "team" ? "My Team" : "How to Play"}
            </button>
          ))}
        </nav>
        <div className="coin-balance" aria-label={`${coins} coins`}><span>●</span> {coins}</div>
      </header>

      {tab === "play" && (
        <section className="play-page">
          {celebration && <div className="celebration" role="status"><span>★</span>{celebration}</div>}

          <div className="phase-selector" aria-label="Training phase">
            <button className={phase === 1 ? "phase-active" : ""} onClick={() => choosePhase(1)}>
              <span>Phase 1</span><b>Place Y</b>
            </button>
            <button className={phase === 2 ? "phase-active" : ""} onClick={() => choosePhase(2)} disabled={!phase2Unlocked}>
              <span>Phase 2 {phase2Unlocked ? "✓" : "🔒"}</span><b>Place Y, X & Z</b>
              {!phase2Unlocked && <small>Master all six formations to unlock</small>}
            </button>
          </div>

          <div className="play-heading">
            <div className="play-call">
              <p className="eyebrow">Coach&apos;s call · Phase {phase}</p>
              <h1>{formation}!</h1>
            </div>
            <div className={`feedback ${answered ? "visible" : ""} ${answered && resultCorrect ? "success" : "try-again"}`} aria-live="polite">
              <span className="feedback-icon">{answered ? (resultCorrect ? "✓" : "!") : currentPlayer}</span>
              <div>
                <b>{answered ? (resultCorrect ? (phase === 1 ? "Great alignment!" : "Formation complete!") : `Not quite—study the blue ${currentPlayer}.`) : instruction}</b>
                <p>{boardStatus}</p>
              </div>
              {answered && <button className="primary-button" onClick={() => resetPlay()}>Next Play <span>→</span></button>}
            </div>
            <div className="challenge-chip"><span>{currentPlayer}</span> Place {currentPlayer}</div>
          </div>

          <div className={`board-wrap ${answered && resultCorrect ? "board-correct" : ""}`}>
            <div className="landmarks" aria-hidden="true">
              {LANDMARKS.map((mark) => (
                <b key={mark.label} style={{ gridColumn: mark.after, justifySelf: "end" }}>{mark.label}</b>
              ))}
            </div>
            <div className="formation-board" aria-label={`Formation board for ${formation}`}>
              <div className="line-of-scrimmage" />
              {SELECTABLE.map((cell) => {
                const [row, col] = cell.split("-").map(Number);
                const marker = markerAt(cell);
                const selectedHere = selected === cell;
                const correctHere = answered && resultCorrect === false && correctCell === cell;
                return (
                  <button
                    key={cell}
                    className={`target ${selectedHere && resultCorrect === false ? "selected" : ""} ${correctHere ? "correct-target" : ""}`}
                    style={{ gridRow: row, gridColumn: col }}
                    onClick={() => chooseCell(cell)}
                    disabled={answered}
                    aria-label={`Place ${currentPlayer} at row ${row}, column ${col}`}
                  >
                    {marker && <span className={`player skill-player player-${marker.label.toLowerCase()} ${marker.reveal ? "revealed-player" : ""}`}>{marker.label}</span>}
                  </button>
                );
              })}
              {FIXED.map((player) => (
                <span key={player.label} className={`player fixed ${player.label === "C" ? "center" : ""}`} style={{ gridRow: player.row, gridColumn: player.col }}>
                  {player.label}
                </span>
              ))}
            </div>
          </div>

          <MasteryTracker phase={phase} mastery={activeMastery} />
        </section>
      )}

      {tab === "team" && (
        <section className="team-page">
          <div className="section-title"><p className="eyebrow">Locker room</p><h1>Build My Team</h1><p>Train hard. Earn coins. Make this team yours.</p></div>
          <div className="team-layout">
            <div className="team-preview" style={{ "--primary": primary, "--secondary": secondary } as React.CSSProperties}>
              <p>LIVE PREVIEW</p>
              <Helmet design={helmet} />
              <h2>{teamName || "My Team"}</h2>
              <span className="team-tag">FORMATION READY</span>
            </div>
            <div className="customizer">
              <label>Team name<input value={teamName} maxLength={22} onChange={(event) => setTeamName(event.target.value)} /></label>
              <div className="color-row">
                <label>Primary color<input type="color" value={primary} onChange={(event) => setPrimary(event.target.value)} /></label>
                <label>Secondary color<input type="color" value={secondary} onChange={(event) => setSecondary(event.target.value)} /></label>
              </div>
              <h2>Helmet Locker</h2>
              <div className="helmet-grid">
                {HELMETS.map((item) => {
                  const owned = unlocked.includes(item.id);
                  const affordable = coins >= item.cost;
                  return (
                    <button key={item.id} className={`helmet-card ${helmet === item.id ? "equipped" : ""}`} onClick={() => unlockHelmet(item.id, item.cost)} disabled={!owned && !affordable}>
                      <span className="mini-helmet" style={{ "--primary": primary, "--secondary": secondary } as React.CSSProperties}><Helmet design={item.id} small /></span>
                      <b>{item.name}</b>
                      <small>{owned ? (helmet === item.id ? "Equipped" : "Owned") : `● ${item.cost}`}</small>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      {tab === "help" && (
        <section className="help-page">
          <div className="section-title"><p className="eyebrow">Quick guide</p><h1>How to Play</h1><p>Master Y first, then build the full formation.</p></div>
          <div className="steps">
            {[
              ["1", "Master Y", "Place Y correctly five times in every formation."],
              ["2", "Unlock Phase 2", "Master all six formations to unlock Y, X, and Z."],
              ["3", "Build the formation", "In Phase 2, place Y, then X, then Z."],
              ["4", "Build your team", "Earn coins and unlock helmet designs."],
            ].map(([number, title, copy]) => <article key={number}><span>{number}</span><h2>{title}</h2><p>{copy}</p></article>)}
          </div>
          <div className="reference">
            <h2>Y Formation Reference</h2>
            <div className="reference-grid">
              {FORMATION_NAMES.map((name) => (
                <div key={name}><b>{name}</b><span>{FORMATIONS[name].short}</span></div>
              ))}
            </div>
            <p className="memory-tip"><b>Memory tip:</b> Right-side formations start with R. Left-side formations start with L.</p>
          </div>
        </section>
      )}

      <footer>ZYFL Formation Lab · Formation Mastery</footer>
    </main>
  );
}

function MasteryTracker({ phase, mastery }: { phase: Phase; mastery: Mastery }) {
  return (
    <section className="mastery-panel" aria-label={`Phase ${phase} mastery`}>
      <div className="mastery-heading">
        <div><p className="eyebrow">Phase {phase} progress</p><h2>Formation Mastery</h2></div>
        <span>{FORMATION_NAMES.filter((name) => mastery[name] >= 5).length}/6 mastered</span>
      </div>
      <div className="mastery-grid">
        {FORMATION_NAMES.map((name) => {
          const complete = mastery[name] >= 5;
          return (
            <div key={name} className={`mastery-item ${complete ? "mastered" : ""}`}>
              <div><b>{complete ? "✓ " : ""}{name}</b><span>{complete ? "Mastered" : `${mastery[name]}/5`}</span></div>
              <i><span style={{ width: `${mastery[name] * 20}%` }} /></i>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Helmet({ design, small = false }: { design: HelmetId; small?: boolean }) {
  return (
    <div className={`helmet helmet-${design} ${small ? "helmet-small" : ""}`} aria-label={`${design} helmet preview`}>
      <span className="helmet-mark">{design === "wing" ? "≋" : design === "lightning" ? "ϟ" : ""}</span>
      <span className="face-mask" />
    </div>
  );
}
