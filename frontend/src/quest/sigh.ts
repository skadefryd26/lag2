/// <reference types="vite/client" />

const SIGH_WORD = /[*(]?\bsu+k+\b[.!…,:]*[*)]?[.!…,:]*\s*/gi;

export const withoutSigh = (text: string) => text.replace(SIGH_WORD, '').trim();

const clips = (files: Record<string, string>) => Object.values(files);
const SOUNDS = {
  sukk: clips(import.meta.glob('./sounds/sukk/*.mp3', { eager: true, query: '?url', import: 'default' })),
  hm: clips(import.meta.glob('./sounds/hm/*.mp3', { eager: true, query: '?url', import: 'default' })),
  gisp: clips(import.meta.glob('./sounds/gisp/*.mp3', { eager: true, query: '?url', import: 'default' })),
};

let last = '';
function pick(urls: string[]) {
  const choices = urls.length > 1 ? urls.filter(url => url !== last) : urls;
  last = choices[Math.floor(Math.random() * choices.length)];
  return last;
}

// ponytail: 1 av 4 er et irritert «hm»; juster her om Bjarne blir for grynten.
export function playReaction(caught = false): Promise<void> {
  const url = pick(caught ? SOUNDS.gisp : Math.random() < 0.25 ? SOUNDS.hm : SOUNDS.sukk);
  const audio = new Audio(url);
  audio.volume = 0.8;
  return new Promise(resolve => {
    const done = () => resolve();
    audio.onended = done;
    audio.onerror = done;
    setTimeout(done, 4000);
    audio.play().catch(done);
  });
}
