import { Alert, Stack, Text } from "@mantine/core";

interface BlodsukkertipsProps {
  blodsukker: number;
}

/**
 * Viser tips fra Bjarne når blodsukkeret er lavt
 */
export function Blodsukkertips({ blodsukker }: BlodsukkertipsProps) {
  if (blodsukker >= 50) return null; // Intet tip hvis blodsukkeret er okay

  const tips = getTips(blodsukker);

  return (
    <Alert
      icon="💭"
      title="Bjarne siger:"
      color={blodsukker < 30 ? "red" : "yellow"}
      variant="light"
    >
      <Stack gap="xs">
        <Text size="sm">{tips.tekst}</Text>
        <Text size="xs" c="dimmed" style={{ fontStyle: "italic" }}>
          {tips.undertext}
        </Text>
      </Stack>
    </Alert>
  );
}

function getTips(
  blodsukker: number
): { tekst: string; undertext: string } {
  if (blodsukker < 30) {
    const tips_kritisk = [
      {
        tekst: "*sukk* Blodsukkeret er kritisk lavt. Du skal have kaffe MED det samme. Ikke frukt, ikke vand — KAFFE.",
        undertext:
          "Kaffe giver hurtigt peak. Hvis du ikke finder kaffe inden møtet, er det på dig.",
      },
      {
        tekst: "Blodsukkeret dit er så lavt at jeg begynder at bekymre mig. Og jeg bekymrer mig aldrig. Find kaffe. Nu.",
        undertext:
          "En god kaffeautomat giver dig 5 points. En dårlig kaffeautomat giver dig -10, men du overlever.",
      },
      {
        tekst: "*sukk* Du skal ikke gå til møtet. Du skal gå til kaffemaskinen. Jeg venter.",
        undertext:
          "Jeg anbefaler den med den grønne lampe. Den er altid på tur, men den laver den bedste kaffe.",
      },
    ];
    return tips_kritisk[Math.floor(Math.random() * tips_kritisk.length)];
  }

  if (blodsukker < 50) {
    const tips_lavt = [
      {
        tekst: "Blodsukkeret begynder at blive købet. En kaffe ville være en god idé. Eller frukt, hvis du må være sådan.",
        undertext:
          "Kaffe giver mig ro. Frukt giver dig længerevarende energi. Jeg anbefaler kaffe.",
      },
      {
        tekst: "*sukk* Du burde have drunket kaffe for 10 minutter siden. Men det er ikke for sent endnu.",
        undertext: "En kaffeautomat på vej til møtet ville være idéelt.",
      },
      {
        tekst: "Dine energier falder. Og jeg kan ikke hjælpe dig hvis du besvimer. Så find noget at drikke.",
        undertext:
          "Kaffe eller frukt. Jeg er ikke kræsen når det handler om at holde dig vågen.",
      },
    ];
    return tips_lavt[Math.floor(Math.random() * tips_lavt.length)];
  }

  return {
    tekst: "Alles vel.",
    undertext: "",
  };
}
