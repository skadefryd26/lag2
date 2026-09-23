export type Turn = { role: 'user' | 'assistant'; content: string; speaker?: 'bjarne' | 'kollega' };
export type QuestResponse = { reply: string; stage: number; completed: boolean };
export type HandoffResponse = { turns: { speaker: 'bjarne' | 'kollega'; reply: string }[]; completed: boolean };

export async function sendQuest(message: string, history: Turn[], stage: number): Promise<QuestResponse> {
  let response: Response;
  try {
    response = await fetch('/api/quest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history: history.slice(-20).map(({ role, content }) => ({ role, content })), stage }),
    });
  } catch {
    throw new Error('Jeg får ikke kontakt med Bjarne akkurat nå. Prøv igjen om litt.');
  }

  if (!response.ok) {
    throw new Error(response.status === 503
      ? 'Bjarne er ikke koblet til ennå. Prøv igjen når resten av laget har startet ham.'
      : 'Bjarne mistet tråden. Ingenting ble sendt — prøv igjen.');
  }
  const data: unknown = await response.json();
  if (typeof data !== 'object' || data === null || !('reply' in data) || typeof data.reply !== 'string'
    || !('stage' in data) || typeof data.stage !== 'number'
    || !('completed' in data) || typeof data.completed !== 'boolean') {
    throw new Error('Bjarne ga et svar vi ikke forstod. Prøv igjen.');
  }
  return data as QuestResponse;
}

export async function sendHandoff(phase: 'consult' | 'transfer', history: Turn[]): Promise<HandoffResponse> {
  const response = await fetch('/api/quest/handoff', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phase, history: history.slice(-20).map(({ role, content }) => ({ role, content })) }),
  });
  if (!response.ok) throw new Error('Overføringen stoppet opp. Ingenting er sendt. Prøv igjen.');
  const data: unknown = await response.json();
  if (!data || typeof data !== 'object' || !('completed' in data) || data.completed !== (phase === 'transfer')
    || !('turns' in data) || !Array.isArray(data.turns) || data.turns.length !== (phase === 'consult' ? 1 : 2)
    || data.turns.some((turn, index) => !turn || turn.speaker !== (index === 0 ? 'bjarne' : 'kollega') || typeof turn.reply !== 'string' || !turn.reply.trim())) {
    throw new Error('Overføringen ga et svar vi ikke forstod. Prøv igjen.');
  }
  return data as HandoffResponse;
}
