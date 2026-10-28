import type { Kryss, KryssValg, Labyrint, Stopp, StoppType } from "../types/labyrint.ts";
import { moter } from "./moter.ts";

// Issue #7: lager en labyrint for hvert møte.
// Labyrinten er et rutenett: LAG kolonner med checkpoints, BANER rader.
// Fra hvert checkpoint kan man gå til samme rad eller naborad i neste kolonne,
// så man har alltid minst to valg. Alt er oppdiktet, og samme møte gir alltid samme labyrint.

const LAG = 6;
const BANER = 3;

const navn: Record<StoppType, string[]> = {
  trapp: ["Spiraltrappa", "Branntrappa", "Den glemte trappa", "Hovedtrappa (64 trinn)", "Trappa som bare går halvveis"],
  gang: ["Glassgangen", "Gangen med plantene ingen vanner", "Korridoren med motivasjonsplakater", "Gangen gjennom IT-avdelingen", "Den lange gangen forbi lageret", "Kjellergangen med blinkende lysrør"],
  heis: ["Heis C (treg)", "Vareheisen", "Heisen som alltid stopper i 4.", "Glassheisen"],
  "kaffe-god": ["Barista-automaten «Espresso Forte»", "Automaten «Bønnebaronen»", "Kaffehjørnet med ekte melk"],
  "kaffe-darlig": ["Automaten som bare lager varmt vann", "Kaffeautomaten «Gråsonen»", "Automaten med ukjent innhold"],
  frukt: ["Fruktskåla i kantina", "Kantina (bananer og et tvilsomt eple)", "Fruktkurven på kjøkkenet"],
  toalett: ["Toalettet som alltid er ledig", "Toalettet ved garderoben", "Toalettet med kø"],
};

const minutter: Record<StoppType, number> = {
  trapp: 2, gang: 1, heis: 2, "kaffe-god": 2, "kaffe-darlig": 1, frukt: 2, toalett: 2,
};

// Vekter: ganger og trapper er vanligst, kaffe og frukt er sjeldne og verdifulle.
const typer: StoppType[] = [
  "gang", "gang", "gang", "trapp", "trapp", "heis",
  "kaffe-god", "kaffe-darlig", "kaffe-darlig", "frukt", "toalett",
];

function tilfeldig(frø: string) {
  let s = 0;
  for (const c of frø) s = (s * 31 + c.charCodeAt(0)) >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

const id = (lag: number, bane: number) => `k${lag}-${bane}`;

function beskriv(stopp: Stopp): string {
  switch (stopp.type) {
    case "kaffe-god": return `Du står ved ${stopp.navn}. Den gløder. Den kaller på deg.`;
    case "kaffe-darlig": return `Du står ved ${stopp.navn}. Den ser skyldig ut.`;
    case "frukt": return `${stopp.navn}. Blodsukkeret ditt vender seg mot lyden av bananer.`;
    case "toalett": return `${stopp.navn}. En sjelden mulighet.`;
    case "heis": return `${stopp.navn}. Dørene lukker seg nesten.`;
    case "trapp": return `${stopp.navn}. Knærne dine protesterer.`;
    default: return `${stopp.navn}. Du er ikke helt sikker på hvor du er.`;
  }
}

export function lagLabyrint(moteId: string): Labyrint {
  const mote = moter.find((m) => m.id === moteId)!;
  const r = tilfeldig(moteId);
  const kryss: Record<string, Kryss> = {};

  // Hvert checkpoint får et stopp som er det man møter når man kommer dit.
  const stoppFor: Record<string, Stopp> = {};
  for (let lag = 1; lag <= LAG; lag++) {
    for (let bane = 0; bane < BANER; bane++) {
      const type = typer[Math.floor(r() * typer.length)];
      const liste = navn[type];
      stoppFor[id(lag, bane)] = { type, navn: liste[Math.floor(r() * liste.length)], minutter: minutter[type] };
    }
  }

  const valgTil = (lag: number, bane: number): KryssValg[] => {
    const ut: KryssValg[] = [];
    for (const b of [bane - 1, bane, bane + 1]) {
      if (b < 0 || b >= BANER) continue;
      const s = stoppFor[id(lag, b)];
      ut.push({ tekst: s.navn, stopp: s, til: id(lag, b) });
    }
    return ut;
  };

  const midt = Math.floor(BANER / 2);
  kryss.start = {
    id: "start", lag: 0, bane: midt,
    beskrivelse: `Du står i resepsjonen på ${mote.kontor}. Møtet «${mote.tittel}» er i ${mote.etasje}, rom ${mote.rom}.`,
    valg: valgTil(1, midt),
  };

  for (let lag = 1; lag <= LAG; lag++) {
    for (let bane = 0; bane < BANER; bane++) {
      const s = stoppFor[id(lag, bane)];
      const valg: KryssValg[] =
        lag < LAG
          ? valgTil(lag + 1, bane)
          : [
              { tekst: `Rett inn i ${mote.rom}`, stopp: { type: "gang", navn: `Døra til ${mote.rom}`, minutter: 1 }, til: "MAL" },
              { tekst: "En siste toalettpause først", stopp: { type: "toalett", navn: "Toalettet rett ved møterommet", minutter: 2 }, til: "MAL" },
            ];
      kryss[id(lag, bane)] = { id: id(lag, bane), lag, bane, stopp: s, beskrivelse: beskriv(s), valg };
    }
  }

  return { moteId, start: "start", antallLag: LAG, antallBaner: BANER, kryss };
}

export const labyrinter: Labyrint[] = moter.map((m) => lagLabyrint(m.id));
