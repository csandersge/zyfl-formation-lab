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

export type FormationCurriculumEntry = {
  id: string;
  displayCall: string;
  formation: FormationCurriculumFamily;
  hModifier: FormationCurriculumModifier;
  introducedAt: FormationCurriculumGrade;
  cumulativeForFourthGrade: true;
  active: false;
  needsReview: boolean;
};

// 2026 4th Grade ZYFL cumulative formation curriculum.
// Right/Left and Ray/Larry use attached Y alignments.
// Rip/Liz use wing alignments.
// Rock/Lex use off-ball slot alignments.
// Rap/Lap use on-ball slot alignments.
// Exact coordinates will be reviewed and added in a later step.
export const APPROVED_2026_FOURTH_GRADE_FORMATIONS: readonly FormationCurriculumEntry[] = [
  // Flag
  { id: "rock-4", displayCall: "Rock 4", formation: "Rock", hModifier: "4", introducedAt: "Flag", cumulativeForFourthGrade: true, active: false, needsReview: true },
  { id: "rock-d", displayCall: "Rock D", formation: "Rock", hModifier: "D", introducedAt: "Flag", cumulativeForFourthGrade: true, active: false, needsReview: true },
  { id: "lex-4", displayCall: "Lex 4", formation: "Lex", hModifier: "4", introducedAt: "Flag", cumulativeForFourthGrade: true, active: false, needsReview: true },
  { id: "lex-d", displayCall: "Lex D", formation: "Lex", hModifier: "D", introducedAt: "Flag", cumulativeForFourthGrade: true, active: false, needsReview: true },
  { id: "rap-4", displayCall: "Rap 4", formation: "Rap", hModifier: "4", introducedAt: "Flag", cumulativeForFourthGrade: true, active: false, needsReview: true },
  { id: "rap-d", displayCall: "Rap D", formation: "Rap", hModifier: "D", introducedAt: "Flag", cumulativeForFourthGrade: true, active: false, needsReview: true },
  { id: "lap-4", displayCall: "Lap 4", formation: "Lap", hModifier: "4", introducedAt: "Flag", cumulativeForFourthGrade: true, active: false, needsReview: true },
  { id: "lap-d", displayCall: "Lap D", formation: "Lap", hModifier: "D", introducedAt: "Flag", cumulativeForFourthGrade: true, active: false, needsReview: true },

  // 3rd Grade
  { id: "rip-4", displayCall: "Rip 4", formation: "Rip", hModifier: "4", introducedAt: "3rd Grade", cumulativeForFourthGrade: true, active: false, needsReview: true },
  { id: "rip-d", displayCall: "Rip D", formation: "Rip", hModifier: "D", introducedAt: "3rd Grade", cumulativeForFourthGrade: true, active: false, needsReview: true },
  { id: "liz-4", displayCall: "Liz 4", formation: "Liz", hModifier: "4", introducedAt: "3rd Grade", cumulativeForFourthGrade: true, active: false, needsReview: true },
  { id: "liz-d", displayCall: "Liz D", formation: "Liz", hModifier: "D", introducedAt: "3rd Grade", cumulativeForFourthGrade: true, active: false, needsReview: true },
  { id: "right-4", displayCall: "Right 4", formation: "Right", hModifier: "4", introducedAt: "3rd Grade", cumulativeForFourthGrade: true, active: false, needsReview: true },
  { id: "right-d", displayCall: "Right D", formation: "Right", hModifier: "D", introducedAt: "3rd Grade", cumulativeForFourthGrade: true, active: false, needsReview: true },
  { id: "left-4", displayCall: "Left 4", formation: "Left", hModifier: "4", introducedAt: "3rd Grade", cumulativeForFourthGrade: true, active: false, needsReview: true },
  { id: "left-d", displayCall: "Left D", formation: "Left", hModifier: "D", introducedAt: "3rd Grade", cumulativeForFourthGrade: true, active: false, needsReview: true },

  // 4th Grade
  { id: "ray", displayCall: "Ray", formation: "Ray", hModifier: null, introducedAt: "4th Grade", cumulativeForFourthGrade: true, active: false, needsReview: true },
  { id: "larry", displayCall: "Larry", formation: "Larry", hModifier: null, introducedAt: "4th Grade", cumulativeForFourthGrade: true, active: false, needsReview: true },
  { id: "ricky-4", displayCall: "Ricky 4", formation: "Ricky", hModifier: "4", introducedAt: "4th Grade", cumulativeForFourthGrade: true, active: false, needsReview: true },
  { id: "ricky-d", displayCall: "Ricky D", formation: "Ricky", hModifier: "D", introducedAt: "4th Grade", cumulativeForFourthGrade: true, active: false, needsReview: true },
  { id: "lucky-4", displayCall: "Lucky 4", formation: "Lucky", hModifier: "4", introducedAt: "4th Grade", cumulativeForFourthGrade: true, active: false, needsReview: true },
  { id: "lucky-d", displayCall: "Lucky D", formation: "Lucky", hModifier: "D", introducedAt: "4th Grade", cumulativeForFourthGrade: true, active: false, needsReview: true },
];

const VALID_FORMATION_FAMILIES: ReadonlySet<FormationCurriculumFamily> = new Set([
  "Right", "Left", "Rip", "Liz", "Rock", "Lex",
  "Rap", "Lap", "Ray", "Larry", "Ricky", "Lucky",
]);
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
  return true;
}
