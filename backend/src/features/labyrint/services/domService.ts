import { sporGateway } from "../clients/aiGatewayClient.ts";
import { bjarneDomPrompt } from "../prompts/bjarneDomPrompt.ts";
import type { Dom, Mote, Vei } from "../types/labyrint.ts";

// Poengregler for effektiv navigering (#6). Rikke eier disse — juster fritt.
const POENG = {
  grunnpoeng: 100, // full pott for den raskeste veien
  trekkPerMinuttTregere: 12, // trekk per minutt tregere enn raskeste vei
  bonusITide: 20, // bonus for å rekke møtet
  trekkPerMinuttForsinket: 8, // trekk per minutt for sent
};

export type Poengpost = { tekst: string; verdi: number };

function minutter(vei: Vei): number {
  return vei.stopp.reduce((s, x) => s + x.minutter, 0);
}

export function regnPoeng(
  mote: Mote,
  vei: Vei,
): { poeng: number; poster: Poengpost[]; brukteMin: number; raskesteMin: number; forsinkelse: number } {
  const poster: Poengpost[] = [];
  const brukteMin = minutter(vei);
  const raskesteMin = Math.min(...mote.veier.map(minutter));

  poster.push({ tekst: "Du kom fram", verdi: POENG.grunnpoeng });

  const tregere = brukteMin - raskesteMin;
  if (tregere <= 0) {
    poster.push({ tekst: `Du valgte den raskeste veien (${brukteMin} min)`, verdi: 0 });
  } else {
    poster.push({
      tekst: `${tregere} min tregere enn den raskeste veien (${raskesteMin} min)`,
      verdi: -tregere * POENG.trekkPerMinuttTregere,
    });
  }

  const forsinkelse = Math.max(0, brukteMin - mote.minutterIgjen);
  if (forsinkelse > 0) {
    poster.push({
      tekst: `${forsinkelse} min for sent til møtet`,
      verdi: -forsinkelse * POENG.trekkPerMinuttForsinket,
    });
  } else {
    poster.push({
      tekst: `Rakk møtet med ${mote.minutterIgjen - brukteMin} min til overs`,
      verdi: POENG.bonusITide,
    });
  }

  const poeng = Math.max(0, poster.reduce((s, p) => s + p.verdi, 0));
  return { poeng, poster, brukteMin, raskesteMin, forsinkelse };
}

// Effektivitetsmåler (0–100): hvor nær den perfekte, raskeste reisen du var.
export function effektivitet(poeng: number): number {
  // 0 poeng => 0, 120 poeng (raskest + i tide) => 100
  return Math.max(0, Math.min(100, Math.round((poeng / 120) * 100)));
}

function lagInput(mote: Mote, vei: Vei, poeng: number, poster: Poengpost[], raskeste: number): string {
  const linjer = poster.map((p) => `- ${p.tekst}: ${p.verdi >= 0 ? "+" : ""}${p.verdi}`).join("\n");
  return `Møte: «${mote.tittel}» kl. ${mote.tid}, rom ${mote.rom}, ${mote.etasje}.
Minutter til møtestart da spilleren startet: ${mote.minutterIgjen}.
Spilleren valgte vei «${vei.navn}».
Raskeste mulige vei tok ${raskeste} min.
Poengregnskap (handler KUN om å finne fram effektivt, ikke om kaffe eller frukt):
${linjer}
SUM POENG: ${poeng}

Fell dommen din over hvor effektivt spilleren fant fram.`;
}

export async function hentDom(mote: Mote, vei: Vei): Promise<Dom> {
  const { poeng, poster, raskesteMin } = regnPoeng(mote, vei);
  const maler = effektivitet(poeng);
  const detaljer = poster.map((p) => `${p.verdi >= 0 ? "➕" : "➖"} ${p.tekst} (${p.verdi >= 0 ? "+" : ""}${p.verdi})`);

  let dom = "*sukk* Jeg orker ikke dømme akkurat nå. Men poengene taler for seg.";
  try {
    const tekst = await sporGateway(bjarneDomPrompt, lagInput(mote, vei, poeng, poster, raskesteMin));
    if (tekst.trim()) dom = tekst.trim();
  } catch {
    // Beholder fallback-dommen. Poengene og måleren virker uansett.
  }

  return { poeng, effektivitet: maler, dom, detaljer };
}
