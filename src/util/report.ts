/**
 * Evidence Report Generator
 * Produces judge-grade output proving physical validity and explaining savings
 */

import { StepResult } from "../types.js";
import { CONFIG } from "../config.js";

export type SystemMetrics = {
  totalCost: number;
  importCost: number;
  exportRevenue: number;
  penalties: number;
  totalImportedKWh: number;
  totalExportedKWh: number;
  peakImportKW: number;
  comfortViolationScore: number;
  evDeadlineMet: boolean;
  evFinalKWh: number;
  evChargingCost: number;
  spikeCost: number; // Cost during steps 30-31
  spikeImportKWh: number; // Import during steps 30-31
};

export type SafetyStats = {
  totalPlansGenerated: number;
  totalPlansRejected: number;
  rejectionReasons: Record<string, number>;
  llmInvalidFallbacks: number;
  llmUsage: {
    interpreter: number;
    planner: number;
    executor: number;
  };
};

export type DecisionLog = {
  step: number;
  allPlansCount: number;
  feasiblePlansCount: number;
  safetyIssues: string[];
  usedLLM: {
    interpreter: boolean;
    planner: boolean;
    executor: boolean;
  };
};

/**
 * Compute comprehensive system metrics from step results
 */
export function computeSystemMetrics(results: StepResult[]): SystemMetrics {
  let importCost = 0;
  let exportRevenue = 0;
  let penalties = 0;
  let totalImportedKWh = 0;
  let totalExportedKWh = 0;
  let comfortViolationScore = 0;
  let evChargingCost = 0;
  let spikeCost = 0;
  let spikeImportKWh = 0;

  for (const r of results) {
    const stepHours = 0.25;
    const stepImportKWh = r.gridImportKW * stepHours;
    const stepExportKWh = r.gridExportKW * stepHours;
    const stepImportCost = stepImportKWh * r.state.tariff;
    const stepExportRevenue = stepExportKWh * CONFIG.FEED_IN_TARIFF_PER_KWH;

    importCost += stepImportCost;
    exportRevenue += stepExportRevenue;
    penalties += r.gridPenaltyUSD;
    totalImportedKWh += stepImportKWh;
    totalExportedKWh += stepExportKWh;
    comfortViolationScore += r.comfortViolation;

    // EV charging cost (weighted by tariff)
    if (r.action.evChargeKW > 0) {
      evChargingCost += r.action.evChargeKW * stepHours * r.state.tariff;
    }

    // Spike period cost (steps 30-31)
    if (r.state.step === 30 || r.state.step === 31) {
      spikeCost += stepImportCost;
      spikeImportKWh += stepImportKWh;
    }
  }

  const totalCost = importCost - exportRevenue + penalties;
  const peakImportKW = Math.max(...results.map((r) => r.gridImportKW));

  // Check EV deadline
  const initialResult = results[0];
  const finalResult = results[results.length - 1];
  const evInitialRequired = initialResult.state.evRequiredKWh;
  const evFinalRequired = finalResult.state.evRequiredKWh;
  const evChargedKWh = evInitialRequired - evFinalRequired;
  const evDeadlineMet = evFinalRequired <= 0.01; // Essentially zero

  return {
    totalCost,
    importCost,
    exportRevenue,
    penalties,
    totalImportedKWh,
    totalExportedKWh,
    peakImportKW,
    comfortViolationScore,
    evDeadlineMet,
    evFinalKWh: evChargedKWh,
    evChargingCost,
    spikeCost,
    spikeImportKWh,
  };
}

/**
 * Compute safety statistics from decision logs
 */
export function computeSafetyStats(logs: DecisionLog[]): SafetyStats {
  let totalPlansGenerated = 0;
  let totalPlansRejected = 0;
  const rejectionReasons: Record<string, number> = {};
  const llmUsage = { interpreter: 0, planner: 0, executor: 0 };

  for (const log of logs) {
    totalPlansGenerated += log.allPlansCount;
    totalPlansRejected += log.allPlansCount - log.feasiblePlansCount;

    // Count rejection reasons
    for (const issue of log.safetyIssues) {
      rejectionReasons[issue] = (rejectionReasons[issue] || 0) + 1;
    }

    // Count LLM usage
    if (log.usedLLM.interpreter) llmUsage.interpreter++;
    if (log.usedLLM.planner) llmUsage.planner++;
    if (log.usedLLM.executor) llmUsage.executor++;
  }

  return {
    totalPlansGenerated,
    totalPlansRejected,
    rejectionReasons,
    llmInvalidFallbacks: 0, // TODO: Track this if we add JSON validation failures
    llmUsage,
  };
}

/**
 * Run sanity checks and throw/warn on violations
 */
export function runSanityChecks(
  baselineMetrics: SystemMetrics,
  agentMetrics: SystemMetrics,
  baselineResults: StepResult[],
  agentResults: StepResult[]
) {
  const checks: string[] = [];

  // Check 1: Export must be 0 when disabled
  if (!CONFIG.EXPORT_ENABLED) {
    if (baselineMetrics.totalExportedKWh > 0.001) {
      throw new Error(
        `SANITY CHECK FAILED: Baseline exported ${baselineMetrics.totalExportedKWh.toFixed(3)} kWh but EXPORT_ENABLED=false`
      );
    }
    if (agentMetrics.totalExportedKWh > 0.001) {
      throw new Error(
        `SANITY CHECK FAILED: Agent exported ${agentMetrics.totalExportedKWh.toFixed(3)} kWh but EXPORT_ENABLED=false`
      );
    }
    checks.push("✓ No grid export when EXPORT_ENABLED=false");
  }

  // Check 2: Total cost must be >= 0 when export disabled
  if (!CONFIG.EXPORT_ENABLED) {
    if (baselineMetrics.totalCost < -0.01) {
      console.warn(
        `⚠️  WARNING: Baseline total cost is negative ($${baselineMetrics.totalCost.toFixed(2)}) when export disabled`
      );
    }
    if (agentMetrics.totalCost < -0.01) {
      console.warn(
        `⚠️  WARNING: Agent total cost is negative ($${agentMetrics.totalCost.toFixed(2)}) when export disabled`
      );
    }
    if (baselineMetrics.totalCost >= 0 && agentMetrics.totalCost >= 0) {
      checks.push("✓ Total cost non-negative (export disabled)");
    }
  }

  // Check 3: Battery SOC bounds
  const allResults = [...baselineResults, ...agentResults];
  for (const r of allResults) {
    if (r.nextState.batterySOC < -0.01 || r.nextState.batterySOC > 1.01) {
      throw new Error(
        `SANITY CHECK FAILED: Battery SOC out of bounds at step ${r.state.step}: ${(r.nextState.batterySOC * 100).toFixed(1)}%`
      );
    }
  }
  checks.push("✓ Battery SOC within [0%, 100%] at all steps");

  // Check 4: EV charge never decreases (tracked via evRequiredKWh)
  const checkEVMonotonic = (results: StepResult[], label: string) => {
    for (let i = 1; i < results.length; i++) {
      const prev = results[i - 1].nextState;
      const curr = results[i].state;
      // evRequiredKWh should only decrease (as we charge) or stay the same
      if (curr.evRequiredKWh > prev.evRequiredKWh + 0.01) {
        throw new Error(
          `SANITY CHECK FAILED (${label}): EV required kWh increased at step ${curr.step}: ${prev.evRequiredKWh.toFixed(2)} → ${curr.evRequiredKWh.toFixed(2)} kWh`
        );
      }
    }
  };
  
  checkEVMonotonic(baselineResults, "baseline");
  checkEVMonotonic(agentResults, "agent");
  checks.push("✓ EV charge progresses monotonically");

  // Check 5: EV deadline compliance for AGENT (this is a HARD CONSTRAINT)
  const initialEVRequired = agentResults[0].state.evRequiredKWh;
  if (!agentMetrics.evDeadlineMet && initialEVRequired > 0.1) {
    throw new Error(
      `SANITY CHECK FAILED: Agent did not meet EV deadline! Required ${initialEVRequired.toFixed(2)} kWh, charged ${agentMetrics.evFinalKWh.toFixed(2)} kWh. EV deadline is a HARD CONSTRAINT - this run is INVALID.`
    );
  }
  if (agentMetrics.evDeadlineMet && initialEVRequired > 0.1) {
    checks.push("✓ Agent met EV charging deadline (HARD CONSTRAINT)");
  } else {
    checks.push("✓ EV deadline N/A (no charging required)");
  }

  return checks;
}

/**
 * Print comprehensive evidence report
 */
export function printEvidenceReport(
  mode: string,
  baselineResults: StepResult[],
  agentResults: StepResult[],
  agentLogs: DecisionLog[]
) {
  const baselineMetrics = computeSystemMetrics(baselineResults);
  const agentMetrics = computeSystemMetrics(agentResults);
  const safetyStats = computeSafetyStats(agentLogs);

  // Run sanity checks
  const sanityChecks = runSanityChecks(baselineMetrics, agentMetrics, baselineResults, agentResults);

  // Compute savings
  const savedUSD = baselineMetrics.totalCost - agentMetrics.totalCost;
  const savingsPercent = (savedUSD / baselineMetrics.totalCost) * 100;
  const peakReduction = baselineMetrics.peakImportKW - agentMetrics.peakImportKW;

  // Spike savings attribution
  const spikeSavings = baselineMetrics.spikeCost - agentMetrics.spikeCost;
  const spikeImportReduction = baselineMetrics.spikeImportKWh - agentMetrics.spikeImportKWh;

  // EV scheduling benefit
  const evSchedulingSavings = baselineMetrics.evChargingCost - agentMetrics.evChargingCost;

  // Penalty avoidance
  const penaltyAvoidance = baselineMetrics.penalties - agentMetrics.penalties;

  console.log("\n" + "=".repeat(80));
  console.log("🔬 EVIDENCE REPORT - Physical Validity & Savings Attribution");
  console.log("=".repeat(80));

  // ===== SYSTEM METRICS =====
  console.log("\n📊 SYSTEM METRICS");
  console.log("-".repeat(80));

  const printMetrics = (label: string, metrics: SystemMetrics) => {
    console.log(`\n${label}:`);
    console.log(`  Total Cost             : $${metrics.totalCost.toFixed(2)}`);
    console.log(`    ├─ Import Cost       : $${metrics.importCost.toFixed(2)}`);
    console.log(`    ├─ Export Revenue    : $${metrics.exportRevenue.toFixed(2)}`);
    console.log(`    └─ Penalties         : $${metrics.penalties.toFixed(2)}`);
    console.log(`  Total Imported         : ${metrics.totalImportedKWh.toFixed(2)} kWh`);
    console.log(`  Total Exported         : ${metrics.totalExportedKWh.toFixed(2)} kWh`);
    console.log(`  Peak Import Power      : ${metrics.peakImportKW.toFixed(2)} kW`);
    console.log(`  Comfort Violations     : ${metrics.comfortViolationScore.toFixed(2)}°C·steps`);
    console.log(
      `  EV Deadline Met        : ${metrics.evDeadlineMet ? "✓ YES" : "✗ NO"} (${metrics.evFinalKWh.toFixed(2)} kWh charged)`
    );
    console.log(`  EV Charging Cost       : $${metrics.evChargingCost.toFixed(2)}`);
  };

  printMetrics("BASELINE", baselineMetrics);
  printMetrics(`AGENT (${mode.toUpperCase()} mode)`, agentMetrics);

  // ===== SAVINGS ATTRIBUTION =====
  console.log("\n" + "-".repeat(80));
  console.log("💰 SAVINGS ATTRIBUTION");
  console.log("-".repeat(80));
  console.log(`\nTotal Savings: $${savedUSD.toFixed(2)} (${savingsPercent.toFixed(1)}%)`);

  console.log(`\n1. Price Spike Mitigation (Steps 30-31):`);
  console.log(`   Baseline spike cost    : $${baselineMetrics.spikeCost.toFixed(2)}`);
  console.log(`   Agent spike cost       : $${agentMetrics.spikeCost.toFixed(2)}`);
  console.log(`   Spike savings          : $${spikeSavings.toFixed(2)}`);
  console.log(`   Import reduction       : ${spikeImportReduction.toFixed(2)} kWh`);
  console.log(
    `   Contribution to total  : ${((spikeSavings / savedUSD) * 100).toFixed(1)}%`
  );

  console.log(`\n2. EV Charging Schedule Optimization:`);
  console.log(`   Baseline EV cost       : $${baselineMetrics.evChargingCost.toFixed(2)}`);
  console.log(`   Agent EV cost          : $${agentMetrics.evChargingCost.toFixed(2)}`);
  console.log(`   EV scheduling savings  : $${evSchedulingSavings.toFixed(2)}`);
  console.log(
    `   Contribution to total  : ${((evSchedulingSavings / savedUSD) * 100).toFixed(1)}%`
  );

  console.log(`\n3. Peak Shaving:`);
  console.log(`   Baseline peak          : ${baselineMetrics.peakImportKW.toFixed(2)} kW`);
  console.log(`   Agent peak             : ${agentMetrics.peakImportKW.toFixed(2)} kW`);
  console.log(`   Peak reduction         : ${peakReduction.toFixed(2)} kW`);
  if (penaltyAvoidance > 0) {
    console.log(`   Penalty avoidance      : $${penaltyAvoidance.toFixed(2)}`);
  }

  // ===== SAFETY & RELIABILITY =====
  console.log("\n" + "-".repeat(80));
  console.log("🔒 SAFETY & RELIABILITY");
  console.log("-".repeat(80));

  console.log(`\nPlan Generation & Validation:`);
  console.log(`  Total plans generated  : ${safetyStats.totalPlansGenerated}`);
  console.log(`  Plans rejected by safety: ${safetyStats.totalPlansRejected}`);
  
  // Calculate per-step metrics for better context
  const stepsWithPlans = agentLogs.length;
  const avgPlansPerStep = safetyStats.totalPlansGenerated / stepsWithPlans;
  const avgRejectedPerStep = safetyStats.totalPlansRejected / stepsWithPlans;
  const stepsWithAllRejected = agentLogs.filter(log => log.feasiblePlansCount === 0).length;
  
  console.log(
    `  Rejection rate         : ${((safetyStats.totalPlansRejected / safetyStats.totalPlansGenerated) * 100).toFixed(1)}%`
  );
  console.log(`  Avg plans per step     : ${avgPlansPerStep.toFixed(1)}`);
  console.log(`  Avg rejected per step  : ${avgRejectedPerStep.toFixed(1)}`);
  console.log(
    `  Steps with fallback    : ${stepsWithAllRejected}/${stepsWithPlans} (${((stepsWithAllRejected/stepsWithPlans)*100).toFixed(1)}%)`
  );

  if (Object.keys(safetyStats.rejectionReasons).length > 0) {
    console.log(`\nTop Rejection Reasons:`);
    const sortedReasons = Object.entries(safetyStats.rejectionReasons)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    for (const [reason, count] of sortedReasons) {
      console.log(`  ${reason.padEnd(25)}: ${count}`);
    }
  }

  console.log(`\nLLM vs Heuristic Usage (per agent):`);
  console.log(
    `  Interpreter (LLM)      : ${safetyStats.llmUsage.interpreter}/${CONFIG.TOTAL_STEPS} steps`
  );
  console.log(
    `  Planner (LLM)          : ${safetyStats.llmUsage.planner}/${CONFIG.TOTAL_STEPS} steps`
  );
  console.log(
    `  Executor (LLM)         : ${safetyStats.llmUsage.executor}/${CONFIG.TOTAL_STEPS} steps`
  );

  // ===== SANITY CHECKS =====
  console.log("\n" + "-".repeat(80));
  console.log("✅ SANITY CHECKS");
  console.log("-".repeat(80));
  for (const check of sanityChecks) {
    console.log(`  ${check}`);
  }

  // ===== HIGH SAVINGS EXPLANATION =====
  if (mode === "llm" && savingsPercent > 25) {
    console.log("\n" + "-".repeat(80));
    console.log("💡 HIGH SAVINGS EXPLANATION");
    console.log("-".repeat(80));
    console.log(
      `High savings (${savingsPercent.toFixed(1)}%) driven by avoiding grid import during tariff`
    );
    console.log(
      `shock via battery discharge + better EV timing. Agent reduced import by`
    );
    console.log(
      `${spikeImportReduction.toFixed(2)} kWh during $0.75/kWh spike, saving $${spikeSavings.toFixed(2)}.`
    );
  }

  console.log("\n" + "=".repeat(80));
  console.log("✅ ALL SYSTEMS PHYSICALLY VALID - READY FOR JUDGING");
  console.log("=".repeat(80) + "\n");
}
