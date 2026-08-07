import assert from "node:assert/strict";
import test from "node:test";

import {
  ACTIVE_2026_FORMATIONS,
  APPROVED_2026_FOURTH_GRADE_FORMATIONS,
  EXCLUDED_2026_FORMATIONS,
  FORMATION_FAMILY_DEFINITIONS,
  FORMATION_GRID_COMPATIBILITY_REPORT,
  H_ALIGNMENT_DEFINITIONS,
  H_ALIGNMENT_REFERENCE_FORMATIONS,
  H_COORDINATE_COMPATIBILITY_REPORT,
  FORMATION_DISPLAY_CALL_ALIASES,
  FORMATION_ID_ALIASES,
  curriculumLevelMastered,
  getCurriculumMasteryCategories,
  getCurriculumMasteryCategory,
  getCurriculumMasteryTarget,
  migrateCurriculumExposure,
  resolveHAlignmentForFormation,
  resolveFormationDisplayCall,
  resolveFormationId,
  selectCurriculumFormation,
  validateApproved2026FourthGradeFormations,
} from "../app/data/formation-curriculum-2026.ts";

test("the 2026 fourth-grade curriculum activates only complete compatible calls", () => {
  assert.equal(validateApproved2026FourthGradeFormations(), true);
  assert.equal(APPROVED_2026_FOURTH_GRADE_FORMATIONS.length, 22);
  assert.deepEqual(
    APPROVED_2026_FOURTH_GRADE_FORMATIONS
      .filter(({ formation }) => formation === "Ray" || formation === "Larry")
      .map(({ hModifier }) => hModifier),
    ["4", "4"],
  );
  assert.deepEqual(
    APPROVED_2026_FOURTH_GRADE_FORMATIONS.map(({ displayCall }) => displayCall),
    [
      "Rock 4", "Rock D", "Lex 4", "Lex D", "Rap 4", "Rap D", "Lap 4", "Lap D",
      "Rip 4", "Rip D", "Liz 4", "Liz D", "Right 4", "Right D", "Left 4", "Left D",
      "Ray 4", "Larry 4", "Ricky 4", "Ricky D", "Lucky 4", "Lucky D",
    ],
  );
  assert.equal(ACTIVE_2026_FORMATIONS.length, 20);
  assert.deepEqual(
    EXCLUDED_2026_FORMATIONS.map(({ displayCall }) => displayCall),
    ["Rock D", "Lex D"],
  );
  assert.ok(ACTIVE_2026_FORMATIONS.every(({ active }) => active));
  assert.ok(ACTIVE_2026_FORMATIONS.every(({ coordinates }) =>
    Object.values(coordinates).every((coordinate) => coordinate !== null)
  ));
  assert.deepEqual(FORMATION_GRID_COMPATIBILITY_REPORT.grid, { columns: 19, rows: 6 });
  assert.ok(APPROVED_2026_FOURTH_GRADE_FORMATIONS.every(({ coordinates }) =>
    Object.values(coordinates).every((coordinate) =>
      coordinate === null || (coordinate.c >= 1 && coordinate.c <= 19 && coordinate.r >= 1 && coordinate.r <= 6)
    )
  ));
  assert.equal(H_ALIGNMENT_DEFINITIONS["4"].relationToY, "opposite-side");
  assert.equal(H_ALIGNMENT_DEFINITIONS["4"].landmark, "inside-slot");
  assert.equal(H_ALIGNMENT_DEFINITIONS["4"].lineStatus, "off-line");
  assert.equal(H_ALIGNMENT_DEFINITIONS.D.relationToY, "same-side");
  assert.equal(FORMATION_FAMILY_DEFINITIONS.Rap.yLineStatus, "on-line");
  assert.equal(FORMATION_FAMILY_DEFINITIONS.Rock.yLineStatus, "off-line");
  assert.equal(FORMATION_FAMILY_DEFINITIONS.Ricky.yAlignmentType, "wing");
  assert.equal(FORMATION_FAMILY_DEFINITIONS.Lucky.needsReview, false);
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
  assert.equal(
    APPROVED_2026_FOURTH_GRADE_FORMATIONS.find(({ displayCall }) => displayCall === "Rap 4")?.coordinates.Y.r,
    1,
  );
  assert.equal(
    APPROVED_2026_FOURTH_GRADE_FORMATIONS.find(({ displayCall }) => displayCall === "Rock 4")?.coordinates.Y.r,
    2,
  );
});

test("the complete H ladder mirrors sides and keeps special 0 as an explicit role swap", () => {
  const numeric = ["1", "2", "3", "4", "5"];
  const letters = ["A", "B", "C", "D", "E"];
  const pairs = [["1", "A"], ["2", "B"], ["3", "C"], ["4", "D"], ["5", "E"]];

  for (const formation of ["Right", "Rip", "Rock"]) {
    assert.ok(numeric.every((modifier) => resolveHAlignmentForFormation(formation, modifier).coordinates.H.c < 10));
    assert.ok(letters.every((modifier) => resolveHAlignmentForFormation(formation, modifier).coordinates.H.c > 10));
  }
  for (const formation of ["Left", "Liz", "Lex"]) {
    assert.ok(numeric.every((modifier) => resolveHAlignmentForFormation(formation, modifier).coordinates.H.c > 10));
    assert.ok(letters.every((modifier) => resolveHAlignmentForFormation(formation, modifier).coordinates.H.c < 10));
  }

  for (const [number, letter] of pairs) {
    assert.equal(H_ALIGNMENT_DEFINITIONS[number].pairedWith, letter);
    assert.equal(H_ALIGNMENT_DEFINITIONS[letter].pairedWith, number);
    assert.equal(H_ALIGNMENT_DEFINITIONS[number].landmark, H_ALIGNMENT_DEFINITIONS[letter].landmark);
    assert.equal(H_ALIGNMENT_DEFINITIONS[number].depthRow, H_ALIGNMENT_DEFINITIONS[letter].depthRow);
  }

  for (const modifier of ["5", "E"]) {
    for (const formation of ["Right", "Left"]) {
      const h = resolveHAlignmentForFormation(formation, modifier).coordinates.H;
      assert.ok(h.c <= 3 || h.c >= 17);
      assert.equal(H_ALIGNMENT_DEFINITIONS[modifier].landmark, "outside-receiver");
    }
  }

  const rightZero = resolveHAlignmentForFormation("Right", "0");
  assert.equal(rightZero.swappedReceiver, "X");
  assert.deepEqual(rightZero.playerAlignments.H, { c: 2, depthRow: 1, lineStatus: "on-line" });
  assert.deepEqual(rightZero.coordinates.X, { c: 9, r: 5 });
  assert.notDeepEqual(rightZero.coordinates.H, resolveHAlignmentForFormation("Right", "5").coordinates.H);

  const leftZero = resolveHAlignmentForFormation("Left", "0");
  assert.equal(leftZero.swappedReceiver, "Z");
  assert.deepEqual(leftZero.playerAlignments.H, { c: 18, depthRow: 1, lineStatus: "on-line" });
  assert.deepEqual(leftZero.coordinates.Z, { c: 11, r: 5 });
  assert.notDeepEqual(leftZero.coordinates.H, resolveHAlignmentForFormation("Left", "5").coordinates.H);

  assert.equal(H_ALIGNMENT_REFERENCE_FORMATIONS.length, 22);
  assert.ok(H_ALIGNMENT_REFERENCE_FORMATIONS.every(({ active }) => active === false));
  assert.ok(H_ALIGNMENT_REFERENCE_FORMATIONS.every(({ coordinates }) => {
    const occupied = Object.values(coordinates).filter(Boolean).map(({ c, r }) => `${c}-${r}`);
    return new Set(occupied).size === occupied.length;
  }));
  assert.equal(APPROVED_2026_FOURTH_GRADE_FORMATIONS.length, 22);
  assert.equal(ACTIVE_2026_FORMATIONS.length, 20);
  assert.ok(!ACTIVE_2026_FORMATIONS.some(({ hModifier }) => ["0", "5", "E"].includes(hModifier)));
});

test("Rap/Lap and Ricky/Lucky preserve base columns and apply explicit line-status overrides", () => {
  const find = (displayCall) => {
    const entry = APPROVED_2026_FOURTH_GRADE_FORMATIONS.find((candidate) => candidate.displayCall === displayCall);
    assert.ok(entry, `${displayCall} must exist`);
    return entry;
  };
  const columns = (entry) => Object.fromEntries(
    Object.entries(entry.playerAlignments).map(([player, alignment]) => [player, alignment?.c ?? null]),
  );

  for (const modifier of ["4", "D"]) {
    const rock = find(`Rock ${modifier}`);
    const rap = find(`Rap ${modifier}`);
    assert.deepEqual(columns(rap), columns(rock));
    assert.equal(rap.playerAlignments.Y.lineStatus, "on-line");
    assert.equal(rap.coordinates.Y.c, rock.coordinates.Y.c);
    assert.equal(rap.coordinates.Y.r, 1);

    const lex = find(`Lex ${modifier}`);
    const lap = find(`Lap ${modifier}`);
    assert.deepEqual(columns(lap), columns(lex));
    assert.equal(lap.playerAlignments.Y.lineStatus, "on-line");
    assert.equal(lap.coordinates.Y.c, lex.coordinates.Y.c);
    assert.equal(lap.coordinates.Y.r, 1);

    const rip = find(`Rip ${modifier}`);
    const ricky = find(`Ricky ${modifier}`);
    assert.deepEqual(columns(ricky), columns(rip));
    assert.deepEqual(ricky.playerAlignments.Y, rip.playerAlignments.Y);
    assert.equal(ricky.playerAlignments.H.lineStatus, "on-line");
    assert.equal(ricky.playerAlignments.X.lineStatus, "off-line");
    assert.equal(ricky.coordinates.H.r, 1);
    assert.equal(ricky.coordinates.X.r, 2);

    const liz = find(`Liz ${modifier}`);
    const lucky = find(`Lucky ${modifier}`);
    assert.deepEqual(columns(lucky), columns(liz));
    assert.deepEqual(lucky.playerAlignments.Y, liz.playerAlignments.Y);
    assert.equal(lucky.playerAlignments.H.lineStatus, "on-line");
    assert.equal(lucky.playerAlignments.Z.lineStatus, "off-line");
    assert.equal(lucky.coordinates.H.r, 1);
    assert.equal(lucky.coordinates.Z.r, 2);
  }

  assert.equal(APPROVED_2026_FOURTH_GRADE_FORMATIONS.length, 22);
  assert.ok(["Rap 4", "Rap D", "Lap 4", "Lap D", "Ricky 4", "Ricky D", "Lucky 4", "Lucky D"]
    .every((call) => ACTIVE_2026_FORMATIONS.some(({ displayCall }) => displayCall === call)));
});

test("Ray 4 and Larry 4 are centralized, explicit trips formations with legacy aliases", () => {
  const rayCalls = APPROVED_2026_FOURTH_GRADE_FORMATIONS.filter(({ displayCall }) => displayCall === "Ray 4");
  const larryCalls = APPROVED_2026_FOURTH_GRADE_FORMATIONS.filter(({ displayCall }) => displayCall === "Larry 4");
  assert.equal(APPROVED_2026_FOURTH_GRADE_FORMATIONS.length, 22);
  assert.equal(rayCalls.length, 1);
  assert.equal(larryCalls.length, 1);

  const ray = rayCalls[0];
  const larry = larryCalls[0];
  const right4 = APPROVED_2026_FOURTH_GRADE_FORMATIONS.find(({ displayCall }) => displayCall === "Right 4");
  const left4 = APPROVED_2026_FOURTH_GRADE_FORMATIONS.find(({ displayCall }) => displayCall === "Left 4");

  assert.deepEqual(ray.coordinates.Y, right4.coordinates.Y);
  assert.deepEqual(ray.coordinates.X, right4.coordinates.X);
  assert.notDeepEqual(ray.coordinates.Z, right4.coordinates.Z);
  assert.deepEqual(ray.coordinates.Z, { c: 4, r: 2 });
  assert.deepEqual(ray.coordinates.H, right4.coordinates.H);
  assert.equal(ray.hAlignment.relationToY, "opposite-side");

  assert.deepEqual(larry.coordinates.Y, left4.coordinates.Y);
  assert.deepEqual(larry.coordinates.Z, left4.coordinates.Z);
  assert.notDeepEqual(larry.coordinates.X, left4.coordinates.X);
  assert.deepEqual(larry.coordinates.X, { c: 16, r: 2 });
  assert.deepEqual(larry.coordinates.H, left4.coordinates.H);
  assert.equal(larry.hAlignment.relationToY, "opposite-side");

  assert.deepEqual(FORMATION_ID_ALIASES, { ray: "ray-4", larry: "larry-4" });
  assert.deepEqual(FORMATION_DISPLAY_CALL_ALIASES, { Ray: "Ray 4", Larry: "Larry 4" });
  assert.equal(resolveFormationId("ray"), "ray-4");
  assert.equal(resolveFormationDisplayCall("Larry"), "Larry 4");
  assert.deepEqual(migrateCurriculumExposure({ ray: 2, "ray-4": 3, larry: 1 }), {
    "ray-4": 5,
    "larry-4": 1,
  });

  assert.ok(ACTIVE_2026_FORMATIONS.includes(ray));
  assert.ok(ACTIVE_2026_FORMATIONS.includes(larry));
  assert.ok(!ACTIVE_2026_FORMATIONS.some(({ displayCall }) => displayCall === "Ray" || displayCall === "Larry"));
});

test("Levels 1-3 derive categories, targets, and least-mastered selection from active data", () => {
  assert.deepEqual(getCurriculumMasteryCategories(1), [
    "Rock", "Lex", "Rap", "Lap", "Rip", "Liz", "Right", "Left", "Ray", "Larry", "Ricky", "Lucky",
  ]);
  assert.deepEqual(getCurriculumMasteryCategories(2), getCurriculumMasteryCategories(1));
  assert.deepEqual(getCurriculumMasteryCategories(3), ["4 Opposite Y", "D Same Side as Y"]);
  assert.equal(getCurriculumMasteryTarget(3, "4 Opposite Y"), 5);
  assert.equal(getCurriculumMasteryTarget(3, "D Same Side as Y"), 5);

  const mastery = { "4 Opposite Y": 5, "D Same Side as Y": 0 };
  const selected = selectCurriculumFormation(3, mastery, {}, "rap-d");
  assert.equal(getCurriculumMasteryCategory(3, selected), "D Same Side as Y");
  assert.notEqual(selected.id, "rap-d");
  assert.equal(curriculumLevelMastered(3, mastery), false);
  assert.ok(!ACTIVE_2026_FORMATIONS.some(({ displayCall }) =>
    ["Ray", "Larry", "Ray D", "Larry D", "Rock C", "Rip 2"].includes(displayCall)
  ));
});
