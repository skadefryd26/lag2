import assert from "node:assert/strict";
import { test } from "node:test";
import { hasDiscoveredBjarne, parseQuestRequest } from "./quest.js";

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
