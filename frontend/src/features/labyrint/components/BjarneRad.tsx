import { useEffect, useState } from "react";
import { Avatar, Card, Group, Text } from "@mantine/core";
import type { Anbefaling, Vei } from "../types";

const venteReplikker = [
  "*sukk* … Bjarne ser på kartet …",
  "Bjarne tar en slurk kaffe først …",
  "Bjarne lurer på hvorfor du ikke bare spurte resepsjonen …",
  "Bjarne vurderer kaffeautomatene. Strengt.",
];

type Props = { laster: boolean; feil?: string; anbefaling?: Anbefaling; veier: Vei[] };

export function BjarneRad({ laster, feil, anbefaling, veier }: Props) {
  const [i, setI] = useState(0);
  const [vist, setVist] = useState("");

  useEffect(() => {
    if (!laster) return;
    const t = setInterval(() => setI((x) => (x + 1) % venteReplikker.length), 1600);
    return () => clearInterval(t);
  }, [laster]);

  // Skriv svaret ut bokstav for bokstav
  useEffect(() => {
    const tekst = anbefaling?.begrunnelse ?? "";
    setVist("");
    let n = 0;
    const t = setInterval(() => {
      n += 2;
      setVist(tekst.slice(0, n));
      if (n >= tekst.length) clearInterval(t);
    }, 25);
    return () => clearInterval(t);
  }, [anbefaling]);

  const vei = veier.find((v) => v.id === anbefaling?.anbefaltVeiId);

  return (
    <Card withBorder shadow="lg" padding="lg" style={{ background: "#fffaf3" }}>
      <Group align="flex-start" wrap="nowrap">
        <Avatar size={64} radius="xl" color="kaffe" className={laster ? "bjarne-tenker" : undefined}>
          <Text fz={36}>🧔</Text>
        </Avatar>
        <div style={{ flex: 1 }}>
          <Text fw={700} ff="Fredoka">Bjarne, ledestjerne, dommer, medhjelper og bøddel</Text>
          {laster && <Text c="dimmed" fs="italic">{venteReplikker[i]}</Text>}
          {feil && !laster && <Text c="red">Bjarne svarer ikke: {feil}</Text>}
          {anbefaling && !laster && (
            <>
              {vei && <Text fw={600} mt={4}>👉 Ta vei {vei.id.toUpperCase()}: {vei.navn}</Text>}
              <Text mt={4}>{vist}</Text>
              {Object.keys(anbefaling.poeng).length > 0 && (
                <Group gap="xs" mt="sm">
                  {Object.entries(anbefaling.poeng).map(([id, p]) => (
                    <Text key={id} fz="sm" c={p >= 0 ? "green.8" : "red.8"}>
                      Vei {id.toUpperCase()}: {p > 0 ? "+" : ""}{p} poeng
                    </Text>
                  ))}
                </Group>
              )}
            </>
          )}
        </div>
      </Group>
    </Card>
  );
}
