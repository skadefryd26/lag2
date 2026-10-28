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

export type DomRequest = { moteId: string; veiId: string };

export type Dom = {
  poeng: number;
  effektivitet: number; // 0–100: hvor nær den raskeste mulige reisen du var
  dom: string; // Bjarnes dom, starter med et sukk
  detaljer: string[]; // kulepunkter: hva som ga og tok poeng
};

export type Feil = { feil: string };

// Steg-for-steg-labyrint (#7)
export type KryssValg = { tekst: string; stopp: Stopp; til: string }; // til = kryss-id eller "MAL"
export type Kryss = { id: string; lag: number; bane: number; stopp?: Stopp; beskrivelse: string; valg: KryssValg[] };
export type Labyrint = { moteId: string; start: string; antallLag: number; antallBaner: number; kryss: Record<string, Kryss> };

export type KommentarRequest = {
  moteId: string;
  blodsukker: number;
  sti: Stopp[]; // alle valg så langt, siste til slutt
  fremme: boolean;
};
export type Kommentar = { kommentar: string };
