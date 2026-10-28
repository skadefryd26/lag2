import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Anbefaling, Dom, Mote } from "../types";

async function hentJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { feil?: string }).feil ?? `Feil ${res.status}`);
  return data as T;
}

export function useMoter() {
  return useQuery({ queryKey: ["moter"], queryFn: () => hentJson<Mote[]>("/api/moter") });
}

export type NyttMote = {
  tittel: string;
  tid: string;
  kontor: string;
  etasje: string;
  rom: string;
  minutterIgjen: number;
};

export function useLeggTilMote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (mote: NyttMote) =>
      hentJson<Mote>("/api/moter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mote),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["moter"] }),
  });
}

export function useAnbefaling() {
  return useMutation({
    mutationFn: (args: { moteId: string; blodsukker: number }) =>
      hentJson<Anbefaling>("/api/bjarne/anbefaling", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(args),
      }),
  });
}

export function useDom() {
  return useMutation({
    mutationFn: (args: { moteId: string; veiId: string }) =>
      hentJson<Dom>("/api/bjarne/dom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(args),
      }),
  });
}
