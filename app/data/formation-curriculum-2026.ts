export type FormationCurriculumFamily =
  | "Right"
  | "Left"
  | "Rip"
  | "Liz"
  | "Rock"
  | "Lex"
  | "Rap"
  | "Lap"
  | "Ray"
  | "Larry"
  | "Ricky"
  | "Lucky";

export type FormationCurriculumModifier = "4" | "D" | null;
export type FormationCurriculumGrade = "Flag" | "3rd Grade" | "4th Grade";
export type FormationSide = "left" | "right";
export type YAlignmentType = "attached-tight-end" | "wing" | "slot" | "unknown";
export type LineStatus = "on-line" | "off-line" | "play-dependent" | "unknown";
export type HRelationToY = "same-side" | "opposite-side";
export type GridCoordinate = { c: number; r: number };
export type FormationCoordinates = {
  Y: GridCoordinate | null;
  X: GridCoordinate | null;
  Z: GridCoordinate | null;
  H: GridCoordinate | null;
};
export type CoordinateSource = "reused-existing" | "playbook-diagram" | "semantic-rule" | "unresolved";
export type GridCompatibility = "compatible" | "compatible-with-new-coordinates" | "requires-adjustment" | "unresolved";
export type CoordinateWarning = {
  players: ["Y" | "X" | "Z" | "H", "Y" | "X" | "Z" | "H"];
  reason: string;
  severity: "blocking";
};

export type FormationFamilyDefinition = {
  formation: FormationCurriculumFamily;
  ySide: FormationSide;
  yAlignmentType: YAlignmentType;
  yLineStatus: LineStatus;
  description: string;
  alignmentVariation?: string;
  otherPlayerAlignmentNote?: string;
  needsReview: boolean;
};

export type HAlignmentDefinition = {
  modifier: Exclude<FormationCurriculumModifier, null>;
  relationToY: HRelationToY;
  alignmentType: "slot";
  lineStatus: "off-line" | "unknown";
  description: string;
};

export type FormationCurriculumEntry = {
  id: string;
  displayCall: string;
  formation: FormationCurriculumFamily;
  hModifier: FormationCurriculumModifier;
  introducedAt: FormationCurriculumGrade;
  cumulativeForFourthGrade: true;
  active: boolean;
  yAlignment: {
    side: FormationSide;
    type: YAlignmentType;
    lineStatus: LineStatus;
  };
  hAlignment: {
    relationToY: HRelationToY;
    type: "slot";
    lineStatus: "off-line" | "unknown";
  } | null;
  coordinates: FormationCoordinates;
  coordinateSources: Record<keyof FormationCoordinates, CoordinateSource>;
  coordinateWarnings: readonly CoordinateWarning[];
  gridCompatibility: GridCompatibility;
  compatibilityNotes?: string;
  alignmentVariation?: string;
  otherPlayerAlignmentNote?: string;
  sourceConflict?: string;
  needsReview: boolean;
};

// 2026 4th Grade ZYFL semantic formation families.
// These definitions intentionally describe alignments without assigning 19×6 grid coordinates.
export const FORMATION_FAMILY_DEFINITIONS: Readonly<
  Record<FormationCurriculumFamily, FormationFamilyDefinition>
> = {
  Right: {
    formation: "Right",
    ySide: "right",
    yAlignmentType: "attached-tight-end",
    yLineStatus: "on-line",
    description: "Y aligns on the line as an attached tight end to the right, in a three-point stance with a two-foot split from the tackle. Z is the receiver off the ball.",
    needsReview: false,
  },
  Left: {
    formation: "Left",
    ySide: "left",
    yAlignmentType: "attached-tight-end",
    yLineStatus: "on-line",
    description: "Y aligns on the line as an attached tight end to the left, in a three-point stance with a two-foot split from the tackle. X is the receiver off the ball.",
    needsReview: false,
  },
  Rip: {
    formation: "Rip",
    ySide: "right",
    yAlignmentType: "wing",
    yLineStatus: "off-line",
    description: "Y aligns as a wing on the right; introductory diagrams show Y at the outside hip of the tackle.",
    alignmentVariation: "Play-dependent wing depth and width from B gap to C gap",
    needsReview: false,
  },
  Liz: {
    formation: "Liz",
    ySide: "left",
    yAlignmentType: "wing",
    yLineStatus: "off-line",
    description: "Y aligns as a wing on the left; introductory diagrams show Y at the outside hip of the tackle.",
    alignmentVariation: "Play-dependent wing depth and width from B gap to C gap",
    needsReview: false,
  },
  Rock: {
    formation: "Rock",
    ySide: "right",
    yAlignmentType: "slot",
    yLineStatus: "off-line",
    description: "Y aligns off the line in a two-point slot stance on the right, halfway between the outside receiver and the inside receiver.",
    needsReview: false,
  },
  Lex: {
    formation: "Lex",
    ySide: "left",
    yAlignmentType: "slot",
    yLineStatus: "off-line",
    description: "Y aligns off the line in a two-point slot stance on the left, halfway between the outside receiver and the inside receiver.",
    needsReview: false,
  },
  Rap: {
    formation: "Rap",
    ySide: "right",
    yAlignmentType: "slot",
    yLineStatus: "on-line",
    description: "Y aligns on the line in a two-point slot stance on the right, halfway between the outside receiver and the inside receiver.",
    needsReview: false,
  },
  Lap: {
    formation: "Lap",
    ySide: "left",
    yAlignmentType: "slot",
    yLineStatus: "on-line",
    description: "Y aligns on the line in a two-point slot stance on the left, halfway between the outside receiver and the inside receiver.",
    needsReview: false,
  },
  Ray: {
    formation: "Ray",
    ySide: "right",
    yAlignmentType: "attached-tight-end",
    yLineStatus: "on-line",
    description: "Ray 4 starts from Right 4, keeps Y attached right, and brings the backside Z across to create trips opposite Y.",
    otherPlayerAlignmentNote: "X stays wide opposite Y; Z crosses beside X; H remains in the normal 4 alignment opposite Y.",
    needsReview: false,
  },
  Larry: {
    formation: "Larry",
    ySide: "left",
    yAlignmentType: "attached-tight-end",
    yLineStatus: "on-line",
    description: "Larry 4 starts from Left 4, keeps Y attached left, and brings the backside X across to create trips opposite Y.",
    otherPlayerAlignmentNote: "Z stays wide opposite Y; X crosses beside Z; H remains in the normal 4 alignment opposite Y.",
    needsReview: false,
  },
  Ricky: {
    formation: "Ricky",
    ySide: "right",
    yAlignmentType: "unknown",
    yLineStatus: "unknown",
    description: "The diagrams identify Ricky as the right-side member of the Ricky/Lucky pair; its complete Y alignment classification remains unresolved.",
    needsReview: true,
  },
  Lucky: {
    formation: "Lucky",
    ySide: "left",
    yAlignmentType: "unknown",
    yLineStatus: "unknown",
    description: "The diagrams identify Lucky as the left-side member of the Ricky/Lucky pair; its complete Y alignment classification remains unresolved.",
    needsReview: true,
  },
};

export const H_ALIGNMENT_DEFINITIONS: Readonly<
  Record<Exclude<FormationCurriculumModifier, null>, HAlignmentDefinition>
> = {
  "4": {
    modifier: "4",
    relationToY: "opposite-side",
    alignmentType: "slot",
    lineStatus: "off-line",
    description: "H aligns opposite Y, halfway between the outside receiver and the tackle.",
  },
  D: {
    modifier: "D",
    relationToY: "same-side",
    alignmentType: "slot",
    lineStatus: "off-line",
    description: "H aligns on the Y side, halfway between the middle receiver and the tackle.",
  },
};

type DraftFamilyCoordinates = Pick<FormationCoordinates, "Y" | "X" | "Z">;

// Draft 19×6 coordinates. Existing live coordinates are not changed or imported here.
const DRAFT_FAMILY_COORDINATES: Readonly<Record<FormationCurriculumFamily, DraftFamilyCoordinates>> = {
  Right: { Y: { c: 13, r: 1 }, X: { c: 2, r: 1 }, Z: { c: 18, r: 2 } },
  Left: { Y: { c: 7, r: 1 }, X: { c: 2, r: 2 }, Z: { c: 18, r: 1 } },
  Rip: { Y: { c: 13, r: 2 }, X: { c: 2, r: 1 }, Z: { c: 18, r: 1 } },
  Liz: { Y: { c: 7, r: 2 }, X: { c: 2, r: 1 }, Z: { c: 18, r: 1 } },
  Rock: { Y: { c: 16, r: 2 }, X: { c: 2, r: 1 }, Z: { c: 18, r: 1 } },
  Lex: { Y: { c: 4, r: 2 }, X: { c: 2, r: 1 }, Z: { c: 18, r: 1 } },
  Rap: { Y: { c: 16, r: 1 }, X: { c: 2, r: 1 }, Z: { c: 18, r: 1 } },
  Lap: { Y: { c: 4, r: 1 }, X: { c: 2, r: 1 }, Z: { c: 18, r: 1 } },
  // Ray 4 is Right 4 with Z explicitly shifted across to the X/H side.
  Ray: { Y: { c: 13, r: 1 }, X: { c: 2, r: 1 }, Z: { c: 4, r: 2 } },
  // Larry 4 is Left 4 with X explicitly shifted across to the Z/H side.
  Larry: { Y: { c: 7, r: 1 }, X: { c: 16, r: 2 }, Z: { c: 18, r: 1 } },
  Ricky: { Y: { c: 13, r: 2 }, X: { c: 2, r: 1 }, Z: { c: 18, r: 1 } },
  Lucky: { Y: { c: 7, r: 2 }, X: { c: 2, r: 1 }, Z: { c: 18, r: 1 } },
};

const LEGACY_FAMILIES = new Set<FormationCurriculumFamily>(["Right", "Left", "Rip", "Liz", "Rock", "Lex"]);

const LEGACY_H_COORDINATES = {
  right: { "4": { c: 4, r: 2 }, D: { c: 16, r: 2 } },
  left: { "4": { c: 16, r: 2 }, D: { c: 4, r: 2 } },
} as const;

const CANDIDATE_2026_H_COORDINATES = {
  right: { "4": { c: 5, r: 2 }, D: { c: 16, r: 2 } },
  left: { "4": { c: 15, r: 2 }, D: { c: 4, r: 2 } },
} as const;

export const H_COORDINATE_COMPATIBILITY_REPORT = (["right", "left"] as const).flatMap((ySide) =>
  (["4", "D"] as const).map((modifier) => ({
    ySide,
    modifier,
    oldCoordinate: LEGACY_H_COORDINATES[ySide][modifier],
    newCandidateCoordinate: CANDIDATE_2026_H_COORDINATES[ySide][modifier],
    matches2026Definition:
      LEGACY_H_COORDINATES[ySide][modifier].c === CANDIDATE_2026_H_COORDINATES[ySide][modifier].c
      && LEGACY_H_COORDINATES[ySide][modifier].r === CANDIDATE_2026_H_COORDINATES[ySide][modifier].r,
  })),
);

export function getCoordinateDistance(a: GridCoordinate, b: GridCoordinate) {
  return {
    columnDistance: Math.abs(a.c - b.c),
    rowDistance: Math.abs(a.r - b.r),
  };
}

export function findCoordinateWarnings(coordinates: FormationCoordinates): CoordinateWarning[] {
  const players = Object.entries(coordinates).filter(
    (entry): entry is [keyof FormationCoordinates, GridCoordinate] => entry[1] !== null,
  );
  const warnings: CoordinateWarning[] = [];
  for (let first = 0; first < players.length; first += 1) {
    for (let second = first + 1; second < players.length; second += 1) {
      const [firstPlayer, firstCoordinate] = players[first];
      const [secondPlayer, secondCoordinate] = players[second];
      const distance = getCoordinateDistance(firstCoordinate, secondCoordinate);
      if (distance.rowDistance === 0 && distance.columnDistance < 1) {
        warnings.push({
          players: [firstPlayer, secondPlayer],
          reason: "Rendered markers overlap",
          severity: "blocking",
        });
      }
    }
  }
  return warnings;
}

type CurriculumEntrySource = Pick<
  FormationCurriculumEntry,
  "id" | "displayCall" | "formation" | "hModifier" | "introducedAt"
> & {
  sourceConflict?: string;
};

function createCurriculumEntry(source: CurriculumEntrySource): FormationCurriculumEntry {
  const family = FORMATION_FAMILY_DEFINITIONS[source.formation];
  const hDefinition = source.hModifier === null ? null : H_ALIGNMENT_DEFINITIONS[source.hModifier];
  const familyCoordinates = DRAFT_FAMILY_COORDINATES[source.formation];
  const diagramHasUnresolvedD =
    (source.formation === "Ricky" || source.formation === "Lucky") && source.hModifier === "D";
  const hCoordinate = diagramHasUnresolvedD
    ? null
    : source.hModifier === null
      ? null
      : CANDIDATE_2026_H_COORDINATES[family.ySide][source.hModifier];
  const coordinates: FormationCoordinates = { ...familyCoordinates, H: hCoordinate };
  const reusedFamily = LEGACY_FAMILIES.has(source.formation);
  const coordinateSources: Record<keyof FormationCoordinates, CoordinateSource> = {
    Y: reusedFamily ? "reused-existing" : "playbook-diagram",
    X: reusedFamily ? "reused-existing" : "playbook-diagram",
    Z: reusedFamily ? "reused-existing" : "playbook-diagram",
    H: diagramHasUnresolvedD || source.hModifier === null ? "unresolved" : "semantic-rule",
  };
  const coordinateWarnings = findCoordinateWarnings(coordinates);
  const gridCompatibility: GridCompatibility = diagramHasUnresolvedD
    ? "unresolved"
    : coordinateWarnings.length
      ? "requires-adjustment"
      : reusedFamily && source.hModifier !== "4"
        ? "compatible"
        : "compatible-with-new-coordinates";
  const compatibilityNotes = diagramHasUnresolvedD
    ? "The diagram places H opposite Y even though the written D rule says same-side; H remains unresolved."
    : coordinateWarnings.length
        ? "The current marker geometry produces a blocking player overlap."
        : source.hModifier === "4"
          ? "The 2026 H midpoint is one column inward from the legacy 4 target."
          : source.formation === "Rap" || source.formation === "Lap"
            ? "Row 1 preserves the on-line slot distinction from the off-line Rock/Lex row 2 alignment."
            : undefined;
  const active =
    gridCompatibility !== "unresolved"
    && gridCompatibility !== "requires-adjustment"
    && coordinateWarnings.length === 0
    && Object.values(coordinates).every((coordinate) => coordinate !== null);
  return {
    ...source,
    cumulativeForFourthGrade: true,
    active,
    yAlignment: {
      side: family.ySide,
      type: family.yAlignmentType,
      lineStatus: family.yLineStatus,
    },
    hAlignment: hDefinition
      ? {
          relationToY: hDefinition.relationToY,
          type: hDefinition.alignmentType,
          lineStatus: hDefinition.lineStatus,
        }
      : null,
    coordinates,
    coordinateSources,
    coordinateWarnings,
    gridCompatibility,
    ...(compatibilityNotes ? { compatibilityNotes } : {}),
    ...(family.alignmentVariation ? { alignmentVariation: family.alignmentVariation } : {}),
    ...(family.otherPlayerAlignmentNote ? { otherPlayerAlignmentNote: family.otherPlayerAlignmentNote } : {}),
    needsReview: family.needsReview || gridCompatibility === "requires-adjustment" || gridCompatibility === "unresolved",
  };
}

// 2026 4th Grade ZYFL cumulative formation curriculum.
// This configuration remains inactive and is not connected to live gameplay.
export const APPROVED_2026_FOURTH_GRADE_FORMATIONS: readonly FormationCurriculumEntry[] = [
  // Flag
  createCurriculumEntry({ id: "rock-4", displayCall: "Rock 4", formation: "Rock", hModifier: "4", introducedAt: "Flag" }),
  createCurriculumEntry({ id: "rock-d", displayCall: "Rock D", formation: "Rock", hModifier: "D", introducedAt: "Flag" }),
  createCurriculumEntry({ id: "lex-4", displayCall: "Lex 4", formation: "Lex", hModifier: "4", introducedAt: "Flag" }),
  createCurriculumEntry({ id: "lex-d", displayCall: "Lex D", formation: "Lex", hModifier: "D", introducedAt: "Flag" }),
  createCurriculumEntry({ id: "rap-4", displayCall: "Rap 4", formation: "Rap", hModifier: "4", introducedAt: "Flag" }),
  createCurriculumEntry({ id: "rap-d", displayCall: "Rap D", formation: "Rap", hModifier: "D", introducedAt: "Flag" }),
  createCurriculumEntry({ id: "lap-4", displayCall: "Lap 4", formation: "Lap", hModifier: "4", introducedAt: "Flag" }),
  createCurriculumEntry({ id: "lap-d", displayCall: "Lap D", formation: "Lap", hModifier: "D", introducedAt: "Flag" }),

  // 3rd Grade
  createCurriculumEntry({ id: "rip-4", displayCall: "Rip 4", formation: "Rip", hModifier: "4", introducedAt: "3rd Grade" }),
  createCurriculumEntry({ id: "rip-d", displayCall: "Rip D", formation: "Rip", hModifier: "D", introducedAt: "3rd Grade" }),
  createCurriculumEntry({ id: "liz-4", displayCall: "Liz 4", formation: "Liz", hModifier: "4", introducedAt: "3rd Grade" }),
  createCurriculumEntry({ id: "liz-d", displayCall: "Liz D", formation: "Liz", hModifier: "D", introducedAt: "3rd Grade" }),
  createCurriculumEntry({ id: "right-4", displayCall: "Right 4", formation: "Right", hModifier: "4", introducedAt: "3rd Grade" }),
  createCurriculumEntry({ id: "right-d", displayCall: "Right D", formation: "Right", hModifier: "D", introducedAt: "3rd Grade" }),
  createCurriculumEntry({ id: "left-4", displayCall: "Left 4", formation: "Left", hModifier: "4", introducedAt: "3rd Grade" }),
  createCurriculumEntry({ id: "left-d", displayCall: "Left D", formation: "Left", hModifier: "D", introducedAt: "3rd Grade" }),

  // 4th Grade
  createCurriculumEntry({ id: "ray-4", displayCall: "Ray 4", formation: "Ray", hModifier: "4", introducedAt: "4th Grade" }),
  createCurriculumEntry({ id: "larry-4", displayCall: "Larry 4", formation: "Larry", hModifier: "4", introducedAt: "4th Grade" }),
  createCurriculumEntry({ id: "ricky-4", displayCall: "Ricky 4", formation: "Ricky", hModifier: "4", introducedAt: "4th Grade" }),
  createCurriculumEntry({ id: "ricky-d", displayCall: "Ricky D", formation: "Ricky", hModifier: "D", introducedAt: "4th Grade" }),
  createCurriculumEntry({ id: "lucky-4", displayCall: "Lucky 4", formation: "Lucky", hModifier: "4", introducedAt: "4th Grade" }),
  createCurriculumEntry({ id: "lucky-d", displayCall: "Lucky D", formation: "Lucky", hModifier: "D", introducedAt: "4th Grade" }),
];

export const ACTIVE_2026_FORMATIONS = APPROVED_2026_FOURTH_GRADE_FORMATIONS.filter(
  (entry) =>
    entry.active
    && entry.gridCompatibility !== "unresolved"
    && entry.gridCompatibility !== "requires-adjustment"
    && entry.coordinateWarnings.length === 0,
);

export const EXCLUDED_2026_FORMATIONS = APPROVED_2026_FOURTH_GRADE_FORMATIONS.filter(
  (entry) => !ACTIVE_2026_FORMATIONS.includes(entry),
);

// Preserve progress written before Ray 4 and Larry 4 received their corrected names.
export const FORMATION_ID_ALIASES: Readonly<Record<string, string>> = {
  ray: "ray-4",
  larry: "larry-4",
};

export const FORMATION_DISPLAY_CALL_ALIASES: Readonly<Record<string, string>> = {
  Ray: "Ray 4",
  Larry: "Larry 4",
};

export function resolveFormationId(value: string) {
  return FORMATION_ID_ALIASES[value] ?? value;
}

export function resolveFormationDisplayCall(value: string) {
  return FORMATION_DISPLAY_CALL_ALIASES[value] ?? value;
}

export function migrateCurriculumExposure(exposure: CurriculumExposure): CurriculumExposure {
  return Object.entries(exposure).reduce<CurriculumExposure>((migrated, [id, count]) => {
    const resolvedId = resolveFormationId(id);
    migrated[resolvedId] = (migrated[resolvedId] ?? 0) + Math.max(0, Math.floor(count));
    return migrated;
  }, {});
}

export type CurriculumLevel = 1 | 2 | 3;
export type CurriculumMastery = Record<string, number>;
export type CurriculumExposure = Record<string, number>;

function receiverCoordinateSignature(entry: FormationCurriculumEntry) {
  return (["Y", "X", "Z"] as const)
    .map((player) => {
      const coordinate = entry.coordinates[player];
      return coordinate ? `${coordinate.r}-${coordinate.c}` : "unresolved";
    })
    .join("|");
}

export function getCurriculumMasteryCategory(level: CurriculumLevel, entry: FormationCurriculumEntry) {
  if (level === 1) return entry.formation;
  if (level === 2) {
    const familySignatures = new Set(
      ACTIVE_2026_FORMATIONS
        .filter((candidate) => candidate.formation === entry.formation)
        .map(receiverCoordinateSignature),
    );
    return familySignatures.size === 1 ? entry.formation : entry.id;
  }
  if (entry.hModifier === "4") return "4 Opposite Y";
  if (entry.hModifier === "D") return "D Same Side as Y";
  return `${entry.formation} H Alignment`;
}

export function getCurriculumMasteryCategories(level: CurriculumLevel) {
  return [...new Set(ACTIVE_2026_FORMATIONS.map((entry) => getCurriculumMasteryCategory(level, entry)))];
}

export function getCurriculumMasteryTarget(level: CurriculumLevel, category: string) {
  const exampleCount = ACTIVE_2026_FORMATIONS.filter(
    (entry) => getCurriculumMasteryCategory(level, entry) === category,
  ).length;
  if (exampleCount >= 3) return 5;
  if (exampleCount === 2) return 4;
  if (exampleCount === 1) return 3;
  return 0;
}

export function curriculumLevelMastered(level: CurriculumLevel, mastery: CurriculumMastery) {
  return getCurriculumMasteryCategories(level).every(
    (category) => (mastery[category] ?? 0) >= getCurriculumMasteryTarget(level, category),
  );
}

export function selectCurriculumFormation(
  level: CurriculumLevel,
  mastery: CurriculumMastery,
  exposure: CurriculumExposure,
  previousId?: string,
) {
  const categories = getCurriculumMasteryCategories(level);
  const incomplete = categories
    .map((category) => ({
      category,
      score: mastery[category] ?? 0,
      target: getCurriculumMasteryTarget(level, category),
    }))
    .filter(({ score, target }) => score < target);
  const considered = incomplete.length ? incomplete : categories.map((category) => ({
    category,
    score: mastery[category] ?? 0,
    target: getCurriculumMasteryTarget(level, category),
  }));
  const lowestRatio = Math.min(...considered.map(({ score, target }) => score / Math.max(1, target)));
  const priorityCategories = new Set(
    considered.filter(({ score, target }) => score / Math.max(1, target) === lowestRatio).map(({ category }) => category),
  );
  let candidates = ACTIVE_2026_FORMATIONS.filter(
    (entry) => priorityCategories.has(getCurriculumMasteryCategory(level, entry)),
  );
  const lowestExposure = Math.min(...candidates.map((entry) => exposure[entry.id] ?? 0));
  candidates = candidates.filter((entry) => (exposure[entry.id] ?? 0) === lowestExposure);
  const withoutRepeat = candidates.filter((entry) => entry.id !== previousId);
  if (withoutRepeat.length) {
    candidates = withoutRepeat;
  } else {
    const samePriorityAlternatives = ACTIVE_2026_FORMATIONS.filter(
      (entry) =>
        entry.id !== previousId &&
        priorityCategories.has(getCurriculumMasteryCategory(level, entry)),
    );
    const anyAlternative = ACTIVE_2026_FORMATIONS.filter((entry) => entry.id !== previousId);
    candidates = samePriorityAlternatives.length ? samePriorityAlternatives : anyAlternative;
  }
  return candidates[Math.floor(Math.random() * candidates.length)] ?? ACTIVE_2026_FORMATIONS[0];
}

export const FORMATION_GRID_COMPATIBILITY_REPORT = {
  grid: { columns: 19, rows: 6 },
  markerDiameter: "clamp(31px, 4vw, 48px)",
  entries: APPROVED_2026_FOURTH_GRADE_FORMATIONS.map((entry) => ({
    id: entry.id,
    displayCall: entry.displayCall,
    gridCompatibility: entry.gridCompatibility,
    compatibilityNotes: entry.compatibilityNotes,
    coordinateWarnings: entry.coordinateWarnings,
  })),
};

const VALID_FORMATION_FAMILIES: ReadonlySet<FormationCurriculumFamily> = new Set(
  Object.keys(FORMATION_FAMILY_DEFINITIONS) as FormationCurriculumFamily[],
);
const VALID_MODIFIERS: ReadonlySet<FormationCurriculumModifier> = new Set(["4", "D", null]);

export function validateApproved2026FourthGradeFormations(
  entries: readonly FormationCurriculumEntry[] = APPROVED_2026_FOURTH_GRADE_FORMATIONS,
): true {
  if (entries.length !== 22) throw new Error("The 2026 fourth-grade formation curriculum must contain exactly 22 entries.");
  if (new Set(entries.map((entry) => entry.id)).size !== entries.length) throw new Error("Formation curriculum ids must be unique.");
  if (new Set(entries.map((entry) => entry.displayCall)).size !== entries.length) throw new Error("Formation curriculum display calls must be unique.");
  if (entries.some((entry) => !VALID_FORMATION_FAMILIES.has(entry.formation))) throw new Error("Formation curriculum contains an invalid formation family.");
  if (entries.some((entry) => !VALID_MODIFIERS.has(entry.hModifier))) throw new Error("Formation curriculum contains an invalid H modifier.");
  if (entries.some((entry) => (entry.formation === "Ray" || entry.formation === "Larry") && entry.hModifier !== "4")) {
    throw new Error("Ray and Larry must use the 4 modifier.");
  }
  if (entries.some((entry) => entry.active && (
    entry.gridCompatibility === "unresolved"
    || entry.gridCompatibility === "requires-adjustment"
    || entry.coordinateWarnings.length > 0
    || Object.values(entry.coordinates).some((coordinate) => coordinate === null)
  ))) throw new Error("Only complete, compatible 2026 formations may be active.");
  if (entries.some((entry) => Object.values(entry.coordinates).some((coordinate) =>
    coordinate !== null && (coordinate.c < 1 || coordinate.c > 19 || coordinate.r < 1 || coordinate.r > 6)
  ))) throw new Error("Formation curriculum contains coordinates outside the 19×6 grid.");
  if (entries.some((entry) => entry.gridCompatibility === "compatible" && entry.coordinateWarnings.length)) {
    throw new Error("A compatible formation cannot contain blocking coordinate warnings.");
  }
  return true;
}
