// Baseline controller - naive rule-based approach for comparison

import { EnergyState, Action } from "../types.js";

/**
 * Baseline strategy:
 * - EV: charge ASAP at max rate until done
 * - HVAC: fixed comfortable target
 * - Battery: charge when solar available, otherwise idle
 * 
 * This is the "dumb" approach we want to beat with AI agents
 */
export function baselineAction(state: EnergyState): Action {
  // EV: charge immediately at max rate if needed
  const evChargeKW = state.evRequiredKWh > 0 ? state.evMaxChargeKW : 0;

  // HVAC: fixed target temperature
  const hvacTargetTempC = 24.5;

  // Battery: charge when solar available and not full
  const batteryPowerKW =
    state.solarKW > 2.5 && state.batterySOC < 0.9 ? 2.0 : 0;

  return {
    batteryPowerKW,
    evChargeKW,
    hvacTargetTempC,
    note: "baseline",
  };
}
