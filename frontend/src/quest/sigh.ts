const SIGH_WORD = /[*(]?\bsu+k+\b[.!…,:]*[*)]?[.!…,:]*\s*/gi;

export const withoutSigh = (text: string) => text.replace(SIGH_WORD, '').trim();

type Sigh = { text: string; pitch: number; rate: number; volume: number };

// Lavt, sakte og dempet = Bjarne lener seg bort fra mikrofonen.
export const SIGHS: Sigh[] = [
  { text: 'Hhhååå…', pitch: 0.6, rate: 0.5, volume: 0.55 },
  { text: 'Mmmhhh…', pitch: 0.55, rate: 0.5, volume: 0.5 },
  { text: 'Å, nei da…', pitch: 0.7, rate: 0.6, volume: 0.6 },
  { text: 'Pfff.', pitch: 0.9, rate: 0.8, volume: 0.75 },
  { text: 'Hmpf.', pitch: 0.8, rate: 0.8, volume: 0.7 },
  { text: 'Æsj.', pitch: 0.85, rate: 0.75, volume: 0.7 },
  { text: 'Uff…', pitch: 0.65, rate: 0.55, volume: 0.6 },
  { text: 'Ææææh…', pitch: 0.55, rate: 0.45, volume: 0.55 },
  { text: 'Uff da, altså…', pitch: 0.65, rate: 0.6, volume: 0.6 },
];

const jitter = (value: number) => value * (0.9 + Math.random() * 0.2);
let last = -1;

export function sighUtterance(voice?: SpeechSynthesisVoice) {
  let i = Math.floor(Math.random() * SIGHS.length);
  if (i === last) i = (i + 1) % SIGHS.length;
  last = i;
  const sigh = SIGHS[i];
  const utterance = new SpeechSynthesisUtterance(sigh.text);
  utterance.lang = 'nb-NO';
  if (voice) utterance.voice = voice;
  utterance.pitch = jitter(sigh.pitch);
  utterance.rate = jitter(sigh.rate);
  utterance.volume = Math.min(1, jitter(sigh.volume));
  return utterance;
}
