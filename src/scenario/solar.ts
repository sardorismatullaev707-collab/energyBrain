// Solar generation scenario with cloud event

import { makeOPSDSolarKW } from "./opsd.js";
import { ScenarioType } from "./tariffs.js";

export function makeSolarKW(scenario: ScenarioType = "default"): number[] {
  if (scenario === "opsd") {
    return makeOPSDSolarKW();
  }
  return makeDefaultSolarKW();
}

/** Original hardcoded solar scenario */
function makeDefaultSolarKW(): number[] {
  const solar: number[] = [];
  for (let i = 0; i < 96; i++) {  // 24 hours = 96 steps
    // Bell curve centered around midday (step 48 = noon in 24h)
    const x = (i - 48) / 16;  // Wider spread for 24h
    let pv = Math.max(0, 4.0 * Math.exp(-x * x)); // max 4kW at solar noon

    // Cloud event: PV drops around steps 52-56 (afternoon clouds ~13:00-14:00)
    if (i >= 52 && i <= 56) {
      pv *= 0.3;
    }

    // Night hours: no solar (00:00-06:00 and 20:00-24:00)
    if (i < 24 || i >= 80) {
      pv = 0;
    }

    solar.push(pv);
  }
  return solar;
}
