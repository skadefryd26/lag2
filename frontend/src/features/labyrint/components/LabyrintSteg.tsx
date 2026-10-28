import { useEffect, useState } from "react";
import { Alert, Avatar, Badge, Button, Card, Group, SegmentedControl, Stack, Text, Timeline, Title } from "@mantine/core";
import { Link, useParams, useSearch } from "@tanstack/react-router";
import { useMoter } from "../api/labyrintApi";
import { useLabyrint, useStegKommentar } from "../api/stegApi";
import type { KryssValg, Stopp } from "../types";
import { ikon } from "./ikoner";
import { LabyrintKart } from "./LabyrintKart";
import { LabyrintKart3D } from "./LabyrintKart3D";

const venteReplikker = [
  "*sukk* … Bjarne vurderer valget ditt …",
  "Bjarne rister på hodet. Sakte.",
  "Bjarne noterer noe i en liten svart bok …",
  "Bjarne slurper kaffe demonstrativt …",
];

// Issue #7: labyrinten steg for steg, med en Bjarne-kommentar etter hvert valg.
export function LabyrintSteg() {
  const { moteId } = useParams({ from: "/mote/$moteId/steg" });
  const { blodsukker } = useSearch({ from: "/mote/$moteId/steg" });
  const mote = useMoter().data?.find((m) => m.id === moteId);
  const { data: lab, error } = useLabyrint(moteId);
  const kommentar = useStegKommentar();

  const [kryssId, setKryssId] = useState<string | null>(null);
  const [sti, setSti] = useState<Stopp[]>([]);
  const [besokt, setBesokt] = useState<string[]>([]);
  const [visning, setVisning] = useState<"3d" | "2d">("3d");
  const [vent, setVent] = useState(0);

  useEffect(() => {
    if (lab && kryssId === null) {
      setKryssId(lab.start);
      setBesokt([lab.start]);
    }
  }, [lab, kryssId]);

  useEffect(() => {
    if (!kommentar.isPending) return;
    const t = setInterval(() => setVent((x) => (x + 1) % venteReplikker.length), 1500);
    return () => clearInterval(t);
  }, [kommentar.isPending]);

  if (error) return <Text c="red">{error.message}</Text>;
  if (!lab || !mote || !kryssId) return <Text>Bjarne leter fram kartet …</Text>;

  const fremme = kryssId === "MAL";
  const kryss = fremme ? null : lab.kryss[kryssId];
  const brukt = sti.reduce((s, x) => s + x.minutter, 0);
  const forSent = brukt > mote.minutterIgjen;

  function velg(v: KryssValg) {
    const nySti = [...sti, v.stopp];
    setSti(nySti);
    setBesokt([...besokt, v.til]);
    setKryssId(v.til);
    kommentar.mutate({ moteId, blodsukker, sti: nySti, fremme: v.til === "MAL" });
  }

  function startPaNytt() {
    setSti([]);
    setBesokt([lab!.start]);
    setKryssId(lab!.start);
    kommentar.reset();
  }

  return (
    <Stack>
      <Link to="/mote/$moteId" params={{ moteId }} style={{ color: "#a85f14", textDecoration: "none" }}>← Tilbake til kartet</Link>
      <Title order={3}>🧭 Steg for steg til «{mote.rom}»</Title>
      <Group gap="xs">
        <Badge size="lg" color={forSent ? "red" : "green"}>⏱️ {brukt} av {mote.minutterIgjen} min brukt</Badge>
        <Badge size="lg" variant="light" color={blodsukker < 40 ? "red" : "green"}>🩸 Blodsukker {blodsukker}</Badge>
        <Badge size="lg" variant="light" color="kaffe">📍 Checkpoint {Math.min(besokt.length - 1, lab.antallLag)} av {lab.antallLag}</Badge>
      </Group>

      <SegmentedControl
        value={visning}
        onChange={(v) => setVisning(v as "3d" | "2d")}
        data={[{ label: "🧊 3D", value: "3d" }, { label: "🗺️ Kart", value: "2d" }]}
        style={{ alignSelf: "flex-start" }}
      />
      {visning === "3d" ? (
        <LabyrintKart3D
          lab={lab}
          rom={mote.rom}
          besokt={besokt}
          naa={kryssId}
          lasert={kommentar.isPending}
          onVelg={(tilId) => {
            const v = kryss?.valg.find((x) => x.til === tilId);
            if (v) velg(v);
          }}
        />
      ) : (
      <LabyrintKart
        lab={lab}
        rom={mote.rom}
        besokt={besokt}
        naa={kryssId}
        lasert={kommentar.isPending}
        onVelg={(tilId) => {
          const v = kryss?.valg.find((x) => x.til === tilId);
          if (v) velg(v);
        }}
      />
      )}
      <Text c="dimmed" fz="sm">
        Klikk på et grønt checkpoint, eller velg under. I 3D kan du dra for å snu kontoret og scrolle for å zoome.
      </Text>

      <Card withBorder shadow="lg" padding="lg" style={{ background: "#fffaf3" }}>
        <Group align="flex-start" wrap="nowrap">
          <Avatar size={56} radius="xl" color="kaffe" className={kommentar.isPending ? "bjarne-tenker" : undefined}>
            <Text fz={30}>🧔</Text>
          </Avatar>
          <div style={{ flex: 1 }}>
            <Text fw={700} ff="Fredoka">Bjarne</Text>
            {kommentar.isPending && <Text c="dimmed" fs="italic">{venteReplikker[vent]}</Text>}
            {kommentar.error && <Text c="red">Bjarne svarer ikke: {kommentar.error.message}</Text>}
            {kommentar.data && !kommentar.isPending && (
              <Text className="dukk-opp" key={sti.length}>{kommentar.data.kommentar}</Text>
            )}
            {!kommentar.data && !kommentar.isPending && !kommentar.error && (
              <Text c="dimmed">*sukk* Velg en vei, så skal jeg si hva jeg mener om den.</Text>
            )}
          </div>
        </Group>
      </Card>

      {kryss && (
        <Card withBorder padding="lg" className="dukk-opp" key={kryss.id}>
          <Text fw={600} mb="sm">📍 {kryss.beskrivelse}</Text>
          <Group>
            {kryss.valg.map((v, i) => (
              <Button key={`${v.til}-${i}`} size="md" variant="light" disabled={kommentar.isPending} onClick={() => velg(v)}>
                {ikon[v.stopp.type]} {v.tekst} ({v.stopp.minutter} min)
              </Button>
            ))}
          </Group>
        </Card>
      )}

      {fremme && (
        <Alert color={forSent ? "red" : "green"} title="Du er fremme!" className="dukk-opp">
          Du kom fram til «{mote.rom}» etter {brukt} minutter{forSent ? `, ${brukt - mote.minutterIgjen} min for sent` : ", i tide"}.
          <Button mt="sm" variant="white" onClick={startPaNytt}>Gå labyrinten på nytt</Button>
        </Alert>
      )}

      {sti.length > 0 && (
        <Card withBorder padding="md">
          <Text fw={600} mb="xs">Veien din så langt</Text>
          <Timeline active={sti.length} bulletSize={26}>
            {sti.map((s, i) => (
              <Timeline.Item key={i} bullet={<span>{ikon[s.type]}</span>} title={s.navn}>
                <Text c="dimmed" fz="sm">{s.minutter} min</Text>
              </Timeline.Item>
            ))}
          </Timeline>
        </Card>
      )}
    </Stack>
  );
}
