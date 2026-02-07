// Safety Constraints Agent - validates plans against hard constraints

import { EnergyState, Plan } from "../types.js";
import { CONFIG } from "../config.js";

export type SafetyReport = {
  ok: boolean;
  reasons: string[];
  adjustedPlan?: Plan;
};

/**
 * Deterministic constraint checker (NOT LLM)
 * 
 * This is critical infrastructure - uses deterministic code to enforce:
 * - Battery SOC limits
 * - Grid power limits
 * - EV deadline requirements
 * - Physical constraints
 * 
 * This demonstrates "Reasoners decide, code enforces" architecture
 */
export function checkPlanSafety(state: EnergyState, plan: Plan): SafetyReport {
  const reasons: string[] = [];

  // Simulate the plan forward to check constraints
  let soc = state.batterySOC;
  let evRemain = state.evRequiredKWh;

  const dt = CONFIG.DT_HOURS;
  const eff = CONFIG.BATTERY_EFFICIENCY;

  for (let i = 0; i < plan.actions.length; i++) {
    const a = plan.actions[i];

    // Approximate SOC evolution
    const p = a.batteryPowerKW;
    const delta = (p * dt * (p >= 0 ? eff : 1 / eff)) / state.batteryKWh;
    soc = soc + delta;

    // EV progress
    evRemain = Math.max(0, evRemain - a.evChargeKW * dt * CONFIG.EV_CHARGE_EFFICIENCY);

    // Check SOC bounds
    if (soc < CONFIG.SOC_MIN_SAFETY) {
      reasons.push(`SOC_TOO_LOW at +${i}`);
    }
    if (soc > CONFIG.SOC_MAX_SAFETY) {
      reasons.push(`SOC_TOO_HIGH at +${i}`);
    }

    // Check grid limit (rough approximation)
    const gridApprox =
      state.baseLoadKW + 2.0 + a.evChargeKW + Math.max(0, a.batteryPowerKW);
    if (gridApprox > state.gridMaxKW + CONFIG.GRID_SAFETY_BUFFER_KW) {
      reasons.push(`GRID_OVER at +${i}`);
    }
  }

  // EV deadline check - HARD CONSTRAINT
  // Calculate remaining time and required charging rate
  const stepsLeft = state.evDeadlineStep - state.step;
  
  if (evRemain > 0.1 && stepsLeft <= CONFIG.TOTAL_STEPS) {
    // Check if we have enough time to charge remaining kWh
    const totalEVChargeInPlan = plan.actions.reduce((sum, a) => sum + a.evChargeKW * dt, 0);
    const chargedInPlan = totalEVChargeInPlan * CONFIG.EV_CHARGE_EFFICIENCY;
    const remainingAfterPlan = evRemain - chargedInPlan;
    
    // If deadline is within plan horizon and we won't complete charging
    if (stepsLeft <= plan.horizonSteps && remainingAfterPlan > 0.1) {
      reasons.push("EV_DEADLINE_VIOLATION");
    }
    
    // If deadline is approaching and plan doesn't charge enough
    if (stepsLeft <= CONFIG.EV_URGENT_STEPS_THRESHOLD) {
      const timeLeftHours = stepsLeft * dt;
      const minRequiredRate = remainingAfterPlan / timeLeftHours / CONFIG.EV_CHARGE_EFFICIENCY;
      if (minRequiredRate > state.evMaxChargeKW * 1.1) {
        // Physically impossible to meet deadline even at max rate
        reasons.push("EV_DEADLINE_IMPOSSIBLE");
      } else if (totalEVChargeInPlan < evRemain * 0.8) {
        // Plan doesn't charge aggressively enough when deadline near
        reasons.push("EV_DEADLINE_RISK");
      }
    }
  }

  const ok = reasons.length === 0;
  return { ok, reasons };
}
