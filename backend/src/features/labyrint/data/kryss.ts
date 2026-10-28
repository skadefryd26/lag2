import type { Labyrint } from "../types/labyrint.ts";

// Issue #7: faste labyrinter med veikryss, én per møte. Alt er oppdiktet.
// "til": "MAL" betyr at spilleren er fremme i møterommet.
export const labyrinter: Labyrint[] = [
  {
    moteId: "m1",
    start: "resepsjon",
    kryss: {
      resepsjon: {
        id: "resepsjon",
        beskrivelse: "Du står i resepsjonen på Kontor Fjellvik. Resepsjonisten later som hun ikke ser deg.",
        valg: [
          { tekst: "Ta hovedtrappa", stopp: { type: "trapp", navn: "Hovedtrappa (64 trinn)", minutter: 2 }, til: "plantegang" },
          { tekst: "Gå glassgangen", stopp: { type: "gang", navn: "Glassgangen", minutter: 1 }, til: "kaffehjornet" },
          { tekst: "Smett inn bakveien", stopp: { type: "gang", navn: "Bakveien forbi lageret", minutter: 1 }, til: "lageret" },
        ],
      },
      plantegang: {
        id: "plantegang",
        beskrivelse: "3. etasje. En lang gang med plantene ingen vanner. Det lukter svakt av ambisjoner.",
        valg: [
          { tekst: "Rett fram til rommet", stopp: { type: "gang", navn: "Den lange gangen med plantene", minutter: 2 }, til: "MAL" },
          { tekst: "Innom toalettet", stopp: { type: "toalett", navn: "Toalettet i 3. etasje", minutter: 2 }, til: "MAL" },
        ],
      },
      kaffehjornet: {
        id: "kaffehjornet",
        beskrivelse: "Du ser Barista-automaten «Espresso Forte». Den gløder. Den kaller på deg.",
        valg: [
          { tekst: "Hent kaffe", stopp: { type: "kaffe-god", navn: "Espresso Forte", minutter: 3 }, til: "heis" },
          { tekst: "Motstå fristelsen, ta heisen", stopp: { type: "heis", navn: "Heis C (treg)", minutter: 3 }, til: "MAL" },
        ],
      },
      heis: {
        id: "heis",
        beskrivelse: "Kaffe i hånda. Foran deg: Heis C (treg) og en trapp ingen har brukt siden 2019.",
        valg: [
          { tekst: "Heis C", stopp: { type: "heis", navn: "Heis C (treg)", minutter: 3 }, til: "MAL" },
          { tekst: "Den glemte trappa", stopp: { type: "trapp", navn: "Den glemte trappa", minutter: 2 }, til: "MAL" },
        ],
      },
      lageret: {
        id: "lageret",
        beskrivelse: "Lageret. Esker med «Strategi 2019». En automat som bare lager varmt vann.",
        valg: [
          { tekst: "Prøv automaten likevel", stopp: { type: "kaffe-darlig", navn: "Automaten som bare lager varmt vann", minutter: 1 }, til: "branntrapp" },
          { tekst: "Rett til branntrappa", stopp: { type: "trapp", navn: "Branntrappa", minutter: 2 }, til: "MAL" },
        ],
      },
      branntrapp: {
        id: "branntrapp",
        beskrivelse: "Med en kopp lunkent vann klatrer du mot branntrappa.",
        valg: [{ tekst: "Opp branntrappa", stopp: { type: "trapp", navn: "Branntrappa", minutter: 2 }, til: "MAL" }],
      },
    },
  },
  {
    moteId: "m2",
    start: "resepsjon",
    kryss: {
      resepsjon: {
        id: "resepsjon",
        beskrivelse: "Kontor Havbukta. Skiltet sier «Labyrinten: 5. etasje». Det er tre retninger. Ingen er merket.",
        valg: [
          { tekst: "Mot kantina", stopp: { type: "gang", navn: "Kantinegangen", minutter: 1 }, til: "kantina" },
          { tekst: "Heis A", stopp: { type: "heis", navn: "Heis A", minutter: 2 }, til: "femteA" },
          { tekst: "Ned mot toalettene", stopp: { type: "gang", navn: "Gangen i 2. etasje", minutter: 1 }, til: "toalett" },
        ],
      },
      kantina: {
        id: "kantina",
        beskrivelse: "Kantina. Bananer, og ett eple som har sett bedre dager.",
        valg: [
          { tekst: "Ta en banan", stopp: { type: "frukt", navn: "Banan fra kantina", minutter: 3 }, til: "spiral" },
          { tekst: "Ikke tid, rett til spiraltrappa", stopp: { type: "trapp", navn: "Spiraltrappa", minutter: 3 }, til: "femteB" },
        ],
      },
      spiral: {
        id: "spiral",
        beskrivelse: "Banan i hånda. Spiraltrappa snurrer oppover. Du blir litt svimmel bare av å se på den.",
        valg: [{ tekst: "Opp spiraltrappa", stopp: { type: "trapp", navn: "Spiraltrappa", minutter: 3 }, til: "femteB" }],
      },
      femteA: {
        id: "femteA",
        beskrivelse: "Korridor 5A. Dørene har ingen navn, bare tall. Rommet heter Labyrinten. Selvfølgelig.",
        valg: [
          { tekst: "Gå til venstre", stopp: { type: "gang", navn: "Korridor 5A, feil vei", minutter: 3 }, til: "femteB" },
          { tekst: "Gå til høyre", stopp: { type: "gang", navn: "Korridor 5A, riktig vei", minutter: 1 }, til: "MAL" },
        ],
      },
      femteB: {
        id: "femteB",
        beskrivelse: "Korridor 5B. Du hører noen si «skal vi ta en runde rundt bordet». Du er nær.",
        valg: [{ tekst: "Følg lyden av post-it-lapper", stopp: { type: "gang", navn: "Korridor 5B", minutter: 2 }, til: "MAL" }],
      },
      toalett: {
        id: "toalett",
        beskrivelse: "Toalettet i 2. etasje. Det er alltid ledig. Ingen vet hvorfor.",
        valg: [
          { tekst: "Benytt anledningen", stopp: { type: "toalett", navn: "Toalettet i 2. etasje", minutter: 3 }, til: "graasonen" },
          { tekst: "Videre til nødtrappa", stopp: { type: "trapp", navn: "Nødtrappa", minutter: 4 }, til: "MAL" },
        ],
      },
      graasonen: {
        id: "graasonen",
        beskrivelse: "Kaffeautomaten «Gråsonen» står ved nødtrappa og ser skyldig ut.",
        valg: [
          { tekst: "Kaffe fra Gråsonen", stopp: { type: "kaffe-darlig", navn: "Gråsonen", minutter: 2 }, til: "nodtrapp" },
          { tekst: "Nødtrappa uten kaffe", stopp: { type: "trapp", navn: "Nødtrappa", minutter: 4 }, til: "MAL" },
        ],
      },
      nodtrapp: {
        id: "nodtrapp",
        beskrivelse: "Med grå kaffe i hånda står du ved nødtrappa.",
        valg: [{ tekst: "Opp nødtrappa", stopp: { type: "trapp", navn: "Nødtrappa", minutter: 4 }, til: "MAL" }],
      },
    },
  },
  {
    moteId: "m3",
    start: "resepsjon",
    kryss: {
      resepsjon: {
        id: "resepsjon",
        beskrivelse: "Kontor Lillesund. Møterommet «Utsikten» ligger i kjelleren. Det sier sitt.",
        valg: [
          { tekst: "Rett fram", stopp: { type: "gang", navn: "Resepsjonsgangen", minutter: 3 }, til: "MAL" },
          { tekst: "Innom Bønnebaronen", stopp: { type: "kaffe-god", navn: "Bønnebaronen", minutter: 2 }, til: "garderobe" },
        ],
      },
      garderobe: {
        id: "garderobe",
        beskrivelse: "Ved garderoben. Det er et toalett her, og kjellertrappa.",
        valg: [
          { tekst: "Toalettpause", stopp: { type: "toalett", navn: "Toalettet ved garderoben", minutter: 2 }, til: "kjeller" },
          { tekst: "Ned i kjelleren", stopp: { type: "trapp", navn: "Kjellertrappa", minutter: 1 }, til: "MAL" },
        ],
      },
      kjeller: {
        id: "kjeller",
        beskrivelse: "Kjellergangen. Lysrøret blinker i takt med hjerterytmen din.",
        valg: [{ tekst: "Mot «Utsikten»", stopp: { type: "gang", navn: "Kjellergangen", minutter: 2 }, til: "MAL" }],
      },
    },
  },
  {
    moteId: "m4",
    start: "resepsjon",
    kryss: {
      resepsjon: {
        id: "resepsjon",
        beskrivelse: "Kontor Fjellvik igjen. Rommet «Toppen» ligger i 7. etasje. Lean-frokosten har ingen frokost.",
        valg: [
          { tekst: "Trappemaraton", stopp: { type: "trapp", navn: "Seks etasjer med trapp", minutter: 7 }, til: "MAL" },
          { tekst: "Kantina først", stopp: { type: "frukt", navn: "Fruktskåla i kantina", minutter: 3 }, til: "kantine" },
          { tekst: "Snarveien gjennom IT", stopp: { type: "gang", navn: "Gangen gjennom IT-avdelingen", minutter: 3 }, til: "it" },
        ],
      },
      kantine: {
        id: "kantine",
        beskrivelse: "Du har frukt. Espresso Forte står rett ved siden av og blunker.",
        valg: [
          { tekst: "Kaffe også", stopp: { type: "kaffe-god", navn: "Espresso Forte", minutter: 2 }, til: "heisB" },
          { tekst: "Rett til heis B", stopp: { type: "heis", navn: "Heis B", minutter: 3 }, til: "MAL" },
        ],
      },
      heisB: {
        id: "heisB",
        beskrivelse: "Frukt og kaffe. Du er uovervinnelig. Heis B venter.",
        valg: [{ tekst: "Heis B til toppen", stopp: { type: "heis", navn: "Heis B", minutter: 3 }, til: "MAL" }],
      },
      it: {
        id: "it",
        beskrivelse: "IT-avdelingen. Noen spør om du har prøvd å skru den av og på igjen. Du vet ikke hva «den» er.",
        valg: [
          { tekst: "Automaten med ukjent innhold", stopp: { type: "kaffe-darlig", navn: "Automaten med ukjent innhold", minutter: 2 }, til: "vareheis" },
          { tekst: "Rett til vareheisen", stopp: { type: "heis", navn: "Vareheisen", minutter: 4 }, til: "MAL" },
        ],
      },
      vareheis: {
        id: "vareheis",
        beskrivelse: "Du drikker noe brunt. Vareheisen knirker.",
        valg: [{ tekst: "Vareheisen opp", stopp: { type: "heis", navn: "Vareheisen", minutter: 4 }, til: "MAL" }],
      },
    },
  },
];
