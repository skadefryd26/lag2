import { useEffect, useState } from "react";
import { Alert, Anchor, Badge, Button, Card, Group, Slider, Stack, Text, Title } from "@mantine/core";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { useAnbefaling, useDom, useMoter } from "../api/labyrintApi";
import type { Stopp } from "../types";
import { BjarneRad } from "./BjarneRad";
import { DomKort } from "./DomKort";
import { Blodsukkerogtid } from "./Blodsukkerogtid";
import { Blodsukkertips } from "./Blodsukkertips";
import { beregnBlodsukker } from "../utils/blodsukker";

const ikon: Record<Stopp["type"], string> = {
  trapp: "🪜",
  gang: "🚶",
  heis: "🛗",
  "kaffe-god": "☕",
  "kaffe-darlig": "🤢",
  frukt: "🍌",
  toalett: "🚻",
};

export function KartSide() {
  const { moteId } = useParams({ from: "/mote/$moteId" });
  const { data } = useMoter();
  const mote = data?.find((m) => m.id === moteId);
  const [valgt, setValgt] = useState<string | null>(null);
  const [blodsukker, setBlodsukker] = useState(() =>
    beregnBlodsukker(new Date().getHours(), new Date().getMinutes())
  );
  const anbefaling = useAnbefaling();
  const dom = useDom();
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      const nu = new Date();
      setBlodsukker(beregnBlodsukker(nu.getHours(), nu.getMinutes()));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (mote) anbefaling.mutate({ moteId: mote.id, blodsukker });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mote?.id]);

  if (!mote) return <Text>Leter etter møtet …</Text>;

  const anbefalt = anbefaling.data?.anbefaltVeiId;

  return (
    <Stack>
      <Anchor component={Link} to="/">← Tilbake til kalenderen</Anchor>
      <Title order={3}>🗺️ Veien til «{mote.rom}»</Title>
      <Text c="dimmed">
        {mote.tittel} · {mote.kontor}, {mote.etasje} · kl. {mote.tid}
      </Text>

      <Blodsukkerogtid møtetid={mote.tid} />

      <Blodsukkertips blodsukker={blodsukker} />

      <BjarneRad laster={anbefaling.isPending} feil={anbefaling.error?.message} anbefaling={anbefaling.data} veier={mote.veier} />

      <Button
        size="lg"
        onClick={() => navigate({ to: "/mote/$moteId/steg", params: { moteId: mote.id }, search: { blodsukker } })}
      >
        🧭 Gå steg for steg gjennom labyrinten
      </Button>

      <Stack gap="sm">
        {mote.veier.map((v) => {
          const sum = v.stopp.reduce((s, x) => s + x.minutter, 0);
          const forSent = sum > mote.minutterIgjen;
          const erAnbefalt = v.id === anbefalt;
          return (
            <Card
              key={v.id}
              withBorder
              shadow={valgt === v.id ? "xl" : "xs"}
              padding="md"
              onClick={() => {
                setValgt(v.id);
                dom.reset();
              }}
              style={{
                cursor: "pointer",
                borderWidth: valgt === v.id || erAnbefalt ? 3 : 1,
                borderColor: valgt === v.id ? "#c07322" : erAnbefalt ? "#2f9e44" : undefined,
              }}
            >
              <Group justify="space-between" mb="xs">
                <Text fw={700}>Vei {v.id.toUpperCase()}: {v.navn}</Text>
                <Group gap="xs">
                  {erAnbefalt && <Badge color="green">Bjarnes valg</Badge>}
                  {valgt === v.id && <Badge>Ditt valg</Badge>}
                  <Badge color={forSent ? "red" : "gray"} variant="light">{sum} min</Badge>
                </Group>
              </Group>
              <Group gap={6}>
                {v.stopp.map((s, i) => (
                  <Group key={i} gap={6}>
                    {i > 0 && <Text c="dimmed">→</Text>}
                    <Badge variant="outline" size="lg" tt="none">
                      {ikon[s.type]} {s.navn}
                    </Badge>
                  </Group>
                ))}
              </Group>
            </Card>
          );
        })}
      </Stack>

      {valgt && (
        <Alert color="kaffe" className="dukk-opp">
          {valgt === anbefalt
            ? "Du valgte Bjarnes vei. Han later som han ikke bryr seg, men han er fornøyd."
            : "Du valgte en annen vei enn Bjarne. Han noterer seg det. I en mappe. Med ditt navn."}
        </Alert>
      )}

      {valgt && (
        <Button
          size="md"
          color="kaffe"
          loading={dom.isPending}
          onClick={() =>
            dom.mutate({ moteId: mote.id, veiId: valgt })
          }
        >
          🏁 Jeg kom fram — la Bjarne felle dommen
        </Button>
      )}

      {valgt && (dom.isPending || dom.data || dom.error) && (
        <DomKort
          laster={dom.isPending}
          feil={dom.error?.message}
          dom={dom.data}
          veiNavn={mote.veier.find((v) => v.id === valgt)?.navn ?? ""}
        />
      )}
    </Stack>
  );
}
