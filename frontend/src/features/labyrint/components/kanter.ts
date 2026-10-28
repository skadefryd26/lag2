import type { Labyrint } from "../types";

// Gangene er toveis, så hver gang tegnes bare én gang.
export function unikeKanter(lab: Labyrint) {
  const sett = new Map<string, { fra: string; til: string }>();
  for (const k of Object.values(lab.kryss)) {
    for (const v of k.valg) {
      const nokkel = [k.id, v.til].sort().join("|");
      if (!sett.has(nokkel)) sett.set(nokkel, { fra: k.id, til: v.til });
    }
  }
  return [...sett.values()];
}

// Gangene spilleren har gått, uansett retning.
export function gatteKanter(besokt: string[]) {
  return new Set(besokt.slice(1).map((id, i) => [besokt[i], id].sort().join("|")));
}

export const kantNokkel = (a: string, b: string) => [a, b].sort().join("|");
