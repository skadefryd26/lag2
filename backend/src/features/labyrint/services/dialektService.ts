import { sporGateway } from "../clients/aiGatewayClient.ts";

// Issue #23: Bjarne kan snakke østfoldsk. Teksten skrives på dialekt, og stemmen leser den opp.
export type Dialekt = "ostfold" | "bokmal";

export const tilDialekt = (verdi: unknown): Dialekt => (verdi === "bokmal" ? "bokmal" : "ostfold");

export const ostfoldInstruks = `
VIKTIG – SPRÅK: Du er fra Østfold og skriver ALLTID på østfoldsk dialekt, slik det uttales. Eksempler på trekk:
- «je» for jeg, «itte» for ikke, «hæ» for hva, «no» for noe, «sjøl» for selv, «dom» for de/dem, «oss» for vi, «a» som etterhengt småord («ja, a»)
- a-endelser i fortid og bestemt form: «kasta», «hoppa», «trappa», «kaffen»
- «hær» for her, «dær» for der, «åssen» for hvordan, «kåssen» for hvorfor, «noenting» for noe
Hold det lesbart og kort, men gå tydelig inn for dialekten: bruk minst fire dialektord i hvert svar, og start gjerne med «Hæ, a?» eller «Nei, nå…». Dialekten skal være kjærlig, aldri latterliggjørende.`;

const omskrivPrompt = `Skriv om teksten til østfoldsk dialekt, slik den uttales. Behold innhold, tall og navn nøyaktig. Ikke legg til noe nytt.${ostfoldInstruks}
Svar kun med den omskrevne teksten.`;

export async function omskrivTilOstfold(tekst: string): Promise<string> {
  try {
    const ut = await sporGateway(omskrivPrompt, tekst);
    return ut.trim() || tekst;
  } catch {
    return tekst; // Dommen virker uansett, bare på bokmål
  }
}
