// Alert skills - logging and notifications

export function sendAlert(message: string, level: "info" | "warning" | "error" = "info"): void {
  const prefix = level === "error" ? "🚨" : level === "warning" ? "⚠️" : "ℹ️";
  console.log(`${prefix} ALERT: ${message}`);
}

export function logDecision(step: number, reasoning: string): void {
  console.log(`\n[Step ${step}] ${reasoning}`);
}

export function logStepDetail(
  step: number,
  action: { batteryPowerKW: number; evChargeKW: number; hvacTargetTempC: number },
  result: { costUSD: number; gridImportKW: number; gridExportKW: number; gridPenaltyUSD: number; comfortViolation: number }
): void {
  const batt = action.batteryPowerKW >= 0 ? `+${action.batteryPowerKW.toFixed(1)}` : action.batteryPowerKW.toFixed(1);
  const gridInfo = result.gridExportKW > 0 
    ? `Import=${result.gridImportKW.toFixed(1)}kW Export=${result.gridExportKW.toFixed(1)}kW`
    : `Import=${result.gridImportKW.toFixed(1)}kW`;
  
  console.log(
    `  Action: Batt=${batt}kW EV=${action.evChargeKW.toFixed(1)}kW HVAC=${action.hvacTargetTempC.toFixed(1)}°C`
  );
  console.log(
    `  Result: Cost=$${result.costUSD.toFixed(2)} Grid=${gridInfo} Penalty=$${result.gridPenaltyUSD.toFixed(2)} Comfort=${result.comfortViolation.toFixed(1)}°`
  );
}
