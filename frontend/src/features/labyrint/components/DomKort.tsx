import { Alert, Badge, Card, Group, Progress, Stack, Text, Title } from "@mantine/core";
import type { Dom } from "../types";

function malerFarge(verdi: number): string {
  if (verdi >= 70) return "green";
  if (verdi >= 40) return "yellow";
  return "red";
}

function malerTekst(verdi: number): string {
  if (verdi >= 85) return "Lynrask. Bjarne nikker motvillig — du fant nesten fram like bra som han ville gjort.";
  if (verdi >= 60) return "Ganske effektivt. Bjarne hadde klart det raskere, men han sier det ikke høyt. Jo, det gjorde han.";
  if (verdi >= 35) return "Treigt. Bjarne rakk to kaffekopper mens du lette.";
  return "Katastrofalt ineffektivt. Bjarne vurderer å sende deg kart. På papir.";
}

export function DomKort({
  laster,
  feil,
  dom,
  veiNavn,
}: {
  laster: boolean;
  feil?: string;
  dom?: Dom;
  veiNavn: string;
}) {
  return (
    <Card withBorder padding="md" className="dukk-opp" style={{ borderColor: "#c07322", borderWidth: 2 }}>
      <Group justify="space-between" mb="xs">
        <Title order={4}>⚖️ Bjarnes dom over «{veiNavn}»</Title>
        {dom && (
          <Badge size="lg" color={dom.poeng >= 60 ? "green" : dom.poeng > 0 ? "orange" : "red"}>
            {dom.poeng} poeng
          </Badge>
        )}
      </Group>

      {laster && <Text c="dimmed">*sukk* … Bjarne henter kaffe og gjør seg klar til å dømme deg …</Text>}
      {feil && <Alert color="red">Bjarne mistet tråden: {feil}</Alert>}

      {dom && !laster && (
        <Stack gap="sm">
          <Text fs="italic">{dom.dom}</Text>

          <div>
            <Group justify="space-between" mb={4}>
              <Text fw={600}>🏃 Effektivitetsmåler</Text>
              <Text fw={700}>{dom.effektivitet}/100</Text>
            </Group>
            <Progress value={dom.effektivitet} color={malerFarge(dom.effektivitet)} size="xl" radius="xl" />
            <Text size="sm" c="dimmed" mt={4}>
              {malerTekst(dom.effektivitet)}
            </Text>
          </div>

          {dom.detaljer.length > 0 && (
            <Stack gap={2}>
              <Text fw={600} size="sm">
                Poengregnskapet:
              </Text>
              {dom.detaljer.map((d, i) => (
                <Text key={i} size="sm">
                  {d}
                </Text>
              ))}
            </Stack>
          )}
        </Stack>
      )}
    </Card>
  );
}
