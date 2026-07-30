import assert from "node:assert/strict";
import test from "node:test";

import {
  APPROVED_2026_RUN_CALLS,
  APPROVED_2026_RUN_CONCEPTS,
  RUN_CONCEPT_NAMES,
  RUN_LANDMARK_DIGITS,
  getRunMasteryTarget,
  level4RunConceptMastered,
  level5RunLandmarkMastered,
  selectApproved2026RunCall,
  validate2026RunCurriculum,
} from "../app/data/run-curriculum-2026.ts";

test("the 2026 run curriculum stores four explicit concepts and answers", () => {
  assert.deepEqual(validate2026RunCurriculum(), []);
  assert.equal(APPROVED_2026_RUN_CONCEPTS.length, 4);
  assert.deepEqual(APPROVED_2026_RUN_CONCEPTS.map(({ codeWord }) => codeWord), [
    "Oregon", "Ducks", "Oklahoma", "Sooners",
  ]);
  assert.deepEqual(APPROVED_2026_RUN_CONCEPTS.map(({ landmarkDigit }) => landmarkDigit), [
    "9", "8", "7", "6",
  ]);
  assert.deepEqual(APPROVED_2026_RUN_CONCEPTS.map(({ concept }) => concept), [
    "Outside Zone", "Outside Zone", "Counter", "Counter",
  ]);
  assert.ok(APPROVED_2026_RUN_CONCEPTS.every(({ carrier }) => carrier === "F"));
  assert.deepEqual(RUN_CONCEPT_NAMES, ["Outside Zone", "Counter"]);
  assert.deepEqual(RUN_LANDMARK_DIGITS, ["9", "8", "7", "6"]);
});

test("approved full calls use only semantic formation compatibility", () => {
  assert.ok(APPROVED_2026_RUN_CALLS.length > 0);
  assert.ok(APPROVED_2026_RUN_CALLS.every(({ formation, runConcept, displayCall }) => {
    if (runConcept.concept === "Outside Zone") {
      return ["wing", "slot"].includes(formation.yAlignment.type)
        && !["Right", "Left", "Ray", "Larry"].includes(formation.formation)
        && !/\b(\d)\s+\1\b/.test(displayCall);
    }
    return formation.yAlignment.type === "attached-tight-end"
      && ["Right", "Left"].includes(formation.formation)
      && !/\b(\d)\s+\1\b/.test(displayCall);
  }));
  assert.ok(APPROVED_2026_RUN_CALLS.every(({ formation, runConcept }) =>
    formation.active && runConcept.activeLevel4 && runConcept.activeLevel5
  ));
});

test("mastery requires both directions and selection prioritizes least progress", () => {
  const targets = Object.fromEntries(
    APPROVED_2026_RUN_CONCEPTS.map(({ id }) => [id, getRunMasteryTarget(id)]),
  );
  assert.ok(Object.values(targets).every((target) => target === 5));
  assert.equal(level4RunConceptMastered({
    "outside-zone-left": 5,
    "outside-zone-right": 0,
    "counter-left": 5,
    "counter-right": 5,
  }), false);
  assert.equal(level4RunConceptMastered(Object.fromEntries(
    APPROVED_2026_RUN_CONCEPTS.map(({ id }) => [id, 5]),
  )), true);
  assert.equal(level5RunLandmarkMastered({ 9: 5, 8: 5, 7: 5, 6: 5 }), true);

  const selected = selectApproved2026RunCall(
    5,
    {},
    { 9: 5, 8: 5, 7: 0, 6: 5 },
  );
  assert.equal(selected.runConcept.landmarkDigit, "7");
  const different = selectApproved2026RunCall(5, {}, {}, selected.id);
  assert.notEqual(different.id, selected.id);
});
