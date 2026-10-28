// Speiler backend/src/features/labyrint/types/labyrint.ts
export type StoppType = "trapp" | "gang" | "heis" | "kaffe-god" | "kaffe-darlig" | "frukt" | "toalett";
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
export type Anbefaling = { anbefaltVeiId: string; begrunnelse: string; poeng: Record<string, number> };

// Steg-for-steg (#7)
export type KryssValg = { tekst: string; stopp: Stopp; til: string };
export type Kryss = { id: string; beskrivelse: string; valg: KryssValg[] };
export type Labyrint = { moteId: string; start: string; kryss: Record<string, Kryss> };
