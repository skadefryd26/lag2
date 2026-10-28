import { sporGateway } from "../clients/aiGatewayClient.ts";
import { bjarneStegPrompt } from "../prompts/bjarneStegPrompt.ts";
import type { Labyrint, Mote, Stopp } from "../types/labyrint.ts";
import { type Dialekt, ostfoldInstruks } from "./dialektService.ts";

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

export async function hentStegKommentar(mote: Mote, blodsukker: number, sti: Stopp[], fremme: boolean, tilbake = false, dialekt: Dialekt = "bokmal"): Promise<string> {
  const prompt = bjarneStegPrompt + (dialekt === "ostfold" ? ostfoldInstruks : "");
  const tekst = await sporGateway(prompt, lagStegInput(mote, blodsukker, sti, fremme, tilbake));
  return tekst.trim() || "*sukk*";
}

const startPrompt = `Du er Bjarne, husets AI i Gjensidige: ledestjerne, dommer, medhjelper og bøddel. Lat, arrogant, kaffeavhengig, men faktisk hjelpsom.
En prosessutvikler står i resepsjonen og skal gjennom kontorlabyrinten til et møte. Gi et kort råd FØR de går (2–3 setninger, norsk, start med et sukk):
- Pek ut ett eller to steder i labyrinten som er verdt et stopp (god kaffe, frukt hvis blodsukkeret er under 40, toalett), og ett sted de bør unngå (dårlig kaffe).
- Si noe om tiden de har.
Aldri nedsettende mot spilleren. Svar kun med selve rådet.`;

export async function hentStartRad(mote: Mote, lab: Labyrint, blodsukker: number, dialekt: Dialekt = "bokmal"): Promise<string> {
  const kolonner = Array.from({ length: lab.antallLag }, (_, i) => i + 1)
    .map((lag) => {
      const her = Object.values(lab.kryss).filter((k) => k.lag === lag && k.stopp);
      return `Checkpoint ${lag}: ${her.map((k) => `${k.stopp!.navn} [${k.stopp!.type}]`).join(", ")}`;
    })
    .join("\n");
  const input = `Møte: «${mote.tittel}» i rom ${mote.rom} (${mote.kontor}, ${mote.etasje}). Minutter igjen: ${mote.minutterIgjen}.
Blodsukker: ${blodsukker}/100.
Labyrinten:
${kolonner}`;
  const tekst = await sporGateway(startPrompt + (dialekt === "ostfold" ? ostfoldInstruks : ""), input);
  return tekst.trim() || "*sukk* Bare gå. Jeg følger med.";
}
