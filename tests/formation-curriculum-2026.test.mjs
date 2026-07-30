import assert from "node:assert/strict";
import test from "node:test";

import {
  APPROVED_2026_FOURTH_GRADE_FORMATIONS,
  FORMATION_FAMILY_DEFINITIONS,
  H_ALIGNMENT_DEFINITIONS,
  validateApproved2026FourthGradeFormations,
} from "../app/data/formation-curriculum-2026.ts";

test("the inactive 2026 fourth-grade curriculum is valid and complete", () => {
  assert.equal(validateApproved2026FourthGradeFormations(), true);
  assert.equal(APPROVED_2026_FOURTH_GRADE_FORMATIONS.length, 22);
  assert.deepEqual(
    APPROVED_2026_FOURTH_GRADE_FORMATIONS
      .filter(({ formation }) => formation === "Ray" || formation === "Larry")
      .map(({ hModifier }) => hModifier),
    [null, null],
  );
  assert.ok(APPROVED_2026_FOURTH_GRADE_FORMATIONS.every(({ active }) => active === false));
  assert.ok(APPROVED_2026_FOURTH_GRADE_FORMATIONS.every(({ coordinates }) => coordinates === null));
  assert.deepEqual(H_ALIGNMENT_DEFINITIONS["4"], {
    modifier: "4",
    relationToY: "opposite-side",
    alignmentType: "slot",
    lineStatus: "off-line",
    description: "H aligns opposite Y, halfway between the outside receiver and the tackle.",
  });
  assert.equal(H_ALIGNMENT_DEFINITIONS.D.relationToY, "same-side");
  assert.equal(FORMATION_FAMILY_DEFINITIONS.Rap.yLineStatus, "on-line");
  assert.equal(FORMATION_FAMILY_DEFINITIONS.Rock.yLineStatus, "off-line");
  assert.equal(FORMATION_FAMILY_DEFINITIONS.Ricky.yAlignmentType, "unknown");
  assert.equal(FORMATION_FAMILY_DEFINITIONS.Lucky.needsReview, true);
  assert.ok(
    APPROVED_2026_FOURTH_GRADE_FORMATIONS
      .filter(({ formation }) => formation === "Ray" || formation === "Larry")
      .every(({ sourceConflict }) => sourceConflict?.includes("Retained progression-table wording")),
  );
});
