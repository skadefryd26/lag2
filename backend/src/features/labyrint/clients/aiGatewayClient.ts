const ENDPOINT = "https://genai.gjensidige.io/openai/v1/responses";
const MODEL = "gpt-5.6-luna";

type ResponsesApiResponse = {
  output: { type: string; content?: { type: string; text?: string }[] }[];
};

export class GatewayFeil extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

export async function sporGateway(instructions: string, input: string): Promise<string> {
  const token = process.env.AI_GATEWAY_TOKEN;
  if (!token) {
    throw new GatewayFeil("Tilgangstoken mangler i .env.local (AI_GATEWAY_TOKEN).", 500);
  }

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ model: MODEL, instructions, input, stream: false }),
  });

  if (res.status === 401) {
    throw new GatewayFeil("Tilgangstokenet er utløpt. Be kodeagenten hente et nytt.", 401);
  }
  if (!res.ok) {
    const tekst = await res.text();
    throw new GatewayFeil(`AI-gatewayen svarte ${res.status}: ${tekst.slice(0, 200)}`, 502);
  }

  const data = (await res.json()) as ResponsesApiResponse;
  return hentTekst(data);
}

export function hentTekst(data: ResponsesApiResponse): string {
  for (const o of data.output ?? []) {
    for (const c of o.content ?? []) {
      if (c.type === "output_text" && c.text) return c.text;
    }
  }
  return "";
}
