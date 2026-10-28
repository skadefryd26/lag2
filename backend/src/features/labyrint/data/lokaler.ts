export type Booking = { fra: string; til: string; tittel: string };

export type Lokale = {
  id: string;
  navn: string;
  kontor: string;
  etasje: string;
  bokinger: Booking[];
};

// Alt er oppdiktet: kontorer, rom og bookinger.
export const lokaler: Lokale[] = [
  {
    id: "barnerommet",
    navn: "Barnerommet",
    kontor: "Kontor Fjellvik",
    etasje: "3. etasje",
    bokinger: [
      { fra: "09:00", til: "09:45", tittel: "Prosesskartlegging av prosesskartleggingen" },
      { fra: "13:00", til: "14:00", tittel: "Workshop om workshops" },
    ],
  },
  {
    id: "peisestua",
    navn: "Peisestua",
    kontor: "Kontor Fjellvik",
    etasje: "2. etasje",
    bokinger: [{ fra: "10:00", til: "11:30", tittel: "Kaffekomiteen (lukket møte)" }],
  },
  {
    id: "kjokkenet",
    navn: "Kjøkkenet",
    kontor: "Kontor Fjellvik",
    etasje: "2. etasje",
    bokinger: [],
  },
  {
    id: "stabburet",
    navn: "Stabburet",
    kontor: "Kontor Fjellvik",
    etasje: "4. etasje",
    bokinger: [{ fra: "12:00", til: "13:00", tittel: "Lunsjforedrag uten lunsj" }],
  },
  {
    id: "hytta",
    navn: "Hytta",
    kontor: "Kontor Fjellvik",
    etasje: "7. etasje",
    bokinger: [{ fra: "15:00", til: "15:30", tittel: "Lean-frokost (uten frokost)" }],
  },
  {
    id: "naustet",
    navn: "Naustet",
    kontor: "Kontor Havbukta",
    etasje: "5. etasje",
    bokinger: [{ fra: "10:30", til: "11:30", tittel: "Workshop: Hvorfor har vi så mange workshops?" }],
  },
  {
    id: "brygga",
    navn: "Brygga",
    kontor: "Kontor Havbukta",
    etasje: "1. etasje",
    bokinger: [],
  },
  {
    id: "sjobua",
    navn: "Sjøbua",
    kontor: "Kontor Havbukta",
    etasje: "6. etasje",
    bokinger: [{ fra: "08:30", til: "09:30", tittel: "Morgenkaffe med Bjarne (avlyst)" }],
  },
  {
    id: "landstedet",
    navn: "Landstedet",
    kontor: "Kontor Lillesund",
    etasje: "1. etasje",
    bokinger: [{ fra: "13:00", til: "13:30", tittel: "Statusmøte om statusmøtene" }],
  },
  {
    id: "storstua",
    navn: "Storstua",
    kontor: "Kontor Lillesund",
    etasje: "1. etasje",
    bokinger: [{ fra: "11:00", til: "12:00", tittel: "Allmøte der ingen får ordet" }],
  },
  {
    id: "vindfanget",
    navn: "Vindfanget",
    kontor: "Kontor Lillesund",
    etasje: "2. etasje",
    bokinger: [],
  },
  {
    id: "gapahuken",
    navn: "Gapahuken",
    kontor: "Kontor Lillesund",
    etasje: "3. etasje",
    bokinger: [{ fra: "14:00", til: "16:00", tittel: "Strategiseminar om å komme seg hjem" }],
  },
];

export function tilMinutter(tid: string): number {
  const [timer, minutter] = tid.split(":").map(Number);
  return (timer || 0) * 60 + (minutter || 0);
}

export function erLedig(lokale: Lokale, fra: string, til: string): boolean {
  const start = tilMinutter(fra);
  const slutt = tilMinutter(til);
  if (!Number.isFinite(start) || !Number.isFinite(slutt) || slutt <= start) return false;
  return !lokale.bokinger.some((b) => start < tilMinutter(b.til) && slutt > tilMinutter(b.fra));
}

export function leggTilBooking(lokaleId: string, fra: string, til: string, tittel: string): boolean {
  const lokale = lokaler.find((l) => l.id === lokaleId);
  if (!lokale || !erLedig(lokale, fra, til)) return false;
  lokale.bokinger.push({ fra, til, tittel });
  return true;
}

export function finnLokale(lokaleId: string): Lokale | undefined {
  return lokaler.find((l) => l.id === lokaleId);
}
