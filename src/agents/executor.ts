// Execution Agent - chooses best plan and extracts immediate action

import { EnergyState, Plan, Action, Memory } from "../types.js";
import { CONFIG } from "../config.js";

/**
 * Quick scoring function for plan comparison
 * Lower score is better
 */
function scorePlanQuick(state: EnergyState, plan: Plan): number {
  // We only care about the immediate action (first step of plan)
  const a0 = plan.actions[0];

  // Cost proxy: estimated grid import * tariff
  const costProxy =
    Math.max(
      0,
      state.baseLoadKW + 2.0 + a0.evChargeKW + Math.max(0, a0.batteryPowerKW) - state.solarKW
    ) * state.tariff;

  // Grid penalty proxy: penalize exceeding limit heavily
  const gridProxy = Math.max(0, state.baseLoadKW + 2.0 + a0.evChargeKW - state.gridMaxKW) * 10;

  // EV urgency proxy: penalize not charging when deadline approaching
  const stepsToDeadline = Math.max(1, state.evDeadlineStep - state.step);
  const evUrgencyProxy =
    state.evRequiredKWh > 0 ? (1 / stepsToDeadline) * (a0.evChargeKW === 0 ? 8 : 0) : 0;

  // Comfort proxy: penalize if we're outside comfort zone
  const comfortProxy =
    state.indoorTempC < CONFIG.COMFORT_MIN_TEMP_C ||
    state.indoorTempC > CONFIG.COMFORT_MAX_TEMP_C
      ? 5
      : 0;

  return costProxy + gridProxy + evUrgencyProxy + comfortProxy;
}

/**
 * Reasoner Agent: Chooses the best plan from feasible candidates
 * Returns the immediate action to take (first step of chosen plan)
 */
export function chooseAction(
  state: EnergyState,
  mem: Memory,
  feasiblePlans: Plan[]
): { action: Action; reasoning: string } {
  if (feasiblePlans.length === 0) {
    throw new Error("No feasible plans available");
  }

  // Score all plans and pick the best
  let best = feasiblePlans[0];
  let bestScore = scorePlanQuick(state, best);

  for (const p of feasiblePlans.slice(1)) {
    const s = scorePlanQuick(state, p);
    if (s < bestScore) {
      best = p;
      bestScore = s;
    }
  }

  // Extract the immediate action (first step of plan)
  const action = best.actions[0];

  const reasoning = [
    `Chose ${action.note}`,
    `score=${bestScore.toFixed(2)}`,
    `rationale=${best.rationale}`,
  ].join(" | ");

  return { action, reasoning };
}

/**
 * LLM-backed action selection with validation and fallback
 */
export async function llmChooseAction(
  provider: { complete: (prompt: string) => Promise<string> },
  state: EnergyState,
  mem: Memory,
  feasiblePlans: Plan[]
): Promise<{ result: { action: Action; reasoning: string }; usedLLM: boolean }> {
  try {
    const plansDesc = feasiblePlans
      .map((p, i) => `Plan ${p.actions[0].note}: ${p.rationale}`)
      .join("\n");

    const prompt = `You are an energy system decision-maker. Choose the best plan and extract immediate action.

Current State:
- Step: ${state.step}
- Tariff: $${state.tariff}/kWh
- SOC: ${(state.batterySOC * 100).toFixed(0)}%
- EV remaining: ${state.evRequiredKWh.toFixed(1)} kWh
- Indoor: ${state.indoorTempC.toFixed(1)}°C

Available Plans:
${plansDesc}

Respond with JSON only:
{
  "chosenPlanId": "A" or "B" or "C",
  "action": {"batteryPowerKW": number, "evChargeKW": number, "hvacTargetTempC": number, "note": "string"},
  "reasoning": "why this plan"
}`;

    const response = await provider.complete(prompt);
    const parsed = JSON.parse(response);

    // Validate structure
    if (!parsed.action || typeof parsed.reasoning !== "string") {
      throw new Error("Invalid LLM response");
    }

    // Clamp action values
    const action: Action = {
      batteryPowerKW: Math.max(
        -state.batteryMaxDischargeKW,
        Math.min(state.batteryMaxChargeKW, parsed.action.batteryPowerKW || 0)
      ),
      evChargeKW: Math.max(0, Math.min(state.evMaxChargeKW, parsed.action.evChargeKW || 0)),
      hvacTargetTempC: Math.max(22.5, Math.min(27, parsed.action.hvacTargetTempC || 24.5)),
      note: parsed.action.note || "LLM",
    };

    return {
      result: { action, reasoning: parsed.reasoning },
      usedLLM: true,
    };
  } catch (error) {
    // Fallback to heuristic
    return {
      result: chooseAction(state, mem, feasiblePlans),
      usedLLM: false,
    };
  }
}
