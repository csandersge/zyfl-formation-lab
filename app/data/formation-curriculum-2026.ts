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
  active: false;
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
  coordinates: null;
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
    description: "Y uses the attached tight-end alignment on the right.",
    otherPlayerAlignmentNote: "X, Z, H, QB, and F placement requires later diagram review and must not be assumed identical to Right.",
    needsReview: true,
  },
  Larry: {
    formation: "Larry",
    ySide: "left",
    yAlignmentType: "attached-tight-end",
    yLineStatus: "on-line",
    description: "Y uses the attached tight-end alignment on the left.",
    otherPlayerAlignmentNote: "X, Z, H, QB, and F placement requires later diagram review and must not be assumed identical to Left.",
    needsReview: true,
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

const RAY_LARRY_SOURCE_CONFLICT =
  "Progression table lists Ray/Larry without a modifier; diagram labels may show 4. Retained progression-table wording pending implementation review.";

type CurriculumEntrySource = Pick<
  FormationCurriculumEntry,
  "id" | "displayCall" | "formation" | "hModifier" | "introducedAt"
> & {
  sourceConflict?: string;
};

function createCurriculumEntry(source: CurriculumEntrySource): FormationCurriculumEntry {
  const family = FORMATION_FAMILY_DEFINITIONS[source.formation];
  const hDefinition = source.hModifier === null ? null : H_ALIGNMENT_DEFINITIONS[source.hModifier];
  return {
    ...source,
    cumulativeForFourthGrade: true,
    active: false,
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
    coordinates: null,
    ...(family.alignmentVariation ? { alignmentVariation: family.alignmentVariation } : {}),
    ...(family.otherPlayerAlignmentNote ? { otherPlayerAlignmentNote: family.otherPlayerAlignmentNote } : {}),
    needsReview: family.needsReview,
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
  createCurriculumEntry({ id: "ray", displayCall: "Ray", formation: "Ray", hModifier: null, introducedAt: "4th Grade", sourceConflict: RAY_LARRY_SOURCE_CONFLICT }),
  createCurriculumEntry({ id: "larry", displayCall: "Larry", formation: "Larry", hModifier: null, introducedAt: "4th Grade", sourceConflict: RAY_LARRY_SOURCE_CONFLICT }),
  createCurriculumEntry({ id: "ricky-4", displayCall: "Ricky 4", formation: "Ricky", hModifier: "4", introducedAt: "4th Grade" }),
  createCurriculumEntry({ id: "ricky-d", displayCall: "Ricky D", formation: "Ricky", hModifier: "D", introducedAt: "4th Grade" }),
  createCurriculumEntry({ id: "lucky-4", displayCall: "Lucky 4", formation: "Lucky", hModifier: "4", introducedAt: "4th Grade" }),
  createCurriculumEntry({ id: "lucky-d", displayCall: "Lucky D", formation: "Lucky", hModifier: "D", introducedAt: "4th Grade" }),
];

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
  if (entries.some((entry) => (entry.formation === "Ray" || entry.formation === "Larry") && entry.hModifier !== null)) {
    throw new Error("Ray and Larry must not have H modifiers.");
  }
  if (entries.some((entry) => entry.active)) throw new Error("The 2026 formation curriculum must remain inactive.");
  if (entries.some((entry) => entry.coordinates !== null)) throw new Error("Formation coordinates must remain unresolved in this data-only step.");
  return true;
}
