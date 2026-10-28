import { useMutation, useQuery } from "@tanstack/react-query";
import type { Dom, Labyrint, Stopp } from "../types";

export type Dialekt = "ostfold" | "bokmal";

async function hentJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { feil?: string }).feil ?? `Feil ${res.status}`);
  return data as T;
}

export function useLabyrint(moteId: string) {
  return useQuery({
    queryKey: ["labyrint", moteId],
    queryFn: () => hentJson<Labyrint>(`/api/labyrint/${moteId}`),
  });
}

export function useStartRad(moteId: string, blodsukker: number, dialekt: Dialekt) {
  return useQuery({
    queryKey: ["startrad", moteId, dialekt],
    queryFn: () =>
      hentJson<{ kommentar: string }>("/api/bjarne/startrad", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moteId, blodsukker, dialekt }),
      }),
    staleTime: Infinity,
    retry: false,
  });
}

export function useDomLabyrint() {
  return useMutation({
    mutationFn: (args: { moteId: string; sti: Stopp[]; dialekt: Dialekt }) =>
      hentJson<Dom>("/api/bjarne/dom-labyrint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(args),
      }),
  });
}

export function useStegKommentar() {
  return useMutation({
    mutationFn: (args: { moteId: string; blodsukker: number; sti: Stopp[]; fremme: boolean; tilbake: boolean; dialekt: Dialekt }) =>
      hentJson<{ kommentar: string }>("/api/bjarne/kommentar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(args),
      }),
  });
}
