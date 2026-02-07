// StateInterpreter Agent - extracts events and assesses risk

import { EnergyState, Memory } from "../types.js";
import { memoryBrief } from "../memory/memoryStore.js";
import { CONFIG } from "../config.js";

export type Interpreted = {
  events: string[];
  riskScore: number; // 0..1
  summary: string;
};

/**
 * Reasoner Agent: Interprets current state and detects important events
 * 
 * Events detected:
 * - PRICE_SPIKE: tariff above threshold
 * - EV_URGENT: approaching EV deadline with charge remaining
 * - GRID_OVERLOAD_RISK: predicted load exceeds grid limit
 * - BATTERY_LOW: SOC critically low
 * - COMFORT_DRIFT: temperature outside comfort zone
 */
export function interpretState(state: EnergyState, mem: Memory): Interpreted {
  const events: string[] = [];

  // Detect price spike
  if (state.tariff >= CONFIG.PRICE_SPIKE_THRESHOLD) {
    events.push("PRICE_SPIKE");
  }

  // EV urgency check
  const stepsLeft = state.evDeadlineStep - state.step;
  if (state.evRequiredKWh > 0 && stepsLeft <= CONFIG.EV_URGENT_STEPS_THRESHOLD) {
    events.push("EV_URGENT");
  }

  // Grid overload risk (rough prediction if we charge EV now)
  const predictedGrid = state.baseLoadKW + 2.5 + state.evMaxChargeKW;
  if (predictedGrid > state.gridMaxKW) {
    events.push("GRID_OVERLOAD_RISK");
  }

  // Battery low warning
  if (state.batterySOC < CONFIG.BATTERY_LOW_THRESHOLD) {
    events.push("BATTERY_LOW");
  }

  // Comfort drift
  if (
    state.indoorTempC < CONFIG.COMFORT_MIN_TEMP_C ||
    state.indoorTempC > CONFIG.COMFORT_MAX_TEMP_C
  ) {
    events.push("COMFORT_DRIFT");
  }

  // Risk score increases with number of concurrent events
  const riskScore = Math.min(1, events.length / 6);

  // Build comprehensive summary
  const summary = [
    `t=${state.step}`,
    `tariff=$${state.tariff.toFixed(2)}`,
    `SOC=${(state.batterySOC * 100).toFixed(0)}%`,
    `EVremain=${state.evRequiredKWh.toFixed(1)}kWh`,
    `indoor=${state.indoorTempC.toFixed(1)}°C`,
    `| ${events.join(",") || "OK"}`,
    `| ${memoryBrief(mem)}`,
  ].join(" ");

  return { events, riskScore, summary };
}

/**
 * LLM-backed state interpretation with validation and fallback
 */
export async function llmInterpretState(
  provider: { complete: (prompt: string) => Promise<string> },
  state: EnergyState,
  mem: Memory
): Promise<{ result: Interpreted; usedLLM: boolean }> {
  try {
    // Build prompt for LLM
    const prompt = `You are an energy system analyst. Analyze the current state and detect events.

Current State:
- Step: ${state.step}
- Tariff: $${state.tariff}/kWh
- SOC: ${(state.batterySOC * 100).toFixed(0)}%
- EV remaining: ${state.evRequiredKWh.toFixed(1)} kWh
- Indoor temp: ${state.indoorTempC.toFixed(1)}°C
- Grid max: ${state.gridMaxKW} kW
- Memory: ${memoryBrief(mem)}

Respond with JSON only:
{
  "events": ["PRICE_SPIKE", "EV_URGENT", etc],
  "riskScore": 0.0-1.0,
  "summary": "brief analysis"
}`;

    const response = await provider.complete(prompt);
    const parsed = JSON.parse(response);

    // Validate structure
    if (
      !Array.isArray(parsed.events) ||
      typeof parsed.riskScore !== "number" ||
      typeof parsed.summary !== "string"
    ) {
      throw new Error("Invalid LLM response structure");
    }

    // Clamp risk score
    parsed.riskScore = Math.max(0, Math.min(1, parsed.riskScore));

    return {
      result: {
        events: parsed.events,
        riskScore: parsed.riskScore,
        summary: parsed.summary,
      },
      usedLLM: true,
    };
  } catch (error) {
    // Fallback to heuristic
    return {
      result: interpretState(state, mem),
      usedLLM: false,
    };
  }
}
