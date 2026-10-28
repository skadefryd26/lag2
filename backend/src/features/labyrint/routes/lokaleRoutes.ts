import { Router } from "express";
import { erLedig, lokaler, tilMinutter } from "../data/lokaler.ts";

export const lokaleRouter = Router();

lokaleRouter.get("/lokaler", (req, res) => {
  const fra = String(req.query.fra ?? "10:00");
  const til = String(req.query.til ?? "11:00");
  if (tilMinutter(til) <= tilMinutter(fra)) {
    res.status(400).json({ feil: "Bjarne trenger et tidsrom der slutten kommer etter starten. Selv han har grenser." });
    return;
  }
  res.json(lokaler.map((l) => ({ ...l, ledig: erLedig(l, fra, til) })));
});
