import { Router } from "express";
import { moter } from "../data/moter.ts";
import { hentLabyrint } from "../data/kryss.ts";
import { hentStegKommentar } from "../services/bjarneStegService.ts";
import { GatewayFeil } from "../clients/aiGatewayClient.ts";
import type { KommentarRequest } from "../types/labyrint.ts";

// Issue #7: steg-for-steg-labyrinten
export const stegRouter = Router();

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
    const kommentar = await hentStegKommentar(mote, blodsukker, body.sti, Boolean(body.fremme), Boolean(body.tilbake));
    res.json({ kommentar });
  } catch (e) {
    const status = e instanceof GatewayFeil ? e.status : 502;
    const melding = e instanceof Error ? e.message : "Ukjent feil";
    console.error("Bjarne-feil:", melding);
    res.status(status).json({ feil: melding });
  }
});
