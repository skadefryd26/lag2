type Status = 'idle' | 'recording' | 'thinking' | 'speaking';

export function newQueueNumber(previous?: number): number {
  // A fictional demo number, never linked to a real queue.
  const number = Math.floor(Math.random() * 899) + 100;
  return number === previous ? (number === 999 ? 100 : number + 1) : number;
}

export function BjarneStatus({ status, completed, stage, queueNumber }: {
  status: Status;
  completed: boolean;
  stage: number;
  queueNumber: number;
}) {
  // Speiler Bjarnes samtalesteg i backend/src/bjarne.ts, ikke en vurdering av kunden.
  const personality = completed ? 'Avslørt AI, fortsatt hjelpsom'
    : stage >= 2 || (stage >= 1 && status === 'thinking') ? status === 'thinking' ? 'Samler uviktige detaljer'
      : status === 'speaking' ? 'Ivrig på avsporinger'
      : 'Skråsikker om omveier'
    : status === 'recording' ? 'Vennlig og lyttende'
    : status === 'thinking' ? 'Saklig og presis'
    : status === 'speaking' ? 'Skråsikkert saklig'
    : 'Saklig og kaffetørst';

  return <div className="bjarne-status" aria-live="polite" aria-label="Fiktiv status for Bjarne og køen">
    <div className="scene-widget personality-widget">
      <span>PERSONLIGHET NÅ</span>
      <strong>{personality}</strong>
    </div>
    <div className="scene-widget queue-widget">
      <span>DITT KØNUMMER</span>
      <strong>#{queueNumber}</strong>
      <small>Helt fiktivt, selvsagt</small>
    </div>
  </div>;
}
