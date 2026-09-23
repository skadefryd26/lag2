import assert from "node:assert/strict";
import { test } from "node:test";
import { parseQuestRequest } from "./quest.js";

const ok = { history: [], message: "Kjøleskapet mitt har rømt.", stage: 0 };

test("godtar gyldig forespørsel", () => {
  assert.deepEqual(parseQuestRequest(ok), ok);
});

test("avviser feilformat", () => {
  for (const bad of [
    null,
    { ...ok, message: "" },
    { ...ok, message: "x".repeat(2001) },
    { ...ok, stage: 4 },
    { ...ok, stage: 1.5 },
    { ...ok, history: "nei" },
    { ...ok, history: Array(21).fill({ role: "user", content: "hei" }) },
    { ...ok, history: [{ role: "system", content: "hei" }] },
  ])
    assert.equal(typeof parseQuestRequest(bad), "string", JSON.stringify(bad)?.slice(0, 60));
});
