"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ACTIVE_2026_FORMATIONS,
  ALL_H_ALIGNMENT_MODIFIERS,
  FORMATION_FAMILY_DEFINITIONS,
  type CurriculumExposure,
  type CurriculumLevel,
  type CurriculumMastery,
  type FormationCurriculumEntry,
  type FormationCurriculumModifier,
  type GridCoordinate,
  curriculumLevelMastered,
  getCurriculumMasteryCategories,
  getCurriculumMasteryCategory,
  getCurriculumMasteryTarget,
  migrateCurriculumExposure,
  resolveHAlignmentForFormation,
  selectCurriculumFormation,
} from "./data/formation-curriculum-2026";
import {
  APPROVED_2026_RUN_CALLS,
  APPROVED_2026_RUN_CONCEPTS,
  RUN_CONCEPT_IDS,
  RUN_CONCEPT_NAMES,
  RUN_LANDMARK_DIGITS,
  type Approved2026RunCall,
  type RunConceptId,
  type RunConceptName,
  type RunLandmarkDigit,
  type RunLandmarkMastery,
  type RunVariantMastery,
  getRunMasteryTarget,
  level4RunConceptMastered,
  level5RunLandmarkMastered,
  selectApproved2026RunCall,
} from "./data/run-curriculum-2026";

type Tab = "play" | "cards" | "help";
type Phase = 1 | 2 | 3 | 4 | 5;
type CardPhase = 1 | 2 | 3 | 4 | 5;
type PlayerLabel = "Y" | "X" | "Z" | "H";
type ReceiverLabel = "Y" | "X" | "Z";
type BallCarrier = "QB" | "F" | "H" | "Y" | "X" | "Z";
type CarrierDigit = "1" | "2" | "4" | "5" | "6" | "7";
type LocationDigit = "0" | "1" | "4" | "5" | "6" | "7" | "8" | "9";
type HModifier = Exclude<FormationCurriculumModifier, null>;
type HHistory = Record<HModifier, { correct: number; incorrect: number }>;
type CarrierHistory = Record<CarrierDigit, { correct: number; incorrect: number }>;
type LocationHistory = Record<LocationDigit, { correct: number; incorrect: number }>;
type CarrierMastery = Partial<Record<BallCarrier, number>>;
type RunLocationMastery = Partial<Record<LocationDigit, number>>;
type HSpot = { c: number; r: number };
type FormationName = "Right" | "Left" | "Rip" | "Liz" | "Rock" | "Lex";
type Cell = `${number}-${number}`;
type Mastery = Record<FormationName, number>;
type CardKey = "phase1" | "phase2" | "phase3" | "phase4" | "phase5";
type CardState = Record<CardKey, boolean>;
type SpecialPlayType = "power" | "sweep" | "qb-keep" | "reverse" | "empty-sweep" | null;
type ApprovedRunPlay = {
  id: string;
  displayCall: string;
  formation: "Left" | "Right" | "Rip";
  hModifier: HModifier;
  displayedRunNumber: string;
  carrier: BallCarrier;
  runLocationDigit: LocationDigit;
  concept: string;
  specialType: SpecialPlayType;
  activePhase4: boolean;
  activePhase5: boolean;
};

const FORMATION_NAMES: FormationName[] = ["Right", "Rip", "Rock", "Left", "Liz", "Lex"];
const EMPTY_MASTERY: Mastery = { Right: 0, Rip: 0, Rock: 0, Left: 0, Liz: 0, Lex: 0 };
const EMPTY_CARD_STATE: CardState = { phase1: false, phase2: false, phase3: false, phase4: false, phase5: false };
const H_MODIFIERS: HModifier[] = [...ALL_H_ALIGNMENT_MODIFIERS];
const CARRIER_DIGITS: CarrierDigit[] = ["1", "2", "4", "5", "6", "7"];
const LOCATION_DIGITS: LocationDigit[] = ["0", "1", "4", "5", "6", "7", "8", "9"];
const BALL_CARRIERS: BallCarrier[] = ["QB", "F", "H", "Y", "X", "Z"];
const CARRIER_DIGIT_FOR_PLAYER: Record<BallCarrier, CarrierDigit> = {
  QB: "1", F: "2", H: "4", Y: "5", X: "6", Z: "7",
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
// Retained only for backward-compatible saved progress and historical reference.
// This legacy list never feeds the live 2026 Level 4–5 question pool.
const LEGACY_2025_APPROVED_RUN_PLAYS: ApprovedRunPlay[] = [
  { id: "left-3-20", displayCall: "Left 3 20", formation: "Left", hModifier: "3", displayedRunNumber: "20", carrier: "F", runLocationDigit: "0", concept: "Inside Zone Right", specialType: null, activePhase4: true, activePhase5: true },
  { id: "left-4-11", displayCall: "Left 4 11", formation: "Left", hModifier: "4", displayedRunNumber: "11", carrier: "QB", runLocationDigit: "1", concept: "Inside Zone Left", specialType: null, activePhase4: true, activePhase5: true },
  { id: "left-4-21", displayCall: "Left 4 21", formation: "Left", hModifier: "4", displayedRunNumber: "21", carrier: "F", runLocationDigit: "1", concept: "Inside Zone Left", specialType: null, activePhase4: true, activePhase5: true },
  { id: "left-a-25-power", displayCall: "Left A 25 Power", formation: "Left", hModifier: "A", displayedRunNumber: "25", carrier: "F", runLocationDigit: "5", concept: "Power Left", specialType: "power", activePhase4: true, activePhase5: true },
  { id: "left-c-21", displayCall: "Left C 21", formation: "Left", hModifier: "C", displayedRunNumber: "21", carrier: "F", runLocationDigit: "1", concept: "Inside Zone Left", specialType: null, activePhase4: true, activePhase5: true },
  { id: "left-c-fake-21-qb-keep-right", displayCall: "Left C Fake 21 QB Keep Right", formation: "Left", hModifier: "C", displayedRunNumber: "21", carrier: "QB", runLocationDigit: "8", concept: "Outside Zone Right", specialType: "qb-keep", activePhase4: true, activePhase5: true },
  { id: "left-d-29-sweep", displayCall: "Left D 29 Sweep", formation: "Left", hModifier: "D", displayedRunNumber: "29", carrier: "F", runLocationDigit: "9", concept: "Outside Zone Left", specialType: "sweep", activePhase4: true, activePhase5: true },

  { id: "right-3-21", displayCall: "Right 3 21", formation: "Right", hModifier: "3", displayedRunNumber: "21", carrier: "F", runLocationDigit: "1", concept: "Inside Zone Left", specialType: null, activePhase4: true, activePhase5: true },
  { id: "right-4-10", displayCall: "Right 4 10", formation: "Right", hModifier: "4", displayedRunNumber: "10", carrier: "QB", runLocationDigit: "0", concept: "Inside Zone Right", specialType: null, activePhase4: true, activePhase5: true },
  { id: "right-4-20", displayCall: "Right 4 20", formation: "Right", hModifier: "4", displayedRunNumber: "20", carrier: "F", runLocationDigit: "0", concept: "Inside Zone Right", specialType: null, activePhase4: true, activePhase5: true },
  { id: "right-a-24-power", displayCall: "Right A 24 Power", formation: "Right", hModifier: "A", displayedRunNumber: "24", carrier: "F", runLocationDigit: "4", concept: "Power Right", specialType: "power", activePhase4: true, activePhase5: true },
  { id: "right-b-20", displayCall: "Right B 20", formation: "Right", hModifier: "B", displayedRunNumber: "20", carrier: "F", runLocationDigit: "0", concept: "Inside Zone Right", specialType: null, activePhase4: true, activePhase5: true },
  { id: "right-c-10", displayCall: "Right C 10", formation: "Right", hModifier: "C", displayedRunNumber: "10", carrier: "QB", runLocationDigit: "0", concept: "Inside Zone Right", specialType: null, activePhase4: true, activePhase5: true },
  { id: "right-c-20", displayCall: "Right C 20", formation: "Right", hModifier: "C", displayedRunNumber: "20", carrier: "F", runLocationDigit: "0", concept: "Inside Zone Right", specialType: null, activePhase4: true, activePhase5: true },
  { id: "right-c-empty-18-sweep", displayCall: "Right C Empty 18 Sweep", formation: "Right", hModifier: "C", displayedRunNumber: "18", carrier: "QB", runLocationDigit: "8", concept: "Outside Zone Right", specialType: "empty-sweep", activePhase4: true, activePhase5: true },
  { id: "right-c-fake-20-qb-keep-left", displayCall: "Right C Fake 20 QB Keep Left", formation: "Right", hModifier: "C", displayedRunNumber: "20", carrier: "QB", runLocationDigit: "9", concept: "Outside Zone Left", specialType: "qb-keep", activePhase4: true, activePhase5: true },
  { id: "right-d-28-sweep", displayCall: "Right D 28 Sweep", formation: "Right", hModifier: "D", displayedRunNumber: "28", carrier: "F", runLocationDigit: "8", concept: "Outside Zone Right", specialType: "sweep", activePhase4: true, activePhase5: true },

  { id: "rip-1-44", displayCall: "Rip 1 44", formation: "Rip", hModifier: "1", displayedRunNumber: "44", carrier: "H", runLocationDigit: "4", concept: "Power Right", specialType: null, activePhase4: true, activePhase5: true },
  { id: "rip-3-20", displayCall: "Rip 3 20", formation: "Rip", hModifier: "3", displayedRunNumber: "20", carrier: "F", runLocationDigit: "0", concept: "Inside Zone Right", specialType: null, activePhase4: true, activePhase5: true },
  { id: "rip-3-28", displayCall: "Rip 3 28", formation: "Rip", hModifier: "3", displayedRunNumber: "28", carrier: "F", runLocationDigit: "8", concept: "Outside Zone Right", specialType: null, activePhase4: true, activePhase5: true },
  { id: "rip-3-48-reverse-right", displayCall: "Rip 3 48 Reverse Right", formation: "Rip", hModifier: "3", displayedRunNumber: "48", carrier: "H", runLocationDigit: "8", concept: "Outside Zone Right", specialType: "reverse", activePhase4: true, activePhase5: true },
];
const ACTIVE_PHASE4_PLAYS = LEGACY_2025_APPROVED_RUN_PLAYS.filter((play) => play.activePhase4);
const ACTIVE_PHASE5_PLAYS = LEGACY_2025_APPROVED_RUN_PLAYS.filter((play) => play.activePhase5);
const REQUIRED_PHASE4_CARRIERS = BALL_CARRIERS.filter((carrier) =>
  ACTIVE_PHASE4_PLAYS.some((play) => play.carrier === carrier),
);
const REQUIRED_PHASE5_RUN_DIGITS = LOCATION_DIGITS.filter((digit) =>
  ACTIVE_PHASE5_PLAYS.some((play) => play.runLocationDigit === digit),
);
const EMPTY_PHASE4_CARRIER_MASTERY = Object.fromEntries(
  REQUIRED_PHASE4_CARRIERS.map((carrier) => [carrier, 0]),
) as CarrierMastery;
const EMPTY_PHASE5_RUN_LOCATION_MASTERY = Object.fromEntries(
  REQUIRED_PHASE5_RUN_DIGITS.map((digit) => [digit, 0]),
) as RunLocationMastery;
const EMPTY_H_HISTORY: HHistory = Object.fromEntries(
  H_MODIFIERS.map((modifier) => [modifier, { correct: 0, incorrect: 0 }]),
) as HHistory;
const EMPTY_CARRIER_HISTORY: CarrierHistory = Object.fromEntries(
  CARRIER_DIGITS.map((digit) => [digit, { correct: 0, incorrect: 0 }]),
) as CarrierHistory;
const EMPTY_LOCATION_HISTORY: LocationHistory = Object.fromEntries(
  LOCATION_DIGITS.map((digit) => [digit, { correct: 0, incorrect: 0 }]),
) as LocationHistory;
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
  "1-2", "1-7", "1-13", "1-18",
  "2-2", "2-4", "2-7", "2-13", "2-16", "2-18",
];
const CURRICULUM_SELECTABLE: Cell[] = [...new Set(
  ACTIVE_2026_FORMATIONS.flatMap((entry) =>
    (["Y", "X", "Z"] as const).flatMap((player) => {
      const coordinate = entry.coordinates[player];
      return coordinate ? [`${coordinate.r}-${coordinate.c}` as Cell] : [];
    }),
  ),
)];
const CURRICULUM_H_TARGETS = [...new Map(
  ACTIVE_2026_FORMATIONS.flatMap((entry) => {
    const coordinate = entry.coordinates.H;
    return coordinate ? [[`${coordinate.r}-${coordinate.c}`, coordinate] as const] : [];
  }),
).values()];
const ACTIVE_CURRICULUM_FAMILIES = [...new Set(
  ACTIVE_2026_FORMATIONS.map((entry) => entry.formation),
)];
const curriculumFamilyShortLabel = (formation: FormationCurriculumEntry["formation"]) => {
  const definition = FORMATION_FAMILY_DEFINITIONS[formation];
  const alignment =
    definition.yAlignmentType === "attached-tight-end"
      ? "Attached Y"
      : definition.yAlignmentType === "wing"
        ? "Wing Y"
        : definition.yLineStatus === "on-line"
          ? "On-line slot Y"
          : "Off-ball slot Y";
  return `${alignment} ${definition.ySide}`;
};
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
];
const CARD_DATA: Record<CardKey, {
  phase: CardPhase;
  rarity: "Rookie" | "Pro" | "Elite" | "Legendary" | "Mythic";
  title: string;
  theme: string;
  image: string;
  alt: string;
}> = {
  phase1: {
    phase: 1, rarity: "Rookie", title: "Edge Alignment", theme: "Tight End / Y Position",
    image: "assets/cards/phase-1-rookie-edge-alignment.png",
    alt: "Rookie Edge Alignment football card unlocked for mastering Level 1",
  },
  phase2: {
    phase: 2, rarity: "Pro", title: "Perimeter Playmaker", theme: "Wide Receiver / Y, X, and Z",
    image: "assets/cards/phase-2-pro-perimeter-playmaker.png",
    alt: "Pro Perimeter Playmaker football card unlocked for mastering Level 2",
  },
  phase3: {
    phase: 3, rarity: "Elite", title: "Hybrid Force", theme: "H-Back",
    image: "assets/cards/phase-3-elite-hybrid-force.png",
    alt: "Elite Hybrid Force football card unlocked for mastering Level 3",
  },
  phase4: {
    phase: 4, rarity: "Legendary", title: "Run Concept Mastery", theme: "Outside Zone & Counter",
    image: "assets/cards/phase-4-legendary-ball-carrier-mastery.png",
    alt: "Legendary football card unlocked for mastering Level 4 run concepts",
  },
  phase5: {
    phase: 5, rarity: "Mythic", title: "Lane Finder", theme: "Mastered run locations",
    image: "assets/cards/lane-finder.png",
    alt: "Lane Finder Mythic football reward card unlocked for mastering Level 5",
  },
};
const CARD_KEYS = Object.keys(CARD_DATA) as CardKey[];
const LEVEL_CONFIG: Array<{
  level: Phase;
  title: string;
  reward: string;
  enabled: boolean;
  lockedMessage?: string;
}> = [
  { level: 1, title: "Place Y", reward: "Reward: Rookie Football Card", enabled: true },
  { level: 2, title: "Place Y, X & Z", reward: "Reward: Pro Football Card", enabled: true, lockedMessage: "Master the Level 1 formation families to unlock" },
  { level: 3, title: "Add the H back", reward: "Reward: Elite Football Card", enabled: true, lockedMessage: "Master the Level 2 receiver formations to unlock" },
  { level: 4, title: "Run Concept", reward: "Reward: Legendary Football Card", enabled: true, lockedMessage: "Master the Level 3 H alignments to unlock run-concept training" },
  { level: 5, title: "Run Landmark", reward: "Reward: Lane Finder", enabled: true, lockedMessage: "Master Outside Zone and Counter in Level 4 to unlock landmark training" },
];

function levelIsAvailable(level: Phase) {
  return LEVEL_CONFIG.find((item) => item.level === level)?.enabled ?? false;
}

function nextAvailableLevel(currentLevel: Phase): Phase | null {
  return LEVEL_CONFIG.find((item) => item.level > currentLevel && item.enabled)?.level ?? null;
}

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

function readCarrierMastery(value: unknown, completed = false): CarrierMastery {
  const source = value && typeof value === "object" ? value as CarrierMastery : {};
  return Object.fromEntries(REQUIRED_PHASE4_CARRIERS.map((carrier) => [
    carrier,
    completed ? 5 : clampMastery(source[carrier]),
  ])) as CarrierMastery;
}

function readRunLocationMastery(value: unknown, completed = false): RunLocationMastery {
  const source = value && typeof value === "object" ? value as RunLocationMastery : {};
  return Object.fromEntries(REQUIRED_PHASE5_RUN_DIGITS.map((digit) => [
    digit,
    completed ? 5 : clampMastery(source[digit]),
  ])) as RunLocationMastery;
}

function readRunVariantMastery(value: unknown): RunVariantMastery {
  const source = value && typeof value === "object" ? value as RunVariantMastery : {};
  return Object.fromEntries(
    RUN_CONCEPT_IDS.map((id) => [id, clampMastery(source[id])]),
  ) as RunVariantMastery;
}

function readRunLandmarkMastery(value: unknown): RunLandmarkMastery {
  const source = value && typeof value === "object" ? value as RunLandmarkMastery : {};
  return Object.fromEntries(
    RUN_LANDMARK_DIGITS.map((digit) => [digit, clampMastery(source[digit])]),
  ) as RunLandmarkMastery;
}

function phaseMastered(mastery: Mastery) {
  return FORMATION_NAMES.every((name) => mastery[name] >= 5);
}

function coordinateCell(coordinate: GridCoordinate | null): Cell | null {
  return coordinate ? `${coordinate.r}-${coordinate.c}` as Cell : null;
}

function readCurriculumMastery(
  value: unknown,
  level: CurriculumLevel,
  legacyMastery?: Mastery,
): CurriculumMastery {
  const source = value && typeof value === "object" ? value as CurriculumMastery : null;
  return Object.fromEntries(getCurriculumMasteryCategories(level).map((category) => {
    const safelyMigratedLegacyScore =
      !source
      && level < 3
      && FORMATION_NAMES.includes(category as FormationName)
      ? legacyMastery?.[category as FormationName]
      : undefined;
    return [category, clampMastery(source?.[category] ?? safelyMigratedLegacyScore)];
  }));
}

function readCurriculumExposure(value: unknown): Record<CurriculumLevel, CurriculumExposure> {
  const source = value && typeof value === "object"
    ? value as Partial<Record<CurriculumLevel, CurriculumExposure>>
    : {};
  return {
    1: migrateCurriculumExposure(source[1] ?? {}),
    2: migrateCurriculumExposure(source[2] ?? {}),
    3: migrateCurriculumExposure(source[3] ?? {}),
  };
}

function getDynamicMasteryTarget(playCount: number) {
  if (playCount >= 3) return 5;
  if (playCount === 2) return 4;
  if (playCount === 1) return 3;
  return 0;
}

function getLevel4MasteryTarget(carrier: BallCarrier, activePlays = ACTIVE_PHASE4_PLAYS) {
  const playCount = new Set(
    activePlays.filter((play) => play.carrier === carrier).map((play) => play.id),
  ).size;
  return getDynamicMasteryTarget(playCount);
}

function getLevel5MasteryTarget(digit: LocationDigit, activePlays = ACTIVE_PHASE5_PLAYS) {
  const playCount = new Set(
    activePlays.filter((play) => play.runLocationDigit === digit).map((play) => play.id),
  ).size;
  return getDynamicMasteryTarget(playCount);
}

function phase4Mastered(mastery: CarrierMastery) {
  return REQUIRED_PHASE4_CARRIERS.every(
    (carrier) => (mastery[carrier] ?? 0) >= getLevel4MasteryTarget(carrier),
  );
}

function phase5Mastered(mastery: RunLocationMastery) {
  return REQUIRED_PHASE5_RUN_DIGITS.every(
    (digit) => (mastery[digit] ?? 0) >= getLevel5MasteryTarget(digit),
  );
}

function cardKeyForPhase(phase: CardPhase): CardKey {
  return `phase${phase}` as CardKey;
}

function readCardState(value: unknown): CardState {
  const source = value && typeof value === "object" ? value as Partial<CardState> : {};
  return Object.fromEntries(CARD_KEYS.map((key) => [key, Boolean(source[key])])) as CardState;
}

function getHSpot(formation: FormationName, modifier: HModifier): HSpot {
  const coordinate = resolveHAlignmentForFormation(formation, modifier).coordinates.H;
  if (!coordinate) throw new Error(`${formation} ${modifier} does not resolve an H position.`);
  return coordinate;
}

function hTargetsForFormation(formation: FormationName) {
  return H_MODIFIERS.map((modifier) => ({ modifier, ...getHSpot(formation, modifier) }));
}

function pickApprovedRunPlay(
  phase: 4 | 5,
  carrierMastery: CarrierMastery,
  runLocationMastery: RunLocationMastery,
  previousPlayId?: string,
  playRepeatCount = 0,
  previousFormation?: FormationName,
  formationRepeatCount = 0,
) {
  const eligible = phase === 4 ? ACTIVE_PHASE4_PLAYS : ACTIVE_PHASE5_PLAYS;
  const incompleteCategories = phase === 4
    ? REQUIRED_PHASE4_CARRIERS
      .map((carrier) => ({
        category: carrier,
        score: carrierMastery[carrier] ?? 0,
        target: getLevel4MasteryTarget(carrier, eligible),
      }))
      .filter(({ score, target }) => score < target)
    : REQUIRED_PHASE5_RUN_DIGITS
      .map((digit) => ({
        category: digit,
        score: runLocationMastery[digit] ?? 0,
        target: getLevel5MasteryTarget(digit, eligible),
      }))
      .filter(({ score, target }) => score < target);

  let candidates = eligible;
  if (incompleteCategories.length) {
    const lowestProgressRatio = Math.min(
      ...incompleteCategories.map(({ score, target }) => score / target),
    );
    const priorityCategories = new Set(
      incompleteCategories
        .filter(({ score, target }) => score / target === lowestProgressRatio)
        .map(({ category }) => category),
    );
    candidates = eligible.filter((play) =>
      phase === 4
        ? priorityCategories.has(play.carrier)
        : priorityCategories.has(play.runLocationDigit),
    );
  }

  const differentPlay = candidates.filter((play) => play.id !== previousPlayId);
  if (differentPlay.length) {
    candidates = differentPlay;
  } else if (playRepeatCount >= 2) {
    candidates = candidates.length ? candidates : eligible;
  }
  const withoutRepeatedFormation = candidates.filter(
    (play) => !(play.formation === previousFormation && formationRepeatCount >= 2),
  );
  if (withoutRepeatedFormation.length) candidates = withoutRepeatedFormation;

  return candidates[Math.floor(Math.random() * candidates.length)] ?? eligible[0];
}

export default function Home() {
  const [tab, setTab] = useState<Tab>("play");
  const [phase, setPhase] = useState<Phase>(1);
  const [formation, setFormation] = useState<FormationName>("Right");
  const [hModifier, setHModifier] = useState<HModifier>("A");
  const [currentPlayer, setCurrentPlayer] = useState<PlayerLabel>("Y");
  const [placements, setPlacements] = useState<Partial<Record<ReceiverLabel, Cell>>>({});
  const [hPlacement, setHPlacement] = useState<HModifier | null>(null);
  const [curriculumHPlacement, setCurriculumHPlacement] = useState<GridCoordinate | null>(null);
  const [selected, setSelected] = useState<Cell | null>(null);
  const [answered, setAnswered] = useState(false);
  const [resultCorrect, setResultCorrect] = useState<boolean | null>(null);
  const [p1Mastery, setP1Mastery] = useState<Mastery>(EMPTY_MASTERY);
  const [p2Mastery, setP2Mastery] = useState<Mastery>(EMPTY_MASTERY);
  const [p3Mastery, setP3Mastery] = useState<Mastery>(EMPTY_MASTERY);
  const [curriculumMastery, setCurriculumMastery] = useState<Record<CurriculumLevel, CurriculumMastery>>({
    1: readCurriculumMastery(null, 1),
    2: readCurriculumMastery(null, 2),
    3: readCurriculumMastery(null, 3),
  });
  const [curriculumExposure, setCurriculumExposure] = useState<Record<CurriculumLevel, CurriculumExposure>>({
    1: {}, 2: {}, 3: {},
  });
  const [selectedCurriculumFormation, setSelectedCurriculumFormation] = useState<FormationCurriculumEntry>(
    ACTIVE_2026_FORMATIONS[0],
  );
  const [p4Mastery, setP4Mastery] = useState<Mastery>(EMPTY_MASTERY);
  const [p5Mastery, setP5Mastery] = useState<Mastery>(EMPTY_MASTERY);
  const [phase4CarrierMastery, setPhase4CarrierMastery] = useState<CarrierMastery>(EMPTY_PHASE4_CARRIER_MASTERY);
  const [phase5RunLocationMastery, setPhase5RunLocationMastery] = useState<RunLocationMastery>(EMPTY_PHASE5_RUN_LOCATION_MASTERY);
  const [level4RunVariantMastery, setLevel4RunVariantMastery] = useState<RunVariantMastery>(
    readRunVariantMastery(null),
  );
  const [level5RunLandmarkMastery, setLevel5RunLandmarkMastery] = useState<RunLandmarkMastery>(
    readRunLandmarkMastery(null),
  );
  const [phase2Unlocked, setPhase2Unlocked] = useState(false);
  const [phase3Unlocked, setPhase3Unlocked] = useState(false);
  const [phase4Unlocked, setPhase4Unlocked] = useState(false);
  const [phase5Unlocked, setPhase5Unlocked] = useState(false);
  const [hHistory, setHHistory] = useState<HHistory>(EMPTY_H_HISTORY);
  const [carrierHistory, setCarrierHistory] = useState<CarrierHistory>(EMPTY_CARRIER_HISTORY);
  const [locationHistory, setLocationHistory] = useState<LocationHistory>(EMPTY_LOCATION_HISTORY);
  const [selectedRunPlay, setSelectedRunPlay] = useState<Approved2026RunCall>(APPROVED_2026_RUN_CALLS[0]);
  const [quizOpen, setQuizOpen] = useState(false);
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [quizChoice, setQuizChoice] = useState<RunConceptName | null>(null);
  const [locationActive, setLocationActive] = useState(false);
  const [locationAnswered, setLocationAnswered] = useState(false);
  const [locationChoice, setLocationChoice] = useState<RunLandmarkDigit | null>(null);
  const quizRef = useRef<HTMLDivElement>(null);
  const landmarksRef = useRef<HTMLDivElement>(null);
  const [celebration, setCelebration] = useState<string | null>(null);
  const [unlockedCards, setUnlockedCards] = useState<CardState>(EMPTY_CARD_STATE);
  const [cardRevealSeen, setCardRevealSeen] = useState<CardState>(EMPTY_CARD_STATE);
  const [pendingReveal, setPendingReveal] = useState<CardKey | null>(null);
  const [pendingLevelAdvance, setPendingLevelAdvance] = useState<Phase | null>(null);
  const [revealReady, setRevealReady] = useState(false);
  const [detailCard, setDetailCard] = useState<CardKey | null>(null);
  const [levelScrollAtStart, setLevelScrollAtStart] = useState(true);
  const [levelScrollAtEnd, setLevelScrollAtEnd] = useState(false);
  const revealRef = useRef<HTMLDivElement>(null);
  const detailRef = useRef<HTMLDivElement>(null);
  const levelSelectorRef = useRef<HTMLElement>(null);
  const levelScrollViewportRef = useRef<HTMLDivElement>(null);
  const completionQueuedRef = useRef<Set<Phase>>(new Set());
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
      const savedCurriculumMastery = {
        1: readCurriculumMastery(saved.level1Curriculum2026Mastery, 1, savedP1),
        2: readCurriculumMastery(saved.level2Curriculum2026Mastery, 2, savedP2),
        3: readCurriculumMastery(saved.level3Curriculum2026Mastery, 3),
      } satisfies Record<CurriculumLevel, CurriculumMastery>;
      const savedCurriculumExposure = readCurriculumExposure(saved.formationCurriculum2026Exposure);
      const savedHHistory = readHHistory(saved.hModifierHistory);
      const savedCarrierHistory = readCarrierHistory(saved.carrierDigitHistory);
      const savedLocationHistory = readLocationHistory(saved.runLocationHistory);
      const savedRevealSeen = readCardState(saved.cardRevealSeen);
      const savedCards = readCardState(saved.unlockedCards);
      const legacyPhase4Complete = Boolean(saved.phase4Mastered) || phaseMastered(savedP4);
      const legacyPhase5Complete = Boolean(saved.phase5Mastered) || phaseMastered(savedP5);
      const savedPhase4CarrierMastery = readCarrierMastery(saved.phase4CarrierMastery, legacyPhase4Complete);
      const savedPhase5RunLocationMastery = readRunLocationMastery(saved.phase5RunLocationMastery, legacyPhase5Complete);
      const savedLevel4RunVariantMastery = readRunVariantMastery(saved.level4RunCurriculum2026Mastery);
      const savedLevel5RunLandmarkMastery = readRunLandmarkMastery(saved.level5RunCurriculum2026Mastery);
      const masteryCards: CardState = {
        phase1: phaseMastered(savedP1) || curriculumLevelMastered(1, savedCurriculumMastery[1]),
        phase2: phaseMastered(savedP2) || curriculumLevelMastered(2, savedCurriculumMastery[2]),
        phase3: phaseMastered(savedP3) || curriculumLevelMastered(3, savedCurriculumMastery[3]),
        phase4: legacyPhase4Complete || level4RunConceptMastered(savedLevel4RunVariantMastery),
        phase5: legacyPhase5Complete || level5RunLandmarkMastered(savedLevel5RunLandmarkMastery),
      };
      const migratedCards = Object.fromEntries(
        CARD_KEYS.map((key) => [key, savedCards[key] || masteryCards[key]]),
      ) as CardState;
      setP1Mastery(savedP1);
      setP2Mastery(savedP2);
      setP3Mastery(savedP3);
      setCurriculumMastery(savedCurriculumMastery);
      setCurriculumExposure(savedCurriculumExposure);
      setP4Mastery(savedP4);
      setP5Mastery(savedP5);
      setPhase4CarrierMastery(savedPhase4CarrierMastery);
      setPhase5RunLocationMastery(savedPhase5RunLocationMastery);
      setLevel4RunVariantMastery(savedLevel4RunVariantMastery);
      setLevel5RunLandmarkMastery(savedLevel5RunLandmarkMastery);
      setHHistory(savedHHistory);
      setCarrierHistory(savedCarrierHistory);
      setLocationHistory(savedLocationHistory);
      setUnlockedCards(migratedCards);
      setCardRevealSeen(savedRevealSeen);
      setPhase2Unlocked(Boolean(saved.phase2Unlocked) || phaseMastered(savedP1) || curriculumLevelMastered(1, savedCurriculumMastery[1]));
      setPhase3Unlocked(Boolean(saved.phase3Unlocked) || phaseMastered(savedP2) || curriculumLevelMastered(2, savedCurriculumMastery[2]));
      setPhase4Unlocked(
        phaseMastered(savedP3) || curriculumLevelMastered(3, savedCurriculumMastery[3]),
      );
      setPhase5Unlocked(level4RunConceptMastered(savedLevel4RunVariantMastery));
      const firstUnseen = CARD_KEYS.find((key) => migratedCards[key] && !savedRevealSeen[key]);
      if (firstUnseen) setPendingReveal(firstUnseen);
      setSelectedCurriculumFormation(selectCurriculumFormation(
        1,
        savedCurriculumMastery[1],
        savedCurriculumExposure[1],
      ));
      setSelectedRunPlay(selectApproved2026RunCall(
        4,
        savedLevel4RunVariantMastery,
        savedLevel5RunLandmarkMastery,
      ));
    } catch {
      setSelectedCurriculumFormation(ACTIVE_2026_FORMATIONS[0]);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem("zyfl-progress", JSON.stringify({
      version: 9,
      progressSchemaVersion: 4,
      formationCurriculumVersion: "2026-fourth-grade",
      runCurriculumVersion: "2026-fourth-grade",
      level1Curriculum2026Mastery: curriculumMastery[1],
      level2Curriculum2026Mastery: curriculumMastery[2],
      level3Curriculum2026Mastery: curriculumMastery[3],
      formationCurriculum2026Exposure: curriculumExposure,
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
      phase4Mastered: phase4Mastered(phase4CarrierMastery),
      phase4CarrierMastery,
      level4RunCurriculum2026Mastery: level4RunVariantMastery,
      level4RunCurriculum2026Mastered: level4RunConceptMastered(level4RunVariantMastery),
      legacyPhase4FormationMastery: p4Mastery,
      phase5Unlocked,
      phase5Mastery: p5Mastery,
      phase5Mastered: phase5Mastered(phase5RunLocationMastery),
      phase5RunLocationMastery,
      level5RunCurriculum2026Mastery: level5RunLandmarkMastery,
      level5RunCurriculum2026Mastered: level5RunLandmarkMastered(level5RunLandmarkMastery),
      legacyPhase5FormationMastery: p5Mastery,
      hModifierHistory: hHistory,
      carrierDigitHistory: carrierHistory,
      runLocationHistory: locationHistory,
      unlockedCards,
      cardRevealSeen,
    }));
  }, [p1Mastery, p2Mastery, p3Mastery, p4Mastery, p5Mastery, curriculumMastery, curriculumExposure, phase4CarrierMastery, phase5RunLocationMastery, level4RunVariantMastery, level5RunLandmarkMastery, phase2Unlocked, phase3Unlocked, phase4Unlocked, phase5Unlocked, hHistory, carrierHistory, locationHistory, unlockedCards, cardRevealSeen, ready]);

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

  useEffect(() => {
    if (tab !== "play") return;
    const viewport = levelScrollViewportRef.current;
    if (!viewport) return;

    const frame = window.requestAnimationFrame(() => {
      scrollActiveLevelIntoView();
      updateLevelScrollButtons();
    });
    const handleResize = () => updateLevelScrollButtons();
    const resizeObserver = typeof ResizeObserver === "undefined"
      ? null
      : new ResizeObserver(handleResize);

    viewport.addEventListener("scroll", updateLevelScrollButtons, { passive: true });
    window.addEventListener("resize", handleResize);
    resizeObserver?.observe(viewport);
    if (viewport.firstElementChild) resizeObserver?.observe(viewport.firstElementChild);

    return () => {
      window.cancelAnimationFrame(frame);
      viewport.removeEventListener("scroll", updateLevelScrollButtons);
      window.removeEventListener("resize", handleResize);
      resizeObserver?.disconnect();
    };
  }, [phase, tab]);

  useEffect(() => {
    if (!pendingLevelAdvance || pendingReveal) return;
    const rewardKey = cardKeyForPhase(pendingLevelAdvance);
    if (!unlockedCards[rewardKey] || !cardRevealSeen[rewardKey]) return;
    advanceToNextLevel(pendingLevelAdvance);
  }, [cardRevealSeen, pendingLevelAdvance, pendingReveal, unlockedCards]);

  const activeCurriculumLevel = phase <= 3 ? phase as CurriculumLevel : null;
  const activeCurriculumMastery = activeCurriculumLevel ? curriculumMastery[activeCurriculumLevel] : {};
  const activeFormationEntry = phase <= 3 ? selectedCurriculumFormation : selectedRunPlay.formation;
  const correctCell = currentPlayer === "H"
    ? null
    : coordinateCell(activeFormationEntry.coordinates[currentPlayer]);
  const correctHSpot = phase === 3
    ? selectedCurriculumFormation.coordinates.H ?? { c: 10, r: 2 }
    : selectedRunPlay.formation.coordinates.H ?? { c: 10, r: 2 };
  const occupiedCurriculumCells = new Set(
    (["Y", "X", "Z"] as const)
      .map((player) => selectedCurriculumFormation.coordinates[player])
      .filter((coordinate): coordinate is GridCoordinate => coordinate !== null)
      .map((coordinate) => `${coordinate.r}-${coordinate.c}`),
  );
  const visibleCurriculumHTargets = CURRICULUM_H_TARGETS.filter(
    (spot) =>
      (spot.c === correctHSpot.c && spot.r === correctHSpot.r) ||
      !occupiedCurriculumCells.has(`${spot.r}-${spot.c}`),
  );
  const displayedFormationCall = activeFormationEntry.displayCall;
  const ballCarrier = selectedRunPlay.runConcept.carrier;
  const locationDigit = selectedRunPlay.runConcept.landmarkDigit;
  const completeCall = selectedRunPlay.displayCall;
  const curriculumFamily = FORMATION_FAMILY_DEFINITIONS[selectedCurriculumFormation.formation];
  const curriculumYAlignmentLabel =
    curriculumFamily.yAlignmentType === "attached-tight-end"
      ? "an attached tight end"
      : curriculumFamily.yAlignmentType === "wing"
        ? "a wing"
        : curriculumFamily.yLineStatus === "on-line"
          ? "an on-line slot"
          : "an off-ball slot";
  const instruction = phase === 4
    ? "Which run concept is this?"
    : phase === 5
      ? "Where is this run designed to go?"
    : phase === 1
    ? "Place Y in the correct spot for the formation."
    : phase === 3
      ? "Place H using the formation tag. 4 means opposite Y. D means the same side as Y."
    : currentPlayer === "Y" ? "Place the Y player."
      : currentPlayer === "X" ? "Correct. Now place X."
        : currentPlayer === "Z" ? "Correct. Now place Z."
          : "Correct. Now place H.";

  const boardStatus = useMemo(() => {
    if (phase === 5 && locationAnswered) {
      const concept = selectedRunPlay.runConcept;
      return resultCorrect
        ? `Correct! ${concept.codeWord} goes ${concept.direction} toward ${concept.landmarkDigit}.`
        : `Check the code word. ${concept.codeWord} means ${concept.direction} toward ${concept.landmarkDigit}.`;
    }
    if (!answered) return instruction;
    if (resultCorrect) {
      return phase === 1
        ? `Correct! In ${selectedCurriculumFormation.formation}, Y lines up as ${curriculumYAlignmentLabel} to the ${curriculumFamily.ySide}.`
        : "Formation complete! Keep building mastery.";
    }
    if (currentPlayer === "H") {
      const side = correctHSpot.c > 10 ? "right" : "left";
      if (phase === 3) {
        return selectedCurriculumFormation.hModifier === "4"
          ? `The 4 tag places H opposite Y.`
          : selectedCurriculumFormation.hModifier === "D"
            ? `The D tag places H on the same side as Y.`
            : `Place H in the stored ${selectedCurriculumFormation.displayCall} alignment.`;
      }
      return `Letters place H on the Y side. Numbers place H away from Y. ${formation} ${hModifier} places H at ${hModifier} on the ${side} side.`;
    }
    if (phase <= 3 && currentPlayer === "Y") {
      return `Not quite. In ${selectedCurriculumFormation.formation}, Y is ${curriculumYAlignmentLabel} to the ${curriculumFamily.ySide}.`;
    }
    return `Check ${currentPlayer}. The blue marker shows the correct location.`;
  }, [answered, correctHSpot.c, currentPlayer, curriculumFamily.ySide, curriculumYAlignmentLabel, formation, hModifier, instruction, locationAnswered, phase, resultCorrect, selectedCurriculumFormation, selectedRunPlay.runConcept]);

  function unlockCard(targetPhase: CardPhase) {
    const key = cardKeyForPhase(targetPhase);
    setUnlockedCards((current) => {
      if (current[key]) {
        if (!cardRevealSeen[key]) setPendingReveal(key);
        return current;
      }
      returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      setPendingReveal(key);
      return { ...current, [key]: true };
    });
  }

  function unlockLevel(level: Phase) {
    if (level === 2) setPhase2Unlocked(true);
    if (level === 3) setPhase3Unlocked(true);
    if (level === 4) setPhase4Unlocked(true);
    if (level === 5) setPhase5Unlocked(true);
  }

  function levelIsUnlocked(level: Phase) {
    if (level === 1) return true;
    if (level === 2) return phase2Unlocked;
    if (level === 3) return phase3Unlocked;
    if (level === 4) return phase4Unlocked;
    return phase5Unlocked;
  }

  function updateLevelScrollButtons() {
    const viewport = levelScrollViewportRef.current;
    if (!viewport) return;
    const tolerance = 2;
    setLevelScrollAtStart(viewport.scrollLeft <= tolerance);
    setLevelScrollAtEnd(
      viewport.scrollLeft + viewport.clientWidth >= viewport.scrollWidth - tolerance,
    );
  }

  function scrollActiveLevelIntoView() {
    const activeCard = levelSelectorRef.current?.querySelector<HTMLButtonElement>(
      '.level-card[aria-current="step"]',
    );
    activeCard?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      block: "nearest",
      inline: "center",
    });
  }

  function getLevelScrollAmount() {
    const card = levelSelectorRef.current?.querySelector<HTMLElement>(".level-card");
    const track = levelSelectorRef.current?.querySelector<HTMLElement>(".level-scroll-track");
    if (!card || !track) return 280;
    const styles = window.getComputedStyle(track);
    const gap = Number.parseFloat(styles.columnGap || styles.gap || "0");
    return card.getBoundingClientRect().width + gap;
  }

  function scrollLevels(direction: -1 | 1) {
    levelScrollViewportRef.current?.scrollBy({
      left: direction * getLevelScrollAmount(),
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    });
  }

  function advanceToNextLevel(currentLevel: Phase) {
    const nextLevel = nextAvailableLevel(currentLevel);
    setPendingLevelAdvance(null);
    setTab("play");

    if (nextLevel) {
      unlockLevel(nextLevel);
      setPhase(nextLevel);
      resetPlay(nextLevel);
      setCelebration(`Level ${nextLevel} ready!`);
      window.setTimeout(() => {
        const target = levelSelectorRef.current?.querySelector<HTMLButtonElement>(`button[data-level="${nextLevel}"]`);
        target?.focus({ preventScroll: true });
      }, 0);
    } else {
      setCelebration(currentLevel < 5 ? "More levels are being updated!" : "All levels mastered!");
      window.setTimeout(() => {
        const target = levelSelectorRef.current?.querySelector<HTMLButtonElement>(`button[data-level="${currentLevel}"]`);
        target?.focus({ preventScroll: true });
      }, 0);
    }
  }

  function handleLevelMastery(levelNumber: Phase) {
    if (completionQueuedRef.current.has(levelNumber)) return;
    completionQueuedRef.current.add(levelNumber);
    setPendingLevelAdvance(levelNumber);
    unlockCard(levelNumber);
  }

  function recordMastery(targetPhase: Phase) {
    if (targetPhase <= 3) {
      const curriculumLevel = targetPhase as CurriculumLevel;
      setCurriculumMastery((current) => {
        const levelMastery = current[curriculumLevel];
        const levelWasMastered = curriculumLevelMastered(curriculumLevel, levelMastery);
        const category = getCurriculumMasteryCategory(curriculumLevel, selectedCurriculumFormation);
        const target = getCurriculumMasteryTarget(curriculumLevel, category);
        const categoryWasMastered = (levelMastery[category] ?? 0) >= target;
        const nextLevelMastery = {
          ...levelMastery,
          [category]: Math.min(target, (levelMastery[category] ?? 0) + 1),
        };
        const levelIsNowMastered = curriculumLevelMastered(curriculumLevel, nextLevelMastery);
        if (!categoryWasMastered && nextLevelMastery[category] >= target) {
          setCelebration(`${category} mastered in Level ${curriculumLevel}!`);
        }
        if (curriculumLevel === 1 && !phase2Unlocked && levelIsNowMastered) {
          setPhase2Unlocked(true);
          setCelebration("Level 2 unlocked! Now place Y, X, and Z.");
        }
        if (curriculumLevel === 2 && !phase3Unlocked && levelIsNowMastered) {
          setPhase3Unlocked(true);
          setCelebration("Level 3 unlocked! Now place H using the formation tag.");
        }
        if (!levelWasMastered && levelIsNowMastered) handleLevelMastery(curriculumLevel);
        return { ...current, [curriculumLevel]: nextLevelMastery };
      });
    } else if (targetPhase === 4) {
      setLevel4RunVariantMastery((current) => {
        const levelWasMastered = level4RunConceptMastered(current);
        const variant = selectedRunPlay.runConceptId;
        const target = getRunMasteryTarget(variant);
        const next = {
          ...current,
          [variant]: Math.min(target, (current[variant] ?? 0) + 1),
        };
        const levelIsNowMastered = level4RunConceptMastered(next);
        if (!phase5Unlocked && levelIsNowMastered) {
          setPhase5Unlocked(true);
          setCelebration("Level 5 unlocked! Now find the run landmark.");
        }
        if (!levelWasMastered && levelIsNowMastered) handleLevelMastery(4);
        return next;
      });
    } else {
      setLevel5RunLandmarkMastery((current) => {
        const levelWasMastered = level5RunLandmarkMastered(current);
        const target = getRunMasteryTarget(selectedRunPlay.runConceptId);
        const wasMastered = (current[locationDigit] ?? 0) >= target;
        const next = {
          ...current,
          [locationDigit]: Math.min(target, (current[locationDigit] ?? 0) + 1),
        };
        if (!wasMastered && (next[locationDigit] ?? 0) >= target) setCelebration(`${locationDigit} · ${selectedRunPlay.concept} mastered in Level 5!`);
        if (!levelWasMastered && level5RunLandmarkMastered(next)) handleLevelMastery(5);
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

  function chooseCurriculumHSpot(coordinate: GridCoordinate) {
    if (answered || phase !== 3 || currentPlayer !== "H") return;
    const expected = selectedCurriculumFormation.coordinates.H;
    const correct = Boolean(expected && expected.c === coordinate.c && expected.r === coordinate.r);
    setCurriculumHPlacement(coordinate);
    setResultCorrect(correct);
    setAnswered(true);
    if (correct) recordMastery(3);
  }

  function chooseRunConcept(choice: RunConceptName) {
    if (!quizOpen || quizAnswered) return;
    const correct = choice === selectedRunPlay.runConcept.concept;
    setQuizChoice(choice);
    setQuizAnswered(true);
    setResultCorrect(correct);
    setAnswered(true);
    if (correct) recordMastery(4);
  }

  function chooseRunLocation(choice: RunLandmarkDigit) {
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
    if (correct) recordMastery(5);
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
    let nextCurriculumFormation = selectedCurriculumFormation;
    if (nextPhase === 4 || nextPhase === 5) {
      const nextPlay = selectApproved2026RunCall(
        nextPhase,
        level4RunVariantMastery,
        level5RunLandmarkMastery,
        selectedRunPlay.id,
        selectedRunPlay.formationId,
      );
      setSelectedRunPlay(nextPlay);
      nextCurriculumFormation = nextPlay.formation;
    } else {
      const curriculumLevel = nextPhase as CurriculumLevel;
      nextCurriculumFormation = selectCurriculumFormation(
        curriculumLevel,
        curriculumMastery[curriculumLevel],
        curriculumExposure[curriculumLevel],
        selectedCurriculumFormation.id,
      );
      setSelectedCurriculumFormation(nextCurriculumFormation);
      setCurriculumExposure((current) => ({
        ...current,
        [curriculumLevel]: {
          ...current[curriculumLevel],
          [nextCurriculumFormation.id]: (current[curriculumLevel][nextCurriculumFormation.id] ?? 0) + 1,
        },
      }));
    }
    setCurrentPlayer(nextPhase === 3 ? "H" : "Y");
    setPlacements(nextPhase >= 3 ? {
      Y: coordinateCell(nextCurriculumFormation.coordinates.Y) as Cell,
      X: coordinateCell(nextCurriculumFormation.coordinates.X) as Cell,
      Z: coordinateCell(nextCurriculumFormation.coordinates.Z) as Cell,
    } : {});
    setHPlacement(null);
    setCurriculumHPlacement(nextPhase >= 4 ? nextCurriculumFormation.coordinates.H : null);
    setSelected(null);
    setAnswered(false);
    setResultCorrect(null);
    setQuizOpen(nextPhase === 4);
    setQuizAnswered(false);
    setQuizChoice(null);
    setLocationActive(nextPhase === 5);
    setLocationAnswered(false);
    setLocationChoice(null);
  }

  function choosePhase(nextPhase: Phase) {
    if (!levelIsAvailable(nextPhase)) return;
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

  function lineStatusClass(label: PlayerLabel) {
    const lineStatus = activeFormationEntry.playerAlignments[label]?.lineStatus;
    return lineStatus ? `line-status-${lineStatus}` : "";
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
    if (!pendingLevelAdvance) {
      if (viewCollection) setTab("cards");
      window.setTimeout(() => returnFocusRef.current?.focus(), 0);
    }
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
      finishReveal(false);
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
        <button className="collection-count" onClick={() => setTab("cards")} aria-label={`${CARD_KEYS.filter((key) => unlockedCards[key]).length} of ${CARD_KEYS.length} cards unlocked`}>
          <span>★</span> {CARD_KEYS.filter((key) => unlockedCards[key]).length}/{CARD_KEYS.length}
        </button>
      </header>

      {tab === "play" && (
        <section className="play-page">
          {celebration && <div className="celebration" role="status"><span>★</span>{celebration}</div>}

          <section ref={levelSelectorRef} className="level-selector" aria-label="Choose a level">
            <button
              type="button"
              className="level-scroll-button level-scroll-left"
              aria-label="Previous levels"
              disabled={levelScrollAtStart}
              onClick={() => scrollLevels(-1)}
            >
              <span aria-hidden="true">‹</span>
            </button>
            <div ref={levelScrollViewportRef} className="level-scroll-viewport">
              <div className="level-scroll-track">
                {LEVEL_CONFIG.map(({ level, title, reward, enabled, lockedMessage }) => {
                  const unlocked = levelIsUnlocked(level);
                  const cardKey = cardKeyForPhase(level);
                  const completed = unlockedCards[cardKey];
                  return (
                    <button
                      key={level}
                      type="button"
                      data-level={level}
                      className={`level-card ${phase === level ? "phase-active" : ""}`}
                      aria-current={phase === level ? "step" : undefined}
                      onClick={() => choosePhase(level)}
                      disabled={!enabled || !unlocked}
                    >
                      <span>Level {level} {completed ? "✓" : unlocked ? "" : "🔒"}</span>
                      <b>{title}</b>
                      {!unlocked && lockedMessage && <small>{lockedMessage}</small>}
                      <small className="phase-reward">{completed ? "Card Unlocked ✓" : reward}</small>
                    </button>
                  );
                })}
              </div>
            </div>
            <button
              type="button"
              className="level-scroll-button level-scroll-right"
              aria-label="More levels"
              disabled={levelScrollAtEnd}
              onClick={() => scrollLevels(1)}
            >
              <span aria-hidden="true">›</span>
            </button>
          </section>

          <div className="play-heading">
            <div className="play-call">
              <p className="eyebrow">Coach&apos;s call · Level {phase}</p>
              <h1 className="approved-play-call">{phase >= 4 ? completeCall : selectedCurriculumFormation.displayCall}</h1>
            </div>
            <div className={`feedback ${answered ? "visible" : ""} ${answered && resultCorrect ? "success" : "try-again"}`} aria-live="polite">
              <span className="feedback-icon">{answered ? (resultCorrect ? "✓" : "!") : locationActive ? "?" : currentPlayer}</span>
              <div>
                <b>{locationAnswered
                  ? (resultCorrect ? "Run landmark correct!" : "Run landmark revealed.")
                  : phase === 4 && quizAnswered
                    ? (resultCorrect ? "Run concept correct!" : "Run concept revealed.")
                  : answered
                    ? (resultCorrect ? (phase === 1 ? "Great alignment!" : "Formation complete!") : `Not quite—study the blue ${currentPlayer}.`)
                    : instruction}</b>
                <p>{boardStatus}</p>
              </div>
              {answered && <button className="primary-button" onClick={() => resetPlay()}>Next Play <span>→</span></button>}
            </div>
            <div className="challenge-chip">
              <span>{phase >= 4 ? "?" : currentPlayer}</span>
              {phase === 4 ? "Name the concept" : phase === 5 ? "Pick the landmark" : `Place ${currentPlayer}`}
            </div>
          </div>

          <div className={`board-wrap ${answered && resultCorrect ? "board-correct" : ""}`}>
            <div ref={landmarksRef} className={`landmarks ${locationActive ? "location-active" : ""}`} aria-label={phase === 5 && (locationActive || locationAnswered) ? "Run location landmarks" : undefined}>
              {LANDMARKS.map((mark) => {
                const validLocation = RUN_LANDMARK_DIGITS.includes(mark.label as RunLandmarkDigit);
                const selectedLocation = locationChoice === mark.label;
                const correctLocation = locationAnswered && locationDigit === mark.label;
                return phase === 5 && (locationActive || locationAnswered) && validLocation ? (
                  <button
                    key={mark.label}
                    className={`landmark-button ${selectedLocation ? "selected-location" : ""} ${selectedLocation && !correctLocation ? "wrong-location" : ""} ${correctLocation ? "correct-location" : ""}`}
                    style={{ gridColumn: mark.after, justifySelf: "end" }}
                    onClick={() => chooseRunLocation(mark.label as RunLandmarkDigit)}
                    disabled={!locationActive || locationAnswered}
                    aria-label={locationAnswered
                      ? `Run landmark ${mark.label}, ${APPROVED_2026_RUN_CONCEPTS.find((concept) => concept.landmarkDigit === mark.label)?.explanation}`
                      : `Run landmark ${mark.label}`}
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
            <div className="formation-board" aria-label={`Formation board for ${displayedFormationCall}`}>
              <div className="line-of-scrimmage" />
              {CURRICULUM_SELECTABLE.map((cell) => {
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
                    disabled={phase >= 4 || answered || quizOpen || currentPlayer === "H"}
                    aria-label={`Place ${currentPlayer} at row ${row}, column ${col}`}
                  >
                    {marker && <span
                      className={`player skill-player player-${marker.label.toLowerCase()} ${lineStatusClass(marker.label)} ${marker.reveal ? "revealed-player" : ""} ${carrierClass(marker.label)}`}
                      data-line-status={activeFormationEntry.playerAlignments[marker.label]?.lineStatus}
                    >
                      {marker.label}{footballBadge(marker.label)}
                    </span>}
                  </button>
                );
              })}
              {phase === 3 && visibleCurriculumHTargets.map((spot) => {
                const selectedHere = curriculumHPlacement?.c === spot.c && curriculumHPlacement?.r === spot.r;
                const expected = selectedCurriculumFormation.coordinates.H;
                const correctHere = answered && resultCorrect === false && expected?.c === spot.c && expected?.r === spot.r;
                const showMarker = selectedHere || correctHere;
                return (
                  <button
                    key={`curriculum-h-${spot.r}-${spot.c}`}
                    className={`h-target ${selectedHere && resultCorrect === false ? "selected" : ""} ${correctHere ? "correct-target" : ""}`}
                    style={{
                      left: `calc((${spot.c} - 0.5) * (100% / 19))`,
                      top: `calc((${spot.r} - 0.5) * (100% / 6))`,
                    }}
                    onClick={() => chooseCurriculumHSpot(spot)}
                    disabled={answered || currentPlayer !== "H"}
                    data-active={currentPlayer === "H"}
                    aria-label={`Place H at row ${spot.r}, column ${spot.c}`}
                  >
                    {showMarker && <span
                      className={`player skill-player player-h ${lineStatusClass("H")} ${correctHere ? "revealed-player" : ""}`}
                      data-line-status={activeFormationEntry.playerAlignments.H?.lineStatus}
                    >
                      H
                    </span>}
                  </button>
                );
              })}
              {phase >= 4 && curriculumHPlacement && (
                <span
                  className={`player skill-player player-h ${lineStatusClass("H")}`}
                  data-line-status={activeFormationEntry.playerAlignments.H?.lineStatus}
                  style={{ gridRow: curriculumHPlacement.r, gridColumn: curriculumHPlacement.c }}
                >
                  H
                </span>
              )}
              {FIXED.map((player) => (
                <span key={player.label} className={`player fixed ${player.label === "C" ? "center" : ""}`} style={{ gridRow: player.row, gridColumn: player.col }}>
                  {player.label}
                </span>
              ))}
              {phase >= 4 && (
                <span
                  className="player fixed ball-carrier"
                  data-line-status={activeFormationEntry.fAlignment.lineStatus}
                  data-f-relation={activeFormationEntry.fAlignment.relationToH}
                  style={{
                    gridRow: activeFormationEntry.coordinates.F.r,
                    gridColumn: activeFormationEntry.coordinates.F.c,
                  }}
                >
                  F<span className="football-badge" aria-label="Ball carrier">🏈</span>
                </span>
              )}
            </div>
            {phase === 4 && quizOpen && (
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
                  <h3 id="carrier-quiz-title">Which run concept is this?</h3>
                  <div className="carrier-answers">
                    {RUN_CONCEPT_NAMES.map((answer) => {
                      const isCorrect = answer === selectedRunPlay.runConcept.concept;
                      const isChosen = answer === quizChoice;
                      return (
                        <button
                          key={answer}
                          className={`${quizAnswered && isCorrect ? "correct-answer" : ""} ${quizAnswered && isChosen && !isCorrect ? "wrong-answer" : ""}`}
                          onClick={() => chooseRunConcept(answer)}
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
                      <p>{selectedRunPlay.runConcept.concept === "Outside Zone"
                        ? "Oregon and Ducks are Outside Zone calls."
                        : "Oklahoma and Sooners are Counter calls."}</p>
                      <button className="primary-button" onClick={() => resetPlay()}>Next Play <span>→</span></button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {phase <= 3
            ? <CurriculumMasteryTracker phase={phase as CurriculumLevel} mastery={activeCurriculumMastery} />
            : phase === 4
              ? <RunConceptMasteryTracker mastery={level4RunVariantMastery} />
              : <RunLandmarkMasteryTracker mastery={level5RunLandmarkMastery} />}
        </section>
      )}

      {tab === "cards" && (
        <section className="cards-page">
          <div className="section-title">
            <p className="eyebrow">Achievement collection</p>
            <h1>My Cards</h1>
            <p>Master each training level to collect every card from Rookie through Mythic.</p>
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
                    <span>Level {card.phase} · {card.rarity}</span>
                    <h2>{isUnlocked ? card.title : `${card.rarity} Card`}</h2>
                    <p>{isUnlocked ? `Level ${card.phase} mastered` : `Master Level ${card.phase} to unlock`}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {tab === "help" && (
        <section className="help-page">
          <div className="section-title"><p className="eyebrow">Quick guide</p><h1>How to Play</h1><p>Master each training level to unlock a collectible football card. Build your collection from Rookie through Mythic.</p></div>
          <div className="steps">
            {[
              ["1", "Master Y", "Place Y in the correct spot for the formation."],
              ["2", "Build the formation", "Build the formation by placing Y, X, and Z."],
              ["3", "Add H", "Place H using the formation tag. 4 means opposite Y. D means the same side as Y."],
              ["4", "Name the run concept", "Choose Outside Zone for Oregon or Ducks. Choose Counter for Oklahoma or Sooners."],
              ["5", "Find the run landmark", "Use the code word: Oregon 9, Ducks 8, Oklahoma 7, and Sooners 6."],
            ].map(([number, title, copy]) => <article key={number}><span>{number}</span><h2>{title}</h2><p>{copy}</p></article>)}
          </div>
          <div className="reference">
            <h2>2026 Formation Reference</h2>
            <div className="reference-grid">
              {ACTIVE_CURRICULUM_FAMILIES.map((name) => (
                <div key={name}><b>{name}</b><span>{curriculumFamilyShortLabel(name)}</span></div>
              ))}
            </div>
            <p className="memory-tip"><b>Memory tip:</b> Right-side formations start with R. Left-side formations start with L.</p>
            <p className="memory-tip h-rule"><b>H-back rule:</b> 4 places H opposite Y. D places H on the same side as Y.</p>
            <p className="memory-tip carrier-rule"><b>Run code words:</b> Oregon and Ducks are Outside Zone. Oklahoma and Sooners are Counter. F carries all four runs.</p>
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
            <p className="eyebrow">Level {CARD_DATA[pendingReveal].phase} mastered!</p>
            <div className="reveal-stage">
              <div className="sealed-card"><span>ZYFL</span><b>FOOTBALL CARD</b></div>
              <img src={CARD_DATA[pendingReveal].image} alt={CARD_DATA[pendingReveal].alt} />
            </div>
            <h2 id="card-reveal-title">{revealReady ? "New Card Unlocked!" : "Opening your reward…"}</h2>
            {revealReady && (
              <>
                <p>{CARD_DATA[pendingReveal].rarity} · {CARD_DATA[pendingReveal].title}</p>
                {pendingLevelAdvance ? (
                  <button className="primary-button" onClick={() => finishReveal(false)}>
                    {nextAvailableLevel(pendingLevelAdvance)
                      ? `Continue to Level ${nextAvailableLevel(pendingLevelAdvance)}`
                      : "Return to Levels"}
                  </button>
                ) : (
                  <>
                    <button className="primary-button" onClick={() => finishReveal(true)}>View My Cards</button>
                    <button className="secondary-button" onClick={() => finishReveal(false)}>Keep Playing</button>
                  </>
                )}
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
              <div><p className="eyebrow">Level {CARD_DATA[detailCard].phase} mastered</p><h2 id="card-detail-title">{CARD_DATA[detailCard].title}</h2></div>
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

function CurriculumMasteryTracker({ phase, mastery }: { phase: CurriculumLevel; mastery: CurriculumMastery }) {
  const categories = getCurriculumMasteryCategories(phase);
  const masteredCount = categories.filter(
    (category) => (mastery[category] ?? 0) >= getCurriculumMasteryTarget(phase, category),
  ).length;
  return (
    <section className="mastery-panel" aria-label={`Level ${phase} mastery`}>
      <div className="mastery-heading">
        <div><p className="eyebrow">Level {phase} progress</p><h2>{phase === 3 ? "H Alignment Mastery" : "Formation Mastery"}</h2></div>
        <span>{masteredCount}/{categories.length} mastered</span>
      </div>
      <div className="mastery-grid">
        {categories.map((category) => {
          const target = getCurriculumMasteryTarget(phase, category);
          const score = mastery[category] ?? 0;
          const complete = score >= target;
          return (
            <div key={category} className={`mastery-item ${complete ? "mastered" : ""}`}>
              <div><b>{complete ? "✓ " : ""}{category}</b><span>{complete ? "Mastered" : `${score}/${target}`}</span></div>
              <i><span style={{ width: `${target ? (score / target) * 100 : 0}%` }} /></i>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function RunConceptMasteryTracker({ mastery }: { mastery: RunVariantMastery }) {
  const conceptProgress = RUN_CONCEPT_NAMES.map((name) => {
    const variants = APPROVED_2026_RUN_CONCEPTS.filter((item) => item.concept === name);
    const target = Math.min(...variants.map((item) => getRunMasteryTarget(item.id)));
    const score = Math.min(...variants.map((item) => mastery[item.id] ?? 0));
    return { name, score, target };
  });
  const masteredCount = conceptProgress.filter(({ score, target }) => score >= target).length;
  return (
    <section className="mastery-panel" aria-label="Level 4 run-concept mastery">
      <div className="mastery-heading">
        <div><p className="eyebrow">Level 4 progress</p><h2>Run Concept Mastery</h2></div>
        <span>{masteredCount}/{RUN_CONCEPT_NAMES.length} mastered</span>
      </div>
      <div className="mastery-grid">
        {conceptProgress.map(({ name, score, target }) => {
          const displayedCount = Math.min(score, target);
          const complete = score >= target;
          return (
            <div key={name} className={`mastery-item ${complete ? "mastered" : ""}`}>
              <div><b>{complete ? "✓ " : ""}{name}</b><span>{displayedCount}/{target}{complete ? " · Mastered" : ""}</span></div>
              <i><span style={{ width: `${target ? (displayedCount / target) * 100 : 0}%` }} /></i>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function RunLandmarkMasteryTracker({ mastery }: { mastery: RunLandmarkMastery }) {
  const masteredCount = APPROVED_2026_RUN_CONCEPTS.filter(
    (concept) => (mastery[concept.landmarkDigit] ?? 0) >= getRunMasteryTarget(concept.id),
  ).length;
  return (
    <section className="mastery-panel" aria-label="Level 5 run-landmark mastery">
      <div className="mastery-heading">
        <div><p className="eyebrow">Level 5 progress</p><h2>Run Landmark Mastery</h2></div>
        <span>{masteredCount}/{RUN_LANDMARK_DIGITS.length} mastered</span>
      </div>
      <div className="mastery-grid">
        {APPROVED_2026_RUN_CONCEPTS.map((concept) => {
          const digit = concept.landmarkDigit;
          const count = mastery[digit] ?? 0;
          const target = getRunMasteryTarget(concept.id);
          const displayedCount = Math.min(count, target);
          const complete = count >= target;
          return (
            <div key={digit} className={`mastery-item ${complete ? "mastered" : ""}`}>
              <div><b>{complete ? "✓ " : ""}{digit} · {concept.codeWord}</b><span>{displayedCount}/{target}{complete ? " · Mastered" : ""}</span></div>
              <i><span style={{ width: `${target ? (displayedCount / target) * 100 : 0}%` }} /></i>
            </div>
          );
        })}
      </div>
    </section>
  );
}
