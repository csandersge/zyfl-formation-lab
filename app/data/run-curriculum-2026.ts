import {
  ACTIVE_2026_FORMATIONS,
  FORMATION_FAMILY_DEFINITIONS,
  type FormationCurriculumEntry,
} from "./formation-curriculum-2026.ts";

export type RunConceptId =
  | "outside-zone-left"
  | "outside-zone-right"
  | "counter-left"
  | "counter-right";
export type RunConceptName = "Outside Zone" | "Counter";
export type RunLandmarkDigit = "9" | "8" | "7" | "6";

export type RunConcept = {
  id: RunConceptId;
  displaySuffix: string;
  codeWord: "Oregon" | "Ducks" | "Oklahoma" | "Sooners";
  blockerCount: 4 | 5;
  concept: RunConceptName;
  direction: "left" | "right";
  landmarkDigit: RunLandmarkDigit;
  carrier: "F";
  activeLevel4: boolean;
  activeLevel5: boolean;
  introducedAt: "3rd Grade" | "4th Grade";
  explanation: string;
};

export type Approved2026RunCall = {
  id: string;
  formationId: string;
  formation: FormationCurriculumEntry;
  runConceptId: RunConceptId;
  runConcept: RunConcept;
  concept: RunConceptName;
  displayCall: string;
  active: boolean;
  needsReview: boolean;
};

export type RunVariantMastery = Partial<Record<RunConceptId, number>>;
export type RunLandmarkMastery = Partial<Record<RunLandmarkDigit, number>>;

export const APPROVED_2026_RUN_CONCEPTS: readonly RunConcept[] = [
  {
    id: "outside-zone-left",
    displaySuffix: "4 Oregon",
    codeWord: "Oregon",
    blockerCount: 4,
    concept: "Outside Zone",
    direction: "left",
    landmarkDigit: "9",
    carrier: "F",
    activeLevel4: true,
    activeLevel5: true,
    introducedAt: "3rd Grade",
    explanation: "Oregon means Outside Zone left toward the 9 landmark.",
  },
  {
    id: "outside-zone-right",
    displaySuffix: "4 Ducks",
    codeWord: "Ducks",
    blockerCount: 4,
    concept: "Outside Zone",
    direction: "right",
    landmarkDigit: "8",
    carrier: "F",
    activeLevel4: true,
    activeLevel5: true,
    introducedAt: "3rd Grade",
    explanation: "Ducks means Outside Zone right toward the 8 landmark.",
  },
  {
    id: "counter-left",
    displaySuffix: "5 Oklahoma",
    codeWord: "Oklahoma",
    blockerCount: 5,
    concept: "Counter",
    direction: "left",
    landmarkDigit: "7",
    carrier: "F",
    activeLevel4: true,
    activeLevel5: true,
    introducedAt: "4th Grade",
    explanation: "Oklahoma means Counter left toward the 7 landmark.",
  },
  {
    id: "counter-right",
    displaySuffix: "5 Sooners",
    codeWord: "Sooners",
    blockerCount: 5,
    concept: "Counter",
    direction: "right",
    landmarkDigit: "6",
    carrier: "F",
    activeLevel4: true,
    activeLevel5: true,
    introducedAt: "4th Grade",
    explanation: "Sooners means Counter right toward the 6 landmark.",
  },
] as const;

const OUTSIDE_ZONE_ALIGNMENT_TYPES = new Set(["wing", "slot"]);

function formationSupportsConcept(
  formation: FormationCurriculumEntry,
  concept: RunConcept,
) {
  if (!formation.runCurriculumEligible) return false;
  const semantics = FORMATION_FAMILY_DEFINITIONS[formation.formation];
  if (concept.concept === "Outside Zone") {
    return OUTSIDE_ZONE_ALIGNMENT_TYPES.has(semantics.yAlignmentType);
  }
  return semantics.yAlignmentType === "attached-tight-end" && semantics.yLineStatus === "on-line";
}

const slug = (value: string) => value.toLowerCase().replace(/\s+/g, "-");

export const APPROVED_2026_RUN_CALLS: readonly Approved2026RunCall[] =
  ACTIVE_2026_FORMATIONS.flatMap((formation) =>
    APPROVED_2026_RUN_CONCEPTS
      .filter((concept) => formationSupportsConcept(formation, concept))
      .map((concept) => ({
        id: `${formation.id}-${concept.id}`,
        formationId: formation.id,
        formation,
        runConceptId: concept.id,
        runConcept: concept,
        concept: concept.concept,
        // The separator keeps the formation tag and blocker count visually distinct
        // (for example, "Rock 4 · 4 Oregon" rather than "Rock 4 4 Oregon").
        displayCall: `${formation.displayCall} · ${concept.displaySuffix}`,
        active: true,
        needsReview: false,
      })),
  );

export const RUN_CONCEPT_NAMES: readonly RunConceptName[] = ["Outside Zone", "Counter"];
export const RUN_LANDMARK_DIGITS: readonly RunLandmarkDigit[] = ["9", "8", "7", "6"];
export const RUN_CONCEPT_IDS: readonly RunConceptId[] = APPROVED_2026_RUN_CONCEPTS.map(
  (concept) => concept.id,
);

export function getRunMasteryTarget(runConceptId: RunConceptId) {
  const examples = APPROVED_2026_RUN_CALLS.filter(
    (call) => call.runConceptId === runConceptId,
  ).length;
  if (examples >= 3) return 5;
  if (examples === 2) return 4;
  if (examples === 1) return 3;
  return 0;
}

export function level4RunConceptMastered(mastery: RunVariantMastery) {
  return RUN_CONCEPT_IDS.every(
    (id) => (mastery[id] ?? 0) >= getRunMasteryTarget(id),
  );
}

export function level5RunLandmarkMastered(mastery: RunLandmarkMastery) {
  return APPROVED_2026_RUN_CONCEPTS.every(
    (concept) =>
      (mastery[concept.landmarkDigit] ?? 0) >= getRunMasteryTarget(concept.id),
  );
}

export function selectApproved2026RunCall(
  level: 4 | 5,
  variantMastery: RunVariantMastery,
  landmarkMastery: RunLandmarkMastery,
  previousCallId?: string,
  previousFormationId?: string,
) {
  const scored = APPROVED_2026_RUN_CONCEPTS.map((concept) => {
    const score = level === 4
      ? variantMastery[concept.id] ?? 0
      : landmarkMastery[concept.landmarkDigit] ?? 0;
    return { concept, score, target: getRunMasteryTarget(concept.id) };
  });
  const incomplete = scored.filter(({ score, target }) => score < target);
  const considered = incomplete.length ? incomplete : scored;
  const lowestRatio = Math.min(
    ...considered.map(({ score, target }) => score / Math.max(1, target)),
  );
  const priorityIds = new Set(
    considered
      .filter(({ score, target }) => score / Math.max(1, target) === lowestRatio)
      .map(({ concept }) => concept.id),
  );
  let candidates = APPROVED_2026_RUN_CALLS.filter(
    (call) => priorityIds.has(call.runConceptId),
  );
  const withoutSameCall = candidates.filter((call) => call.id !== previousCallId);
  if (withoutSameCall.length) candidates = withoutSameCall;
  if (level === 4) {
    const differentFormation = candidates.filter(
      (call) => call.formationId !== previousFormationId,
    );
    if (differentFormation.length) candidates = differentFormation;
  }
  return candidates[Math.floor(Math.random() * candidates.length)] ?? APPROVED_2026_RUN_CALLS[0];
}

export function validate2026RunCurriculum() {
  const errors: string[] = [];
  if (APPROVED_2026_RUN_CONCEPTS.length !== 4) errors.push("Expected exactly four run concepts.");
  if (new Set(APPROVED_2026_RUN_CONCEPTS.map((concept) => concept.codeWord)).size !== 4) {
    errors.push("Run code words must be unique.");
  }
  if (new Set(APPROVED_2026_RUN_CONCEPTS.map((concept) => concept.landmarkDigit)).size !== 4) {
    errors.push("Run landmark digits must be unique.");
  }
  for (const call of APPROVED_2026_RUN_CALLS) {
    if (!call.formation.active || !call.runConcept.activeLevel4 || !call.runConcept.activeLevel5) {
      errors.push(`${call.displayCall} uses inactive curriculum data.`);
    }
    if (!formationSupportsConcept(call.formation, call.runConcept)) {
      errors.push(`${call.displayCall} is not a supported formation/concept combination.`);
    }
    if (/\b(\d)\s+\1\b/.test(call.displayCall)) {
      errors.push(`${call.displayCall} contains duplicated adjacent numbers.`);
    }
    if (call.id !== `${call.formationId}-${call.runConceptId}` || slug(call.displayCall).length === 0) {
      errors.push(`${call.displayCall} has malformed identity data.`);
    }
  }
  return errors;
}
