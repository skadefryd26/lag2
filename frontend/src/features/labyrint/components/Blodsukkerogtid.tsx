import { useEffect, useState } from "react";
import { Card, Group, Text, Progress, Stack } from "@mantine/core";
import { beregnBlodsukker, beregnNedtaelling, erBlodsukkertKritisktLavt } from "../utils/blodsukker";

interface BlodsukkerogtidProps {
  møtetid: string;
}

export function Blodsukkerogtid({ møtetid }: BlodsukkerogtidProps) {
  const [time, setTime] = useState(new Date().getHours());
  const [minut, setMinut] = useState(new Date().getMinutes());
  const [blodsukker, setBlodsukker] = useState(() =>
    beregnBlodsukker(new Date().getHours(), new Date().getMinutes())
  );
  const [nedtaelling, setNedtaelling] = useState(() =>
    beregnNedtaelling(møtetid, new Date().getHours(), new Date().getMinutes())
  );

  // Opdater tiden og værdierne hvert sekund
  useEffect(() => {
    const interval = setInterval(() => {
      const nu = new Date();
      const h = nu.getHours();
      const m = nu.getMinutes();

      setTime(h);
      setMinut(m);
      setBlodsukker(beregnBlodsukker(h, m));
      setNedtaelling(beregnNedtaelling(møtetid, h, m));
    }, 1000);

    return () => clearInterval(interval);
  }, [møtetid]);

  const kritisktLavt = erBlodsukkertKritisktLavt(blodsukker);
  const farve = kritisktLavt ? "red" : blodsukker < 70 ? "yellow" : "green";
  const timeStr = String(time).padStart(2, "0");
  const minutStr = String(minut).padStart(2, "0");

  return (
    <Card
      withBorder
      padding="md"
      bg={kritisktLavt ? "rgba(255, 0, 0, 0.05)" : undefined}
    >
      <Stack gap="md">
        <Group justify="space-between">
          <div>
            <Text fw={600} size="sm" c="dimmed">
              🩸 Blodsukkerniveau
            </Text>
            <Text fw={700} size="xl">
              {Math.round(blodsukker)}/100
            </Text>
            {kritisktLavt && (
              <Text size="sm" c="red" fw={500}>
                ⚠️ Lavt! Kaffe anbefales kraftigt
              </Text>
            )}
          </div>
          <div style={{ textAlign: "right" }}>
            <Text fw={600} size="sm" c="dimmed">
              ⏱️ Tid til møte
            </Text>
            <Text fw={700} size="xl">
              {nedtaelling} min
            </Text>
            <Text size="sm" c="dimmed">
              (møte kl. {møtetid})
            </Text>
          </div>
        </Group>

        <div>
          <Text size="sm" c="dimmed" mb={4}>
            Nuværende tid: {timeStr}:{minutStr}
          </Text>
          <Progress
            value={(blodsukker / 100) * 100}
            color={farve}
            size="lg"
            radius="md"
            striped={kritisktLavt}
            animated={kritisktLavt}
          />
        </div>
      </Stack>
    </Card>
  );
}
