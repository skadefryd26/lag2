import { useQuery } from "@tanstack/react-query";

export type Booking = { fra: string; til: string; tittel: string };

export type Lokale = {
  id: string;
  navn: string;
  kontor: string;
  etasje: string;
  bokinger: Booking[];
  ledig: boolean;
};

async function hentLokaler(fra: string, til: string): Promise<Lokale[]> {
  const res = await fetch(`/api/lokaler?fra=${encodeURIComponent(fra)}&til=${encodeURIComponent(til)}`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { feil?: string }).feil ?? `Feil ${res.status}`);
  return data as Lokale[];
}

export function useLokaler(fra: string, til: string) {
  return useQuery({ queryKey: ["lokaler", fra, til], queryFn: () => hentLokaler(fra, til) });
}
