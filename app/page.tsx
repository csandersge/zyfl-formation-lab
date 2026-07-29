"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Tab = "play" | "cards" | "help";
type Phase = 1 | 2 | 3 | 4 | 5;
type CardPhase = 1 | 2 | 3 | 4;
type PlayerLabel = "Y" | "X" | "Z" | "H";
type ReceiverLabel = "Y" | "X" | "Z";
type BallCarrier = "QB" | "F" | "H" | "Y" | "X" | "Z";
type CarrierDigit = "1" | "2" | "4" | "5" | "6" | "7";
type LocationDigit = "0" | "1" | "4" | "5" | "6" | "7" | "8" | "9";
type HModifier = "A" | "B" | "C" | "D" | "1" | "2" | "3" | "4";
type HHistory = Record<HModifier, { correct: number; incorrect: number }>;
type CarrierHistory = Record<CarrierDigit, { correct: number; incorrect: number }>;
type LocationHistory = Record<LocationDigit, { correct: number; incorrect: number }>;
type HSpot = { c: number; r: number };
type FormationName = "Right" | "Left" | "Rip" | "Liz" | "Rock" | "Lex";
type Cell = `${number}-${number}`;
type Mastery = Record<FormationName, number>;
type CardKey = "phase1" | "phase2" | "phase3" | "phase4";
type CardState = Record<CardKey, boolean>;

const FORMATION_NAMES: FormationName[] = ["Right", "Rip", "Rock", "Left", "Liz", "Lex"];
const EMPTY_MASTERY: Mastery = { Right: 0, Rip: 0, Rock: 0, Left: 0, Liz: 0, Lex: 0 };
const EMPTY_CARD_STATE: CardState = { phase1: false, phase2: false, phase3: false, phase4: false };
const H_MODIFIERS: HModifier[] = ["A", "B", "C", "D", "1", "2", "3", "4"];
const CARRIER_DIGITS: CarrierDigit[] = ["1", "2", "4", "5", "6", "7"];
const LOCATION_DIGITS: LocationDigit[] = ["0", "1", "4", "5", "6", "7", "8", "9"];
const BALL_CARRIERS: BallCarrier[] = ["QB", "F", "H", "Y", "X", "Z"];
const BALL_CARRIER_MAP: Record<CarrierDigit, BallCarrier> = {
  "1": "QB", "2": "F", "4": "H", "5": "Y", "6": "X", "7": "Z",
};
const RUN_LOCATION_MAP: Record<LocationDigit, { concept: string; side: "Right" | "Left" }> = {
  "0": { concept: "Inside Zone", side: "Right" },
  "1": { concept: "Inside Zone", side: "Left" },
  "4": { concept: "Power", side: "Right" },
  "5": { concept: "Power", side: "Left" },
  "6": { concept: "Counter", side: "Right" },
  "7": { concept: "Counter", side: "Left" },
  "8": { concept: "Outside Zone", side: "Right" },
  "9": { concept: "Outside Zone", side: "Left" },
};
const EMPTY_H_HISTORY: HHistory = Object.fromEntries(
  H_MODIFIERS.map((modifier) => [modifier, { correct: 0, incorrect: 0 }]),
) as HHistory;
const EMPTY_CARRIER_HISTORY: CarrierHistory = Object.fromEntries(
  CARRIER_DIGITS.map((digit) => [digit, { correct: 0, incorrect: 0 }]),
) as CarrierHistory;
const EMPTY_LOCATION_HISTORY: LocationHistory = Object.fromEntries(
  LOCATION_DIGITS.map((digit) => [digit, { correct: 0, incorrect: 0 }]),
) as LocationHistory;
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
const CARD_DATA: Record<CardKey, {
  phase: CardPhase;
  rarity: "Rookie" | "Pro" | "Elite" | "Legendary";
  title: string;
  theme: string;
  image: string;
  alt: string;
}> = {
  phase1: {
    phase: 1, rarity: "Rookie", title: "Edge Alignment", theme: "Tight End / Y Position",
    image: "assets/cards/phase-1-rookie-edge-alignment.png",
    alt: "Rookie Edge Alignment football card unlocked for mastering Phase 1",
  },
  phase2: {
    phase: 2, rarity: "Pro", title: "Perimeter Playmaker", theme: "Wide Receiver / Y, X, and Z",
    image: "assets/cards/phase-2-pro-perimeter-playmaker.png",
    alt: "Pro Perimeter Playmaker football card unlocked for mastering Phase 2",
  },
  phase3: {
    phase: 3, rarity: "Elite", title: "Hybrid Force", theme: "H-Back",
    image: "assets/cards/phase-3-elite-hybrid-force.png",
    alt: "Elite Hybrid Force football card unlocked for mastering Phase 3",
  },
  phase4: {
    phase: 4, rarity: "Legendary", title: "Ball Carrier Mastery", theme: "Ball Carrier",
    image: "assets/cards/phase-4-legendary-ball-carrier-mastery.png",
    alt: "Legendary Ball Carrier Mastery football card unlocked for mastering Phase 4",
  },
};
const CARD_KEYS = Object.keys(CARD_DATA) as CardKey[];

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

function readCarrierHistory(value: unknown): CarrierHistory {
  const source = value && typeof value === "object" ? value as Partial<CarrierHistory> : {};
  return Object.fromEntries(CARRIER_DIGITS.map((digit) => {
    const item = source[digit];
    return [digit, {
      correct: typeof item?.correct === "number" ? Math.max(0, Math.floor(item.correct)) : 0,
      incorrect: typeof item?.incorrect === "number" ? Math.max(0, Math.floor(item.incorrect)) : 0,
    }];
  })) as CarrierHistory;
}

function readLocationHistory(value: unknown): LocationHistory {
  const source = value && typeof value === "object" ? value as Partial<LocationHistory> : {};
  return Object.fromEntries(LOCATION_DIGITS.map((digit) => {
    const item = source[digit];
    return [digit, {
      correct: typeof item?.correct === "number" ? Math.max(0, Math.floor(item.correct)) : 0,
      incorrect: typeof item?.incorrect === "number" ? Math.max(0, Math.floor(item.incorrect)) : 0,
    }];
  })) as LocationHistory;
}

function phaseMastered(mastery: Mastery) {
  return FORMATION_NAMES.every((name) => mastery[name] >= 5);
}

function cardKeyForPhase(phase: CardPhase): CardKey {
  return `phase${phase}` as CardKey;
}

function readCardState(value: unknown): CardState {
  const source = value && typeof value === "object" ? value as Partial<CardState> : {};
  return Object.fromEntries(CARD_KEYS.map((key) => [key, Boolean(source[key])])) as CardState;
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

function pickWeightedCarrier(history: CarrierHistory, previous?: CarrierDigit, repeatCount = 0) {
  const pool = CARRIER_DIGITS.flatMap((digit) => {
    if (digit === previous && repeatCount >= 2) return [];
    const item = history[digit];
    const weight = Math.max(1, 4 + item.incorrect * 2 - Math.min(item.correct, 3));
    return Array.from({ length: Math.min(weight, 18) }, () => digit);
  });
  return pool[Math.floor(Math.random() * pool.length)] ?? "2";
}

function pickWeightedLocation(history: LocationHistory, previous?: LocationDigit, repeatCount = 0) {
  const pool = LOCATION_DIGITS.flatMap((digit) => {
    if (digit === previous && repeatCount >= 2) return [];
    const item = history[digit];
    const weight = Math.max(1, 4 + item.incorrect * 2 - Math.min(item.correct, 3));
    return Array.from({ length: Math.min(weight, 18) }, () => digit);
  });
  return pool[Math.floor(Math.random() * pool.length)] ?? "0";
}

function makeRunNumber(carrierDigit: CarrierDigit, locationDigit: LocationDigit) {
  return `${carrierDigit}${locationDigit}`;
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
  const [p4Mastery, setP4Mastery] = useState<Mastery>(EMPTY_MASTERY);
  const [p5Mastery, setP5Mastery] = useState<Mastery>(EMPTY_MASTERY);
  const [phase2Unlocked, setPhase2Unlocked] = useState(false);
  const [phase3Unlocked, setPhase3Unlocked] = useState(false);
  const [phase4Unlocked, setPhase4Unlocked] = useState(false);
  const [phase5Unlocked, setPhase5Unlocked] = useState(false);
  const [hHistory, setHHistory] = useState<HHistory>(EMPTY_H_HISTORY);
  const [carrierHistory, setCarrierHistory] = useState<CarrierHistory>(EMPTY_CARRIER_HISTORY);
  const [carrierDigit, setCarrierDigit] = useState<CarrierDigit>("2");
  const [carrierRepeatCount, setCarrierRepeatCount] = useState(1);
  const [locationHistory, setLocationHistory] = useState<LocationHistory>(EMPTY_LOCATION_HISTORY);
  const [locationDigit, setLocationDigit] = useState<LocationDigit>("0");
  const [locationRepeatCount, setLocationRepeatCount] = useState(1);
  const [runNumber, setRunNumber] = useState("20");
  const [quizOpen, setQuizOpen] = useState(false);
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [quizChoice, setQuizChoice] = useState<BallCarrier | null>(null);
  const [carrierWasCorrect, setCarrierWasCorrect] = useState(false);
  const [locationActive, setLocationActive] = useState(false);
  const [locationAnswered, setLocationAnswered] = useState(false);
  const [locationChoice, setLocationChoice] = useState<LocationDigit | null>(null);
  const quizRef = useRef<HTMLDivElement>(null);
  const landmarksRef = useRef<HTMLDivElement>(null);
  const [celebration, setCelebration] = useState<string | null>(null);
  const [unlockedCards, setUnlockedCards] = useState<CardState>(EMPTY_CARD_STATE);
  const [cardRevealSeen, setCardRevealSeen] = useState<CardState>(EMPTY_CARD_STATE);
  const [pendingReveal, setPendingReveal] = useState<CardKey | null>(null);
  const [revealReady, setRevealReady] = useState(false);
  const [detailCard, setDetailCard] = useState<CardKey | null>(null);
  const revealRef = useRef<HTMLDivElement>(null);
  const detailRef = useRef<HTMLDivElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("zyfl-progress") || "{}");
      const savedP1 = readMastery(saved.phase1Mastery);
      const savedP2 = readMastery(saved.phase2Mastery);
      const savedP3 = readMastery(saved.phase3Mastery);
      const savedP4 = readMastery(saved.phase4Mastery);
      const savedP5 = readMastery(saved.phase5Mastery);
      const savedHHistory = readHHistory(saved.hModifierHistory);
      const savedCarrierHistory = readCarrierHistory(saved.carrierDigitHistory);
      const savedLocationHistory = readLocationHistory(saved.runLocationHistory);
      const savedRevealSeen = readCardState(saved.cardRevealSeen);
      const masteryCards: CardState = {
        phase1: phaseMastered(savedP1),
        phase2: phaseMastered(savedP2),
        phase3: phaseMastered(savedP3),
        phase4: phaseMastered(savedP4),
      };
      const migratedCards = Object.fromEntries(
        CARD_KEYS.map((key) => [key, masteryCards[key]]),
      ) as CardState;
      setP1Mastery(savedP1);
      setP2Mastery(savedP2);
      setP3Mastery(savedP3);
      setP4Mastery(savedP4);
      setP5Mastery(savedP5);
      setHHistory(savedHHistory);
      setCarrierHistory(savedCarrierHistory);
      setLocationHistory(savedLocationHistory);
      setUnlockedCards(migratedCards);
      setCardRevealSeen(savedRevealSeen);
      setPhase2Unlocked(Boolean(saved.phase2Unlocked) || phaseMastered(savedP1));
      setPhase3Unlocked(Boolean(saved.phase3Unlocked) || phaseMastered(savedP2));
      setPhase4Unlocked(Boolean(saved.phase4Unlocked) || phaseMastered(savedP3));
      setPhase5Unlocked(Boolean(saved.phase5Unlocked) || phaseMastered(savedP4));
      const firstUnseen = CARD_KEYS.find((key) => migratedCards[key] && !savedRevealSeen[key]);
      if (firstUnseen) setPendingReveal(firstUnseen);
      setFormation(pickWeightedFormation(savedP1));
      setHModifier(pickWeightedModifier(savedHHistory));
      const nextCarrier = pickWeightedCarrier(savedCarrierHistory);
      const nextLocation = pickWeightedLocation(savedLocationHistory);
      setCarrierDigit(nextCarrier);
      setLocationDigit(nextLocation);
      setRunNumber(makeRunNumber(nextCarrier, nextLocation));
    } catch {
      setFormation(pickWeightedFormation(EMPTY_MASTERY));
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem("zyfl-progress", JSON.stringify({
      version: 6,
      phase1Mastery: p1Mastery,
      phase1Mastered: phaseMastered(p1Mastery),
      phase2Unlocked,
      phase2Mastery: p2Mastery,
      phase2Mastered: phaseMastered(p2Mastery),
      phase3Unlocked,
      phase3Mastery: p3Mastery,
      phase3Mastered: phaseMastered(p3Mastery),
      phase4Unlocked,
      phase4Mastery: p4Mastery,
      phase4Mastered: phaseMastered(p4Mastery),
      phase5Unlocked,
      phase5Mastery: p5Mastery,
      phase5Mastered: phaseMastered(p5Mastery),
      hModifierHistory: hHistory,
      carrierDigitHistory: carrierHistory,
      runLocationHistory: locationHistory,
      unlockedCards,
      cardRevealSeen,
    }));
  }, [p1Mastery, p2Mastery, p3Mastery, p4Mastery, p5Mastery, phase2Unlocked, phase3Unlocked, phase4Unlocked, phase5Unlocked, hHistory, carrierHistory, locationHistory, unlockedCards, cardRevealSeen, ready]);

  useEffect(() => {
    if (!celebration) return;
    const timer = window.setTimeout(() => setCelebration(null), 2800);
    return () => window.clearTimeout(timer);
  }, [celebration]);

  useEffect(() => {
    if (!quizOpen) return;
    quizRef.current?.querySelector<HTMLButtonElement>("button:not(:disabled)")?.focus();
  }, [quizOpen]);

  useEffect(() => {
    if (!locationActive) return;
    window.setTimeout(() => landmarksRef.current?.querySelector<HTMLButtonElement>("button:not(:disabled)")?.focus(), 0);
  }, [locationActive]);

  useEffect(() => {
    if (!pendingReveal) return;
    setRevealReady(false);
    window.setTimeout(() => revealRef.current?.focus(), 0);
    const timer = window.setTimeout(() => setRevealReady(true), 1600);
    return () => window.clearTimeout(timer);
  }, [pendingReveal]);

  useEffect(() => {
    if (!detailCard) return;
    window.setTimeout(() => detailRef.current?.querySelector<HTMLButtonElement>("button")?.focus(), 0);
  }, [detailCard]);

  const activeMastery = phase === 1 ? p1Mastery : phase === 2 ? p2Mastery : phase === 3 ? p3Mastery : phase === 4 ? p4Mastery : p5Mastery;
  const correctCell = currentPlayer === "H" ? null : FORMATIONS[formation].players[currentPlayer];
  const correctHSpot = getHSpot(formation, hModifier);
  const ballCarrier = BALL_CARRIER_MAP[carrierDigit];
  const runLocation = RUN_LOCATION_MAP[locationDigit];
  const completeCall = `${formation} ${hModifier} ${runNumber}`;
  const instruction = locationActive
    ? "Where is the runner going?"
    : phase === 1
    ? "Place the Y player."
    : currentPlayer === "Y" ? "Place the Y player."
      : currentPlayer === "X" ? "Correct. Now place X."
        : currentPlayer === "Z" ? "Correct. Now place Z."
          : "Correct. Now place H.";

  const boardStatus = useMemo(() => {
    if (phase === 5 && locationAnswered) {
      return resultCorrect
        ? `Correct! The ${locationDigit} means ${runLocation.concept} ${runLocation.side}.`
        : `Not quite. The second digit is ${locationDigit}, so the run goes to the ${locationDigit} landmark: ${runLocation.concept} ${runLocation.side}.`;
    }
    if (!answered) return instruction;
    if (resultCorrect) {
      return phase === 1 ? "Touchdown! Great alignment." : "Formation complete! Keep building mastery.";
    }
    if (currentPlayer === "H") {
      const side = correctHSpot.c > 10 ? "right" : "left";
      return `Letters place H on the Y side. Numbers place H away from Y. ${formation} ${hModifier} places H at ${hModifier} on the ${side} side.`;
    }
    return `The blue ${currentPlayer} shows the correct location. Try a new play when ready.`;
  }, [answered, correctHSpot.c, currentPlayer, formation, hModifier, instruction, locationAnswered, locationDigit, phase, resultCorrect, runLocation.concept, runLocation.side]);

  function unlockCard(targetPhase: CardPhase) {
    const key = cardKeyForPhase(targetPhase);
    setUnlockedCards((current) => {
      if (current[key]) return current;
      setPendingReveal(key);
      return { ...current, [key]: true };
    });
  }

  function recordMastery(targetPhase: Phase) {
    if (targetPhase === 1) {
      setP1Mastery((current) => {
        const phaseWasMastered = phaseMastered(current);
        const wasMastered = current[formation] >= 5;
        const next = { ...current, [formation]: Math.min(5, current[formation] + 1) };
        if (!wasMastered && next[formation] === 5) setCelebration(`${formation} mastered!`);
        if (!phase2Unlocked && phaseMastered(next)) {
          setPhase2Unlocked(true);
          setCelebration("Phase 2 unlocked! Now place Y, X, and Z.");
        }
        if (!phaseWasMastered && phaseMastered(next)) unlockCard(1);
        return next;
      });
    } else if (targetPhase === 2) {
      setP2Mastery((current) => {
        const phaseWasMastered = phaseMastered(current);
        const wasMastered = current[formation] >= 5;
        const next = { ...current, [formation]: Math.min(5, current[formation] + 1) };
        if (!wasMastered && next[formation] === 5) setCelebration(`${formation} mastered in Phase 2!`);
        if (!phase3Unlocked && phaseMastered(next)) {
          setPhase3Unlocked(true);
          setCelebration("Phase 3 unlocked! Letters follow Y; numbers go away from Y.");
        }
        if (!phaseWasMastered && phaseMastered(next)) unlockCard(2);
        return next;
      });
    } else if (targetPhase === 3) {
      setP3Mastery((current) => {
        const phaseWasMastered = phaseMastered(current);
        const wasMastered = current[formation] >= 5;
        const next = { ...current, [formation]: Math.min(5, current[formation] + 1) };
        if (!wasMastered && next[formation] === 5) setCelebration(`${formation} mastered in Phase 3!`);
        if (!phase4Unlocked && phaseMastered(next)) {
          setPhase4Unlocked(true);
          setCelebration("Phase 4 unlocked! The first run-number digit names the ball carrier.");
        }
        if (!phaseWasMastered && phaseMastered(next)) unlockCard(3);
        return next;
      });
    } else if (targetPhase === 4) {
      setP4Mastery((current) => {
        const phaseWasMastered = phaseMastered(current);
        const wasMastered = current[formation] >= 5;
        const next = { ...current, [formation]: Math.min(5, current[formation] + 1) };
        if (!wasMastered && next[formation] === 5) setCelebration(`${formation} mastered in Phase 4!`);
        if (!phase5Unlocked && phaseMastered(next)) {
          setPhase5Unlocked(true);
          setCelebration("Phase 5 unlocked! The second digit tells where the runner is going.");
        }
        if (!phaseWasMastered && phaseMastered(next)) unlockCard(4);
        return next;
      });
    } else {
      setP5Mastery((current) => {
        const wasMastered = current[formation] >= 5;
        const next = { ...current, [formation]: Math.min(5, current[formation] + 1) };
        if (!wasMastered && next[formation] === 5) setCelebration(`${formation} mastered in Phase 5!`);
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

    setResultCorrect(true);

    if (phase === 1) {
      setAnswered(true);
      recordMastery(1);
      return;
    }

    const playerOrder: PlayerLabel[] = phase >= 3 ? ["Y", "X", "Z", "H"] : ["Y", "X", "Z"];
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
    if (correct) {
      if (phase >= 4) {
        setResultCorrect(null);
        setQuizOpen(true);
      } else {
        setAnswered(true);
        recordMastery(3);
      }
    } else {
      setAnswered(true);
    }
  }

  function chooseBallCarrier(choice: BallCarrier) {
    if (!quizOpen || quizAnswered) return;
    const correct = choice === ballCarrier;
    setQuizChoice(choice);
    setQuizAnswered(true);
    setCarrierWasCorrect(correct);
    setResultCorrect(correct);
    setAnswered(phase === 4);
    setCarrierHistory((current) => ({
      ...current,
      [carrierDigit]: {
        ...current[carrierDigit],
        [correct ? "correct" : "incorrect"]: current[carrierDigit][correct ? "correct" : "incorrect"] + 1,
      },
    }));
    if (correct && phase === 4) {
      recordMastery(4);
    }
  }

  function beginRunLocation() {
    if (phase !== 5 || !quizAnswered) return;
    setQuizOpen(false);
    setLocationActive(true);
    setAnswered(false);
    setResultCorrect(null);
  }

  function chooseRunLocation(choice: LocationDigit) {
    if (phase !== 5 || !locationActive || locationAnswered) return;
    const correct = choice === locationDigit;
    setLocationChoice(choice);
    setLocationActive(false);
    setLocationAnswered(true);
    setAnswered(true);
    setResultCorrect(correct);
    setLocationHistory((current) => ({
      ...current,
      [locationDigit]: {
        ...current[locationDigit],
        [correct ? "correct" : "incorrect"]: current[locationDigit][correct ? "correct" : "incorrect"] + 1,
      },
    }));
    if (correct && carrierWasCorrect) recordMastery(5);
  }

  function trapQuizFocus(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      return;
    }
    if (event.key !== "Tab") return;
    const buttons = Array.from(quizRef.current?.querySelectorAll<HTMLButtonElement>("button:not(:disabled)") ?? []);
    if (!buttons.length) return;
    const first = buttons[0];
    const last = buttons[buttons.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function resetPlay(nextPhase = phase) {
    const mastery = nextPhase === 1 ? p1Mastery : nextPhase === 2 ? p2Mastery : nextPhase === 3 ? p3Mastery : nextPhase === 4 ? p4Mastery : p5Mastery;
    const nextFormation = pickWeightedFormation(mastery, formation, repeatCount);
    const nextModifier = pickWeightedModifier(hHistory, hModifier, hRepeatCount);
    const nextCarrier = pickWeightedCarrier(carrierHistory, carrierDigit, carrierRepeatCount);
    let nextLocation = pickWeightedLocation(locationHistory, locationDigit, locationRepeatCount);
    if (`${nextFormation} ${nextModifier} ${nextCarrier}${nextLocation}` === completeCall) {
      nextLocation = LOCATION_DIGITS.find((digit) => digit !== nextLocation) ?? "0";
    }
    const nextRunNumber = makeRunNumber(nextCarrier, nextLocation);
    setRepeatCount(nextFormation === formation ? repeatCount + 1 : 1);
    setHRepeatCount(nextModifier === hModifier ? hRepeatCount + 1 : 1);
    setCarrierRepeatCount(nextCarrier === carrierDigit ? carrierRepeatCount + 1 : 1);
    setLocationRepeatCount(nextLocation === locationDigit ? locationRepeatCount + 1 : 1);
    setFormation(nextFormation);
    setHModifier(nextModifier);
    setCarrierDigit(nextCarrier);
    setLocationDigit(nextLocation);
    setRunNumber(nextRunNumber);
    setCurrentPlayer("Y");
    setPlacements({});
    setHPlacement(null);
    setSelected(null);
    setAnswered(false);
    setResultCorrect(null);
    setQuizOpen(false);
    setQuizAnswered(false);
    setQuizChoice(null);
    setCarrierWasCorrect(false);
    setLocationActive(false);
    setLocationAnswered(false);
    setLocationChoice(null);
  }

  function choosePhase(nextPhase: Phase) {
    if (nextPhase === 2 && !phase2Unlocked) return;
    if (nextPhase === 3 && !phase3Unlocked) return;
    if (nextPhase === 4 && !phase4Unlocked) return;
    if (nextPhase === 5 && !phase5Unlocked) return;
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

  function carrierClass(label: string) {
    return phase >= 4 && quizAnswered && label === ballCarrier ? "ball-carrier" : "";
  }

  function footballBadge(label: string) {
    return phase >= 4 && quizAnswered && label === ballCarrier
      ? <span className="football-badge" aria-label="Ball carrier">🏈</span>
      : null;
  }

  function finishReveal(viewCollection: boolean) {
    if (!pendingReveal) return;
    setCardRevealSeen((current) => ({ ...current, [pendingReveal]: true }));
    setPendingReveal(null);
    if (viewCollection) setTab("cards");
    window.setTimeout(() => returnFocusRef.current?.focus(), 0);
  }

  function openCard(key: CardKey, trigger: HTMLElement) {
    returnFocusRef.current = trigger;
    if (!cardRevealSeen[key]) {
      setPendingReveal(key);
    } else {
      setDetailCard(key);
    }
  }

  function closeCardDetail() {
    setDetailCard(null);
    window.setTimeout(() => returnFocusRef.current?.focus(), 0);
  }

  function handleDetailKey(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      closeCardDetail();
      return;
    }
    if (event.key !== "Tab") return;
    const buttons = Array.from(detailRef.current?.querySelectorAll<HTMLButtonElement>("button") ?? []);
    if (!buttons.length) return;
    if (event.shiftKey && document.activeElement === buttons[0]) {
      event.preventDefault();
      buttons[buttons.length - 1].focus();
    } else if (!event.shiftKey && document.activeElement === buttons[buttons.length - 1]) {
      event.preventDefault();
      buttons[0].focus();
    }
  }

  function handleRevealKey(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      return;
    }
    if (event.key !== "Tab") return;
    const buttons = Array.from(revealRef.current?.querySelectorAll<HTMLButtonElement>("button") ?? []);
    if (!buttons.length) {
      event.preventDefault();
      revealRef.current?.focus();
      return;
    }
    if (event.shiftKey && document.activeElement === buttons[0]) {
      event.preventDefault();
      buttons[buttons.length - 1].focus();
    } else if (!event.shiftKey && document.activeElement === buttons[buttons.length - 1]) {
      event.preventDefault();
      buttons[0].focus();
    }
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <button className="brand" onClick={() => setTab("play")} aria-label="ZYFL Formation Lab home">
          <span className="brand-ball">◆</span>
          <span><b>ZYFL</b><small>FORMATION LAB</small></span>
        </button>
        <nav aria-label="Main navigation">
          {(["play", "cards", "help"] as Tab[]).map((item) => (
            <button key={item} className={tab === item ? "nav-active" : ""} onClick={() => setTab(item)}>
              {item === "play" ? "Play" : item === "cards" ? "My Cards" : "How to Play"}
            </button>
          ))}
        </nav>
        <button className="collection-count" onClick={() => setTab("cards")} aria-label={`${CARD_KEYS.filter((key) => unlockedCards[key]).length} of 4 cards unlocked`}>
          <span>★</span> {CARD_KEYS.filter((key) => unlockedCards[key]).length}/4
        </button>
      </header>

      {tab === "play" && (
        <section className="play-page">
          {celebration && <div className="celebration" role="status"><span>★</span>{celebration}</div>}

          <div className="phase-selector" aria-label="Training phase">
            <button className={phase === 1 ? "phase-active" : ""} onClick={() => choosePhase(1)}>
              <span>Phase 1</span><b>Place Y</b>
              <small className="phase-reward">{unlockedCards.phase1 ? "Card Unlocked ✓" : "Reward: Rookie Football Card"}</small>
            </button>
            <button className={phase === 2 ? "phase-active" : ""} onClick={() => choosePhase(2)} disabled={!phase2Unlocked}>
              <span>Phase 2 {phase2Unlocked ? "✓" : "🔒"}</span><b>Place Y, X & Z</b>
              {!phase2Unlocked && <small>Master all six formations to unlock</small>}
              <small className="phase-reward">{unlockedCards.phase2 ? "Card Unlocked ✓" : "Reward: Pro Football Card"}</small>
            </button>
            <button className={phase === 3 ? "phase-active" : ""} onClick={() => choosePhase(3)} disabled={!phase3Unlocked}>
              <span>Phase 3 {phase3Unlocked ? "✓" : "🔒"}</span><b>Add the H back</b>
              {!phase3Unlocked && <small>Master Phase 2 to unlock H-back training</small>}
              <small className="phase-reward">{unlockedCards.phase3 ? "Card Unlocked ✓" : "Reward: Elite Football Card"}</small>
            </button>
            <button className={phase === 4 ? "phase-active" : ""} onClick={() => choosePhase(4)} disabled={!phase4Unlocked}>
              <span>Phase 4 {phase4Unlocked ? "✓" : "🔒"}</span><b>Identify the Ball Carrier</b>
              {!phase4Unlocked && <small>Master all six formations in Phase 3 to unlock ball-carrier training</small>}
              <small className="phase-reward">{unlockedCards.phase4 ? "Card Unlocked ✓" : "Reward: Legendary Football Card"}</small>
            </button>
            <button className={phase === 5 ? "phase-active" : ""} onClick={() => choosePhase(5)} disabled={!phase5Unlocked}>
              <span>Phase 5 {phase5Unlocked ? "✓" : "🔒"}</span><b>Identify the Run Location</b>
              {!phase5Unlocked && <small>Master all six formations in Phase 4 to unlock run-location training</small>}
              <small className="phase-reward">Reward coming in Phase 5B</small>
            </button>
          </div>

          <div className="play-heading">
            <div className="play-call">
              <p className="eyebrow">Coach&apos;s call · Phase {phase}</p>
              <h1>{phase >= 4 ? completeCall : `${formation}${phase === 3 ? ` ${hModifier}` : ""}`}!</h1>
            </div>
            <div className={`feedback ${answered ? "visible" : ""} ${answered && resultCorrect ? "success" : "try-again"}`} aria-live="polite">
              <span className="feedback-icon">{answered ? (resultCorrect ? "✓" : "!") : locationActive ? "?" : currentPlayer}</span>
              <div>
                <b>{locationAnswered
                  ? (resultCorrect ? "Run location correct!" : "Run location revealed.")
                  : answered
                    ? (resultCorrect ? (phase === 1 ? "Great alignment!" : "Formation complete!") : `Not quite—study the blue ${currentPlayer}.`)
                    : instruction}</b>
                <p>{boardStatus}</p>
              </div>
              {answered && <button className="primary-button" onClick={() => resetPlay()}>Next Play <span>→</span></button>}
            </div>
            <div className="challenge-chip">
              <span>{quizOpen || locationActive ? "?" : currentPlayer}</span>
              {quizOpen ? "Name the carrier" : locationActive ? "Pick the landmark" : `Place ${currentPlayer}`}
            </div>
          </div>

          <div className={`board-wrap ${answered && resultCorrect ? "board-correct" : ""}`}>
            <div ref={landmarksRef} className={`landmarks ${locationActive ? "location-active" : ""}`} aria-label={phase === 5 && (locationActive || locationAnswered) ? "Run location landmarks" : undefined}>
              {LANDMARKS.map((mark) => {
                const validLocation = LOCATION_DIGITS.includes(mark.label as LocationDigit);
                const selectedLocation = locationChoice === mark.label;
                const correctLocation = locationAnswered && locationDigit === mark.label;
                return phase === 5 && (locationActive || locationAnswered) && validLocation ? (
                  <button
                    key={mark.label}
                    className={`landmark-button ${selectedLocation ? "selected-location" : ""} ${selectedLocation && !correctLocation ? "wrong-location" : ""} ${correctLocation ? "correct-location" : ""}`}
                    style={{ gridColumn: mark.after, justifySelf: "end" }}
                    onClick={() => chooseRunLocation(mark.label as LocationDigit)}
                    disabled={!locationActive || locationAnswered}
                    aria-label={locationAnswered
                      ? `Run location ${mark.label}, ${RUN_LOCATION_MAP[mark.label as LocationDigit].concept} ${RUN_LOCATION_MAP[mark.label as LocationDigit].side}`
                      : `Run location ${mark.label}`}
                  >
                    {mark.label}
                    {locationAnswered && selectedLocation && <i aria-hidden="true">{correctLocation ? "✓" : "×"}</i>}
                    {locationAnswered && correctLocation && !selectedLocation && <i aria-hidden="true">✓</i>}
                  </button>
                ) : (
                  <b key={mark.label} aria-hidden="true" style={{ gridColumn: mark.after, justifySelf: "end" }}>{mark.label}</b>
                );
              })}
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
                    disabled={answered || quizOpen || currentPlayer === "H"}
                    aria-label={`Place ${currentPlayer} at row ${row}, column ${col}`}
                  >
                    {marker && <span className={`player skill-player player-${marker.label.toLowerCase()} ${marker.reveal ? "revealed-player" : ""} ${carrierClass(marker.label)}`}>
                      {marker.label}{footballBadge(marker.label)}
                    </span>}
                  </button>
                );
              })}
              {phase >= 3 && hTargetsForFormation(formation).map((spot) => {
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
                    disabled={answered || quizOpen || locationActive || locationAnswered || currentPlayer !== "H"}
                    data-active={currentPlayer === "H"}
                    aria-label="Place H at this location"
                  >
                    {showMarker && <span className={`player skill-player player-h ${correctHere ? "revealed-player" : ""} ${carrierClass("H")}`}>
                      H{footballBadge("H")}
                    </span>}
                  </button>
                );
              })}
              {FIXED.map((player) => (
                <span key={player.label} className={`player fixed ${player.label === "C" ? "center" : ""} ${carrierClass(player.label)}`} style={{ gridRow: player.row, gridColumn: player.col }}>
                  {player.label}{footballBadge(player.label)}
                </span>
              ))}
            </div>
            {phase >= 4 && quizOpen && (
              <div className="quiz-overlay">
                <div
                  ref={quizRef}
                  className="carrier-quiz"
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="carrier-quiz-title"
                  onKeyDown={trapQuizFocus}
                  tabIndex={-1}
                >
                  <p className="eyebrow">Complete play call</p>
                  <h2>{completeCall}</h2>
                  <h3 id="carrier-quiz-title">Who is carrying the ball?</h3>
                  <div className="carrier-answers">
                    {BALL_CARRIERS.map((answer) => {
                      const isCorrect = answer === ballCarrier;
                      const isChosen = answer === quizChoice;
                      return (
                        <button
                          key={answer}
                          className={`${quizAnswered && isCorrect ? "correct-answer" : ""} ${quizAnswered && isChosen && !isCorrect ? "wrong-answer" : ""}`}
                          onClick={() => chooseBallCarrier(answer)}
                          disabled={quizAnswered}
                        >
                          {answer}
                        </button>
                      );
                    })}
                  </div>
                  {quizAnswered && (
                    <div className={`quiz-result ${resultCorrect ? "correct" : "incorrect"}`} role="status">
                      <b>{resultCorrect ? "Correct!" : "Not quite."}</b>
                      <p>The {carrierDigit} in {runNumber} means {ballCarrier} carries the ball.</p>
                      {phase === 5
                        ? <button className="primary-button" onClick={beginRunLocation}>Continue to Run Location <span>→</span></button>
                        : <button className="primary-button" onClick={() => resetPlay()}>Next Play <span>→</span></button>}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <MasteryTracker phase={phase} mastery={activeMastery} />
        </section>
      )}

      {tab === "cards" && (
        <section className="cards-page">
          <div className="section-title">
            <p className="eyebrow">Achievement collection</p>
            <h1>My Cards</h1>
            <p>Master each training phase to collect every card from Rookie through Legendary.</p>
          </div>
          <div className="card-collection">
            {CARD_KEYS.map((key) => {
              const card = CARD_DATA[key];
              const isUnlocked = unlockedCards[key];
              const isNew = isUnlocked && !cardRevealSeen[key];
              return (
                <article key={key} className={`card-slot rarity-${card.rarity.toLowerCase()} ${isUnlocked ? "unlocked" : "locked"}`}>
                  {isUnlocked ? (
                    <button className="card-art-button" onClick={(event) => openCard(key, event.currentTarget)}>
                      <img src={card.image} alt={card.alt} loading="lazy" />
                      <span className="card-status">{isNew ? "New Card!" : "Unlocked ✓"}</span>
                    </button>
                  ) : (
                    <div className="card-back" aria-label={`${card.rarity} card locked`}>
                      <span className="lock-icon" aria-hidden="true">🔒</span>
                      <b>{card.rarity}</b>
                      <small>Football Card</small>
                    </div>
                  )}
                  <div className="card-slot-copy">
                    <span>Phase {card.phase} · {card.rarity}</span>
                    <h2>{isUnlocked ? card.title : `${card.rarity} Card`}</h2>
                    <p>{isUnlocked ? `Phase ${card.phase} mastered` : `Master Phase ${card.phase} to unlock`}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {tab === "help" && (
        <section className="help-page">
          <div className="section-title"><p className="eyebrow">Quick guide</p><h1>How to Play</h1><p>Master each training phase to unlock a collectible football card. Build your collection from Rookie through Legendary.</p></div>
          <div className="steps">
            {[
              ["1", "Master Y", "Place Y correctly five times in every formation."],
              ["2", "Build the formation", "Place Y, then X, then Z in all six formations."],
              ["3", "Add H", "Letters follow Y. Numbers send H away from Y."],
              ["4", "Name the carrier", "The first run-number digit tells who carries the ball."],
              ["5", "Find the run location", "Click the landmark shown by the second run-number digit."],
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
            <p className="memory-tip carrier-rule"><b>Ball-carrier rule:</b> 1 = QB, 2 = F, 4 = H, 5 = Y, 6 = X, and 7 = Z.</p>
            <div className="rarity-guide" aria-label="Football card rarity levels">
              {CARD_KEYS.map((key) => <span key={key} className={`rarity-${CARD_DATA[key].rarity.toLowerCase()}`}>{CARD_DATA[key].rarity}</span>)}
            </div>
          </div>
        </section>
      )}

      {pendingReveal && (
        <div className="card-modal-backdrop">
          <div
            ref={revealRef}
            className={`card-reveal rarity-${CARD_DATA[pendingReveal].rarity.toLowerCase()} ${revealReady ? "revealed" : ""}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="card-reveal-title"
            tabIndex={-1}
            onKeyDown={handleRevealKey}
          >
            <p className="eyebrow">Phase {CARD_DATA[pendingReveal].phase} mastered!</p>
            <div className="reveal-stage">
              <div className="sealed-card"><span>ZYFL</span><b>FOOTBALL CARD</b></div>
              <img src={CARD_DATA[pendingReveal].image} alt={CARD_DATA[pendingReveal].alt} />
            </div>
            <h2 id="card-reveal-title">{revealReady ? "New Card Unlocked!" : "Opening your reward…"}</h2>
            {revealReady && (
              <>
                <p>{CARD_DATA[pendingReveal].rarity} · {CARD_DATA[pendingReveal].title}</p>
                <button className="primary-button" onClick={() => finishReveal(true)}>View My Cards</button>
                <button className="secondary-button" onClick={() => finishReveal(false)}>Keep Playing</button>
              </>
            )}
          </div>
        </div>
      )}

      {detailCard && (
        <div className="card-modal-backdrop detail-backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget) closeCardDetail();
        }}>
          <div
            ref={detailRef}
            className="card-detail"
            role="dialog"
            aria-modal="true"
            aria-labelledby="card-detail-title"
            onKeyDown={handleDetailKey}
          >
            <div className="card-detail-heading">
              <div><p className="eyebrow">Phase {CARD_DATA[detailCard].phase} mastered</p><h2 id="card-detail-title">{CARD_DATA[detailCard].title}</h2></div>
              <button onClick={closeCardDetail} aria-label="Close card detail">Close</button>
            </div>
            <img src={CARD_DATA[detailCard].image} alt={CARD_DATA[detailCard].alt} />
          </div>
        </div>
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
