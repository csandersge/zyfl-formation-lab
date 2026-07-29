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
  assert.match(html, /Phase 4/);
  assert.match(html, /Identify the Ball Carrier/);
  assert.match(html, /Master all six formations in Phase 3/);
  assert.match(html, /Formation Mastery/);
});

test("includes Phase 4 carrier rules, quiz, and compatible storage", async () => {
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
  assert.match(page, /id: "rip-3-48-reverse-right".*carrier: "H"/);
  assert.doesNotMatch(page, /pickWeightedCarrier|pickWeightedLocation|makeRunNumber/);
  assert.doesNotMatch(page, /"6-8"|"6-12"|label: "F", row:/);
  assert.match(page, /carrierDigitHistory/);
  assert.match(page, /version:\s*6/);
  assert.match(page, /runLocationHistory/);
  assert.match(page, /Where is the runner going\?/);
  assert.match(page, /unlockedCards/);
  assert.match(page, /cardRevealSeen/);
  assert.match(page, /My Cards/);
  assert.doesNotMatch(page, /image:\s*"\/assets\/cards\//);
  assert.doesNotMatch(page, /Build My Team/);
  assert.doesNotMatch(page, /"5", "Name the carrier"/);
  assert.doesNotMatch(page, /"Unlock Phase 2"/);
  assert.match(page, /role="dialog"/);
  assert.match(page, /aria-modal="true"/);
  assert.match(page, /Who is carrying the ball\?/);
  assert.match(css, /\.quiz-overlay/);
  assert.match(css, /\.ball-carrier/);
  assert.match(css, /\.card-collection/);
  assert.match(css, /\.card-reveal/);
});
