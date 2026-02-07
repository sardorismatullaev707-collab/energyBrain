// Solar generation scenario with cloud event

export function makeSolarKW(): number[] {
  const solar: number[] = [];
  for (let i = 0; i < 48; i++) {
    // Bell curve centered around midday (step 24 = noon)
    const x = (i - 24) / 8;
    let pv = Math.max(0, 4.0 * Math.exp(-x * x)); // max 4kW at solar noon

    // Cloud event: PV drops around steps 26-28 (afternoon clouds)
    if (i >= 26 && i <= 28) {
      pv *= 0.3;
    }

    solar.push(pv);
  }
  return solar;
}
