import { useEffect, useRef, useState } from 'react';
import { Alert, Button, Textarea } from '@mantine/core';
import { useMutation } from '@tanstack/react-query';
import { sendQuest, type Turn } from './questApi';
import { playReaction, withoutSigh } from './sigh';
import { Waveform, useMicrophoneLevel } from './VoiceDisplay';
import { BjarneStatus, newQueueNumber } from './BjarneStatus';

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

async function say(text: string, caught: boolean, onStart: () => void, onEnd: () => void) {
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  onStart();
  await playReaction(caught);
  if (!('speechSynthesis' in window)) return onEnd();
  const utterance = new SpeechSynthesisUtterance(withoutSigh(text));
  utterance.lang = 'nb-NO';
  utterance.rate = 0.96;
  const norwegian = window.speechSynthesis.getVoices().find(voice => voice.lang.toLowerCase().startsWith('nb'));
  if (norwegian) utterance.voice = norwegian;
  utterance.onstart = onStart;
  utterance.onend = onEnd;
  utterance.onerror = onEnd;
  window.speechSynthesis.speak(utterance);
}

export function QuestScreen() {
  const [history, setHistory] = useState<Turn[]>([]);
  const [stage, setStage] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [draft, setDraft] = useState('');
  const [listening, setListening] = useState(false);
  const [stopping, setStopping] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [speechError, setSpeechError] = useState('');
  const [queueNumber, setQueueNumber] = useState(newQueueNumber);
  const recognition = useRef<Recognition | null>(null);
  const silenceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const finishRecording = useRef<(() => void) | null>(null);
  const conversation = useRef<HTMLDivElement>(null);
  const { level, elapsed } = useMicrophoneLevel(listening);
  const coffee = Math.max(12, 86 - history.length * 9);
  const supported = typeof window !== 'undefined' && !!getRecognition();
  const quest = useMutation({
    mutationFn: (message: string) => sendQuest(message, history, stage),
    onSuccess: (result, message) => {
      setHistory(previous => [...previous, { role: 'user', content: message }, { role: 'assistant', content: result.reply }]);
      setStage(result.stage);
      setCompleted(result.completed);
      setDraft('');
      say(result.reply, result.completed, () => setSpeaking(true), () => setSpeaking(false));
    },
  });
  const phase = listening ? 'recording' : speaking ? 'speaking' : quest.isPending ? 'thinking' : 'idle';

  useEffect(() => {
    conversation.current?.scrollTo({ top: conversation.current.scrollHeight, behavior: 'smooth' });
  }, [history, quest.isPending]);
  useEffect(() => () => {
    if (silenceTimer.current) clearTimeout(silenceTimer.current);
    finishRecording.current = null;
    const session = recognition.current;
    recognition.current = null;
    session?.stop();
    setSpeaking(false);
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
    setSpeaking(false);
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    quest.reset();
    setHistory([]);
    setStage(0);
    setCompleted(false);
    setDraft('');
    setSpeechError('');
    setQueueNumber(previous => newQueueNumber(previous));
  }

  return (
    <main className="page">
      <header className="masthead">
        <div className="brand"><img src="https://cdn.gjensidige.no/builders/builders-platform/assets/favicons/gjensidige/android-chrome-192x192.png" alt="" className="gjensidige-mark" /><span>Gjensidige</span><span className="brand-divider" /><span className="project-name">Skadequest</span></div>
        <nav className="header-nav" aria-label="Navigasjon"><span>En helt fiktiv skadetelefon</span></nav>
        <span className="demo-pill"><span className="online-dot" /> DEMOMODUS</span>
      </header>
      <div className="content">
        <section className="hero">
          <div className="eyebrow"><span className="eyebrow-line" /> SKADEQUEST</div>
          <h1>Møt Bjarne: <span>verdens beste ventemusikk</span></h1>
          <p>Møt Bjarne, digital køavlaster og deltids skadebehandler. Mens de ekte skadebehandlerne jobber med faktiske saker, holder Bjarne deg selskap med relevante spørsmål, kreative oppfølgingsoppgaver og akkurat nok omveier til å kjøpe kollegaene litt ekstra arbeidsro.</p>
        </section>
        <section className="metrics" aria-label="Fiktive nøkkeltall">
          <div className="metric"><span className="metric-icon">☕</span><div><small>Kaffenivå</small><strong>{coffee}%</strong></div><span className="metric-note">KRITISK VIKTIG</span><div className="metric-meter"><i style={{ width: `${coffee}%` }} /></div></div>
          <div className="metric"><span className="metric-icon">↗</span><div><small>Kollegaer reddet fra telefonkø</small><strong>{Math.floor(history.length / 2) + 3}</strong></div><span className="metric-note">I DAG, VISSTNOK</span></div>
          <div className="metric"><span className="metric-icon">▤</span><div><small>Skjemaer utsatt</small><strong>{Math.floor(history.length / 2) + 12}</strong></div><span className="metric-note">EFFEKTIVISERING</span></div>
          <div className="metric"><span className="metric-icon">◎</span><div><small>Risiko for faktisk arbeid</small><strong>{history.length ? '18' : '7'}<span className="metric-percent">%</span></strong></div><span className="metric-note">UNDER KONTROLL</span></div>
        </section>
        <section className="workspace" aria-label="Samtale med Bjarne">
          <div className="call-card">
            <div className="call-head"><span><span className="online-dot" /> SAMTALEN ER ÅPEN</span><span className="round-status">{completed ? 'RUNDE FULLFØRT' : 'INGEN SAK OPPRETTET'}</span></div>
            <div className="call-stage">
            <div className={`bjarne-scene ${phase}`}>
              <div className="scene-grid" aria-hidden="true" /><div className="scene-orbit orbit-one" aria-hidden="true" /><div className="scene-orbit orbit-two" aria-hidden="true" />
              <div className="bjarne-portrait" role="img" aria-label="Illustrasjon av Bjarne med kaffekopp">
                <div className="portrait-head"><span className="portrait-hair" /><span className="portrait-glasses"><i /><i /></span><span className="portrait-nose" /><span className="portrait-mouth" /></div>
                <div className="portrait-body"><span className="portrait-shirt" /><span className="portrait-tie" /></div><span className="portrait-coffee" aria-hidden="true">☕</span>
              </div>
              <BjarneStatus completed={completed} stage={stage} queueNumber={queueNumber} />
              <div className="scene-caption">{speaking ? 'BJARNE HAR ORDET' : quest.isPending ? 'VURDERER Å HJELPE DEG' : listening ? 'HØRER PÅ DEG' : 'PÅ JOBB, MOT SIN VILJE'}</div>
            </div>
            <div className="agent-intro"><span className="eyebrow">DIN DIGITALE SKADEBEHANDLER</span><h2>Bjarne <span className="availability"><span className="online-dot" /> {speaking ? 'Snakker' : listening ? 'Lytter' : quest.isPending ? 'Tenker' : 'Tilgjengelig'}</span></h2></div>
            <div className="agent-bubble"><span className="turn-name">BJARNE SIER</span><p>{history.filter(turn => turn.role === 'assistant').at(-1)?.content ?? '«Sukk. Fortell hva som skjedde, så skal jeg se om vi kan unngå et skjema.»'}</p><Waveform active={speaking} volume={68} label={speaking ? 'Bjarne snakker' : 'Bjarne er stille'} /></div>
            <div className="conversation-card">
              <div className="messages" ref={conversation} role="log" aria-live="polite" aria-label="Samtale">
                {history.length === 0 && <div className="opening"><div className="opening-icon" aria-hidden="true">✳</div><h3>Her begynner historien din.</h3><p>Fortell om en oppdiktet skade. For eksempel: «En drage tok med seg garasjen min.»</p></div>}
                {history.map((turn, index) => <div key={index} className={`turn ${turn.role}`}><div className="turn-name">{turn.role === 'user' ? 'DU' : 'BJARNE'}</div><div className="bubble">{turn.content}</div></div>)}
                {quest.isPending && <div className="turn assistant"><div className="turn-name">BJARNE</div><div className="bubble thinking"><span className="thinking-dots" aria-hidden="true">● ● ●</span> Sukk. Bjarne finner et nytt skjema …</div></div>}
              </div>
            </div>
            <div className="customer-mic">
              <div className="eyebrow">DIN TUR TIL Å SNAKKE</div>
              <div className="voice-controls">
                {supported && !completed && <button className={`mic-button ${listening ? 'is-recording' : ''}`} type="button" onClick={listen} disabled={quest.isPending || stopping} aria-label={listening ? 'Stopp mikrofonen' : 'Trykk for å snakke'} aria-pressed={listening}><span className="mic-ring" /><span className="mic-icon" aria-hidden="true">{listening ? <span className="stop-icon" /> : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="2" width="6" height="13" rx="3" /><path d="M5 10a7 7 0 0 0 14 0M12 17v5m-4 0h8" /></svg>}</span></button>}
                {listening ? <div className="recording-info" role="status"><span className="rec-line"><span className="rec-dot" /> REC <span className="rec-time">{String(Math.floor(elapsed / 60)).padStart(2, '0')}:{String(elapsed % 60).padStart(2, '0')}</span></span><span className="control-help">{stopping ? 'Avslutter opptak …' : '3 sekunder stillhet sender · trykk for å stoppe'}</span></div> : <div className="control-info"><strong>{supported ? 'Trykk og fortell' : 'Skriv til Bjarne'}</strong><span className="control-help">{supported ? 'Replikken sendes etter 3 sekunder stillhet' : 'Mikrofon støttes ikke i denne nettleseren'}</span></div>}
              </div>
              <Waveform active={listening} volume={level} label={listening ? 'Mikrofonen registrerer lyd' : 'Mikrofonen er av'} />
            </div>
            </div>
            <div className="composer">
              {speechError && <Alert color="red" title="Mikrofonen svarte ikke" mb="sm">{speechError}</Alert>}
              {quest.isError && <Alert color="red" title="Samtalen stoppet" mb="sm">{quest.error.message}</Alert>}
              {completed ? <div className="finished"><p>Runden er over. Ingen virkelig skademelding er sendt.</p><Button onClick={restart}>Start en ny, oppdiktet runde ↗</Button></div> : <>
                <label className="input-label" htmlFor="quest-draft">FORETREKKER DU Å SKRIVE?</label>
                <div className="input-row"><Textarea id="quest-draft" aria-label="Din oppdiktede skademelding" placeholder="Beskriv en oppdiktet skade her …" value={draft} onChange={event => setDraft(event.currentTarget.value)} minRows={2} maxLength={2000} disabled={quest.isPending || listening} onKeyDown={event => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); submit(); } }} /><Button onClick={() => submit()} disabled={!draft.trim() || quest.isPending || listening} loading={quest.isPending} aria-label="Send til Bjarne">Send ↗</Button></div>
                <span className="hint">{listening ? 'Vi lytter. Du kan stoppe opptaket med mikrofonknappen.' : 'Enter for å sende · Shift + Enter for ny linje'}</span>
              </>}
            </div>
          </div>
        </section>
        <div className="intro-note demo-note"><span aria-hidden="true">ⓘ</span> Dette er et spill: Bruk bare oppdiktede skader og personer. Ingen virkelig skademelding sendes.</div>
        <footer><span>✳ Skadequest — helt fiktiv forsikring, helt ekte sukk.</span><span>INGEN VIRKELIGE SAKER OPPRETTES HER</span></footer>
      </div>
    </main>
  );
}
