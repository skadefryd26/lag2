import { useCallback, useEffect, useRef, useState } from "react";

// Issue #23: Bjarnes egen stemme. Bruker talesyntesen i nettleseren, ingen eksterne tjenester.
// Bjarne er alltid den samme stemmen: norsk, litt lav og litt treg, slik at han høres oppgitt ut.

const LAGRET = "bjarne-stemme-pa";
const SPRAK = ["nb-NO", "no-NO", "nn-NO", "nb", "no", "da-DK", "sv-SE"];

function velgStemme(): SpeechSynthesisVoice | null {
  const alle = window.speechSynthesis?.getVoices() ?? [];
  for (const sprak of SPRAK) {
    const treff = alle.filter((v) => v.lang.toLowerCase().startsWith(sprak.toLowerCase()));
    // Foretrekk en mannsstemme hvis navnet avslører det (Bjarne er Bjarne)
    const mann = treff.find((v) => /finn|jon|henrik|magnus|mann|male/i.test(v.name));
    if (mann ?? treff[0]) return mann ?? treff[0];
  }
  return null;
}

// Gjør Bjarnes skrevne manerer om til noe som høres
export function tilTale(tekst: string): string {
  return tekst
    .replace(/\*?sukk\*?/gi, "Hhhhh… sukk.")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/[«»"]/g, "")
    .replace(/→/g, ", så ")
    .replace(/[☕🤢🍌🚻🪜🛗🚶🛎️🚪📍⏱️🩸👉🧔]/gu, "")
    .trim();
}

export function useBjarneStemme() {
  const stottet = typeof window !== "undefined" && "speechSynthesis" in window;
  const [pa, setPa] = useState(() => localStorage.getItem(LAGRET) !== "av");
  const [snakker, setSnakker] = useState(false);
  const [sisteTekst, setSisteTekst] = useState("");
  const stemme = useRef<SpeechSynthesisVoice | null>(null);

  useEffect(() => {
    if (!stottet) return;
    const oppdater = () => { stemme.current = velgStemme(); };
    oppdater();
    window.speechSynthesis.addEventListener("voiceschanged", oppdater);
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", oppdater);
      window.speechSynthesis.cancel();
    };
  }, [stottet]);

  const lesOpp = useCallback(
    (tekst: string, { avbryt = true, huskes = true }: { avbryt?: boolean; huskes?: boolean } = {}) => {
      if (huskes) setSisteTekst(tekst);
      if (!stottet || !pa || !tekst) return;
      if (avbryt) window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(tilTale(tekst));
      if (stemme.current) u.voice = stemme.current;
      u.lang = stemme.current?.lang ?? "nb-NO";
      u.rate = 0.92; // litt treg, han gidder ikke skynde seg
      u.pitch = 0.8; // litt lav, han er dypt skuffet
      u.onstart = () => setSnakker(true);
      u.onend = () => setSnakker(window.speechSynthesis.speaking);
      u.onerror = () => setSnakker(false);
      window.speechSynthesis.speak(u);
    },
    [stottet, pa],
  );

  const settPa = useCallback((verdi: boolean) => {
    setPa(verdi);
    localStorage.setItem(LAGRET, verdi ? "pa" : "av");
    if (!verdi && stottet) window.speechSynthesis.cancel();
  }, [stottet]);

  const gjenta = useCallback(() => {
    if (sisteTekst) lesOpp(sisteTekst, { huskes: false });
  }, [sisteTekst, lesOpp]);

  const stopp = useCallback(() => {
    if (stottet) window.speechSynthesis.cancel();
    setSnakker(false);
  }, [stottet]);

  return { stottet, pa, settPa, lesOpp, gjenta, stopp, snakker, sisteTekst };
}
