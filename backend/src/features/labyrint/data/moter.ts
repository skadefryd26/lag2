import type { Mote } from "../types/labyrint.ts";

// Alt her er oppdiktet: kontorer, rom og møter.
export const moter: Mote[] = [
  {
    id: "m1",
    tittel: "Prosesskartlegging av prosesskartleggingen",
    tid: "09:00",
    kontor: "Kontor Fjellvik",
    etasje: "3. etasje",
    rom: "Barnerommet",
    minutterIgjen: 10,
    veier: [
      {
        id: "a",
        navn: "Hovedtrappa",
        stopp: [
          { type: "trapp", navn: "Hovedtrappa (64 trinn)", minutter: 2 },
          { type: "gang", navn: "Den lange gangen med plantene", minutter: 2 },
        ],
      },
      {
        id: "b",
        navn: "Kaffeomveien",
        stopp: [
          { type: "gang", navn: "Glassgangen", minutter: 1 },
          { type: "kaffe-god", navn: "Barista-automaten «Espresso Forte»", minutter: 3 },
          { type: "heis", navn: "Heis C (treg)", minutter: 3 },
        ],
      },
      {
        id: "c",
        navn: "Bakveien forbi lageret",
        stopp: [
          { type: "kaffe-darlig", navn: "Automaten som bare lager varmt vann", minutter: 1 },
          { type: "trapp", navn: "Branntrappa", minutter: 2 },
        ],
      },
    ],
  },
  {
    id: "m2",
    tittel: "Workshop: Hvorfor har vi så mange workshops?",
    tid: "10:30",
    kontor: "Kontor Havbukta",
    etasje: "5. etasje",
    rom: "Naustet",
    minutterIgjen: 12,
    veier: [
      {
        id: "a",
        navn: "Kantineveien",
        stopp: [
          { type: "frukt", navn: "Kantina (bananer og et tvilsomt eple)", minutter: 4 },
          { type: "trapp", navn: "Spiraltrappa", minutter: 3 },
          { type: "gang", navn: "Korridor 5B", minutter: 2 },
        ],
      },
      {
        id: "b",
        navn: "Heisen rett opp",
        stopp: [
          { type: "heis", navn: "Heis A", minutter: 2 },
          { type: "gang", navn: "Korridor 5A, feil vei, så tilbake", minutter: 4 },
        ],
      },
      {
        id: "c",
        navn: "Toalettruta",
        stopp: [
          { type: "toalett", navn: "Toalettet i 2. etasje (alltid ledig)", minutter: 3 },
          { type: "kaffe-darlig", navn: "Kaffeautomaten «Gråsonen»", minutter: 2 },
          { type: "trapp", navn: "Nødtrappa", minutter: 4 },
        ],
      },
    ],
  },
  {
    id: "m3",
    tittel: "Statusmøte om statusmøtene",
    tid: "13:00",
    kontor: "Kontor Lillesund",
    etasje: "1. etasje",
    rom: "Landstedet (i kjelleren)",
    minutterIgjen: 8,
    veier: [
      {
        id: "a",
        navn: "Rett fram",
        stopp: [{ type: "gang", navn: "Resepsjonsgangen", minutter: 3 }],
      },
      {
        id: "b",
        navn: "Via kaffe og do",
        stopp: [
          { type: "kaffe-god", navn: "Automaten «Bønnebaronen»", minutter: 2 },
          { type: "toalett", navn: "Toalettet ved garderoben", minutter: 2 },
          { type: "gang", navn: "Kjellergangen", minutter: 2 },
        ],
      },
    ],
  },
  {
    id: "m4",
    tittel: "Lean-frokost (uten frokost)",
    tid: "15:00",
    kontor: "Kontor Fjellvik",
    etasje: "7. etasje",
    rom: "Hytta",
    minutterIgjen: 11,
    veier: [
      {
        id: "a",
        navn: "Trappemaraton",
        stopp: [
          { type: "trapp", navn: "Seks etasjer med trapp", minutter: 7 },
        ],
      },
      {
        id: "b",
        navn: "Frukt og heis",
        stopp: [
          { type: "frukt", navn: "Fruktskåla i kantina", minutter: 3 },
          { type: "kaffe-god", navn: "Barista-automaten «Espresso Forte»", minutter: 2 },
          { type: "heis", navn: "Heis B", minutter: 3 },
        ],
      },
      {
        id: "c",
        navn: "Snarveien som ikke er en snarvei",
        stopp: [
          { type: "gang", navn: "Gangen gjennom IT-avdelingen", minutter: 3 },
          { type: "kaffe-darlig", navn: "Automaten med ukjent innhold", minutter: 2 },
          { type: "heis", navn: "Vareheisen", minutter: 4 },
        ],
      },
    ],
  },
];
