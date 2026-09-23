import { Router } from "express";
import { BJARNE_SYSTEM_PROMPT, END_INSTRUCTION, STAGE_INSTRUCTIONS } from "./bjarne.js";
import { COLLEAGUE_PROMPT, CONSULT_REPLY, TRANSFER_REPLY } from "./colleague.js";
import { askGateway, GatewayError } from "./gateway.js";

const MAX_HISTORY = 20;
const MAX_CONTENT = 2000;
const ONGOING_STAGE = STAGE_INSTRUCTIONS.length - 1;

type Message = { role: "user" | "assistant"; content: string };
export type QuestRequest = { history: Message[]; message: string; stage: number };

export function hasDiscoveredBjarne(message: string): boolean {
  return !message.trim().endsWith("?") &&
    /\b(?:du|bjarne)\s+er\s+(?:(?:jo|faktisk|bare|egentlig|visst|vel|en|ei|et)\s+)*(?:ai|ki|chatbot|robot|bot|kunstig intelligens)\b/i.test(message);
}

const isText = (v: unknown, max: number): v is string =>
  typeof v === "string" && v.trim().length > 0 && v.length <= max;

export function parseQuestRequest(body: unknown): QuestRequest | string {
  const b = body as Partial<QuestRequest> | null;
  if (!b || typeof b !== "object") return "Forventet JSON-objekt.";
  if (!isText(b.message, MAX_CONTENT)) return `message må være tekst (1–${MAX_CONTENT} tegn).`;
  if (!Number.isInteger(b.stage) || b.stage! < 0 || b.stage! > ONGOING_STAGE)
    return `stage må være et heltall 0–${ONGOING_STAGE}.`;
  if (!Array.isArray(b.history) || b.history.length > MAX_HISTORY)
    return `history må være en liste med maks ${MAX_HISTORY} innslag.`;
  for (const m of b.history)
    if (!m || (m.role !== "user" && m.role !== "assistant") || !isText(m.content, MAX_CONTENT))
      return "Ugyldig innslag i history.";
  return { history: b.history, message: b.message, stage: b.stage! };
}

export function parseTransferRequest(body: unknown): Message[] | string {
  if (!body || typeof body !== "object" || !("history" in body)) return "Forventet history.";
  const history = (body as { history: unknown }).history;
  if (!Array.isArray(history) || history.length > MAX_HISTORY) return `history må være en liste med maks ${MAX_HISTORY} innslag.`;
  for (const m of history)
    if (!m || (m.role !== "user" && m.role !== "assistant") || !isText(m.content, MAX_CONTENT))
      return "Ugyldig innslag i history.";
  return history;
}

export const questRouter = Router().post("/api/quest", async (req, res) => {
  const parsed = parseQuestRequest(req.body);
  if (typeof parsed === "string") return void res.status(400).json({ error: parsed });

  const { history, message, stage } = parsed;
  const completed = hasDiscoveredBjarne(message);
  try {
    const reply = await askGateway(`${BJARNE_SYSTEM_PROMPT}\n\n${completed ? END_INSTRUCTION : STAGE_INSTRUCTIONS[stage]}`, [
      ...history,
      { role: "user", content: message },
    ]);
    // Serveren bestemmer avslutningen, og garanterer at den er tydelig også om AI-en utelater den.
    res.json({ reply: completed ? `${reply}\n\nIngen virkelig skademelding er sendt eller opprettet.` : reply,
      stage: Math.min(stage + 1, ONGOING_STAGE), completed });
  } catch (e) {
    const status = e instanceof GatewayError ? e.status : 500;
    const error = e instanceof GatewayError ? e.message : "Noe gikk galt hos Bjarne.";
    res.status(status).json({ error });
  }
});

questRouter.post("/api/quest/handoff", async (req, res) => {
  const history = parseTransferRequest(req.body);
  if (typeof history === "string") return void res.status(400).json({ error: history });
  const phase = (req.body as { phase?: unknown }).phase;
  if (phase !== "consult" && phase !== "transfer") return void res.status(400).json({ error: "Ugyldig overføringsfase." });

  try {
    if (phase === "consult") return void res.json({ turns: [{ speaker: "bjarne", reply: CONSULT_REPLY }], completed: false });
    const colleague = await askGateway(COLLEAGUE_PROMPT, [...history, { role: "assistant", content: TRANSFER_REPLY }]);
    res.json({ turns: [
      { speaker: "bjarne", reply: TRANSFER_REPLY },
      { speaker: "kollega", reply: `${colleague}\n\nIngen virkelig skademelding er sendt eller opprettet.` },
    ], completed: true });
  } catch (e) {
    const status = e instanceof GatewayError ? e.status : 500;
    const error = e instanceof GatewayError ? e.message : "Mira kunne ikke ta over samtalen.";
    res.status(status).json({ error });
  }
});
