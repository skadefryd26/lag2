const SIGH_WORD = /[*(]?\bsu+k+\b[.!…,:]*[*)]?[.!…,:]*\s*/gi;

export const withoutSigh = (text: string) => text.replace(SIGH_WORD, '').trim();

let audio: AudioContext | undefined;

// Syntetisert utpust: hvit støy gjennom et synkende båndpassfilter. Ingen lydfil å lisensiere.
export async function playSigh(): Promise<void> {
  try {
    audio ??= new AudioContext();
    await Promise.race([audio.resume(), new Promise(resolve => setTimeout(resolve, 300))]);
    if (audio.state !== 'running') return;

    const seconds = 1.2;
    const buffer = audio.createBuffer(1, audio.sampleRate * seconds, audio.sampleRate);
    const samples = buffer.getChannelData(0);
    for (let i = 0; i < samples.length; i++) samples[i] = Math.random() * 2 - 1;

    const noise = new AudioBufferSourceNode(audio, { buffer });
    const filter = new BiquadFilterNode(audio, { type: 'bandpass', frequency: 900, Q: 1.2 });
    const gain = new GainNode(audio, { gain: 0.0001 });
    const now = audio.currentTime;
    filter.frequency.exponentialRampToValueAtTime(350, now + seconds);
    gain.gain.exponentialRampToValueAtTime(0.4, now + 0.25);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + seconds);

    noise.connect(filter).connect(gain).connect(audio.destination);
    const ended = new Promise(resolve => { noise.onended = resolve; });
    noise.start();
    await ended;
  } catch (error) {
    console.warn('Sukkelyden kunne ikke spilles:', error);
  }
}
