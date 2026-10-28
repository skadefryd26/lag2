import { Badge, Card, Group, Loader, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { useNavigate } from "@tanstack/react-router";
import { useMoter } from "../api/labyrintApi";

export function MoteKalender() {
  const { data, isLoading, error } = useMoter();
  const navigate = useNavigate();

  if (isLoading) return <Loader />;
  if (error) return <Text c="red">Kalenderen er borte. Bjarne nekter all skyld. ({error.message})</Text>;

  return (
    <Stack>
      <Title order={3}>📅 Dagens møter – hvilket skal du gå deg bort på vei til?</Title>
      <SimpleGrid cols={{ base: 1, sm: 2 }}>
        {data!.map((m) => (
          <Card
            key={m.id}
            onClick={() => navigate({ to: "/mote/$moteId", params: { moteId: m.id } })}
            shadow="md"
            padding="lg"
            withBorder
            className="dukk-opp"
            style={{ cursor: "pointer" }}
          >
            <Group justify="space-between" mb="xs">
              <Badge size="lg" variant="filled">{m.tid}</Badge>
              <Badge color={m.minutterIgjen <= 5 ? "red" : "orange"} variant="light">
                {m.minutterIgjen} min igjen
              </Badge>
            </Group>
            <Text fw={700} fz="lg">{m.tittel}</Text>
            <Text c="dimmed" fz="sm">
              {m.kontor} · {m.etasje} · rom {m.rom}
            </Text>
          </Card>
        ))}
      </SimpleGrid>
    </Stack>
  );
}
