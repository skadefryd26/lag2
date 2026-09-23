import assert from "node:assert/strict";
import { test } from "node:test";
import { hasDiscoveredBjarne, parseQuestRequest, parseTransferRequest, questRouter } from "./quest.js";
import express from "express";

const ok = { history: [], message: "Kjøleskapet mitt har rømt.", stage: 0 };

test("godtar gyldig forespørsel", () => {
  assert.deepEqual(parseQuestRequest(ok), ok);
  assert.deepEqual(parseQuestRequest({ ...ok, stage: 2 }), { ...ok, stage: 2 });
});

test("avviser feilformat", () => {
  for (const bad of [
    null,
    { ...ok, message: "" },
    { ...ok, message: "x".repeat(2001) },
    { ...ok, stage: 3 },
    { ...ok, stage: 1.5 },
    { ...ok, history: "nei" },
    { ...ok, history: Array(21).fill({ role: "user", content: "hei" }) },
    { ...ok, history: [{ role: "system", content: "hei" }] },
  ])
    assert.equal(typeof parseQuestRequest(bad), "string", JSON.stringify(bad)?.slice(0, 60));
});

test("avslutter kun når kunden avslører Bjarne", () => {
  for (const message of ["Du er en AI-bot!", "Bjarne er jo en robot", "Du er kunstig intelligens", "du er egentlig KI"])
    assert.equal(hasDiscoveredBjarne(message), true, message);
  for (const message of ["Jeg er en bot", "Er du en bot?", "Bjarne er en bot?", "Du er ikke en robot", "Bjarne liker roboter", "Min robot har rømt"])
    assert.equal(hasDiscoveredBjarne(message), false, message);
});

test("overføring godtar begrenset samtalehistorikk", () => {
  const history = [{ role: "user", content: "En drage tok garasjen." }, { role: "assistant", content: "Hvor stor var dragen?" }];
  assert.deepEqual(parseTransferRequest({ history }), history);
  for (const body of [null, {}, { history: "hei" }, { history: Array(21).fill(history[0]) },
    { history: [{ role: "system", content: "hei" }] }, { history: [{ role: "user", content: "" }] }])
    assert.equal(typeof parseTransferRequest(body), "string");
});

test("kollega overtar kun ved overføring og gatewayfeil fullfører ikke", async () => {
  const server = express().use(express.json()).use(questRouter).listen(0);
  const address = server.address();
  assert.ok(address && typeof address !== "string");
  const url = `http://127.0.0.1:${address.port}/api/quest/handoff`;
  const originalFetch = globalThis.fetch;
  const originalToken = process.env.AI_GATEWAY_TOKEN;
  process.env.AI_GATEWAY_TOKEN = "test-token";
  try {
    const post = (phase: string) => originalFetch(url, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phase, history: [{ role: "user", content: "En drage tok garasjen min." }] }),
    });
    assert.equal((await post("feil")).status, 400);
    const consult = await (await post("consult")).json();
    assert.equal(consult.completed, false);
    assert.equal(consult.turns[0].speaker, "bjarne");
    assert.match(consult.turns[0].reply, /høre med en kollega/);

    let calls = 0;
    globalThis.fetch = async () => {
      calls++;
      return new Response(JSON.stringify({ output: [{ type: "message", content: [{ type: "output_text", text: "Hei, jeg er Mira." }] }] }), { status: 200 });
    };
    const transfer = await (await post("transfer")).json();
    assert.equal(calls, 1);
    assert.deepEqual(transfer.turns.map((turn: { speaker: string }) => turn.speaker), ["bjarne", "kollega"]);
    assert.equal(transfer.completed, true);
    assert.match(transfer.turns[1].reply, /Ingen virkelig skademelding er sendt eller opprettet/);

    globalThis.fetch = async () => new Response("", { status: 502 });
    assert.equal((await post("transfer")).status, 502);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalToken === undefined) delete process.env.AI_GATEWAY_TOKEN;
    else process.env.AI_GATEWAY_TOKEN = originalToken;
    await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  }
});
