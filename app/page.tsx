"use client";

import { useEffect, useMemo, useState } from "react";

type Tab = "play" | "team" | "help";
type FormationName = "Right" | "Left" | "Rip" | "Liz" | "Rock" | "Lex";
type Cell = `${number}-${number}`;
type HelmetId = "basic" | "stripe" | "wing" | "lightning";

const FORMATIONS: Record<FormationName, { cell: Cell; explanation: string; short: string }> = {
  Right: { cell: "1-13", explanation: "Right: Y lines up as a TE to the right.", short: "TE right" },
  Left: { cell: "1-7", explanation: "Left: Y lines up as a TE to the left.", short: "TE left" },
  Rip: { cell: "2-13", explanation: "Rip: Y lines up as a wing back to the right on the outside hip of the tackle.", short: "Wing right" },
  Liz: { cell: "2-7", explanation: "Liz: Y lines up as a wing back to the left on the outside hip of the tackle.", short: "Wing left" },
  Rock: { cell: "2-16", explanation: "Rock: Y lines up as slot receiver to the right.", short: "Slot right" },
  Lex: { cell: "2-4", explanation: "Lex: Y lines up as slot receiver to the left.", short: "Slot left" },
};

const FORMATION_NAMES = Object.keys(FORMATIONS) as FormationName[];
const SELECTABLE: Cell[] = [
  "1-2", "1-4", "1-7", "1-13", "1-16", "1-18",
  "2-4", "2-7", "2-13", "2-16",
  "4-8", "4-12",
];
const LANDMARKS = [
  { label: "9", col: 2 }, { label: "7", col: 6 }, { label: "5", col: 7 },
  { label: "3", col: 8 }, { label: "1", col: 9 }, { label: "0", col: 10 },
  { label: "2", col: 11 }, { label: "4", col: 12 }, { label: "6", col: 13 },
  { label: "8", col: 17 },
];
const FIXED = [
  { label: "LT", row: 1, col: 8 }, { label: "LG", row: 1, col: 9 },
  { label: "C", row: 1, col: 10 }, { label: "RG", row: 1, col: 11 },
  { label: "RT", row: 1, col: 12 }, { label: "QB", row: 3, col: 10 },
  { label: "F", row: 4, col: 10 },
];
const HELMETS: { id: HelmetId; name: string; cost: number }[] = [
  { id: "basic", name: "Basic", cost: 0 },
  { id: "stripe", name: "Stripe", cost: 30 },
  { id: "wing", name: "Wing", cost: 60 },
  { id: "lightning", name: "Lightning", cost: 100 },
];

function pickFormation(previous?: FormationName) {
  const choices = FORMATION_NAMES.filter((name) => name !== previous);
  return choices[Math.floor(Math.random() * choices.length)];
}

export default function Home() {
  const [tab, setTab] = useState<Tab>("play");
  const [formation, setFormation] = useState<FormationName>("Right");
  const [selected, setSelected] = useState<Cell | null>(null);
  const [answered, setAnswered] = useState(false);
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
      if (typeof saved.coins === "number") setCoins(saved.coins);
      if (typeof saved.teamName === "string") setTeamName(saved.teamName);
      if (typeof saved.primary === "string") setPrimary(saved.primary);
      if (typeof saved.secondary === "string") setSecondary(saved.secondary);
      if (Array.isArray(saved.unlocked)) setUnlocked(saved.unlocked);
      if (typeof saved.helmet === "string") setHelmet(saved.helmet);
    } catch { /* Start fresh if local data is invalid. */ }
    setFormation(pickFormation());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem("zyfl-progress", JSON.stringify({
      coins, teamName, primary, secondary, unlocked, helmet,
    }));
  }, [coins, teamName, primary, secondary, unlocked, helmet, ready]);

  const isCorrect = selected === FORMATIONS[formation].cell;
  const boardStatus = useMemo(() => {
    if (!answered) return "Tap a white target to place Y.";
    return isCorrect ? "Touchdown! You earned 10 coins." : FORMATIONS[formation].explanation;
  }, [answered, formation, isCorrect]);

  function chooseCell(cell: Cell) {
    if (answered) return;
    setSelected(cell);
    setAnswered(true);
    if (cell === FORMATIONS[formation].cell) setCoins((value) => value + 10);
  }

  function nextPlay() {
    setFormation((current) => pickFormation(current));
    setSelected(null);
    setAnswered(false);
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
          <div className="play-heading">
            <div>
              <p className="eyebrow">Coach&apos;s call</p>
              <h1>{formation}!</h1>
            </div>
            <div className="challenge-chip"><span>Y</span> Find Y&apos;s spot</div>
          </div>

          <div className={`board-wrap ${answered && isCorrect ? "board-correct" : ""}`}>
            <div className="landmarks" aria-hidden="true">
              {LANDMARKS.map((mark) => <b key={mark.label} style={{ gridColumn: mark.col }}>{mark.label}</b>)}
            </div>
            <div className="formation-board" aria-label={`Formation board for ${formation}`}>
              <div className="line-of-scrimmage" />
              {SELECTABLE.map((cell) => {
                const [row, col] = cell.split("-").map(Number);
                const selectedHere = selected === cell;
                const correctHere = answered && FORMATIONS[formation].cell === cell;
                return (
                  <button
                    key={cell}
                    className={`target ${selectedHere ? "selected" : ""} ${correctHere ? "correct-target" : ""}`}
                    style={{ gridRow: row, gridColumn: col }}
                    onClick={() => chooseCell(cell)}
                    disabled={answered}
                    aria-label={`Place Y at row ${row}, column ${col}`}
                  >
                    {(selectedHere || correctHere) && <span className="player y-player">Y</span>}
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

          <div className={`feedback ${answered ? "visible" : ""} ${answered && isCorrect ? "success" : "try-again"}`} aria-live="polite">
            <span className="feedback-icon">{answered ? (isCorrect ? "✓" : "!") : "Y"}</span>
            <div><b>{answered ? (isCorrect ? "Great alignment!" : "Not quite—study the blue Y.") : "You’re up!"}</b><p>{boardStatus}</p></div>
            {answered && <button className="primary-button" onClick={nextPlay}>Next Play <span>→</span></button>}
          </div>
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
          <div className="section-title"><p className="eyebrow">Quick guide</p><h1>How to Play</h1><p>Learn one formation at a time—and build your dream team.</p></div>
          <div className="steps">
            {[
              ["1", "Hear the call", "Read the formation called by the coach."],
              ["2", "Place Y", "Tap where the Y player should line up."],
              ["3", "Earn coins", "Get 10 coins for every correct answer."],
              ["4", "Build your team", "Spend coins on helmet designs."],
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

      <footer>ZYFL Formation Lab · Phase 1: Y Alignment</footer>
    </main>
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
