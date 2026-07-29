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

test("server-renders the ZYFL Formation Lab", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>ZYFL Formation Lab<\/title>/i);
  assert.match(html, /Level 4/);
  assert.match(html, /Identify the Ball Carrier/);
  assert.match(html, /Master all six formations in Level 3/);
  assert.doesNotMatch(html, />[^<]*\bPhases?\b[^<]*</i);
  assert.match(html, /Formation Mastery/);
});

test("includes Level 4 carrier rules, quiz, and compatible storage", async () => {
  const [page, css] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);

  assert.match(page, /type Phase = 1 \| 2 \| 3 \| 4 \| 5/);
  assert.match(page, /APPROVED_RUN_PLAYS/);
  assert.equal((page.match(/displayCall: "/g) ?? []).length, 21);
  assert.match(page, /displayCall: "Left C Fake 21 QB Keep Right"/);
  assert.match(page, /displayCall: "Right C Empty 18 Sweep"/);
  assert.match(page, /displayCall: "Rip 3 48 Reverse Right"/);
  assert.match(page, /carrier: "QB".*specialType: "qb-keep"/);
  assert.match(page, /displayCall: "Left C Fake 21 QB Keep Right".*displayedRunNumber: "21".*carrier: "QB".*runLocationDigit: "8".*concept: "Outside Zone Right"/);
  assert.match(page, /displayCall: "Right C Fake 20 QB Keep Left".*displayedRunNumber: "20".*carrier: "QB".*runLocationDigit: "9".*concept: "Outside Zone Left"/);
  assert.match(page, /runLocationMastery\[digit\]/);
  assert.match(page, /locationDigit = selectedRunPlay\.runLocationDigit/);
  assert.match(page, /id: "rip-3-48-reverse-right".*carrier: "H"/);
  assert.doesNotMatch(page, /pickWeightedCarrier|pickWeightedLocation|makeRunNumber/);
  assert.doesNotMatch(page, /"6-8"|"6-12"|label: "F", row:/);
  const selectableTargets = page.match(/const SELECTABLE:[\s\S]*?\];/)?.[0] ?? "";
  assert.doesNotMatch(selectableTargets, /"1-4"|"1-16"/);
  assert.match(selectableTargets, /"2-4"/);
  assert.match(selectableTargets, /"2-16"/);
  assert.match(page, /modifier !== "C" \|\| \(formation !== "Liz" && formation !== "Rip"\)/);
  assert.match(page, /pickWeightedModifier\(hHistory, hModifier, hRepeatCount, nextFormation\)/);
  assert.match(page, /setHModifier\(nextPlay\.hModifier\)/);
  assert.match(page, /carrierDigitHistory/);
  assert.match(page, /version:\s*7/);
  assert.match(page, /progressSchemaVersion:\s*2/);
  assert.match(page, /phase4CarrierMastery/);
  assert.match(page, /phase5RunLocationMastery/);
  assert.match(page, /REQUIRED_PHASE4_CARRIERS/);
  assert.match(page, /REQUIRED_PHASE5_RUN_DIGITS/);
  assert.match(page, /function getDynamicMasteryTarget\(playCount: number\)/);
  assert.match(page, /if \(playCount >= 3\) return 5/);
  assert.match(page, /if \(playCount === 2\) return 4/);
  assert.match(page, /if \(playCount === 1\) return 3/);
  assert.match(page, /function getLevel4MasteryTarget\(carrier: BallCarrier/);
  assert.match(page, /function getLevel5MasteryTarget\(digit: LocationDigit/);
  assert.match(page, /new Set\([\s\S]*?map\(\(play\) => play\.id\)/);
  assert.match(page, /const lowestProgressRatio = Math\.min/);
  assert.match(page, /score \/ target === lowestProgressRatio/);
  assert.match(page, /priorityCategories\.has\(play\.runLocationDigit\)/);
  assert.match(page, /const differentPlay = candidates\.filter\(\(play\) => play\.id !== previousPlayId\)/);
  assert.doesNotMatch(page, /Math\.max\(1, 6 - \(carrierMastery/);
  assert.match(page, /Ball Carrier Mastery/);
  assert.match(page, /Run Location Mastery/);
  assert.match(page, /type CardPhase = 1 \| 2 \| 3 \| 4 \| 5/);
  assert.match(page, /type CardKey = "phase1" \| "phase2" \| "phase3" \| "phase4" \| "phase5"/);
  assert.match(page, /title: "Lane Finder"/);
  assert.match(page, /rarity: "Mythic"/);
  assert.match(page, /image: "assets\/cards\/lane-finder\.png"/);
  assert.match(page, /phase5: phase5Mastered\(savedPhase5RunLocationMastery\)/);
  assert.match(page, /phase5Mastered\(next\)\) handleLevelMastery\(5\)/);
  assert.match(page, /function advanceToNextLevel\(currentLevel: Phase\)/);
  assert.match(page, /function handleLevelMastery\(levelNumber: Phase\)/);
  assert.equal((page.match(/handleLevelMastery\([1-5]\)/g) ?? []).length, 5);
  assert.match(page, /if \(!pendingLevelAdvance \|\| pendingReveal\) return/);
  assert.match(page, /if \(!phaseWasMastered && phaseMastered\(next\)\) handleLevelMastery\(1\)/);
  assert.match(page, /if \(!phaseWasMastered && phase4Mastered\(next\)\) handleLevelMastery\(4\)/);
  assert.match(page, /data-level="5"/);
  assert.match(page, /Continue to Level/);
  assert.match(page, /Return to Levels/);
  assert.match(page, /finishReveal\(false\)/);
  assert.match(page, /unlockedCards\.phase5 \? "Card Unlocked ✓" : "Reward: Lane Finder"/);
  assert.doesNotMatch(page, new RegExp(["Phase", "5B"].join(" ")));
  assert.doesNotMatch(page, /APPROVED_RUN_FORMATIONS/);
  assert.match(page, /runLocationHistory/);
  assert.match(page, /Where is the runner going\?/);
  assert.match(page, /unlockedCards/);
  assert.match(page, /cardRevealSeen/);
  assert.match(page, /My Cards/);
  assert.doesNotMatch(page, /image:\s*"\/assets\/cards\//);
  assert.doesNotMatch(page, /Build My Team/);
  assert.doesNotMatch(page, /"5", "Name the carrier"/);
  assert.doesNotMatch(page, /"Unlock Level 2"/);
  assert.match(page, /role="dialog"/);
  assert.match(page, /aria-modal="true"/);
  assert.match(page, /Who is carrying the ball\?/);
  assert.match(css, /\.quiz-overlay/);
  assert.match(css, /\.ball-carrier/);
  assert.match(css, /\.card-collection/);
  assert.match(css, /\.card-reveal/);
  assert.match(css, /\.card-slot\.rarity-mythic/);
});
