import assert from "node:assert/strict";
import test from "node:test";

import {
  APPROVED_2026_FOURTH_GRADE_FORMATIONS,
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
});
