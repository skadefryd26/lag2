import { useEffect, useRef, useState } from 'react';

export function Waveform({ active, volume = 0, label }: { active: boolean; volume?: number; label: string }) {
  return <div className={`waveform ${active ? 'waveform-active' : ''}`} role="img" aria-label={label}>
    {Array.from({ length: 19 }, (_, index) =>
      <span key={index} style={{ '--bar': index, '--level': `${Math.max(12, Math.min(100, volume * (0.5 + (index % 5) / 6)))}%` } as React.CSSProperties} />)}
  </div>;
}

/** Microphone amplitude stays in the browser: no recording or raw audio is stored or sent. */
export function useMicrophoneLevel(listening: boolean) {
  const [level, setLevel] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const stream = useRef<MediaStream | null>(null);
  useEffect(() => {
    if (!listening) { setLevel(0); setElapsed(0); return; }
    const start = Date.now();
    const ticker = window.setInterval(() => setElapsed(Math.floor((Date.now() - start) / 1000)), 250);
    let cancelled = false;
    let frame = 0;
    let context: AudioContext | null = null;
    if (navigator.mediaDevices?.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ audio: true }).then(async media => {
        if (cancelled) { media.getTracks().forEach(track => track.stop()); return; }
        stream.current = media;
        context = new AudioContext();
        const analyser = context.createAnalyser();
        analyser.fftSize = 512;
        context.createMediaStreamSource(media).connect(analyser);
        const values = new Uint8Array(analyser.frequencyBinCount);
        const measure = () => {
          analyser.getByteTimeDomainData(values);
          const energy = Math.sqrt(values.reduce((sum, value) => sum + (value - 128) ** 2, 0) / values.length);
          setLevel(Math.min(100, energy * 8));
          frame = requestAnimationFrame(measure);
        };
        measure();
      }).catch(() => { /* Speech recognition can still work without an amplitude meter. */ });
    }
    return () => {
      cancelled = true;
      window.clearInterval(ticker);
      cancelAnimationFrame(frame);
      stream.current?.getTracks().forEach(track => track.stop());
      stream.current = null;
      void context?.close();
    };
  }, [listening]);
  return { level, elapsed };
}
