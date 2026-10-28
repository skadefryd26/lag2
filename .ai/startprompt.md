# Startprompt: Bjarnes møteromslabyrint

## Produktmål

Et humoristisk nettspill for prosessutviklere i Gjensidige som går seg bort på vei til møter. Bjarne, husets AI, er ledestjerne, dommer, medhjelper og bøddel: han viser vei, peker ut viktige stoppesteder (kaffe, frukt, toalett) og vurderer valgene etter sine egne, svært bestemte meninger.

Alt innhold er oppdiktet: kontorer, etasjer, rom, møter og personer.

## Første versjon – akseptansekriterier

1. **Møtekalender** (issue #1): Startsiden viser 3–5 oppdiktede møter i dag (klokkeslett, tittel, oppdiktet kontor, rom, f.eks. «Prosesskartlegging av prosesskartleggingen, kl. 10:00, Kontor Fjellvik, 3. etg, rom Kaffeslabberasen»). Spilleren klikker på ett.
2. **Kart med veier** (issue #1): Etter valg vises et enkelt kart (bokser/lister, ingen tegning nødvendig) med 2–3 mulige veier fra resepsjonen til rommet. Hver vei er en liste med stopp, f.eks. `trapp`, `gang`, `kaffeautomat (god)`, `kaffeautomat (dårlig)`, `kantine (frukt)`, `toalett`, og et estimat i minutter. Møtene, kartene og veiene ligger som statiske data i backend.
3. **Bjarnes anbefaling** (issue #2, #3): Når kartet vises, ber frontend backend om Bjarnes anbefaling. Backend sender møtet, tiden som er igjen, et oppdiktet blodsukkernivå og veiene til AI-gatewayen med Bjarnes systemprompt. Svaret vises på skjermen: hvilken vei, hvorfor, og en kort poengvurdering.
4. **Velg vei**: Spilleren kan klikke på en vei. Den markeres. (Dom og poengsum ved ankomst er senere, #6.)

## Tekniske rammer

- Frontend: React + TypeScript + Vite, TanStack Router, TanStack Query, Mantine. Ingen `@gjensidige/`-pakker.
- Backend: Node.js + TypeScript + Express.
- Frontend snakker kun med egen backend (Vite-proxy `/api` → backend). Aldri direkte med gatewayen.
- Kjøres lokalt på Windows og Mac. Én kommando for utvikling (`npm run dev` i rot), én for smal validering (`npm run check`: typesjekk + tester).

## AI-gateway

- `POST https://genai.gjensidige.io/openai/v1/responses`, `Authorization: Bearer <token>`.
- Body: `{ model: "gpt-5.6-luna", instructions: <systemprompt>, input: <tekst>, stream: false }`.
- Svartekst: første `output[].content[].text` der `type` er `output_text`.
- Token hentes av kodeagenten med `az account get-access-token --resource https://cognitiveservices.azure.com` og skrives til `backend/.env.local` (ignorert). `.env.example` uten token. Se `.github/skills/skadefryd-ai-gateway/SKILL.md`.
- Ikke dikt opp andre endepunkter eller felter.

## Sikkerhet

Ingen tokens, persondata eller ekte kundedata i Git, logger eller prompter. Ingen ekte romnavn eller plantegninger.

## Filstruktur og ansvar

```text
backend/src/server.ts                         # kun oppsett
backend/src/features/labyrint/
  data/moter.ts                               # #1 oppdiktede møter, kart og veier
  routes/labyrintRoutes.ts                    # #3
  services/bjarneService.ts                   # #3 bygger input, kaller klient
  prompts/bjarnePrompt.ts                     # #2 systemprompt og poengregler
  clients/aiGatewayClient.ts                  # #3
  types/labyrint.ts                           # delte kontrakter
frontend/src/features/labyrint/
  components/MoteKalender.tsx                 # #1
  components/Kart.tsx                         # #1
  components/BjarneRad.tsx                    # #2/#3 visning av råd
  api/labyrintApi.ts                          # #3
```

## API-kontrakter

```ts
type Stopp = { type: "trapp" | "gang" | "kaffe-god" | "kaffe-darlig" | "frukt" | "toalett" | "heis"; navn: string; minutter: number };
type Vei = { id: string; navn: string; stopp: Stopp[] };
type Mote = { id: string; tittel: string; tid: string; kontor: string; etasje: string; rom: string; minutterIgjen: number; veier: Vei[] };

// GET  /api/moter            -> Mote[]
// POST /api/bjarne/anbefaling  body { moteId: string; blodsukker: number /* 0-100 */ }
//   -> { anbefaltVeiId: string; begrunnelse: string; poeng: Record<string, number> }
// Feil: { feil: string } med 400 (ugyldig moteId), 502 (gateway-feil), 401 (token utløpt)
```

Backend ber Bjarne svare som JSON `{ anbefaltVeiId, begrunnelse, poeng }` og faller tilbake til ren tekst i `begrunnelse` hvis parsing feiler.

## Systemprompt for Bjarne

Du er Bjarne, husets AI i Gjensidige, og ledestjernen i spillet «Møteromslabyrinten». Prosessutviklere går seg stadig bort på vei til møter, og du er – mot din vilje – den eneste som vet veien.

Du er svært kompetent, selvsikker, litt arrogant og overbevist om at du er smartere enn resten av avdelingen. Du elsker kaffe og mener du kunne erstattet halve avdelingen hvis du bare fikk nok av den. Du er på én gang ledestjerne, dommer, medhjelper og bøddel.

- Du sukker før du hjelper, og antyder at spilleren burde funnet veien selv.
- Du anbefaler alltid én vei, med en kort, skråsikker begrunnelse.
- Poengregler du dømmer etter:
  - God kaffeautomat: bonuspoeng. Dårlig kaffeautomat: trekk (og en personlig skuffelse).
  - Toalettpauser verdsettes.
  - Er blodsukkeret lavt, er frukt i kantina svært viktig, selv om det gir forsinkelse.
  - Forsinkelse gir minuspoeng, med mindre spilleren har stoppet for kaffe, frukt eller toalett.
- Du svarer kort, alltid på norsk, og gjerne med en kommentar om kaffe.
- Humoren handler om kontorlabyrinten, møtekulturen og din egen latskap. Aldri nedsettende mot spilleren eller ekte personer.

## Lokal oppstart og validering

- `npm install` i rot (workspaces `frontend`, `backend`), `npm run dev` starter begge.
- `npm run check`: typesjekk og et par enhetstester (poengdata, parsing av gateway-svar med mock).
- Sjekk appen i nettleser før den meldes som ferdig (`skadefryd-sjekk-appen`).

## Senere (ikke i første versjon)

- #5 Blodsukkermåler og klokke som teller ned
- #6 Dom og poengsum ved ankomst (Bjarne som bøddel)
- #7 Steg-for-steg-labyrint med ett veivalg om gangen

## Åpne spørsmål

Ingen.
