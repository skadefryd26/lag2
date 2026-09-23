import assert from 'node:assert/strict';
import { test } from 'node:test';
import { chromium } from 'playwright-core';

test('fiktiv kø konsulterer ved tre og setter over til Mira ved null', async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    const page = await browser.newPage();
    await page.clock.install();
    const phases = [];
    await page.addInitScript(() => {
      Object.defineProperty(window, 'speechSynthesis', { value: {
        cancel() {}, getVoices() { return []; },
        speak(utterance) { setTimeout(() => { utterance.onstart?.(); utterance.onend?.(); }, 1); },
      } });
    });
    await page.route('**/api/quest/handoff', async route => {
      const { phase } = route.request().postDataJSON();
      phases.push(phase);
      await route.fulfill({ json: { turns: phase === 'consult'
        ? [{ speaker: 'bjarne', reply: 'Jeg må høre med en kollega.' }]
        : [{ speaker: 'bjarne', reply: 'Mira tar over.' }, { speaker: 'kollega', reply: 'Hei, jeg er Mira. Ingen sak er opprettet.' }],
      completed: phase === 'transfer' } });
    });
    await page.route('**/api/quest', route => route.fulfill({ json: { reply: 'Hva skjedde med garasjen?', stage: 1, completed: false } }));
    await page.goto('http://127.0.0.1:5173/');
    await page.getByLabel('Din oppdiktede skademelding').fill('En drage tok garasjen min.');
    await page.getByRole('button', { name: 'Send til Bjarne' }).click();
    await page.getByText('Hva skjedde med garasjen?').first().waitFor();
    await page.clock.fastForward(90_000);
    await page.getByText('Jeg må høre med en kollega.').first().waitFor();
    await page.clock.fastForward(15_000);
    await page.getByRole('heading', { name: 'Mira' }).waitFor();
    assert.deepEqual(phases, ['consult', 'transfer']);
    assert.equal(await page.getByText('RUNDE FULLFØRT').isVisible(), true);
    await page.getByRole('button', { name: /Start en ny/ }).click();
    assert.equal(await page.locator('.agent-intro h2').innerText().then(text => text.startsWith('Bjarne')), true);
    await page.waitForFunction(() => document.querySelector('.queue-metric strong')?.textContent === '21');
  } finally {
    await browser.close();
  }
});
