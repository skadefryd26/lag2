import { sporGateway } from "../clients/aiGatewayClient.ts";
import { bjarneDomPrompt } from "../prompts/bjarneDomPrompt.ts";
import type { Dom, Mote, Vei } from "../types/labyrint.ts";

// Poengreglene for #6. Rikke eier disse — juster fritt.
const POENG = {
  kaffeGod: 15,
  kaffeDarlig: -10,
  toalett: 8,
  fruktLavtBlodsukker: 20,
  fruktVanlig: 5,
  forsinkelsePerMin: -4,
  bjarnesVei: 10,
};

export type Poengpost = { tekst: string; verdi: number };

export function regnPoeng(
  mote: Mote,
  vei: Vei,
  blodsukker: number,
  bjarnesVeiId: string | undefined,
): { poeng: number; poster: Poengpost[]; forsinkelse: number; stoppetForNoe: boolean } {
  const poster: Poengpost[] = [];
  const lavtBlodsukker = blodsukker < 40;
  let stoppetForNoe = false;

  for (const s of vei.stopp) {
    if (s.type === "kaffe-god") {
      poster.push({ tekst: `God kaffe: ${s.navn}`, verdi: POENG.kaffeGod });
      stoppetForNoe = true;
    } else if (s.type === "kaffe-darlig") {
      poster.push({ tekst: `Dårlig kaffe: ${s.navn}`, verdi: POENG.kaffeDarlig });
      stoppetForNoe = true;
    } else if (s.type === "toalett") {
      poster.push({ tekst: `Toalettpause: ${s.navn}`, verdi: POENG.toalett });
      stoppetForNoe = true;
    } else if (s.type === "frukt") {
      const verdi = lavtBlodsukker ? POENG.fruktLavtBlodsukker : POENG.fruktVanlig;
      poster.push({
        tekst: lavtBlodsukker ? `Frukt ved lavt blodsukker: ${s.navn}` : `Frukt: ${s.navn}`,
        verdi,
      });
      stoppetForNoe = true;
    }
  }

  const sumMin = vei.stopp.reduce((s, x) => s + x.minutter, 0);
  const forsinkelse = Math.max(0, sumMin - mote.minutterIgjen);
  if (forsinkelse > 0) {
    if (stoppetForNoe) {
      poster.push({
        tekst: `${forsinkelse} min forsinket — men du stoppet for kaffe, frukt eller do, så Bjarne ser gjennom fingrene`,
        verdi: 0,
      });
    } else {
      poster.push({
        tekst: `${forsinkelse} min forsinket uten god grunn`,
        verdi: forsinkelse * POENG.forsinkelsePerMin,
      });
    }
  }

  if (bjarnesVeiId && vei.id === bjarnesVeiId) {
    poster.push({ tekst: "Du valgte Bjarnes anbefalte vei", verdi: POENG.bjarnesVei });
  }

  const poeng = poster.reduce((s, p) => s + p.verdi, 0);
  return { poeng, poster, forsinkelse, stoppetForNoe };
}

// Kaffebarometer: hvor nær du var å fortjene kaffepausen din (0–100).
export function kaffebarometer(poeng: number): number {
  // -30 poeng => 0, +40 poeng => 100
  const andel = (poeng + 30) / 70;
  return Math.max(0, Math.min(100, Math.round(andel * 100)));
}

function lagInput(mote: Mote, vei: Vei, blodsukker: number, poeng: number, poster: Poengpost[]): string {
  const linjer = poster.map((p) => `- ${p.tekst}: ${p.verdi >= 0 ? "+" : ""}${p.verdi}`).join("\n");
  return `Møte: «${mote.tittel}» kl. ${mote.tid}, rom ${mote.rom}, ${mote.etasje}.
Spilleren valgte vei «${vei.navn}».
Spillerens blodsukker: ${blodsukker}/100.
Poengregnskap for den valgte reisen:
${linjer}
SUM POENG: ${poeng}

Fell dommen din over denne reisen.`;
}

export async function hentDom(
  mote: Mote,
  vei: Vei,
  blodsukker: number,
  bjarnesVeiId: string | undefined,
): Promise<Dom> {
  const { poeng, poster } = regnPoeng(mote, vei, blodsukker, bjarnesVeiId);
  const barometer = kaffebarometer(poeng);
  const detaljer = poster.map((p) => `${p.verdi >= 0 ? "➕" : "➖"} ${p.tekst} (${p.verdi >= 0 ? "+" : ""}${p.verdi})`);

  let dom = "*sukk* Jeg orker ikke dømme akkurat nå. Men poengene taler for seg.";
  try {
    const tekst = await sporGateway(bjarneDomPrompt, lagInput(mote, vei, blodsukker, poeng, poster));
    if (tekst.trim()) dom = tekst.trim();
  } catch {
    // Beholder fallback-dommen. Poengene og barometeret virker uansett.
  }

  return { poeng, kaffebarometer: barometer, dom, detaljer };
}
