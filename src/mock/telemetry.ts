// Mock telemetry stream - simulates real-time energy system data

import { EnergyState } from "../types.js";

export interface TelemetryUpdate {
  tariff?: number;
  solarKW?: number;
  baseLoadKW?: number;
  outdoorTempC?: number;
}

/**
 * Creates a mock telemetry stream that yields updates for each 15-min step
 * Simulates realistic energy system conditions including:
 * - Dynamic tariffs with price shocks
 * - Solar generation with weather events
 * - Variable base load (cooking, appliances)
 * - Outdoor temperature variations
 */
export async function* createMockTelemetry(
  seed: number = 42
): AsyncGenerator<TelemetryUpdate, void, unknown> {
  for (let step = 0; step < 48; step++) {
    const update: TelemetryUpdate = {};

    // Tariff pattern with shock event
    let tariff = 0.18; // normal rate
    if (step <= 8) {
      tariff = 0.14; // cheap overnight
    }
    if (step >= 28 && step <= 36) {
      tariff = 0.42; // expensive evening peak
    }
    // SHOCK: tariff crisis at steps 30-31
    if (step === 30 || step === 31) {
      tariff = 0.75;
    }
    update.tariff = tariff;

    // Solar generation with cloud event
    const x = (step - 24) / 8;
    let solar = Math.max(0, 4.0 * Math.exp(-x * x)); // bell curve, peak at noon
    // Cloud event drops generation
    if (step >= 26 && step <= 28) {
      solar *= 0.3;
    }
    update.solarKW = solar;

    // Base load with cooking spike
    const cookingSpike = step >= 30 && step <= 34 ? 1.2 : 0;
    update.baseLoadKW = 1.6 + cookingSpike;

    // Outdoor temperature (sinusoidal daily pattern)
    update.outdoorTempC = 29 + Math.sin((step / 48) * Math.PI) * 3;

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
