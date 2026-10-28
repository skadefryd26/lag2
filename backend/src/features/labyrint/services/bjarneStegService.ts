import { sporGateway } from "../clients/aiGatewayClient.ts";
import { bjarneStegPrompt } from "../prompts/bjarneStegPrompt.ts";
import type { Mote, Stopp } from "../types/labyrint.ts";

export function lagStegInput(mote: Mote, blodsukker: number, sti: Stopp[], fremme: boolean, tilbake = false): string {
  const brukt = sti.reduce((s, x) => s + x.minutter, 0);
  const siste = sti[sti.length - 1];
  const tidligere = sti.slice(0, -1).map((s) => `${s.navn} [${s.type}]`).join(" → ") || "ingen";
  return `Møte: «${mote.tittel}» i rom ${mote.rom} (${mote.kontor}, ${mote.etasje}).
Minutter igjen ved start: ${mote.minutterIgjen}. Minutter brukt så langt: ${brukt}.${brukt > mote.minutterIgjen ? " Spilleren er FOR SENT." : ""}
Blodsukker: ${blodsukker}/100.
Tidligere valg: ${tidligere}
Siste valg: ${siste.navn} [${siste.type}, ${siste.minutter} min]${tilbake ? " – spilleren GIKK TILBAKE dit" : ""}
${fremme ? "Spilleren er nå fremme i møterommet." : "Spilleren er ikke fremme ennå."}`;
}

export async function hentStegKommentar(mote: Mote, blodsukker: number, sti: Stopp[], fremme: boolean, tilbake = false): Promise<string> {
  const tekst = await sporGateway(bjarneStegPrompt, lagStegInput(mote, blodsukker, sti, fremme, tilbake));
  return tekst.trim() || "*sukk*";
}
