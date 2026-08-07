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

export type FormationCurriculumModifier =
  | "0"
  | "1" | "2" | "3" | "4" | "5"
  | "A" | "B" | "C" | "D" | "E"
  | null;
export type FormationCurriculumGrade = "Flag" | "3rd Grade" | "4th Grade";
export type FormationSide = "left" | "right";
export type YAlignmentType = "attached-tight-end" | "wing" | "slot" | "unknown";
export type LineStatus = "on-line" | "off-line" | "play-dependent" | "unknown";
export type HRelationToY = "same-side" | "opposite-side";
export type FRelationToH = "same-side" | "opposite-side";
export type GridCoordinate = { c: number; r: number };
export type PlayerLineStatus = "on-line" | "off-line";
export type PlayerAlignment = {
  c: number;
  depthRow: number;
  lineStatus: PlayerLineStatus;
};
export type FormationPlayerAlignments = {
  Y: PlayerAlignment | null;
  X: PlayerAlignment | null;
  Z: PlayerAlignment | null;
  H: PlayerAlignment | null;
};
export type FormationCoordinates = {
  Y: GridCoordinate | null;
  X: GridCoordinate | null;
  Z: GridCoordinate | null;
  H: GridCoordinate | null;
  F: GridCoordinate;
};
export type CoordinateSource = "reused-existing" | "playbook-diagram" | "semantic-rule" | "unresolved";
export type GridCompatibility = "compatible" | "compatible-with-new-coordinates" | "requires-adjustment" | "unresolved";
export type CoordinateWarning = {
  players: ["Y" | "X" | "Z" | "H" | "F", "Y" | "X" | "Z" | "H" | "F"];
  reason: string;
  severity: "blocking";
};

export type FormationFamilyDefinition = {
  formation: FormationCurriculumFamily;
  ySide: FormationSide;
  yAlignmentType: YAlignmentType;
  yLineStatus: LineStatus;
  description: string;
  fRelationToH: FRelationToH;
  alignmentVariation?: string;
  otherPlayerAlignmentNote?: string;
  needsReview: boolean;
};

export type HAlignmentDefinition = {
  modifier: Exclude<FormationCurriculumModifier, null>;
  kind: "ladder" | "role-swap";
  relationToY: HRelationToY | "receiver-dependent";
  landmark: "base-tailback" | "b-gap" | "wing" | "inside-slot" | "outside-receiver" | "receiver-swap";
  depthRow: number | "receiver-dependent";
  lineStatus: PlayerLineStatus | "receiver-dependent";
  coordinatesByYSide: Readonly<Record<FormationSide, GridCoordinate>> | null;
  pairedWith: Exclude<FormationCurriculumModifier, null> | null;
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
  runCurriculumEligible: boolean;
  yAlignment: {
    side: FormationSide;
    type: YAlignmentType;
    lineStatus: LineStatus;
  };
  hAlignment: {
    relationToY: HAlignmentDefinition["relationToY"];
    type: HAlignmentDefinition["landmark"];
    lineStatus: PlayerLineStatus | "receiver-dependent" | "unknown";
  } | null;
  coordinates: FormationCoordinates;
  playerAlignments: FormationPlayerAlignments;
  fAlignment: {
    relationToH: FRelationToH;
    side: FormationSide;
    horizontalLandmark: "backfield-left" | "backfield-right";
    c: number;
    depthRow: number;
    lineStatus: "off-line";
  };
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
    fRelationToH: "opposite-side",
    needsReview: false,
  },
  Left: {
    formation: "Left",
    ySide: "left",
    yAlignmentType: "attached-tight-end",
    yLineStatus: "on-line",
    description: "Y aligns on the line as an attached tight end to the left, in a three-point stance with a two-foot split from the tackle. X is the receiver off the ball.",
    fRelationToH: "opposite-side",
    needsReview: false,
  },
  Rip: {
    formation: "Rip",
    ySide: "right",
    yAlignmentType: "wing",
    yLineStatus: "off-line",
    description: "Y aligns as a wing on the right; introductory diagrams show Y at the outside hip of the tackle.",
    fRelationToH: "opposite-side",
    alignmentVariation: "Play-dependent wing depth and width from B gap to C gap",
    needsReview: false,
  },
  Liz: {
    formation: "Liz",
    ySide: "left",
    yAlignmentType: "wing",
    yLineStatus: "off-line",
    description: "Y aligns as a wing on the left; introductory diagrams show Y at the outside hip of the tackle.",
    fRelationToH: "opposite-side",
    alignmentVariation: "Play-dependent wing depth and width from B gap to C gap",
    needsReview: false,
  },
  Rock: {
    formation: "Rock",
    ySide: "right",
    yAlignmentType: "slot",
    yLineStatus: "off-line",
    description: "Y aligns off the line in a two-point slot stance on the right, halfway between the outside receiver and the inside receiver.",
    fRelationToH: "same-side",
    needsReview: false,
  },
  Lex: {
    formation: "Lex",
    ySide: "left",
    yAlignmentType: "slot",
    yLineStatus: "off-line",
    description: "Y aligns off the line in a two-point slot stance on the left, halfway between the outside receiver and the inside receiver.",
    fRelationToH: "same-side",
    needsReview: false,
  },
  Rap: {
    formation: "Rap",
    ySide: "right",
    yAlignmentType: "slot",
    yLineStatus: "on-line",
    description: "Y aligns on the line in a two-point slot stance on the right, halfway between the outside receiver and the inside receiver.",
    fRelationToH: "same-side",
    needsReview: false,
  },
  Lap: {
    formation: "Lap",
    ySide: "left",
    yAlignmentType: "slot",
    yLineStatus: "on-line",
    description: "Y aligns on the line in a two-point slot stance on the left, halfway between the outside receiver and the inside receiver.",
    fRelationToH: "same-side",
    needsReview: false,
  },
  Ray: {
    formation: "Ray",
    ySide: "right",
    yAlignmentType: "attached-tight-end",
    yLineStatus: "on-line",
    description: "Ray 4 starts from Right 4, keeps Y attached right, and brings the backside Z across to create trips opposite Y.",
    fRelationToH: "opposite-side",
    otherPlayerAlignmentNote: "X stays wide opposite Y; Z crosses beside X; H remains in the normal 4 alignment opposite Y.",
    needsReview: false,
  },
  Larry: {
    formation: "Larry",
    ySide: "left",
    yAlignmentType: "attached-tight-end",
    yLineStatus: "on-line",
    description: "Larry 4 starts from Left 4, keeps Y attached left, and brings the backside X across to create trips opposite Y.",
    fRelationToH: "opposite-side",
    otherPlayerAlignmentNote: "Z stays wide opposite Y; X crosses beside Z; H remains in the normal 4 alignment opposite Y.",
    needsReview: false,
  },
  Ricky: {
    formation: "Ricky",
    ySide: "right",
    yAlignmentType: "wing",
    yLineStatus: "off-line",
    description: "Ricky retains the Rip wing alignment. H moves on-line and X moves off-line without changing either player's horizontal column.",
    fRelationToH: "opposite-side",
    needsReview: false,
  },
  Lucky: {
    formation: "Lucky",
    ySide: "left",
    yAlignmentType: "wing",
    yLineStatus: "off-line",
    description: "Lucky retains the Liz wing alignment. H moves on-line and Z moves off-line without changing either player's horizontal column.",
    fRelationToH: "opposite-side",
    needsReview: false,
  },
};

export const H_ALIGNMENT_DEFINITIONS: Readonly<
  Record<Exclude<FormationCurriculumModifier, null>, HAlignmentDefinition>
> = {
  "0": {
    modifier: "0", kind: "role-swap", relationToY: "receiver-dependent", landmark: "receiver-swap",
    depthRow: "receiver-dependent", lineStatus: "receiver-dependent", coordinatesByYSide: null, pairedWith: null,
    description: "H becomes the single receiver; the displaced X or Z assumes H's base-tailback role.",
  },
  "1": {
    modifier: "1", kind: "ladder", relationToY: "opposite-side", landmark: "base-tailback",
    depthRow: 5, lineStatus: "off-line", coordinatesByYSide: { right: { c: 9, r: 5 }, left: { c: 11, r: 5 } }, pairedWith: "A",
    description: "H aligns in the base-tailback position opposite Y.",
  },
  "2": {
    modifier: "2", kind: "ladder", relationToY: "opposite-side", landmark: "b-gap",
    depthRow: 2, lineStatus: "off-line", coordinatesByYSide: { right: { c: 8.5, r: 2 }, left: { c: 11.5, r: 2 } }, pairedWith: "B",
    description: "H aligns in the B-gap area opposite Y.",
  },
  "3": {
    modifier: "3", kind: "ladder", relationToY: "opposite-side", landmark: "wing",
    depthRow: 2, lineStatus: "off-line", coordinatesByYSide: { right: { c: 7.5, r: 2 }, left: { c: 12.5, r: 2 } }, pairedWith: "C",
    description: "H aligns as a wing opposite Y.",
  },
  "4": {
    modifier: "4", kind: "ladder", relationToY: "opposite-side", landmark: "inside-slot",
    depthRow: 2, lineStatus: "off-line", coordinatesByYSide: { right: { c: 5, r: 2 }, left: { c: 15, r: 2 } }, pairedWith: "D",
    description: "H aligns opposite Y, halfway between the outside receiver and the tackle.",
  },
  "5": {
    modifier: "5", kind: "ladder", relationToY: "opposite-side", landmark: "outside-receiver",
    depthRow: 2, lineStatus: "off-line", coordinatesByYSide: { right: { c: 3, r: 2 }, left: { c: 17, r: 2 } }, pairedWith: "E",
    description: "H aligns as an outside receiver near the numbers opposite Y.",
  },
  A: {
    modifier: "A", kind: "ladder", relationToY: "same-side", landmark: "base-tailback",
    depthRow: 5, lineStatus: "off-line", coordinatesByYSide: { right: { c: 11, r: 5 }, left: { c: 9, r: 5 } }, pairedWith: "1",
    description: "H aligns in the base-tailback position on Y's side.",
  },
  B: {
    modifier: "B", kind: "ladder", relationToY: "same-side", landmark: "b-gap",
    depthRow: 2, lineStatus: "off-line", coordinatesByYSide: { right: { c: 11.5, r: 2 }, left: { c: 8.5, r: 2 } }, pairedWith: "2",
    description: "H aligns in the B-gap area on Y's side.",
  },
  C: {
    modifier: "C", kind: "ladder", relationToY: "same-side", landmark: "wing",
    depthRow: 2, lineStatus: "off-line", coordinatesByYSide: { right: { c: 12.5, r: 2 }, left: { c: 7.5, r: 2 } }, pairedWith: "3",
    description: "H aligns as a wing on Y's side.",
  },
  D: {
    modifier: "D", kind: "ladder", relationToY: "same-side", landmark: "inside-slot",
    depthRow: 2, lineStatus: "off-line", coordinatesByYSide: { right: { c: 16, r: 2 }, left: { c: 4, r: 2 } }, pairedWith: "4",
    description: "H aligns on the Y side, halfway between the middle receiver and the tackle.",
  },
  E: {
    modifier: "E", kind: "ladder", relationToY: "same-side", landmark: "outside-receiver",
    depthRow: 2, lineStatus: "off-line", coordinatesByYSide: { right: { c: 17, r: 2 }, left: { c: 3, r: 2 } }, pairedWith: "5",
    description: "H aligns as an outside receiver near the numbers on Y's side.",
  },
};

type FamilyPlayerAlignments = Pick<FormationPlayerAlignments, "Y" | "X" | "Z">;

const onLine = (c: number): PlayerAlignment => ({ c, depthRow: 1, lineStatus: "on-line" });
const offLine = (c: number): PlayerAlignment => ({ c, depthRow: 2, lineStatus: "off-line" });

function withLineStatus(
  base: FamilyPlayerAlignments,
  overrides: Partial<Record<keyof FamilyPlayerAlignments, PlayerLineStatus>>,
): FamilyPlayerAlignments {
  return Object.fromEntries(
    (Object.keys(base) as Array<keyof FamilyPlayerAlignments>).map((player) => {
      const alignment = base[player];
      return [player, alignment && overrides[player]
        ? {
            ...alignment,
            depthRow: overrides[player] === "on-line" ? 1 : 2,
            lineStatus: overrides[player],
          }
        : alignment];
    }),
  ) as FamilyPlayerAlignments;
}

const RIGHT_ALIGNMENTS: FamilyPlayerAlignments = { Y: onLine(13), X: onLine(2), Z: offLine(18) };
const LEFT_ALIGNMENTS: FamilyPlayerAlignments = { Y: onLine(7), X: offLine(2), Z: onLine(18) };
const RIP_ALIGNMENTS: FamilyPlayerAlignments = { Y: offLine(13), X: onLine(2), Z: onLine(18) };
const LIZ_ALIGNMENTS: FamilyPlayerAlignments = { Y: offLine(7), X: onLine(2), Z: onLine(18) };
const ROCK_ALIGNMENTS: FamilyPlayerAlignments = { Y: offLine(16), X: onLine(2), Z: onLine(18) };
const LEX_ALIGNMENTS: FamilyPlayerAlignments = { Y: offLine(4), X: onLine(2), Z: onLine(18) };

// Draft 19×6 coordinates. Existing live coordinates are not changed or imported here.
const DRAFT_FAMILY_ALIGNMENTS: Readonly<Record<FormationCurriculumFamily, FamilyPlayerAlignments>> = {
  Right: RIGHT_ALIGNMENTS,
  Left: LEFT_ALIGNMENTS,
  Rip: RIP_ALIGNMENTS,
  Liz: LIZ_ALIGNMENTS,
  Rock: ROCK_ALIGNMENTS,
  Lex: LEX_ALIGNMENTS,
  Rap: withLineStatus(ROCK_ALIGNMENTS, { Y: "on-line" }),
  Lap: withLineStatus(LEX_ALIGNMENTS, { Y: "on-line" }),
  // Ray 4 is Right 4 with Z explicitly shifted across to the X/H side.
  Ray: { Y: onLine(13), X: onLine(2), Z: offLine(4) },
  // Larry 4 is Left 4 with X explicitly shifted across to the Z/H side.
  Larry: { Y: onLine(7), X: offLine(16), Z: onLine(18) },
  Ricky: withLineStatus(RIP_ALIGNMENTS, { X: "off-line" }),
  Lucky: withLineStatus(LIZ_ALIGNMENTS, { Z: "off-line" }),
};

function renderCoordinate(alignment: PlayerAlignment | null): GridCoordinate | null {
  return alignment
    ? { c: alignment.c, r: alignment.depthRow }
    : null;
}

export function resolveFAlignment(
  hAlignment: PlayerAlignment,
  relationToH: FRelationToH,
): FormationCurriculumEntry["fAlignment"] {
  const hSide: FormationSide = hAlignment.c < 10 ? "left" : "right";
  const side: FormationSide = relationToH === "same-side"
    ? hSide
    : hSide === "left" ? "right" : "left";
  return {
    relationToH,
    side,
    horizontalLandmark: side === "left" ? "backfield-left" : "backfield-right",
    c: side === "left" ? 9 : 11,
    depthRow: 6,
    lineStatus: "off-line",
  };
}

type HResolvedCoordinates = Omit<FormationCoordinates, "F">;

export type HAlignmentResolution = {
  modifier: Exclude<FormationCurriculumModifier, null>;
  playerAlignments: FormationPlayerAlignments;
  coordinates: HResolvedCoordinates;
  swappedReceiver: "X" | "Z" | null;
};

export function resolveHFormationAlignment(
  base: FamilyPlayerAlignments,
  ySide: FormationSide,
  modifier: Exclude<FormationCurriculumModifier, null>,
): HAlignmentResolution {
  const definition = H_ALIGNMENT_DEFINITIONS[modifier];
  let playerAlignments: FormationPlayerAlignments;
  let swappedReceiver: "X" | "Z" | null = null;

  if (modifier === "0") {
    swappedReceiver = ySide === "right" ? "X" : "Z";
    const receiverAlignment = base[swappedReceiver];
    const tailbackCoordinate = H_ALIGNMENT_DEFINITIONS["1"].coordinatesByYSide?.[ySide];
    if (!receiverAlignment || !tailbackCoordinate) throw new Error("The 0 alignment requires an outside receiver and base-tailback landmark.");
    playerAlignments = {
      ...base,
      H: { ...receiverAlignment },
      [swappedReceiver]: {
        c: tailbackCoordinate.c,
        depthRow: tailbackCoordinate.r,
        lineStatus: "off-line",
      },
    };
  } else {
    const coordinate = definition.coordinatesByYSide?.[ySide];
    if (!coordinate || definition.lineStatus === "receiver-dependent") {
      throw new Error(`${modifier} is missing explicit H alignment metadata.`);
    }
    playerAlignments = {
      ...base,
      H: {
        c: coordinate.c,
        depthRow: coordinate.r,
        lineStatus: definition.lineStatus,
      },
    };
  }

  const coordinates = Object.fromEntries(
    (Object.keys(playerAlignments) as Array<keyof FormationPlayerAlignments>)
      .map((player) => [player, renderCoordinate(playerAlignments[player])]),
  ) as HResolvedCoordinates;
  return { modifier, playerAlignments, coordinates, swappedReceiver };
}

export function resolveHAlignmentForFormation(
  formation: FormationCurriculumFamily,
  modifier: Exclude<FormationCurriculumModifier, null>,
) {
  return resolveHFormationAlignment(
    DRAFT_FAMILY_ALIGNMENTS[formation],
    FORMATION_FAMILY_DEFINITIONS[formation].ySide,
    modifier,
  );
}

export const ALL_H_ALIGNMENT_MODIFIERS = [
  "1", "2", "3", "4", "5", "A", "B", "C", "D", "E", "0",
] as const satisfies readonly Exclude<FormationCurriculumModifier, null>[];

// Inactive reference records support future curricula without changing the active fourth-grade list.
export const H_ALIGNMENT_REFERENCE_FORMATIONS = ([
  ["Right", "right", RIGHT_ALIGNMENTS],
  ["Left", "left", LEFT_ALIGNMENTS],
] as const).flatMap(([formation, ySide, base]) =>
  ALL_H_ALIGNMENT_MODIFIERS.map((modifier) => {
    const resolution = resolveHFormationAlignment(base, ySide, modifier);
    const fAlignment = resolveFAlignment(
      resolution.playerAlignments.H!,
      modifier === "0" ? "same-side" : "opposite-side",
    );
    return {
      id: `${formation.toLowerCase()}-${modifier.toLowerCase()}-reference`,
      displayCall: `${formation} ${modifier}`,
      formation,
      active: false as const,
      ...resolution,
      fAlignment,
      coordinates: {
        ...resolution.coordinates,
        F: { c: fAlignment.c, r: fAlignment.depthRow },
      },
    };
  }),
);

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
  runCurriculumEligible?: boolean;
};

function createCurriculumEntry(source: CurriculumEntrySource): FormationCurriculumEntry {
  const family = FORMATION_FAMILY_DEFINITIONS[source.formation];
  const hDefinition = source.hModifier === null ? null : H_ALIGNMENT_DEFINITIONS[source.hModifier];
  const familyAlignments = DRAFT_FAMILY_ALIGNMENTS[source.formation];
  const resolvedAlignment = source.hModifier === null
    ? null
    : resolveHFormationAlignment(familyAlignments, family.ySide, source.hModifier);
  const playerAlignments: FormationPlayerAlignments = resolvedAlignment
    ? { ...resolvedAlignment.playerAlignments }
    : { ...familyAlignments, H: null };
  if ((source.formation === "Ricky" || source.formation === "Lucky") && playerAlignments.H) {
    playerAlignments.H = { ...playerAlignments.H, depthRow: 1, lineStatus: "on-line" };
  }
  if (!playerAlignments.H) throw new Error(`${source.displayCall} requires an explicit H alignment before F can be placed.`);
  const fAlignment = resolveFAlignment(playerAlignments.H, family.fRelationToH);
  const playerCoordinates = Object.fromEntries(
    (Object.keys(playerAlignments) as Array<keyof FormationPlayerAlignments>)
      .map((player) => [player, renderCoordinate(playerAlignments[player])]),
  ) as HResolvedCoordinates;
  const coordinates: FormationCoordinates = {
    ...playerCoordinates,
    F: { c: fAlignment.c, r: fAlignment.depthRow },
  };
  const reusedFamily = LEGACY_FAMILIES.has(source.formation);
  const coordinateSources: Record<keyof FormationCoordinates, CoordinateSource> = {
    Y: reusedFamily ? "reused-existing" : "playbook-diagram",
    X: reusedFamily ? "reused-existing" : "playbook-diagram",
    Z: reusedFamily ? "reused-existing" : "playbook-diagram",
    H: source.hModifier === null ? "unresolved" : "semantic-rule",
    F: "semantic-rule",
  };
  const coordinateWarnings = findCoordinateWarnings(coordinates);
  const gridCompatibility: GridCompatibility = coordinateWarnings.length
      ? "requires-adjustment"
      : reusedFamily && source.hModifier !== "4"
        ? "compatible"
        : "compatible-with-new-coordinates";
  const compatibilityNotes = coordinateWarnings.length
        ? "The current marker geometry produces a blocking player overlap."
        : source.formation === "Ricky" || source.formation === "Lucky"
          ? "H is on-line while the designated outside receiver is off-line; horizontal columns match the Rip/Liz base."
        : source.hModifier === "4"
          ? "The 2026 H midpoint is one column inward from the legacy 4 target."
          : source.formation === "Rap" || source.formation === "Lap"
            ? "Row 1 preserves the on-line slot distinction from the off-line Rock/Lex row 2 alignment."
            : undefined;
  const active =
    gridCompatibility !== "requires-adjustment"
    && coordinateWarnings.length === 0
    && Object.values(coordinates).every((coordinate) => coordinate !== null);
  return {
    ...source,
    cumulativeForFourthGrade: true,
    active,
    runCurriculumEligible: source.runCurriculumEligible ?? true,
    yAlignment: {
      side: family.ySide,
      type: family.yAlignmentType,
      lineStatus: family.yLineStatus,
    },
    hAlignment: hDefinition
      ? {
          relationToY: hDefinition.relationToY,
          type: hDefinition.landmark,
          lineStatus: playerAlignments.H?.lineStatus ?? hDefinition.lineStatus,
        }
      : null,
    coordinates,
    playerAlignments,
    fAlignment,
    coordinateSources,
    coordinateWarnings,
    gridCompatibility,
    ...(compatibilityNotes ? { compatibilityNotes } : {}),
    ...(family.alignmentVariation ? { alignmentVariation: family.alignmentVariation } : {}),
    ...(family.otherPlayerAlignmentNote ? { otherPlayerAlignmentNote: family.otherPlayerAlignmentNote } : {}),
    needsReview: family.needsReview || gridCompatibility === "requires-adjustment",
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
  createCurriculumEntry({ id: "ricky-4", displayCall: "Ricky 4", formation: "Ricky", hModifier: "4", introducedAt: "4th Grade", runCurriculumEligible: false }),
  createCurriculumEntry({ id: "ricky-d", displayCall: "Ricky D", formation: "Ricky", hModifier: "D", introducedAt: "4th Grade", runCurriculumEligible: false }),
  createCurriculumEntry({ id: "lucky-4", displayCall: "Lucky 4", formation: "Lucky", hModifier: "4", introducedAt: "4th Grade", runCurriculumEligible: false }),
  createCurriculumEntry({ id: "lucky-d", displayCall: "Lucky D", formation: "Lucky", hModifier: "D", introducedAt: "4th Grade", runCurriculumEligible: false }),
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
const VALID_MODIFIERS: ReadonlySet<FormationCurriculumModifier> = new Set([
  ...ALL_H_ALIGNMENT_MODIFIERS,
  null,
]);

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
