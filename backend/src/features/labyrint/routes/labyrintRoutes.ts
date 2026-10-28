import { Router } from "express";
import { moter } from "../data/moter.ts";
import { hentAnbefaling } from "../services/bjarneService.ts";
import { GatewayFeil } from "../clients/aiGatewayClient.ts";
import type { AnbefalingRequest } from "../types/labyrint.ts";

export const labyrintRouter = Router();

labyrintRouter.get("/moter", (_req, res) => {
  res.json(moter);
});

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
