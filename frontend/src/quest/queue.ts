export const QUEUE_START = 21;
export const QUEUE_SECONDS_PER_PERSON = 5;

export function peopleAhead(elapsedSeconds: number): number {
  return Math.max(0, QUEUE_START - Math.floor(Math.max(0, elapsedSeconds) / QUEUE_SECONDS_PER_PERSON));
}
