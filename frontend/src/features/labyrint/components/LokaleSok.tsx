import { useState } from "react";
import { Alert, Badge, Button, Card, Group, SimpleGrid, Stack, Text, TextInput, Title } from "@mantine/core";
import { useLokaler } from "../api/lokalerApi";
import { useLeggTilMote } from "../api/labyrintApi";

export function LokaleSok() {
  const [sok, setSok] = useState("");
  const [fra, setFra] = useState("10:00");
  const [til, setTil] = useState("11:00");
  const [tittel, setTittel] = useState("");
  const [sistLagtTil, setSistLagtTil] = useState<string | null>(null);
  const { data, isLoading, error } = useLokaler(fra, til);
  const leggTil = useLeggTilMote();

  const treff = (data ?? []).filter((l) =>
    `${l.navn} ${l.kontor} ${l.etasje}`.toLowerCase().includes(sok.trim().toLowerCase()),
  );

  const leggMoteHer = (lokaleId: string, navn: string) => {
    setSistLagtTil(null);
    leggTil.mutate(
      {
        tittel: tittel.trim() || `Møte i ${navn}`,
        tid: fra,
        rom: navn,
        lokaleId,
        kontor: "",
        etasje: "",
        minutterIgjen: 10,
      },
      {
        onSuccess: () => setSistLagtTil(navn),
      },
    );
  };

  return (
    <Card withBorder padding="lg" shadow="sm">
      <Stack gap="sm">
        <Title order={3}>🔎 Finn et ledig lokale</Title>
        <Text c="dimmed" fz="sm">
          Bjarne har oversikt over alle rommene. Han deler den motvillig. Alt er oppdiktet, og bookingen forsvinner når appen starter på nytt.
        </Text>

        <SimpleGrid cols={{ base: 1, sm: 3 }}>
          <TextInput
            label="Søk"
            placeholder="Rom, kontor eller etasje"
            value={sok}
            onChange={(e) => setSok(e.currentTarget.value)}
          />
          <TextInput label="Ledig fra" value={fra} onChange={(e) => setFra(e.currentTarget.value)} />
          <TextInput label="Ledig til" value={til} onChange={(e) => setTil(e.currentTarget.value)} />
        </SimpleGrid>

        <TextInput
          label="Hva skal møtet hete?"
          placeholder="Tomt felt gir «Møte i …». Bjarne synes det er latskap."
          value={tittel}
          onChange={(e) => setTittel(e.currentTarget.value)}
        />

        {isLoading && <Text c="dimmed">Bjarne blar i permene …</Text>}
        {error && <Alert color="red" title="Bjarne nekter">{error.message}</Alert>}

        {treff.map((l) => (
          <Card key={l.id} withBorder padding="md" className="dukk-opp">
            <Group justify="space-between" wrap="nowrap" align="flex-start">
              <div>
                <Text fw={700}>{l.navn}</Text>
                <Text c="dimmed" fz="sm">
                  {l.kontor} · {l.etasje}
                </Text>
                {l.ledig ? (
                  <Text fz="sm" c="green">
                    Ledig {fra}–{til}
                  </Text>
                ) : (
                  <Text fz="sm" c="red">
                    Opptatt: {l.bokinger.map((b) => `${b.tittel} (${b.fra}–${b.til})`).join(", ")}
                  </Text>
                )}
              </div>
              <Stack gap={6} align="flex-end">
                <Badge color={l.ledig ? "green" : "red"} variant="light">
                  {l.ledig ? "Ledig" : "Opptatt"}
                </Badge>
                <Button
                  size="xs"
                  color="kaffe"
                  disabled={!l.ledig}
                  loading={leggTil.isPending && leggTil.variables?.lokaleId === l.id}
                  onClick={() => leggMoteHer(l.id, l.navn)}
                >
                  Legg møtet hit
                </Button>
              </Stack>
            </Group>
          </Card>
        ))}

        {treff.length === 0 && !isLoading && <Text c="dimmed">Ingen lokaler passer. Bjarne foreslår å møtes i gangen.</Text>}

        {sistLagtTil && (
          <Alert color="kaffe" title="Møtet er lagt inn">
            Det ligger i kalenderen med rom {sistLagtTil}. Bjarne har allerede booket om lunsjen.
          </Alert>
        )}
        {leggTil.error && <Alert color="red" title="Bjarne nekter">{leggTil.error.message}</Alert>}
      </Stack>
    </Card>
  );
}
