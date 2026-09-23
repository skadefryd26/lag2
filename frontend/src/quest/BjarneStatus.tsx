export function newQueueNumber(previous?: number): number {
  // A fictional demo number, never linked to a real queue.
  const number = Math.floor(Math.random() * 899) + 100;
  return number === previous ? (number === 999 ? 100 : number + 1) : number;
}

export function BjarneStatus({ completed, stage, queueNumber }: {
  completed: boolean;
  stage: number;
  queueNumber: number;
}) {
  // Samtalefasene følger backend/src/bjarne.ts. Dette beskriver rollen Bjarne spiller,
  // ikke en sanntidsanalyse av stemmen hans eller kundens følelser.
  const personality = completed ? 'Avslørt AI, faktisk hjelpsom'
    : stage >= 2 ? 'Ivrig på uviktige detaljer'
    : stage === 1 ? 'Skråsikker på omveier'
    : 'Saklig og presis';

  return <div className="bjarne-status" aria-live="polite" aria-label="Fiktiv status for Bjarne og køen">
    <div className="scene-widget personality-widget">
      <span>PERSONLIGHET NÅ</span>
      <strong>{personality}</strong>
      <small>Alltid kaffetørst</small>
    </div>
    <div className="scene-widget queue-widget">
      <span>DITT KØNUMMER</span>
      <strong>#{queueNumber}</strong>
      <small>Helt fiktivt, selvsagt</small>
    </div>
  </div>;
}
