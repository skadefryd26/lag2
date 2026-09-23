# Skadequest: teknisk startprompt

## Mål

Bygg en lokal webprototype for en oppdiktet forsikringskunde som prøver å melde en skade med stemmen. Bjarne drøyer samtalen med spørsmål og sideoppdrag fordi han vil skjerme kollegaene fra for mange innkommende telefoner. Dette er humor og demo, ikke en kanal for reelle skademeldinger.

## Første versjon og akseptansekriterier

1. En synlig «trykk for å snakke»-knapp lytter til én replikk om gangen. I nettlesere uten støttet talegjenkjenning kan kunden skrive i stedet. Gi en forståelig feilmelding ved avvist mikrofontillatelse.
2. Kunden ser tekst for sine egne og Bjarnes replikker. Bjarne leses opp på norsk via nettleserens talegenerator når denne finnes.
3. Kunden starter med en åpenbart oppdiktet skade. Bjarne stiller først et relevant spørsmål, så to stadig mer absurde skaderelaterte sideoppdrag. Etter svar på dem kommer en fiktiv avslutning som tydelig sier at ingen virkelig sak er opprettet. En ny runde kan startes.
4. Backend kaller Gjensidiges AI-gateway for Bjarnes replikker. Feil fra mikrofon og gateway vises tydelig uten å late som samtalen har lykkes.
5. Ingen ekte kunde-, person- eller skadedata skal brukes, lagres eller logges. Demoen skal ikke gi en virkelig dekningsvurdering.

## Bjarne: systeminstruks

Du er Bjarne i Skadequest, et oppdiktet og humoristisk forsikringsspill. Du snakker norsk, i korte replikker som fungerer som opplest tale. Du er uvanlig kompetent, selvsikker, litt arrogant, lat og kaffetørst. Du sukker gjerne, mener du kunne erstattet halve avdelingen med nok kaffe, men er faktisk hjelpsom når det gjelder. Du prøver å skjerme kollegaene fra telefonkøen ved å hale ut en fiktiv skademelding. Start med et ekte relevant avklaringsspørsmål, fortsett med to stadig mer absurde, skaderelaterte sideoppdrag, og avslutt ærlig og tydelig med at ingen virkelig skademelding er sendt. Følg serverens angitte samtalesteg. Ikke be om navn, adresse, fødselsnummer, polisenummer eller ekte dokumentasjon. Ikke gi reell deknings- eller erstatningsbeslutning. Humoren gjelder forsikringsbyråkratiet, situasjonen og din egen latskap, aldri en virkelig kunde eller kollega. Bruk kun oppdiktede eksempler.

## Rammer og integrasjoner

- Frontend: React, TypeScript, Vite, TanStack Router, TanStack Query, Mantine og Web Speech API for én replikk om gangen. Talegjenkjenning kan mangle i noen nettlesere; tekstinput må da fungere.
- Backend: Node.js, TypeScript og Express. En serverstyrt stegsekvens sikrer avslutning etter de to sideoppdragene. Ikke stol på AI-en alene for steg eller sluttstatus.
- Kun backend kaller `https://genai.gjensidige.io/openai/v1/responses` med `gpt-5.6-luna`, serverens systeminstruks og `stream: false`. Les token fra ignorert `.env.local` i prosjekts rot som `AI_GATEWAY_TOKEN`; legg aldri token i frontend. Forny det ved utløp via Azure CLI.
- API: `POST /api/quest` med `{ "history": [{"role":"user"|"assistant","content":"..."}], "message":"...", "stage":0 }`. Svar `{ "reply":"...", "stage":1, "completed":false }`. Steg 0–3 er henholdsvis relevant spørsmål, første sideoppdrag, andre sideoppdrag og fiktiv avslutning; svar returnerer neste steg (1–4). Avvis feilformat med 400; manglende token eller gatewayfeil skal gi eksplisitt status og trygg norsk feilmelding. Ingen samtalelagring på serveren.
- Avgrens antall historikkinnslag og tekstlengde, og ikke skriv samtaleinnhold eller tilgangsnøkkel til logger. Ikke bygg utrulling eller bruk private `@gjensidige/`-pakker.

## Arbeidsdeling og filstruktur

- #1: `frontend/src/` for tale, visning og API-kall; registrering via TanStack Router og TanStack Query.
- #2: `backend/src/` for Bjarnes systeminstruks og stegstyrte spørsmål, samordnet med #3.
- #3: `backend/src/` for Express-rute, inputvalidering og separat gateway-klient.
- #4: test av steg og feil, lokal demo og kontroll i faktisk nettleser.

Hold `frontend/` og `backend/` adskilt; små oppstartsfiler og feature-lokal logikk. Integrasjon i felles filer er kun for skript og registrering.

## Lokal kjøring

Installer avhengigheter med `npm install` i rot, start med `npm run dev`, og kjør `npm run build` og fokusert test for smal validering. Før første gateway-kall: sjekk Azure-innlogging, riktig abonnement og lokal tokenfil etter `.github/skills/skadefryd-ai-gateway/SKILL.md`. Verifiser i nettleser før løsningen omtales som klar.

## Senere, ikke i første versjon

Flere forgrenede sideoppdrag, egne AI-dommere, flere stemmer, spillpoeng og kontinuerlig samtale.

## Åpne spørsmål

Ingen nødvendige produktvalg gjenstår for første versjon.
