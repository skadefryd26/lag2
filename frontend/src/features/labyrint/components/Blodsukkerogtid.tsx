import { useEffect, useState } from "react";
import { Card, Group, Text, Progress, Stack, Box, Slider } from "@mantine/core";
import { beregnBlodsukker, beregnNedtaelling, erBlodsukkertKritisktLavt } from "../utils/blodsukker";

interface BlodsukkerogtidProps {
  møtetid: string;
}

export function Blodsukkerogtid({ møtetid }: BlodsukkerogtidProps) {
  const [time, setTime] = useState(new Date().getHours());
  const [minut, setMinut] = useState(new Date().getMinutes());
  const [blodsukkerAuto, setBlodsukkerAuto] = useState(() =>
    beregnBlodsukker(new Date().getHours(), new Date().getMinutes())
  );
  const [blodsukkerManuel, setBlodsukkerManuel] = useState<number | null>(null);
  const [nedtaelling, setNedtaelling] = useState(() =>
    beregnNedtaelling(møtetid, new Date().getHours(), new Date().getMinutes())
  );

  // Bruk manuel verdi hvis den er satt, ellers auto
  const blodsukker = blodsukkerManuel !== null ? blodsukkerManuel : blodsukkerAuto;

  // Opdater tiden og værdierne hvert sekund
  useEffect(() => {
    const interval = setInterval(() => {
      const nu = new Date();
      const h = nu.getHours();
      const m = nu.getMinutes();

      setTime(h);
      setMinut(m);
      setBlodsukkerAuto(beregnBlodsukker(h, m));
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
          
          {/* Blodsukkerskala med zoner */}
          <Box mb="xs">
            <Group justify="space-between" mb={6}>
              <Text size="xs" c="dimmed">0</Text>
              <Text size="xs" c="dimmed">Lavt</Text>
              <Text size="xs" c="dimmed">Godt</Text>
              <Text size="xs" c="dimmed">100</Text>
            </Group>
            
            {/* Progress bar med gradient-zone-baggrund */}
            <Box style={{ position: "relative", paddingBottom: 24 }}>
              {/* Baggrund zoner */}
              <Box
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 32,
                  background: "linear-gradient(to right, #ff6b6b 0%, #ff6b6b 30%, #ffd43b 30%, #ffd43b 70%, #51cf66 70%, #51cf66 100%)",
                  borderRadius: 6,
                  opacity: 0.15,
                  zIndex: 0,
                }}
              />
              
              {/* Hovedbar med værdi */}
              <Progress
                value={(blodsukker / 100) * 100}
                color={farve}
                size="lg"
                radius="md"
                striped={kritisktLavt}
                animated={kritisktLavt}
                style={{ position: "relative", zIndex: 1 }}
              />
              
              {/* Indikator hvor du er */}
              <Box
                style={{
                  position: "absolute",
                  left: `${(blodsukker / 100) * 100}%`,
                  top: 32 + 6,
                  transform: "translateX(-50%)",
                  zIndex: 2,
                }}
              >
                <Text size="xs" fw={700} c={farve} style={{ whiteSpace: "nowrap" }}>
                  ↑ {Math.round(blodsukker)}
                </Text>
              </Box>
            </Box>
          </Box>

          {/* Manuel blodsukker-slider for testing */}
          <Box mt="md" p="sm" style={{ backgroundColor: "rgba(0,0,0,0.05)", borderRadius: 6 }}>
            <Text size="xs" c="dimmed" mb={6}>
              🎮 Test: Juster blodsukker manuelt
            </Text>
            <Slider
              value={blodsukker}
              onChange={setBlodsukkerManuel}
              min={0}
              max={100}
              step={1}
              marks={[
                { value: 0, label: "0" },
                { value: 30, label: "Kritisk" },
                { value: 50, label: "Lavt" },
                { value: 70, label: "Godt" },
                { value: 100, label: "100" },
              ]}
              label={(value) => `${Math.round(value)}`}
            />
            {blodsukkerManuel !== null && (
              <Text size="xs" c="dimmed" mt={4}>
                💡 Tip: Klik på barren for å gå tilbake til automatisk
              </Text>
            )}
            {blodsukkerManuel !== null && (
              <Text
                size="xs"
                c="blue"
                style={{ cursor: "pointer", textDecoration: "underline" }}
                onClick={() => setBlodsukkerManuel(null)}
                mt={4}
              >
                ↻ Tilbake til automatisk beregning
              </Text>
            )}
          </Box>
        </div>
      </Stack>
    </Card>
  );
}
