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

  assert.match(page, /type Phase = 1 \| 2 \| 3 \| 4/);
  assert.match(page, /BALL_CARRIER_MAP/);
  assert.match(page, /carrierDigitHistory/);
  assert.match(page, /version:\s*4/);
  assert.match(page, /role="dialog"/);
  assert.match(page, /aria-modal="true"/);
  assert.match(page, /Who is carrying the ball\?/);
  assert.match(css, /\.quiz-overlay/);
  assert.match(css, /\.ball-carrier/);
});
