// Tariff scenario with price shock

import { makeOPSDTariffs } from "./opsd.js";

export type ScenarioType = "default" | "opsd";

export function makeTariffs(scenario: ScenarioType = "default"): number[] {
  if (scenario === "opsd") {
    return makeOPSDTariffs();
  }
  return makeDefaultTariffs();
}

/** Original hardcoded tariff scenario */
function makeDefaultTariffs(): number[] {
  const tariffs: number[] = [];
  for (let i = 0; i < 96; i++) {  // 24 hours = 96 steps
    // Base tariff structure
    let t = 0.18; // normal rate

    // Night rate (cheap)
    if (i <= 16 || i >= 88) {  // 00:00-04:00 and 22:00-24:00
      t = 0.12;
    }
    // Early morning cheap
    else if (i <= 32) {  // 04:00-08:00
      t = 0.14;
    }
    // Evening peak (7pm-9pm approx, steps 68-84 = 17:00-21:00)
    else if (i >= 68 && i <= 84) {
      t = 0.42;
    }

    // SHOCK: sudden price spike at steps 72-75 (18:00-18:45, evening peak)
    if (i >= 72 && i <= 75) {
      t = 0.75;
    }

    tariffs.push(t);
  }
  return tariffs;
}
