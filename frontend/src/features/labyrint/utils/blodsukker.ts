/**
 * Beregner blodsukkeret baseret på tidspunktet på dagen.
 * - Morgen (8-13): højt (85)
 * - 13:00: dykker til omkring 45
 * - Stiger langsomt igen mod slutningen af dagen
 */
export function beregnBlodsukker(time: number, minut: number): number {
  if (time < 8 || time >= 16) return 50; // Uden for arbejdstid

  // Før 13:00: højt
  if (time < 13) {
    return 85;
  }

  // Klokken 13: dykker
  if (time === 13) {
    // Første time efter 13:00 falder det langsomt fra 85 til 45
    const faktor = minut / 60; // 0 til 1
    return 85 - faktor * 40; // 85 til 45
  }

  // Efter 13:00: langsomt op igen
  const minutterEfter13 = (time - 13) * 60 + minut;
  return 45 + Math.min(minutterEfter13 / 120, 25); // Stiger over 2 timer
}

/**
 * Beregner nedtællingen til møtetidspunktet i minutter
 */
export function beregnNedtaelling(
  møtetidStr: string,
  nuværendeTime: number,
  nuværendeMinut: number
): number {
  const [møteTime, møteMinut] = møtetidStr.split(":").map(Number);
  const møteTotalMinutter = møteTime * 60 + møteMinut;
  const nuTotalMinutter = nuværendeTime * 60 + nuværendeMinut;
  return Math.max(0, møteTotalMinutter - nuTotalMinutter);
}

/**
 * Afgør om blodsukkeret er kritisk lavt (skal få kaffe)
 */
export function erBlodsukkertKritisktLavt(blodsukker: number): boolean {
  return blodsukker < 50;
}
