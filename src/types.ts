// Core type definitions for EnergyBrain

export type EnergyState = {
  step: number;              // 0..47
  minute: number;            // step*15
  tariff: number;            // $/kWh
  solarKW: number;           // PV generation
  baseLoadKW: number;        // non-controllable load
  hvacLoadKW: number;        // controllable-ish via target temp
  indoorTempC: number;       // comfort model
  outdoorTempC: number;

  batterySOC: number;        // 0..1
  batteryKWh: number;        // capacity
  batteryMaxChargeKW: number;
  batteryMaxDischargeKW: number;

  evRequiredKWh: number;     // remaining needed
  evDeadlineStep: number;    // must be done by this step
  evMaxChargeKW: number;

  gridMaxKW: number;         // limit; penalty if exceeded
};

export type Action = {
  batteryPowerKW: number;    // + charge, - discharge
  evChargeKW: number;        // 0..evMax
  hvacTargetTempC: number;   // target setpoint
  note?: string;             // short explanation
};

export type Plan = {
  horizonSteps: number;      // e.g. 6
  actions: Action[];         // length = horizonSteps, action[0] for now
  rationale: string;         // why this plan
};

export type StepResult = {
  state: EnergyState;
  action: Action;
  nextState: EnergyState;
  costUSD: number;
  gridImportKW: number;       // Power imported from grid (always >= 0)
  gridExportKW: number;       // Power exported to grid (always >= 0)
  gridPenaltyUSD: number;
  comfortViolation: number;  // degrees outside comfort band (0 means ok)
};

export type Memory = {
  lastDecisions: Array<{
    step: number;
    summary: string;
    action: Action;
    outcome: { costUSD: number; peakKW: number; comfortViolation: number };
  }>;
  learnedConstraints: string[];
  notes: string[];
};
