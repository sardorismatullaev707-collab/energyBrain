// Tariff scenario with price shock

export function makeTariffs(): number[] {
  const tariffs: number[] = [];
  for (let i = 0; i < 48; i++) {
    // Base tariff structure
    let t = 0.18; // normal rate

    // Early morning cheap
    if (i <= 8) {
      t = 0.14;
    }
    
    // Evening peak (7pm-9pm approx, steps 28-36)
    if (i >= 28 && i <= 36) {
      t = 0.42;
    }

    // SHOCK: sudden price spike at steps 30-31 (tariff crisis)
    if (i === 30 || i === 31) {
      t = 0.75;
    }

    tariffs.push(t);
  }
  return tariffs;
}
