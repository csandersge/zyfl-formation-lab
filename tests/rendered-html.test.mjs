import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders all five active ZYFL levels", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /<title>ZYFL Formation Lab<\/title>/i);
  assert.match(html, /Run Concept/);
  assert.match(html, /Run Landmark/);
  assert.doesNotMatch(html, /Updating Playbook/);
  assert.doesNotMatch(html, />[^<]*\bPhases?\b[^<]*</i);
});

test("Levels 4-5 use centralized 2026 run answers and versioned progress", async () => {
  const [page, css, runData] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../app/data/run-curriculum-2026.ts", import.meta.url), "utf8"),
  ]);

  assert.match(page, /LEGACY_2025_APPROVED_RUN_PLAYS/);
  assert.match(page, /APPROVED_2026_RUN_CALLS/);
  assert.match(page, /selectApproved2026RunCall\(/);
  assert.match(page, /selectedRunPlay\.runConcept\.concept/);
  assert.match(page, /selectedRunPlay\.runConcept\.landmarkDigit/);
  assert.match(page, /RUN_CONCEPT_NAMES\.map/);
  assert.match(page, /RUN_LANDMARK_DIGITS\.includes/);
  assert.doesNotMatch(page, /Who is carrying the ball\?/);
  assert.doesNotMatch(page, /The first digit|The second digit|first run-number digit|second run-number digit/i);
  assert.doesNotMatch(page, /Updating Playbook/);
  assert.match(page, /\{ level: 4, title: "Run Concept".*enabled: true/);
  assert.match(page, /\{ level: 5, title: "Run Landmark".*enabled: true/);
  assert.match(page, /runCurriculumVersion: "2026-fourth-grade"/);
  assert.match(page, /level4RunCurriculum2026Mastery/);
  assert.match(page, /level5RunCurriculum2026Mastery/);
  assert.match(page, /version:\s*9/);
  assert.match(page, /progressSchemaVersion:\s*4/);
  assert.match(page, /level4RunConceptMastered/);
  assert.match(page, /level5RunLandmarkMastered/);
  assert.match(page, /function advanceToNextLevel\(currentLevel: Phase\)/);
  assert.match(page, /nextAvailableLevel\(currentLevel\)/);
  assert.match(page, /title: "Lane Finder"/);
  assert.match(page, /image: "assets\/cards\/lane-finder\.png"/);
  assert.match(runData, /carrier: "F"/);
  assert.doesNotMatch(runData, /QB Keep|Reverse|Sweep|Power|Empty/);
  assert.match(css, /\.quiz-overlay/);
  assert.match(css, /\.landmark-button/);
});

test("Levels 1-3 remain connected to complete centralized formation calls", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  assert.match(page, /ACTIVE_2026_FORMATIONS/);
  assert.match(page, /selectedCurriculumFormation\.displayCall/);
  assert.match(page, /selectCurriculumFormation\(/);
  assert.match(page, /selectedCurriculumFormation\.coordinates\.H/);
  assert.match(page, /4 means opposite Y\. D means the same side as Y\./);
  assert.doesNotMatch(page, /EXCLUDED_LEVEL3_COMBINATIONS|pickWeightedModifier|pickWeightedFormation/);
});
