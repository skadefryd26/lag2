import { test } from "node:test";
import assert from "node:assert/strict";
import { labyrinter } from "../data/kryss.ts";
import { moter } from "../data/moter.ts";
import { lagStegInput } from "../services/bjarneStegService.ts";

test("hvert møte har en labyrint", () => {
  for (const m of moter) assert.ok(labyrinter.some((l) => l.moteId === m.id), m.id);
});

test("alle valg peker til et kryss som finnes, eller MAL", () => {
  for (const l of labyrinter) {
    assert.ok(l.kryss[l.start], `${l.moteId} start`);
    for (const k of Object.values(l.kryss)) {
      for (const v of k.valg) assert.ok(v.til === "MAL" || l.kryss[v.til], `${l.moteId}/${k.id} → ${v.til}`);
    }
  }
});

test("steg-input sier fra når spilleren er for sent", () => {
  const sti = [{ type: "trapp" as const, navn: "Lang trapp", minutter: 99 }];
  assert.ok(lagStegInput(moter[0], 50, sti, false).includes("FOR SENT"));
});
