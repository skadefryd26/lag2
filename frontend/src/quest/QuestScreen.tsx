import { useEffect, useRef, useState } from 'react';
import { Alert, Badge, Button, Group, Loader, Textarea, Title } from '@mantine/core';
import { useMutation } from '@tanstack/react-query';
import { sendQuest, type Turn } from './questApi';

type Recognition = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  onspeechstart: (() => void) | null;
  onspeechend: (() => void) | null;
  start: () => void;
  stop: () => void;
};
type RecognitionConstructor = new () => Recognition;

function getRecognition(): RecognitionConstructor | undefined {
  const speechWindow = window as Window & {
    SpeechRecognition?: RecognitionConstructor;
    webkitSpeechRecognition?: RecognitionConstructor;
  };
  return speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;
}

function say(text: string) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'nb-NO';
  utterance.rate = 0.96;
  const norwegian = window.speechSynthesis.getVoices().find(voice => voice.lang.toLowerCase().startsWith('nb'));
  if (norwegian) utterance.voice = norwegian;
  window.speechSynthesis.speak(utterance);
}

export function QuestScreen() {
  const [history, setHistory] = useState<Turn[]>([]);
  const [stage, setStage] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [draft, setDraft] = useState('');
  const [listening, setListening] = useState(false);
  const [stopping, setStopping] = useState(false);
  const [speechError, setSpeechError] = useState('');
  const recognition = useRef<Recognition | null>(null);
  const silenceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const finishRecording = useRef<(() => void) | null>(null);
  const conversation = useRef<HTMLDivElement>(null);
  const supported = typeof window !== 'undefined' && !!getRecognition();
  const quest = useMutation({
    mutationFn: (message: string) => sendQuest(message, history, stage),
    onSuccess: (result, message) => {
      setHistory(previous => [...previous, { role: 'user', content: message }, { role: 'assistant', content: result.reply }]);
      setStage(result.stage);
      setCompleted(result.completed);
      setDraft('');
      say(result.reply);
    },
  });

  useEffect(() => {
    conversation.current?.scrollTo({ top: conversation.current.scrollHeight, behavior: 'smooth' });
  }, [history, quest.isPending]);
  useEffect(() => () => {
    if (silenceTimer.current) clearTimeout(silenceTimer.current);
    finishRecording.current = null;
    const session = recognition.current;
    recognition.current = null;
    session?.stop();
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  }, []);

  function submit(text = draft) {
    const trimmed = text.trim();
    if (!trimmed || quest.isPending || completed) return;
    setSpeechError('');
    quest.reset();
    quest.mutate(trimmed);
  }

  function listen() {
    if (listening) {
      if (!stopping) {
        finishRecording.current?.();
      }
      return;
    }
    const SpeechRecognition = getRecognition();
    if (!SpeechRecognition || quest.isPending || completed) return;
    setSpeechError('');
    quest.reset();
    let transcript = '';
    let previousSessions = '';
    let failed = false;
    let finishing = false;
    let heardSpeech = false;
    const clearSilence = () => {
      if (silenceTimer.current) clearTimeout(silenceTimer.current);
      silenceTimer.current = null;
    };
    const finish = () => {
      if (finishing) return;
      finishing = true;
      clearSilence();
      setStopping(true);
      // stop() can still produce a final onresult before onend.
      if (recognition.current) recognition.current.stop();
      else complete();
    };
    const complete = () => {
      if (finishRecording.current !== finish) return;
      finishRecording.current = null;
      clearSilence();
      setListening(false);
      setStopping(false);
      if (failed) return;
      if (transcript) submit(transcript);
      else setSpeechError('Jeg hørte ingenting. Prøv igjen eller skriv i feltet.');
    };
    const resetSilence = () => {
      clearSilence();
      if (!heardSpeech || finishing) return;
      silenceTimer.current = setTimeout(finish, 3000);
    };
    finishRecording.current = finish;
    const startSession = () => {
      if (finishing || failed) return;
      const session = new SpeechRecognition();
      let sessionText = '';
      recognition.current = session;
      session.lang = 'nb-NO';
      session.continuous = true;
      session.interimResults = true;
      session.onspeechstart = () => { heardSpeech = true; clearSilence(); };
      session.onspeechend = resetSilence;
      session.onresult = event => {
        heardSpeech = true;
        sessionText = Array.from(event.results, result => result[0]?.transcript ?? '').join(' ').trim();
        const text = [previousSessions, sessionText].filter(Boolean).join(' ');
        if (text) {
          transcript = text;
          setDraft(text);
        }
        // Receiving a transcript is not evidence of silence; wait for onspeechend.
      };
      session.onerror = event => {
        if (event.error === 'no-speech' && heardSpeech) return;
        failed = true;
        clearSilence();
        setSpeechError(event.error === 'not-allowed' || event.error === 'service-not-allowed'
          ? 'Mikrofonen er ikke tillatt. Du kan skrive i feltet i stedet.'
          : 'Jeg fikk ikke med meg det du sa. Prøv igjen eller skriv i feltet.');
      };
      session.onend = () => {
        if (recognition.current !== session) return;
        recognition.current = null;
        if (finishing || failed || !heardSpeech) {
          complete();
        } else {
          // Some browsers end recognition at a short pause; keep listening until our own timer expires.
          if (sessionText) previousSessions = [previousSessions, sessionText].filter(Boolean).join(' ');
          if (!silenceTimer.current) resetSilence();
          startSession();
        }
      };
      try {
        session.start();
        setListening(true);
      } catch {
        failed = true;
        recognition.current = null;
        setSpeechError('Mikrofonen kunne ikke startes. Du kan skrive i feltet i stedet.');
        complete();
      }
    };
    startSession();
  }

  function restart() {
    if (silenceTimer.current) clearTimeout(silenceTimer.current);
    silenceTimer.current = null;
    finishRecording.current = null;
    const session = recognition.current;
    recognition.current = null;
    session?.stop();
    setListening(false);
    setStopping(false);
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    quest.reset();
    setHistory([]);
    setStage(0);
    setCompleted(false);
    setDraft('');
    setSpeechError('');
  }

  return (
    <main className="page">
      <header className="masthead"><span className="logo">S<span>✳</span></span><span>SKADEQUEST <span className="masthead-muted">/ EN HELT FIKTIV TELEFONKØ</span></span><Badge variant="light" color="orange">DEMO</Badge></header>
      <section className="hero">
        <div className="eyebrow">ET FORSIKRINGSSPILL SOM TAR SEG GOD TID</div>
        <Title order={1}>Din skade. <em>Hans pause.</em></Title>
        <p>Du har en oppdiktet skade. Bjarne har en kaffe som blir kald. Prøv å komme deg gjennom samtalen før han finner på et nytt skjema.</p>
      </section>
      <section className="quest-layout" aria-label="Samtale med Bjarne">
        <aside className="agent-card">
          <div className="portrait" aria-hidden="true"><span>☕</span><div className="portrait-face">B</div></div>
          <div className="agent-online"><span className="online-dot" /> PÅ JOBB, MOT SIN VILJE</div>
          <h2>Bjarne</h2><p>Senior spesialist i å kjøpe seg tid. Overraskende dyktig når han først gidder.</p>
          <div className="agent-footer">«Sukk. Vi får vel se på det.»</div>
        </aside>
        <div className="conversation-card">
          <div className="conversation-head"><div><span className="eyebrow">SAMTALE 001</span><h2>Skadetelefonen</h2></div><span className="round-status">{completed ? 'RUNDE FULLFØRT' : 'INGEN SAK OPPRETTET'}</span></div>
          <div className="messages" ref={conversation} role="log" aria-live="polite" aria-label="Samtale">
            <div className="intro-note">Dette er et spill. Bruk bare oppdiktede skader og personer — ingenting sendes som en virkelig skademelding.</div>
            {history.length === 0 && <div className="opening"><span className="opening-icon">✳</span><h3>Bjarne venter på en grunn til å sukke.</h3><p>Fortell om en åpenbart oppdiktet skade. For eksempel: «En drage tok med seg garasjen min.»</p></div>}
            {history.map((turn, index) => <div key={index} className={`turn ${turn.role}`}><div className="turn-name">{turn.role === 'user' ? 'DU' : 'BJARNE'}</div><div className="bubble">{turn.content}</div></div>)}
            {quest.isPending && <div className="turn assistant"><div className="turn-name">BJARNE</div><div className="bubble thinking"><Loader size="xs" color="orange" /> Sukk. Bjarne finner et nytt skjema …</div></div>}
          </div>
          <div className="composer">
            {speechError && <Alert color="orange" title="Mikrofonen svarte ikke" mb="sm">{speechError}</Alert>}
            {quest.isError && <Alert color="red" title="Samtalen stoppet" mb="sm">{quest.error.message}</Alert>}
            {completed ? <div className="finished"><p>Runden er over. Ingen virkelig skademelding er sendt.</p><Button onClick={restart} color="orange">Start en ny, oppdiktet runde ↗</Button></div> : <>
              <Textarea aria-label="Din oppdiktede skademelding" placeholder="Beskriv en oppdiktet skade her …" value={draft} onChange={event => setDraft(event.currentTarget.value)} minRows={2} maxLength={2000} disabled={quest.isPending || listening} onKeyDown={event => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); submit(); } }} />
              <Group justify="space-between" mt="sm" gap="xs"><span className="hint">{supported ? 'Snakk fritt · sendes etter 3 sekunder stillhet · eller trykk stopp' : 'Talegjenkjenning mangler her · skriv i feltet'}</span><Group gap="xs">{supported && <Button variant="light" color="orange" onClick={listen} disabled={quest.isPending || stopping} aria-label={listening ? 'Stopp mikrofonen' : 'Trykk for å snakke'}>{stopping ? 'Avslutter opptak …' : listening ? '■ Stopp lytting' : '◉ Trykk for å snakke'}</Button>}<Button color="orange" onClick={() => submit()} disabled={!draft.trim() || quest.isPending || listening} loading={quest.isPending}>Send til Bjarne →</Button></Group></Group>
            </>}
          </div>
        </div>
      </section>
      <footer>SKADEQUEST · OPPDIKTET FRA FØRSTE TIL SISTE SUKK</footer>
    </main>
  );
}
