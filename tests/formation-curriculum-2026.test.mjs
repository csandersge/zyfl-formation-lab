import assert from "node:assert/strict";
import test from "node:test";

import {
  APPROVED_2026_FOURTH_GRADE_FORMATIONS,
  FORMATION_FAMILY_DEFINITIONS,
  FORMATION_GRID_COMPATIBILITY_REPORT,
  H_ALIGNMENT_DEFINITIONS,
  H_COORDINATE_COMPATIBILITY_REPORT,
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
  assert.deepEqual(FORMATION_GRID_COMPATIBILITY_REPORT.grid, { columns: 19, rows: 6 });
  assert.ok(APPROVED_2026_FOURTH_GRADE_FORMATIONS.every(({ coordinates }) =>
    Object.values(coordinates).every((coordinate) =>
      coordinate === null || (coordinate.c >= 1 && coordinate.c <= 19 && coordinate.r >= 1 && coordinate.r <= 6)
    )
  ));
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
  assert.deepEqual(
    H_COORDINATE_COMPATIBILITY_REPORT
      .filter(({ modifier }) => modifier === "4")
      .map(({ oldCoordinate, newCandidateCoordinate, matches2026Definition }) => ({
        oldCoordinate,
        newCandidateCoordinate,
        matches2026Definition,
      })),
    [
      { oldCoordinate: { c: 4, r: 2 }, newCandidateCoordinate: { c: 5, r: 2 }, matches2026Definition: false },
      { oldCoordinate: { c: 16, r: 2 }, newCandidateCoordinate: { c: 15, r: 2 }, matches2026Definition: false },
    ],
  );
  for (const call of ["Rock D", "Lex D"]) {
    const entry = APPROVED_2026_FOURTH_GRADE_FORMATIONS.find(({ displayCall }) => displayCall === call);
    assert.equal(entry?.gridCompatibility, "requires-adjustment");
    assert.ok(entry?.coordinateWarnings.some(({ players }) => players.includes("Y") && players.includes("H")));
  }
  for (const call of ["Ricky D", "Lucky D"]) {
    const entry = APPROVED_2026_FOURTH_GRADE_FORMATIONS.find(({ displayCall }) => displayCall === call);
    assert.equal(entry?.coordinates.H, null);
    assert.equal(entry?.coordinateSources.H, "unresolved");
    assert.equal(entry?.gridCompatibility, "unresolved");
  }
  assert.equal(
    APPROVED_2026_FOURTH_GRADE_FORMATIONS.find(({ displayCall }) => displayCall === "Rap 4")?.coordinates.Y.r,
    1,
  );
  assert.equal(
    APPROVED_2026_FOURTH_GRADE_FORMATIONS.find(({ displayCall }) => displayCall === "Rock 4")?.coordinates.Y.r,
    2,
  );
});
