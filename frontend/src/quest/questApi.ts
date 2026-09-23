export type Turn = { role: 'user' | 'assistant'; content: string };
export type QuestResponse = { reply: string; stage: number; completed: boolean };

export async function sendQuest(message: string, history: Turn[], stage: number): Promise<QuestResponse> {
  let response: Response;
  try {
    response = await fetch('/api/quest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history, stage }),
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
