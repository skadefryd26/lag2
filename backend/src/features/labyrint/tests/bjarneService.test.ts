import { test } from "node:test";
import assert from "node:assert/strict";
import { moter } from "../data/moter.ts";
import { lagInput, tolkSvar } from "../services/bjarneService.ts";
import { hentTekst } from "../clients/aiGatewayClient.ts";

test("alle møter har minst to veier", () => {
  for (const m of moter) assert.ok(m.veier.length >= 2, m.id);
});

test("input inneholder alle veier", () => {
  const input = lagInput(moter[0], 30);
  for (const v of moter[0].veier) assert.ok(input.includes(`Vei ${v.id}`));
});

test("tolker gyldig JSON-svar", () => {
  const svar = tolkSvar('{"anbefaltVeiId":"b","begrunnelse":"*sukk*","poeng":{"a":1,"b":5}}', moter[0]);
  assert.equal(svar.anbefaltVeiId, "b");
  assert.equal(svar.poeng.b, 5);
});

test("faller tilbake ved ugyldig svar", () => {
  const svar = tolkSvar("Bare ta trappa.", moter[0]);
  assert.equal(svar.anbefaltVeiId, "a");
  assert.equal(svar.begrunnelse, "Bare ta trappa.");
});

test("henter tekst fra gateway-svar", () => {
  const t = hentTekst({ output: [{ type: "message", content: [{ type: "output_text", text: "hei" }] }] });
  assert.equal(t, "hei");
});
