// Energy system simulator - deterministic physics model

import { EnergyState, Action, StepResult } from "../types.js";
import { CONFIG } from "../config.js";

export function clamp(x: number, a: number, b: number): number {
  return Math.max(a, Math.min(b, x));
}

/**
 * Simple thermal model for indoor temperature
 * - Leak: indoor drifts toward outdoor
 * - Control: HVAC pushes indoor toward target
 */
function stepTemperature(
  indoor: number,
  outdoor: number,
  hvacTarget: number,
  hvacPowerKW: number
): number {
  const leak = CONFIG.THERMAL_LEAK_RATE;
  const control = CONFIG.THERMAL_CONTROL_RATE;
  
  const drift = (outdoor - indoor) * leak;
  const hvacEffect = hvacPowerKW > 0 ? (hvacTarget - indoor) * control : 0;
  
  return indoor + drift + hvacEffect;
}

/**
 * Simulate one 15-minute step of the energy system
 * Returns complete step result including costs and violations
 */
export function simulateStep(state: EnergyState, action: Action): StepResult {
  const dt = CONFIG.DT_HOURS;
  const battEff = CONFIG.BATTERY_EFFICIENCY;
  const evEff = CONFIG.EV_CHARGE_EFFICIENCY;

  // 1) Clamp action to physical limits
  const batteryPower = clamp(
    action.batteryPowerKW,
    -state.batteryMaxDischargeKW,
    state.batteryMaxChargeKW
  );
  const evKW = clamp(action.evChargeKW, 0, state.evMaxChargeKW);

  // 2) Battery SOC update
  // Positive power = charging (apply efficiency), negative = discharging (lose efficiency)
  const batteryDeltaKWh = batteryPower * dt * (batteryPower >= 0 ? battEff : (1 / battEff));
  const socKWh = state.batterySOC * state.batteryKWh;
  const newSocKWh = clamp(socKWh + batteryDeltaKWh, 0, state.batteryKWh);
  const newSOC = newSocKWh / state.batteryKWh;

  // 3) EV required update
  const evDeltaKWh = evKW * dt * evEff;
  const newEvRequired = clamp(state.evRequiredKWh - evDeltaKWh, 0, 1e9);

  // 4) HVAC load calculation
  // More power needed when target is far from current indoor temp
  const tempDiff = Math.abs(action.hvacTargetTempC - state.indoorTempC);
  const hvacKW = clamp(
    tempDiff * CONFIG.HVAC_TEMP_DIFF_COEFFICIENT,
    0,
    CONFIG.HVAC_MAX_POWER_KW
  );
  const newIndoor = stepTemperature(
    state.indoorTempC,
    state.outdoorTempC,
    action.hvacTargetTempC,
    hvacKW
  );

  // 5) Grid import/export calculation - CRITICAL ECONOMIC MODEL
  // Net power: positive means need to import, negative means potential export
  const netKW =
    state.baseLoadKW +
    hvacKW +
    evKW +
    Math.max(0, batteryPower) - // battery charging adds to load
    state.solarKW -
    Math.max(0, -batteryPower); // battery discharging reduces load

  // Grid import/export logic based on export settings
  let gridImportKW: number;
  let gridExportKW: number;

  if (!CONFIG.EXPORT_ENABLED) {
    // No export allowed - all excess generation is curtailed
    gridImportKW = Math.max(0, netKW);
    gridExportKW = 0;
    
    // Regression check: ensure no accidental export
    if (netKW < 0) {
      // Excess generation exists but cannot be exported
      // This is realistic: without net metering, excess solar is wasted
    }
  } else {
    // Export enabled - can sell excess back to grid
    gridImportKW = Math.max(0, netKW);
    gridExportKW = Math.max(0, -netKW);
    
    // Check export permissions
    const hasExcessSolar = state.solarKW > (state.baseLoadKW + hvacKW + evKW);
    const batteryIsDischarging = batteryPower < 0;
    
    if (!CONFIG.ALLOW_SOLAR_EXPORT && hasExcessSolar) {
      gridExportKW = 0; // Solar export disabled
    }
    if (!CONFIG.ALLOW_BATTERY_EXPORT && batteryIsDischarging && gridExportKW > 0) {
      gridExportKW = 0; // Battery export disabled
    }
  }

  // 6) Cost calculation - CORRECTED ECONOMICS
  // Import cost: pay retail tariff for imported energy
  const importCost = gridImportKW * dt * state.tariff;
  
  // Export revenue: receive feed-in tariff (much lower than retail)
  const exportRevenue = gridExportKW * dt * CONFIG.FEED_IN_TARIFF_PER_KWH;
  
  // Net cost (can be negative only if export enabled and revenue > import)
  const costUSD = importCost - exportRevenue;

  // Grid penalty: applies to IMPORT exceeding limit only
  const exceedImport = Math.max(0, gridImportKW - state.gridMaxKW);
  const gridPenaltyUSD = exceedImport * dt * CONFIG.GRID_PENALTY_MULTIPLIER;

  // Regression check: if export disabled, cost should never be negative from export
  if (!CONFIG.EXPORT_ENABLED && costUSD < 0) {
    console.warn(
      `⚠️  Warning: Negative cost detected with export disabled at step ${state.step}. ` +
      `This indicates a model bug. Cost: ${costUSD.toFixed(3)}, netKW: ${netKW.toFixed(2)}`
    );
  }

  // 7) Comfort violation
  const comfortViolation =
    newIndoor < CONFIG.COMFORT_MIN_TEMP_C
      ? CONFIG.COMFORT_MIN_TEMP_C - newIndoor
      : newIndoor > CONFIG.COMFORT_MAX_TEMP_C
      ? newIndoor - CONFIG.COMFORT_MAX_TEMP_C
      : 0;

  // 8) Build next state
  const nextState: EnergyState = {
    ...state,
    step: state.step + 1,
    minute: state.minute + 15,
    indoorTempC: newIndoor,
    hvacLoadKW: hvacKW,
    batterySOC: newSOC,
    evRequiredKWh: newEvRequired,
  };

  return {
    state,
    action: { ...action, batteryPowerKW: batteryPower, evChargeKW: evKW },
    nextState,
    costUSD,
    gridImportKW,
    gridExportKW,
    gridPenaltyUSD,
    comfortViolation,
  };
}
