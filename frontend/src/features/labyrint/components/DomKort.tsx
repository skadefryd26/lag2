import { Alert, Badge, Button, Card, Group, Progress, Stack, Text, Title } from "@mantine/core";
import type { Dom } from "../types";

function barometerFarge(verdi: number): string {
  if (verdi >= 70) return "green";
  if (verdi >= 40) return "yellow";
  return "red";
}

function barometerTekst(verdi: number): string {
  if (verdi >= 85) return "Kaffepausen er rettmessig fortjent. Bjarne nikker motvillig.";
  if (verdi >= 60) return "Nesten verdig en kaffe. Bjarne vurderer å dele.";
  if (verdi >= 35) return "Langt unna en kaffe. Bjarne drikker din i stedet.";
  return "Ingen kaffe til deg. Bjarne er skuffet helt inn i bønnene.";
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
          <Badge size="lg" color={dom.poeng >= 0 ? "green" : "red"}>
            {dom.poeng >= 0 ? "+" : ""}
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
              <Text fw={600}>☕ Kaffebarometer</Text>
              <Text fw={700}>{dom.kaffebarometer}/100</Text>
            </Group>
            <Progress value={dom.kaffebarometer} color={barometerFarge(dom.kaffebarometer)} size="xl" radius="xl" />
            <Text size="sm" c="dimmed" mt={4}>
              {barometerTekst(dom.kaffebarometer)}
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
