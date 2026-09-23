import { Router } from "express";
import { BJARNE_SYSTEM_PROMPT, STAGE_INSTRUCTIONS } from "./bjarne.js";
import { askGateway, GatewayError } from "./gateway.js";

const MAX_HISTORY = 20;
const MAX_CONTENT = 2000;
const LAST_STAGE = STAGE_INSTRUCTIONS.length - 1;

type Message = { role: "user" | "assistant"; content: string };
export type QuestRequest = { history: Message[]; message: string; stage: number };

const isText = (v: unknown, max: number): v is string =>
  typeof v === "string" && v.trim().length > 0 && v.length <= max;

export function parseQuestRequest(body: unknown): QuestRequest | string {
  const b = body as Partial<QuestRequest> | null;
  if (!b || typeof b !== "object") return "Forventet JSON-objekt.";
  if (!isText(b.message, MAX_CONTENT)) return `message må være tekst (1–${MAX_CONTENT} tegn).`;
  if (!Number.isInteger(b.stage) || b.stage! < 0 || b.stage! > LAST_STAGE)
    return `stage må være et heltall 0–${LAST_STAGE}.`;
  if (!Array.isArray(b.history) || b.history.length > MAX_HISTORY)
    return `history må være en liste med maks ${MAX_HISTORY} innslag.`;
  for (const m of b.history)
    if (!m || (m.role !== "user" && m.role !== "assistant") || !isText(m.content, MAX_CONTENT))
      return "Ugyldig innslag i history.";
  return { history: b.history, message: b.message, stage: b.stage! };
}

export const questRouter = Router().post("/api/quest", async (req, res) => {
  const parsed = parseQuestRequest(req.body);
  if (typeof parsed === "string") return void res.status(400).json({ error: parsed });

  const { history, message, stage } = parsed;
  try {
    const reply = await askGateway(`${BJARNE_SYSTEM_PROMPT}\n\n${STAGE_INSTRUCTIONS[stage]}`, [
      ...history,
      { role: "user", content: message },
    ]);
    // Serveren, ikke AI-en, bestemmer neste steg og når det er slutt.
    res.json({ reply, stage: stage + 1, completed: stage === LAST_STAGE });
  } catch (e) {
    const status = e instanceof GatewayError ? e.status : 500;
    const error = e instanceof GatewayError ? e.message : "Noe gikk galt hos Bjarne.";
    res.status(status).json({ error });
  }
});
