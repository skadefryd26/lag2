import { Button, Group, Kbd, Text, VisuallyHidden } from "@mantine/core";

// Issue #23: lydknapper og tastatursnarveier for Bjarnes stemme
type Props = {
  stottet: boolean;
  pa: boolean;
  snakker: boolean;
  sisteTekst: string;
  onPa: (v: boolean) => void;
  onGjenta: () => void;
  onStatus: () => void;
};

export function StemmeKontroll({ stottet, pa, snakker, sisteTekst, onPa, onGjenta, onStatus }: Props) {
  return (
    <>
      {/* Skjermlesere får med seg hver ny replikk fra Bjarne */}
      <VisuallyHidden aria-live="polite" aria-atomic="true">
        {sisteTekst}
      </VisuallyHidden>
      <Group gap="xs" wrap="wrap">
        {stottet ? (
          <Button
            size="xs"
            variant={pa ? "filled" : "light"}
            color={pa ? "kaffe" : "gray"}
            onClick={() => onPa(!pa)}
            aria-pressed={pa}
            aria-label={pa ? "Skru av Bjarnes stemme" : "Skru på Bjarnes stemme"}
          >
            {pa ? (snakker ? "🔊 Bjarne snakker …" : "🔊 Lyd på") : "🔇 Lyd av"}
          </Button>
        ) : (
          <Text fz="xs" c="dimmed">Nettleseren din kan ikke lese opp tekst.</Text>
        )}
        <Button size="xs" variant="light" onClick={onGjenta} disabled={!sisteTekst} aria-label="Hør Bjarnes siste replikk på nytt">
          🔁 Hør igjen
        </Button>
        <Button size="xs" variant="light" onClick={onStatus} aria-label="Hør hvor du er og hvilke valg du har">
          🧭 Hvor er jeg?
        </Button>
        <Text fz="xs" c="dimmed">
          Tastatur: <Kbd>1</Kbd>–<Kbd>9</Kbd> velg vei · <Kbd>S</Kbd> hvor er jeg · <Kbd>R</Kbd> hør igjen · <Kbd>M</Kbd> lyd av/på
        </Text>
      </Group>
    </>
  );
}
