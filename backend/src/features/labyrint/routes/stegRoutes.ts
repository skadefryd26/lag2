import { Router } from "express";
import { moter } from "../data/moter.ts";
import { hentLabyrint } from "../data/kryss.ts";
import { hentStegKommentar, hentStartRad } from "../services/bjarneStegService.ts";
import { hentDom } from "../services/domService.ts";
import { omskrivTilOstfold, tilDialekt } from "../services/dialektService.ts";
import { GatewayFeil } from "../clients/aiGatewayClient.ts";
import type { KommentarRequest, Labyrint, Stopp, Vei } from "../types/labyrint.ts";

// Issue #7: steg-for-steg-labyrinten
export const stegRouter = Router();

function feilsvar(res: import("express").Response, e: unknown) {
  const status = e instanceof GatewayFeil ? e.status : 502;
  const melding = e instanceof Error ? e.message : "Ukjent feil";
  console.error("Bjarne-feil:", melding);
  res.status(status).json({ feil: melding });
}

stegRouter.get("/labyrint/:moteId", (req, res) => {
  const lab = hentLabyrint(req.params.moteId);
  if (!lab) {
    res.status(404).json({ feil: "Dette møtet har ingen labyrint. Bjarne anbefaler å bli hjemme." });
    return;
  }
  res.json(lab);
});

stegRouter.post("/bjarne/kommentar", async (req, res) => {
  const body = req.body as Partial<KommentarRequest>;
  const mote = moter.find((m) => m.id === body.moteId);
  if (!mote || !Array.isArray(body.sti) || body.sti.length === 0) {
    res.status(400).json({ feil: "Bjarne trenger både et møte og minst ett valg å klage på." });
    return;
  }
  const blodsukker = Math.max(0, Math.min(100, Number(body.blodsukker ?? 50)));
  try {
    const kommentar = await hentStegKommentar(mote, blodsukker, body.sti, Boolean(body.fremme), Boolean(body.tilbake), tilDialekt(req.body?.dialekt));
    res.json({ kommentar });
  } catch (e) {
    feilsvar(res, e);
  }
});

// Bjarnes råd før man går inn i labyrinten (erstatter anbefalingen fra den gamle kartsiden)
stegRouter.post("/bjarne/startrad", async (req, res) => {
  const body = req.body as { moteId?: string; blodsukker?: number };
  const mote = moter.find((m) => m.id === body.moteId);
  const lab = body.moteId ? hentLabyrint(body.moteId) : undefined;
  if (!mote || !lab) {
    res.status(400).json({ feil: "Ukjent møte. Bjarne kjenner ikke til det, og det sier mye." });
    return;
  }
  const blodsukker = Math.max(0, Math.min(100, Number(body.blodsukker ?? 50)));
  try {
    res.json({ kommentar: await hentStartRad(mote, lab, blodsukker, tilDialekt(req.body?.dialekt)) });
  } catch (e) {
    feilsvar(res, e);
  }
});

// Raskeste vei gjennom labyrinten, bare framover (til poengregnskapet)
export function raskesteSti(lab: Labyrint): Stopp[] {
  const best = new Map<string, Stopp[]>([[lab.start, []]]);
  const sortert = Object.values(lab.kryss).sort((a, b) => a.lag - b.lag);
  let mal: Stopp[] | null = null;
  const sum = (s: Stopp[]) => s.reduce((t, x) => t + x.minutter, 0);
  for (const k of sortert) {
    const her = best.get(k.id);
    if (!her) continue;
    for (const v of k.valg.filter((x) => x.retning === "fram")) {
      const ny = [...her, v.stopp];
      if (v.til === "MAL") {
        if (!mal || sum(ny) < sum(mal)) mal = ny;
      } else {
        const gml = best.get(v.til);
        if (!gml || sum(ny) < sum(gml)) best.set(v.til, ny);
      }
    }
  }
  return mal ?? [];
}

// Bjarnes dom ved ankomst (#6), brukt på veien gjennom labyrinten
stegRouter.post("/bjarne/dom-labyrint", async (req, res) => {
  const body = req.body as { moteId?: string; sti?: Stopp[] };
  const mote = moter.find((m) => m.id === body.moteId);
  const lab = body.moteId ? hentLabyrint(body.moteId) : undefined;
  if (!mote || !lab || !Array.isArray(body.sti) || body.sti.length === 0) {
    res.status(400).json({ feil: "Bjarne kan ikke dømme en reise som ikke har skjedd." });
    return;
  }
  const din: Vei = { id: "din", navn: "Din vei gjennom labyrinten", stopp: body.sti };
  const raskest: Vei = { id: "raskest", navn: "Bjarnes vei", stopp: raskesteSti(lab) };
  try {
    const dom = await hentDom({ ...mote, veier: [din, raskest] }, din);
    if (tilDialekt(req.body?.dialekt) === "ostfold") dom.dom = await omskrivTilOstfold(dom.dom);
    res.json(dom);
  } catch (e) {
    feilsvar(res, e);
  }
});
