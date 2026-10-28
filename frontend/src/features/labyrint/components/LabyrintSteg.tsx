import { useEffect, useRef, useState } from "react";
import { Alert, Avatar, Badge, Button, Card, Group, Kbd, SegmentedControl, Stack, Text, Timeline, Title } from "@mantine/core";
import { Link, useNavigate, useParams, useSearch } from "@tanstack/react-router";
import { useMoter } from "../api/labyrintApi";
import { type Dialekt, useDomLabyrint, useLabyrint, useStartRad, useStegKommentar } from "../api/stegApi";
import { beregnBlodsukker } from "../utils/blodsukker";
import { Blodsukkerogtid } from "./Blodsukkerogtid";
import { Blodsukkertips } from "./Blodsukkertips";
import { DomKort } from "./DomKort";
import type { KryssValg, Stopp } from "../types";
import { ikon } from "./ikoner";
import { LabyrintKart } from "./LabyrintKart";
import { LabyrintKart3D } from "./LabyrintKart3D";
import { StemmeKontroll } from "./StemmeKontroll";
import { useBjarneStemme } from "../hooks/useBjarneStemme";

const venteReplikker = [
  "*sukk* … Bjarne vurderer valget ditt …",
  "Bjarne rister på hodet. Sakte.",
  "Bjarne noterer noe i en liten svart bok …",
  "Bjarne slurper kaffe demonstrativt …",
];

// Issue #7: labyrinten steg for steg, med en Bjarne-kommentar etter hvert valg.
export function LabyrintSteg() {
  const { moteId } = useParams({ from: "/mote/$moteId/steg" });
  const search = useSearch({ from: "/mote/$moteId/steg" });
  // Blodsukkeret følger klokka (#5), med mindre det er sendt med i adressen
  const [blodsukker] = useState(() =>
    Math.round(search.blodsukker ?? beregnBlodsukker(new Date().getHours(), new Date().getMinutes())),
  );
  const mote = useMoter().data?.find((m) => m.id === moteId);
  const { data: lab, error } = useLabyrint(moteId);
  const [dialekt, setDialekt] = useState<Dialekt>(() => (localStorage.getItem("bjarne-dialekt") === "bokmal" ? "bokmal" : "ostfold"));
  const kommentar = useStegKommentar();
  const startRad = useStartRad(moteId, blodsukker, dialekt);
  const dom = useDomLabyrint();
  const navigate = useNavigate();

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

  // ---- Bjarnes stemme og tastaturstyring (#23) ----
  const stemme = useBjarneStemme();
  const handlinger = useRef<{ valg: KryssValg[]; velg: (v: KryssValg) => void; status: () => string }>({
    valg: [],
    velg: () => {},
    status: () => "",
  });

  useEffect(() => {
    if (startRad.data?.kommentar) {
      stemme.lesOpp(
        `${startRad.data.kommentar} Tips: trykk S for å høre hvor du er og hvilke valg du har, og et tall for å velge vei.`,
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startRad.data]);

  useEffect(() => {
    if (kommentar.data?.kommentar) stemme.lesOpp(kommentar.data.kommentar);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kommentar.data]);

  useEffect(() => {
    if (dom.data) {
      stemme.lesOpp(`Dommen: ${dom.data.poeng} poeng. ${dom.data.dom} Trykk tilbake for å velge et nytt møte.`, { avbryt: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dom.data]);

  useEffect(() => {
    const tast = (e: KeyboardEvent) => {
      const mal = e.target as HTMLElement | null;
      if (mal && (mal.tagName === "INPUT" || mal.tagName === "TEXTAREA" || mal.isContentEditable)) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const h = handlinger.current;
      if (/^[1-9]$/.test(e.key)) {
        const v = h.valg[Number(e.key) - 1];
        if (v) { e.preventDefault(); h.velg(v); }
      } else if (e.key === "s" || e.key === "S") {
        e.preventDefault();
        stemme.lesOpp(h.status(), { huskes: false });
      } else if (e.key === "r" || e.key === "R") {
        e.preventDefault();
        stemme.gjenta();
      } else if (e.key === "m" || e.key === "M") {
        e.preventDefault();
        stemme.settPa(!stemme.pa);
      }
    };
    window.addEventListener("keydown", tast);
    return () => window.removeEventListener("keydown", tast);
  }, [stemme]);

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
    kommentar.mutate({ moteId, blodsukker, sti: nySti, fremme: v.til === "MAL", tilbake: v.retning === "tilbake", dialekt });
    if (v.til === "MAL") dom.mutate({ moteId, sti: nySti, dialekt });
  }

  function startPaNytt() {
    setSti([]);
    setBesokt([lab!.start]);
    setKryssId(lab!.start);
    kommentar.reset();
    dom.reset();
  }

  // Valgene i samme rekkefølge som knappene: videre først, så tilbake
  const valgListe = kryss
    ? [...kryss.valg.filter((v) => v.retning === "fram"), ...kryss.valg.filter((v) => v.retning === "tilbake")]
    : [];
  const nummer = (v: KryssValg) => valgListe.indexOf(v) + 1;

  handlinger.current = {
    valg: kommentar.isPending ? [] : valgListe,
    velg,
    status: () => {
      const tid = `Du har brukt ${brukt} av ${mote.minutterIgjen} minutter. Blodsukkeret er ${blodsukker}.`;
      if (!kryss) return `Du er fremme i ${mote.rom}. ${tid}`;
      const valgTekst = valgListe
        .map((v, i) => `${i + 1}: ${v.retning === "tilbake" ? "tilbake, " : ""}${v.stopp.navn}, ${v.stopp.minutter} minutter`)
        .join(". ");
      return `${kryss.beskrivelse} Checkpoint ${kryss.lag} av ${lab.antallLag}. ${tid} Valgene dine: ${valgTekst}.`;
    },
  };

  return (
    <Stack>
      <Link to="/" style={{ color: "#a85f14", textDecoration: "none" }}>← Tilbake til møtekalenderen</Link>
      <Title order={3}>🧭 Veien til «{mote.rom}»</Title>
      <Text c="dimmed">
        {mote.tittel} · {mote.kontor}, {mote.etasje} · kl. {mote.tid}
      </Text>
      <Blodsukkerogtid møtetid={mote.tid} />
      <Blodsukkertips blodsukker={blodsukker} />
      <Group gap="xs">
        <Badge size="lg" color={forSent ? "red" : "green"}>⏱️ {brukt} av {mote.minutterIgjen} min brukt</Badge>
        <Badge size="lg" variant="light" color={blodsukker < 40 ? "red" : "green"}>🩸 Blodsukker {blodsukker}</Badge>
        <Badge size="lg" variant="light" color="kaffe">📍 Checkpoint {kryss ? kryss.lag : lab.antallLag} av {lab.antallLag}</Badge>
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
          <Avatar size={56} radius="xl" color="kaffe" className={kommentar.isPending || stemme.snakker ? "bjarne-tenker" : undefined}>
            <Text fz={30}>🧔</Text>
          </Avatar>
          <div style={{ flex: 1 }}>
            <Group justify="space-between" mb={4}>
              <Text fw={700} ff="Fredoka">Bjarne{stemme.snakker ? " 🗣️" : ""}</Text>
              <SegmentedControl
                size="xs"
                value={dialekt}
                onChange={(v) => {
                  setDialekt(v as Dialekt);
                  localStorage.setItem("bjarne-dialekt", v);
                }}
                data={[{ label: "Østfoldsk", value: "ostfold" }, { label: "Bokmål", value: "bokmal" }]}
                aria-label="Bjarnes språk"
              />
            </Group>
            <StemmeKontroll
              stottet={stemme.stottet}
              pa={stemme.pa}
              snakker={stemme.snakker}
              sisteTekst={stemme.sisteTekst}
              onPa={stemme.settPa}
              onGjenta={stemme.gjenta}
              onStatus={() => stemme.lesOpp(handlinger.current.status(), { huskes: false })}
            />
            {kommentar.isPending && <Text c="dimmed" fs="italic">{venteReplikker[vent]}</Text>}
            {kommentar.error && <Text c="red">Bjarne svarer ikke: {kommentar.error.message}</Text>}
            {kommentar.data && !kommentar.isPending && (
              <Text className="dukk-opp" key={sti.length}>{kommentar.data.kommentar}</Text>
            )}
            {!kommentar.data && !kommentar.isPending && !kommentar.error && (
              startRad.isPending ? (
                <Text c="dimmed" fs="italic">*sukk* … Bjarne studerer labyrinten for deg …</Text>
              ) : (
                <Text className="dukk-opp">{startRad.data?.kommentar ?? "*sukk* Velg en vei, så skal jeg si hva jeg mener om den."}</Text>
              )
            )}
          </div>
        </Group>
      </Card>

      {kryss && (
        <Card withBorder padding="lg" className="dukk-opp" key={kryss.id}>
          <Text fw={600} mb="sm">📍 {kryss.beskrivelse}</Text>
          <Text fz="sm" c="dimmed" mb={4}>Videre</Text>
          <Group mb="sm">
            {kryss.valg.filter((v) => v.retning === "fram").map((v, i) => (
              <Button key={`${v.til}-${i}`} size="md" variant="light" disabled={kommentar.isPending} onClick={() => velg(v)}
                aria-label={`Valg ${nummer(v)}: ${v.stopp.navn}, ${v.stopp.minutter} minutter`}>
                <Kbd mr={6}>{nummer(v)}</Kbd>{ikon[v.stopp.type]} {v.tekst} ({v.stopp.minutter} min)
              </Button>
            ))}
          </Group>
          {kryss.valg.some((v) => v.retning === "tilbake") && <Text fz="sm" c="dimmed" mb={4}>Tilbake</Text>}
          <Group>
            {kryss.valg.filter((v) => v.retning === "tilbake").map((v, i) => (
              <Button key={`${v.til}-t${i}`} size="sm" variant="subtle" color="gray" disabled={kommentar.isPending} onClick={() => velg(v)}
                aria-label={`Valg ${nummer(v)}: tilbake til ${v.stopp.navn}, ${v.stopp.minutter} minutter`}>
                <Kbd mr={6}>{nummer(v)}</Kbd>↩ {ikon[v.stopp.type]} {v.tekst} ({v.stopp.minutter} min)
              </Button>
            ))}
          </Group>
        </Card>
      )}

      {fremme && (
        <Alert color={forSent ? "red" : "green"} title="Du er fremme!" className="dukk-opp">
          Du kom fram til «{mote.rom}» etter {brukt} minutter{forSent ? `, ${brukt - mote.minutterIgjen} min for sent` : ", i tide"}.
          <Group mt="sm">
            <Button variant="white" onClick={startPaNytt}>Gå labyrinten på nytt</Button>
            <Button color="kaffe" onClick={() => navigate({ to: "/" })}>📅 Velg et nytt møte</Button>
          </Group>
        </Alert>
      )}

      {fremme && (dom.isPending || dom.data || dom.error) && (
        <DomKort laster={dom.isPending} feil={dom.error?.message} dom={dom.data} veiNavn="Din vei gjennom labyrinten" />
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
