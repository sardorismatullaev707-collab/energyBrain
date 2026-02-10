// Mock telemetry stream - simulates real-time energy system data

import { EnergyState } from "../types.js";
import { ScenarioType } from "../scenario/tariffs.js";
import { makeTariffs } from "../scenario/tariffs.js";
import { makeSolarKW } from "../scenario/solar.js";
import { makeOPSDBaseLoadKW, makeOPSDWindKW } from "../scenario/opsd.js";

export interface TelemetryUpdate {
  tariff?: number;
  solarKW?: number;
  baseLoadKW?: number;
  outdoorTempC?: number;
  windKW?: number;           // wind contribution (OPSD only)
}

/**
 * Creates a mock telemetry stream that yields updates for each 15-min step
 * Simulates realistic energy system conditions including:
 * - Dynamic tariffs with price shocks
 * - Solar generation with weather events
 * - Variable base load (cooking, appliances)
 * - Outdoor temperature variations
 *
 * Supports two scenarios:
 * - "default": Original hardcoded patterns
 * - "opsd": Real EU data from Open Power System Data (Germany 2019-07-15)
 */
export async function* createMockTelemetry(
  seed: number = 42,
  scenario: ScenarioType = "default"
): AsyncGenerator<TelemetryUpdate, void, unknown> {

  if (scenario === "opsd") {
    // Use precomputed real data arrays
    const tariffs = makeTariffs("opsd");
    const solar = makeSolarKW("opsd");
    const baseLoads = makeOPSDBaseLoadKW();
    const wind = makeOPSDWindKW();

    for (let step = 0; step < 96; step++) {  // 24 hours
      const update: TelemetryUpdate = {
        tariff: tariffs[step],
        solarKW: solar[step],
        baseLoadKW: baseLoads[step],
        windKW: wind[step],
        // Summer day in Germany (Berlin ~52°N), July 15 - full 24h cycle
        outdoorTempC: 20 + Math.sin(((step - 32) / 96) * 2 * Math.PI) * 8,  // 12-28°C range
      };
      yield update;
    }
    return;
  }

  // ─── Default scenario (original hardcoded) ───
  for (let step = 0; step < 96; step++) {  // 24 hours
    const update: TelemetryUpdate = {};

    // Tariff pattern with shock event
    let tariff = 0.18; // normal rate
    if (step <= 16 || step >= 88) {
      tariff = 0.12; // cheap night
    } else if (step <= 32) {
      tariff = 0.14; // cheap morning
    } else if (step >= 68 && step <= 84) {
      tariff = 0.42; // expensive evening peak
    }
    // SHOCK: tariff crisis at steps 72-75 (18:00-18:45)
    if (step >= 72 && step <= 75) {
      tariff = 0.75;
    }
    update.tariff = tariff;

    // Solar generation with cloud event
    const x = (step - 48) / 16;
    let solar = Math.max(0, 4.0 * Math.exp(-x * x)); // bell curve, peak at noon
    // Cloud event drops generation
    if (step >= 52 && step <= 56) {
      solar *= 0.3;
    }
    // Night: no solar
    if (step < 24 || step >= 80) {
      solar = 0;
    }
    update.solarKW = solar;

    // Base load with cooking spikes (breakfast + dinner)
    const breakfastSpike = step >= 28 && step <= 32 ? 1.0 : 0;  // 07:00-08:00
    const dinnerSpike = step >= 72 && step <= 78 ? 1.5 : 0;     // 18:00-19:30
    const nightLow = (step < 24 || step > 88) ? -0.4 : 0;       // lower at night
    update.baseLoadKW = 1.6 + breakfastSpike + dinnerSpike + nightLow;

    // Outdoor temperature (sinusoidal daily pattern, 24h)
    update.outdoorTempC = 23 + Math.sin(((step - 32) / 96) * 2 * Math.PI) * 6;

    yield update;
  }
}

/**
 * Apply telemetry update to energy state
 */
export function applyTelemetry(state: EnergyState, update: TelemetryUpdate): EnergyState {
  return {
    ...state,
    tariff: update.tariff ?? state.tariff,
    solarKW: update.solarKW ?? state.solarKW,
    baseLoadKW: update.baseLoadKW ?? state.baseLoadKW,
    outdoorTempC: update.outdoorTempC ?? state.outdoorTempC,
  };
}
