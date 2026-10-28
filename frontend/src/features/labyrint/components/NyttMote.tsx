import { useState } from "react";
import { Alert, Button, Card, NumberInput, SimpleGrid, Stack, Text, TextInput, Title } from "@mantine/core";
import { useLeggTilMote, type NyttMote as NyttMoteType } from "../api/labyrintApi";

const tomt: NyttMoteType = {
  tittel: "",
  tid: "12:00",
  kontor: "Kontor Fjellvik",
  etasje: "3. etasje",
  rom: "",
  minutterIgjen: 10,
};

export function NyttMote() {
  const [mote, setMote] = useState<NyttMoteType>(tomt);
  const [feil, setFeil] = useState<string | null>(null);
  const leggTil = useLeggTilMote();

  const oppdater = <K extends keyof NyttMoteType>(nokkel: K, verdi: NyttMoteType[K]) => {
    setMote((forrige) => ({ ...forrige, [nokkel]: verdi }));
    setFeil(null);
  };

  const send = () => {
    if (!mote.tittel.trim() || !mote.rom.trim()) {
      setFeil("Bjarne trenger et møte og et rom. Ellers er det bare en følelse.");
      return;
    }
    leggTil.mutate(mote, {
      onSuccess: () => setMote(tomt),
      onError: (e) => setFeil(e.message),
    });
  };

  return (
    <Card withBorder padding="lg" shadow="sm">
      <Stack gap="sm">
        <Title order={3}>📝 Legg til ditt eget møte</Title>
        <Text c="dimmed" fz="sm">
          Bjarne tar ikke ansvar for møter du finner på. Møtet finnes bare så lenge appen kjører, og alt er oppdiktet.
        </Text>

        <SimpleGrid cols={{ base: 1, sm: 2 }}>
          <TextInput
            label="Møtetittel"
            placeholder="F.eks. Statusmøte om kaffen"
            value={mote.tittel}
            onChange={(e) => oppdater("tittel", e.currentTarget.value)}
          />
          <TextInput
            label="Møterom"
            placeholder="F.eks. Naustet"
            value={mote.rom}
            onChange={(e) => oppdater("rom", e.currentTarget.value)}
          />
          <TextInput
            label="Tid"
            placeholder="12:00"
            value={mote.tid}
            onChange={(e) => oppdater("tid", e.currentTarget.value)}
          />
          <NumberInput
            label="Minutter til møtet starter"
            min={0}
            max={120}
            value={mote.minutterIgjen}
            onChange={(verdi) => oppdater("minutterIgjen", Number(verdi) || 0)}
          />
          <TextInput
            label="Kontor"
            value={mote.kontor}
            onChange={(e) => oppdater("kontor", e.currentTarget.value)}
          />
          <TextInput
            label="Etasje"
            value={mote.etasje}
            onChange={(e) => oppdater("etasje", e.currentTarget.value)}
          />
        </SimpleGrid>

        <Button onClick={send} loading={leggTil.isPending} color="kaffe" w="fit-content">
          Legg det til. Bjarne sukker.
        </Button>

        {feil && (
          <Alert color="red" title="Bjarne nekter">
            {feil}
          </Alert>
        )}

        {leggTil.isSuccess && (
          <Alert color="kaffe" title="Møtet er lagt til">
            Det ligger i kalenderen allerede. Bjarne har begynt å klage.
          </Alert>
        )}
      </Stack>
    </Card>
  );
}
