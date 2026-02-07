// Actuator skills - execute actions on the environment

import { EnergyState, Action, StepResult } from "../types.js";
import { simulateStep } from "../sim/simulator.js";
import { CONFIG } from "../config.js";

/**
 * Execute an action on the environment
 * In production this would interface with real hardware/APIs
 * In MVP this uses the simulator
 * 
 * CRITICAL: This enforces EV deadline as HARD CONSTRAINT
 * If deadline is imminent and EV not charged, overrides action to prioritize EV
 */
export function executeAction(state: EnergyState, action: Action): StepResult {
  // HARD CONSTRAINT ENFORCEMENT: EV deadline override
  // This is the FINAL safety net - prevents deadline violation even if agents fail
  const stepsLeft = state.evDeadlineStep - state.step;
  const evStillNeeded = state.evRequiredKWh > 0.1;
  const deadlineImminent = stepsLeft <= CONFIG.EV_URGENT_STEPS_THRESHOLD;
  
  // Override only if agent is charging too slowly when deadline imminent
  if (evStillNeeded && deadlineImminent && action.evChargeKW < state.evMaxChargeKW * 0.5) {
    // Override: Force EV charging at max rate when deadline imminent
    const overriddenAction: Action = {
      ...action,
      evChargeKW: state.evMaxChargeKW,
      note: `${action.note || 'action'} [EV DEADLINE OVERRIDE: ${stepsLeft} steps left]`,
    };
    return simulateStep(state, overriddenAction);
  }
  
  return simulateStep(state, action);
}
