import { Router } from "express";
import { leggTilMote, moter } from "../data/moter.ts";
import { finnLokale, leggTilBooking } from "../data/lokaler.ts";
import { hentAnbefaling } from "../services/bjarneService.ts";
import { hentDom } from "../services/domService.ts";
import { GatewayFeil } from "../clients/aiGatewayClient.ts";
import type { AnbefalingRequest, DomRequest } from "../types/labyrint.ts";

export const labyrintRouter = Router();

labyrintRouter.get("/moter", (_req, res) => {
  res.json(moter);
});

labyrintRouter.post("/moter", (req, res) => {
  const body = req.body as Record<string, unknown>;
  const tittel = String(body.tittel ?? "").trim();
  const tid = String(body.tid ?? "").trim() || "12:00";
  const lokaleId = typeof body.lokaleId === "string" && body.lokaleId ? body.lokaleId : null;
  const lokale = lokaleId ? finnLokale(lokaleId) : undefined;
  const rom = String(body.rom ?? "").trim() || lokale?.navn || "";
  if (!tittel || !rom) {
    res.status(400).json({ feil: "Bjarne krever i det minste et møte og et rom. Ellers er det bare en følelse." });
    return;
  }
  if (lokaleId && !lokale) {
    res.status(400).json({ feil: "Det lokalet finnes ikke. Bjarne sjekket. Nøye." });
    return;
  }
  if (lokaleId && !leggTilBooking(lokaleId, tid, leggTilMinutter(tid, 30), tittel)) {
    res.status(409).json({ feil: "Lokalet er opptatt i det tidsrommet. Bjarne foreslår et annet rom, eller en annen tid." });
    return;
  }
  const mote = leggTilMote({
    tittel,
    rom,
    tid,
    kontor: String(body.kontor ?? "").trim() || lokale?.kontor || "Kontor Fjellvik",
    etasje: String(body.etasje ?? "").trim() || lokale?.etasje || "3. etasje",
    minutterIgjen: Math.max(0, Math.min(120, Number(body.minutterIgjen ?? 10))),
  });
  res.status(201).json(mote);
});

function leggTilMinutter(tid: string, antall: number): string {
  const [timer, minutter] = tid.split(":").map(Number);
  const total = (timer || 0) * 60 + (minutter || 0) + antall;
  const nyTimer = Math.floor((total % (24 * 60)) / 60);
  const nyMinutter = total % 60;
  return `${String(nyTimer).padStart(2, "0")}:${String(nyMinutter).padStart(2, "0")}`;
}

labyrintRouter.post("/bjarne/anbefaling", async (req, res) => {
  const body = req.body as Partial<AnbefalingRequest>;
  const mote = moter.find((m) => m.id === body.moteId);
  if (!mote) {
    res.status(400).json({ feil: "Ukjent møte. Bjarne kjenner ikke til det, og det sier mye." });
    return;
  }
  const blodsukker = Math.max(0, Math.min(100, Number(body.blodsukker ?? 50)));
  try {
    res.json(await hentAnbefaling(mote, blodsukker));
  } catch (e) {
    const status = e instanceof GatewayFeil ? e.status : 502;
    const melding = e instanceof Error ? e.message : "Ukjent feil";
    console.error("Bjarne-feil:", melding);
    res.status(status).json({ feil: melding });
  }
});

labyrintRouter.post("/bjarne/dom", async (req, res) => {
  const body = req.body as Partial<DomRequest>;
  const mote = moter.find((m) => m.id === body.moteId);
  if (!mote) {
    res.status(400).json({ feil: "Ukjent møte. Bjarne kjenner ikke til det, og det sier mye." });
    return;
  }
  const vei = mote.veier.find((v) => v.id === body.veiId);
  if (!vei) {
    res.status(400).json({ feil: "Ukjent vei. Bjarne lurer på hvor du egentlig gikk." });
    return;
  }
  try {
    res.json(await hentDom(mote, vei));
  } catch (e) {
    const status = e instanceof GatewayFeil ? e.status : 502;
    const melding = e instanceof Error ? e.message : "Ukjent feil";
    console.error("Bjarne-dom-feil:", melding);
    res.status(status).json({ feil: melding });
  }
});
