import { readFileSync } from "node:fs";
import { parseEnv } from "node:util";

const ENDPOINT = "https://genai.gjensidige.io/openai/v1/responses";
const MODEL = "gpt-5.6-luna";
const ENV_FILE = new URL("../../.env.local", import.meta.url);

export class GatewayError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

// Leses på nytt hvert kall, så et fornyet token virker uten omstart.
function token(): string | undefined {
  try {
    return parseEnv(readFileSync(ENV_FILE, "utf8")).AI_GATEWAY_TOKEN || undefined;
  } catch {
    return process.env.AI_GATEWAY_TOKEN || undefined;
  }
}

type Message = { role: "user" | "assistant"; content: string };
type ResponsesBody = {
  output?: { type: string; content?: { type: string; text?: string }[] }[];
};

export async function askGateway(instructions: string, input: Message[]): Promise<string> {
  const t = token();
  if (!t) throw new GatewayError(503, "Tilgangsnøkkelen til AI-gatewayen mangler (.env.local).");

  let res: Response;
  try {
    res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { Authorization: `Bearer ${t}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: MODEL, instructions, input, stream: false }),
      signal: AbortSignal.timeout(30_000),
    });
  } catch {
    throw new GatewayError(502, "Fikk ikke kontakt med AI-gatewayen.");
  }

  if (res.status === 401) throw new GatewayError(502, "Tilgangsnøkkelen til AI-gatewayen er utløpt.");
  if (!res.ok) throw new GatewayError(502, `AI-gatewayen svarte med feil (${res.status}).`);

  const body = (await res.json()) as ResponsesBody;
  const text = body.output
    ?.flatMap((o) => (o.type === "message" ? (o.content ?? []) : []))
    .filter((c) => c.type === "output_text")
    .map((c) => c.text ?? "")
    .join("")
    .trim();
  if (!text) throw new GatewayError(502, "AI-gatewayen ga et tomt svar.");
  return text;
}
