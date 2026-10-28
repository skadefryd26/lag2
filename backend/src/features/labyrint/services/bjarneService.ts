import { sporGateway } from "../clients/aiGatewayClient.ts";
import { bjarneSystemprompt } from "../prompts/bjarnePrompt.ts";
import type { Anbefaling, Mote } from "../types/labyrint.ts";

export function lagInput(mote: Mote, blodsukker: number): string {
  const veier = mote.veier
    .map((v) => {
      const sum = v.stopp.reduce((s, x) => s + x.minutter, 0);
      const stopp = v.stopp.map((s) => `${s.navn} [${s.type}, ${s.minutter} min]`).join(" → ");
      return `Vei ${v.id} «${v.navn}» (${sum} min totalt): ${stopp}`;
    })
    .join("\n");
  return `Møte: «${mote.tittel}» kl. ${mote.tid}, ${mote.kontor}, ${mote.etasje}, rom ${mote.rom}.
Minutter igjen til møtestart: ${mote.minutterIgjen}.
Spillerens blodsukker: ${blodsukker}/100.
Mulige veier:
${veier}`;
}

export function tolkSvar(tekst: string, mote: Mote): Anbefaling {
  const fallbackVei = mote.veier[0].id;
  try {
    const json = tekst.slice(tekst.indexOf("{"), tekst.lastIndexOf("}") + 1);
    const p = JSON.parse(json) as Partial<Anbefaling>;
    const gyldig = mote.veier.some((v) => v.id === p.anbefaltVeiId);
    return {
      anbefaltVeiId: gyldig ? p.anbefaltVeiId! : fallbackVei,
      begrunnelse: p.begrunnelse ?? "*sukk*",
      poeng: p.poeng ?? {},
    };
  } catch {
    return { anbefaltVeiId: fallbackVei, begrunnelse: tekst || "*sukk* Ingen kommentar.", poeng: {} };
  }
}

export async function hentAnbefaling(mote: Mote, blodsukker: number): Promise<Anbefaling> {
  const tekst = await sporGateway(bjarneSystemprompt, lagInput(mote, blodsukker));
  return tolkSvar(tekst, mote);
}
