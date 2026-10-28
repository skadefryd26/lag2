export type StoppType =
  | "trapp"
  | "gang"
  | "heis"
  | "kaffe-god"
  | "kaffe-darlig"
  | "frukt"
  | "toalett";

export type Stopp = { type: StoppType; navn: string; minutter: number };
export type Vei = { id: string; navn: string; stopp: Stopp[] };

export type Mote = {
  id: string;
  tittel: string;
  tid: string;
  kontor: string;
  etasje: string;
  rom: string;
  minutterIgjen: number;
  veier: Vei[];
};

export type AnbefalingRequest = { moteId: string; blodsukker: number };

export type Anbefaling = {
  anbefaltVeiId: string;
  begrunnelse: string;
  poeng: Record<string, number>;
};

export type Feil = { feil: string };

// Steg-for-steg-labyrint (#7)
export type KryssValg = { tekst: string; stopp: Stopp; til: string }; // til = kryss-id eller "MAL"
export type Kryss = { id: string; beskrivelse: string; valg: KryssValg[] };
export type Labyrint = { moteId: string; start: string; kryss: Record<string, Kryss> };

export type KommentarRequest = {
  moteId: string;
  blodsukker: number;
  sti: Stopp[]; // alle valg så langt, siste til slutt
  fremme: boolean;
};
export type Kommentar = { kommentar: string };
