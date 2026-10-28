import { useMutation, useQuery } from "@tanstack/react-query";
import type { Labyrint, Stopp } from "../types";

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

export function useStegKommentar() {
  return useMutation({
    mutationFn: (args: { moteId: string; blodsukker: number; sti: Stopp[]; fremme: boolean }) =>
      hentJson<{ kommentar: string }>("/api/bjarne/kommentar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(args),
      }),
  });
}
