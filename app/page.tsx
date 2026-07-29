"use client";

import { useEffect, useMemo, useState } from "react";

type Tab = "play" | "team" | "help";
type Phase = 1 | 2 | 3;
type PlayerLabel = "Y" | "X" | "Z" | "H";
type ReceiverLabel = "Y" | "X" | "Z";
type HModifier = "A" | "B" | "C" | "D" | "1" | "2" | "3" | "4";
type HHistory = Record<HModifier, { correct: number; incorrect: number }>;
type HSpot = { c: number; r: number };
type FormationName = "Right" | "Left" | "Rip" | "Liz" | "Rock" | "Lex";
type Cell = `${number}-${number}`;
type HelmetId = "basic" | "stripe" | "wing" | "lightning";
type Mastery = Record<FormationName, number>;

const FORMATION_NAMES: FormationName[] = ["Right", "Rip", "Rock", "Left", "Liz", "Lex"];
const EMPTY_MASTERY: Mastery = { Right: 0, Rip: 0, Rock: 0, Left: 0, Liz: 0, Lex: 0 };
const H_MODIFIERS: HModifier[] = ["A", "B", "C", "D", "1", "2", "3", "4"];
const EMPTY_H_HISTORY: HHistory = Object.fromEntries(
  H_MODIFIERS.map((modifier) => [modifier, { correct: 0, incorrect: 0 }]),
) as HHistory;
const NUMBER_H_SPOTS: Record<"1" | "2" | "3" | "4", HSpot> = {
  "1": { c: 9, r: 5 }, "2": { c: 8.5, r: 2 }, "3": { c: 7.5, r: 2 }, "4": { c: 4, r: 2 },
};
const LETTER_H_SPOTS: Record<"A" | "B" | "C" | "D", HSpot> = {
  A: { c: 11, r: 5 }, B: { c: 11.5, r: 2 }, C: { c: 12.5, r: 2 }, D: { c: 16, r: 2 },
};
const LETTER_FOR_NUMBER = { "1": "A", "2": "B", "3": "C", "4": "D" } as const;
const NUMBER_FOR_LETTER = { A: "1", B: "2", C: "3", D: "4" } as const;

const FORMATIONS: Record<FormationName, {
  players: Record<ReceiverLabel, Cell>;
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

function readHHistory(value: unknown): HHistory {
  const source = value && typeof value === "object" ? value as Partial<HHistory> : {};
  return Object.fromEntries(H_MODIFIERS.map((modifier) => {
    const item = source[modifier];
    return [modifier, {
      correct: typeof item?.correct === "number" ? Math.max(0, Math.floor(item.correct)) : 0,
      incorrect: typeof item?.incorrect === "number" ? Math.max(0, Math.floor(item.incorrect)) : 0,
    }];
  })) as HHistory;
}

function phaseMastered(mastery: Mastery) {
  return FORMATION_NAMES.every((name) => mastery[name] >= 5);
}

function yIsRight(formation: FormationName) {
  return formation === "Right" || formation === "Rip" || formation === "Rock";
}

function getHSpot(formation: FormationName, modifier: HModifier): HSpot {
  const rightY = yIsRight(formation);
  const isLetter = modifier >= "A" && modifier <= "D";
  if (isLetter) {
    return rightY
      ? LETTER_H_SPOTS[modifier as keyof typeof LETTER_H_SPOTS]
      : NUMBER_H_SPOTS[NUMBER_FOR_LETTER[modifier as keyof typeof NUMBER_FOR_LETTER]];
  }
  return rightY
    ? NUMBER_H_SPOTS[modifier as keyof typeof NUMBER_H_SPOTS]
    : LETTER_H_SPOTS[LETTER_FOR_NUMBER[modifier as keyof typeof LETTER_FOR_NUMBER]];
}

function hTargetsForFormation(formation: FormationName) {
  return H_MODIFIERS.map((modifier) => ({ modifier, ...getHSpot(formation, modifier) }));
}

function pickWeightedModifier(history: HHistory, previous?: HModifier, repeatCount = 0) {
  const pool = H_MODIFIERS.flatMap((modifier) => {
    if (modifier === previous && repeatCount >= 2) return [];
    const item = history[modifier];
    const weight = Math.max(1, 3 + item.incorrect * 2 - Math.min(item.correct, 2));
    return Array.from({ length: Math.min(weight, 15) }, () => modifier);
  });
  return pool[Math.floor(Math.random() * pool.length)] ?? "A";
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
  const [hModifier, setHModifier] = useState<HModifier>("A");
  const [hRepeatCount, setHRepeatCount] = useState(1);
  const [currentPlayer, setCurrentPlayer] = useState<PlayerLabel>("Y");
  const [placements, setPlacements] = useState<Partial<Record<ReceiverLabel, Cell>>>({});
  const [hPlacement, setHPlacement] = useState<HModifier | null>(null);
  const [selected, setSelected] = useState<Cell | null>(null);
  const [answered, setAnswered] = useState(false);
  const [resultCorrect, setResultCorrect] = useState<boolean | null>(null);
  const [p1Mastery, setP1Mastery] = useState<Mastery>(EMPTY_MASTERY);
  const [p2Mastery, setP2Mastery] = useState<Mastery>(EMPTY_MASTERY);
  const [p3Mastery, setP3Mastery] = useState<Mastery>(EMPTY_MASTERY);
  const [phase2Unlocked, setPhase2Unlocked] = useState(false);
  const [phase3Unlocked, setPhase3Unlocked] = useState(false);
  const [hHistory, setHHistory] = useState<HHistory>(EMPTY_H_HISTORY);
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
      const savedP3 = readMastery(saved.phase3Mastery);
      const savedHHistory = readHHistory(saved.hModifierHistory);
      setP1Mastery(savedP1);
      setP2Mastery(savedP2);
      setP3Mastery(savedP3);
      setHHistory(savedHHistory);
      setPhase2Unlocked(Boolean(saved.phase2Unlocked) || phaseMastered(savedP1));
      setPhase3Unlocked(Boolean(saved.phase3Unlocked) || phaseMastered(savedP2));
      if (typeof saved.coins === "number") setCoins(saved.coins);
      if (typeof saved.teamName === "string") setTeamName(saved.teamName);
      if (typeof saved.primary === "string") setPrimary(saved.primary);
      if (typeof saved.secondary === "string") setSecondary(saved.secondary);
      if (Array.isArray(saved.unlocked)) setUnlocked(saved.unlocked);
      if (typeof saved.helmet === "string") setHelmet(saved.helmet);
      setFormation(pickWeightedFormation(savedP1));
      setHModifier(pickWeightedModifier(savedHHistory));
    } catch {
      setFormation(pickWeightedFormation(EMPTY_MASTERY));
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem("zyfl-progress", JSON.stringify({
      version: 3,
      phase1Mastery: p1Mastery,
      phase1Mastered: phaseMastered(p1Mastery),
      phase2Unlocked,
      phase2Mastery: p2Mastery,
      phase2Mastered: phaseMastered(p2Mastery),
      phase3Unlocked,
      phase3Mastery: p3Mastery,
      phase3Mastered: phaseMastered(p3Mastery),
      hModifierHistory: hHistory,
      coins, teamName, primary, secondary, unlocked, helmet,
    }));
  }, [p1Mastery, p2Mastery, p3Mastery, phase2Unlocked, phase3Unlocked, hHistory, coins, teamName, primary, secondary, unlocked, helmet, ready]);

  useEffect(() => {
    if (!celebration) return;
    const timer = window.setTimeout(() => setCelebration(null), 2800);
    return () => window.clearTimeout(timer);
  }, [celebration]);

  const activeMastery = phase === 1 ? p1Mastery : phase === 2 ? p2Mastery : p3Mastery;
  const correctCell = currentPlayer === "H" ? null : FORMATIONS[formation].players[currentPlayer];
  const correctHSpot = getHSpot(formation, hModifier);
  const instruction = phase === 1
    ? "Place the Y player."
    : currentPlayer === "Y" ? "Place the Y player."
      : currentPlayer === "X" ? "Correct. Now place X."
        : currentPlayer === "Z" ? "Correct. Now place Z."
          : "Correct. Now place H.";

  const boardStatus = useMemo(() => {
    if (!answered) return instruction;
    if (resultCorrect) {
      return phase === 1 ? "Touchdown! You earned 10 coins." : `Formation complete! You earned ${phase === 2 ? 30 : 40} coins.`;
    }
    if (currentPlayer === "H") {
      const side = correctHSpot.c > 10 ? "right" : "left";
      return `Letters place H on the Y side. Numbers place H away from Y. ${formation} ${hModifier} places H at ${hModifier} on the ${side} side.`;
    }
    return `The blue ${currentPlayer} shows the correct location. Try a new play when ready.`;
  }, [answered, correctHSpot.c, currentPlayer, formation, hModifier, instruction, phase, resultCorrect]);

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
    } else if (targetPhase === 2) {
      setP2Mastery((current) => {
        const wasMastered = current[formation] >= 5;
        const next = { ...current, [formation]: Math.min(5, current[formation] + 1) };
        if (!wasMastered && next[formation] === 5) setCelebration(`${formation} mastered in Phase 2!`);
        if (!phase3Unlocked && phaseMastered(next)) {
          setPhase3Unlocked(true);
          setCelebration("Phase 3 unlocked! Letters follow Y; numbers go away from Y.");
        }
        return next;
      });
    } else {
      setP3Mastery((current) => {
        const wasMastered = current[formation] >= 5;
        const next = { ...current, [formation]: Math.min(5, current[formation] + 1) };
        if (!wasMastered && next[formation] === 5) setCelebration(`${formation} mastered in Phase 3!`);
        return next;
      });
    }
  }

  function chooseCell(cell: Cell) {
    if (answered || currentPlayer === "H") return;
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

    const playerOrder: PlayerLabel[] = phase === 3 ? ["Y", "X", "Z", "H"] : ["Y", "X", "Z"];
    const playerIndex = playerOrder.indexOf(currentPlayer);
    if (playerIndex < playerOrder.length - 1) {
      setCurrentPlayer(playerOrder[playerIndex + 1]);
      setSelected(null);
      setResultCorrect(null);
    } else {
      setAnswered(true);
      recordMastery(2);
    }
  }

  function chooseHSpot(modifier: HModifier) {
    if (answered || currentPlayer !== "H") return;
    const correct = modifier === hModifier;
    setHPlacement(modifier);
    setResultCorrect(correct);
    setHHistory((current) => ({
      ...current,
      [hModifier]: {
        ...current[hModifier],
        [correct ? "correct" : "incorrect"]: current[hModifier][correct ? "correct" : "incorrect"] + 1,
      },
    }));
    setAnswered(true);
    if (correct) {
      setCoins((value) => value + 10);
      recordMastery(3);
    }
  }

  function resetPlay(nextPhase = phase) {
    const mastery = nextPhase === 1 ? p1Mastery : nextPhase === 2 ? p2Mastery : p3Mastery;
    const nextFormation = pickWeightedFormation(mastery, formation, repeatCount);
    const nextModifier = pickWeightedModifier(hHistory, hModifier, hRepeatCount);
    setRepeatCount(nextFormation === formation ? repeatCount + 1 : 1);
    setHRepeatCount(nextModifier === hModifier ? hRepeatCount + 1 : 1);
    setFormation(nextFormation);
    setHModifier(nextModifier);
    setCurrentPlayer("Y");
    setPlacements({});
    setHPlacement(null);
    setSelected(null);
    setAnswered(false);
    setResultCorrect(null);
  }

  function choosePhase(nextPhase: Phase) {
    if (nextPhase === 2 && !phase2Unlocked) return;
    if (nextPhase === 3 && !phase3Unlocked) return;
    setPhase(nextPhase);
    resetPlay(nextPhase);
  }

  function markerAt(cell: Cell): { label: PlayerLabel; reveal?: boolean } | null {
    const placed = (Object.entries(placements) as [ReceiverLabel, Cell][])
      .find(([, placedCell]) => placedCell === cell);
    if (placed) return { label: placed[0] };
    if (currentPlayer !== "H" && answered && resultCorrect === false && correctCell === cell) return { label: currentPlayer, reveal: true };
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
            <button className={phase === 3 ? "phase-active" : ""} onClick={() => choosePhase(3)} disabled={!phase3Unlocked}>
              <span>Phase 3 {phase3Unlocked ? "✓" : "🔒"}</span><b>Add the H back</b>
              {!phase3Unlocked && <small>Master Phase 2 to unlock H-back training</small>}
            </button>
          </div>

          <div className="play-heading">
            <div className="play-call">
              <p className="eyebrow">Coach&apos;s call · Phase {phase}</p>
              <h1>{formation}{phase === 3 ? ` ${hModifier}` : ""}!</h1>
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
                    disabled={answered || currentPlayer === "H"}
                    aria-label={`Place ${currentPlayer} at row ${row}, column ${col}`}
                  >
                    {marker && <span className={`player skill-player player-${marker.label.toLowerCase()} ${marker.reveal ? "revealed-player" : ""}`}>{marker.label}</span>}
                  </button>
                );
              })}
              {phase === 3 && hTargetsForFormation(formation).map((spot) => {
                const selectedHere = hPlacement === spot.modifier;
                const correctHere = answered && resultCorrect === false && spot.modifier === hModifier;
                const showMarker = selectedHere || correctHere;
                return (
                  <button
                    key={`h-${spot.modifier}`}
                    className={`h-target ${selectedHere && resultCorrect === false ? "selected" : ""} ${correctHere ? "correct-target" : ""}`}
                    style={{
                      left: `calc((${spot.c} - 0.5) * (100% / 19))`,
                      top: `calc((${spot.r} - 0.5) * (100% / 6))`,
                    }}
                    onClick={() => chooseHSpot(spot.modifier)}
                    disabled={answered || currentPlayer !== "H"}
                    data-active={currentPlayer === "H"}
                    aria-label="Place H at this location"
                  >
                    {showMarker && <span className={`player skill-player player-h ${correctHere ? "revealed-player" : ""}`}>H</span>}
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
          <div className="section-title"><p className="eyebrow">Quick guide</p><h1>How to Play</h1><p>Master Y, build the formation, then add the H back.</p></div>
          <div className="steps">
            {[
              ["1", "Master Y", "Place Y correctly five times in every formation."],
              ["2", "Unlock Phase 2", "Master all six formations to unlock Y, X, and Z."],
              ["3", "Build the formation", "In Phase 2, place Y, then X, then Z."],
              ["4", "Add H", "Letters follow Y. Numbers send H away from Y."],
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
            <p className="memory-tip h-rule"><b>H-back rule:</b> A, B, C, and D place H on the same side as Y. 1, 2, 3, and 4 place H away from Y.</p>
          </div>
        </section>
      )}

      <footer>ZYFL Formation Lab · Formation & H-Back Mastery</footer>
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
