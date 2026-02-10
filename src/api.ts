/**
 * API module for web demo
 * Runs simulation and returns JSON for visualization
 */

import { baselineAction } from "./sim/baseline.js";
import { executeAction } from "./skills/actuators.js";
import { createMemory } from "./memory/memoryStore.js";
import { EnergyState, StepResult } from "./types.js";
import { CONFIG } from "./config.js";
import { MockLLMProvider } from "./llm/mockProvider.js";
import { createMockTelemetry, applyTelemetry } from "./mock/telemetry.js";
import { runAgentStep } from "./agents/orchestrator.js";
import { computeSystemMetrics } from "./util/report.js";

function initialState(): EnergyState {
  return {
    step: 0,
    minute: 0,
    tariff: 0.14,
    solarKW: 0,
    baseLoadKW: 1.8,
    hvacLoadKW: 0,
    indoorTempC: 25.5,
    outdoorTempC: 30.0,
    batterySOC: 0.55,
    batteryKWh: 8.0,
    batteryMaxChargeKW: 3.5,
    batteryMaxDischargeKW: 3.5,
    evRequiredKWh: 10.0,
    evDeadlineStep: 28,
    evMaxChargeKW: 3.5,
    gridMaxKW: 6.0,
  };
}

async function runAgent(mode: "heuristic" = "heuristic"): Promise<StepResult[]> {
  let state = initialState();
  const mem = createMemory();
  const provider = new MockLLMProvider({ seed: 42 });
  const telemetry = createMockTelemetry(42, "opsd");
  const results: StepResult[] = [];

  for (let i = 0; i < CONFIG.TOTAL_STEPS; i++) {
    const telemetryResult = await telemetry.next();
    if (telemetryResult.done) break;

    state = applyTelemetry(state, telemetryResult.value);
    state.step = i;
    state.minute = i * 15;

    const { stepResult } = await runAgentStep(state, mem, provider, mode);
    results.push(stepResult);
    state = stepResult.nextState;
  }

  return results;
}

async function runBaseline(): Promise<StepResult[]> {
  let state = initialState();
  const telemetry = createMockTelemetry(42, "opsd");
  const results: StepResult[] = [];

  for (let i = 0; i < CONFIG.TOTAL_STEPS; i++) {
    const telemetryResult = await telemetry.next();
    if (telemetryResult.done) break;

    state = applyTelemetry(state, telemetryResult.value);
    state.step = i;
    state.minute = i * 15;

    const action = baselineAction(state);
    const stepRes = executeAction(state, action);
    results.push(stepRes);
    state = stepRes.nextState;
  }

  return results;
}

export async function runSimulationAPI() {
  console.log("🧠 Running baseline...");
  const baselineResults = await runBaseline();

  console.log("🤖 Running AI agent (heuristic mode)...");
  const agentResults = await runAgent("heuristic");

  const baselineMetrics = computeSystemMetrics(baselineResults);
  const agentMetrics = computeSystemMetrics(agentResults);

  // Extract time series data for charts
  const hours: string[] = [];
  const prices: number[] = [];
  const solar: number[] = [];
  const batterySOC: number[] = [];
  const evRemaining: number[] = [];
  const baselineCostCumulative: number[] = [];
  const agentCostCumulative: number[] = [];

  let baselineCostSum = 0;
  let agentCostSum = 0;

  for (let i = 0; i < CONFIG.TOTAL_STEPS; i++) {
    const hour = Math.floor(i / 4);
    const minute = (i % 4) * 15;
    hours.push(`${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`);

    prices.push(baselineResults[i].state.tariff);
    solar.push(baselineResults[i].state.solarKW);
    batterySOC.push(agentResults[i].state.batterySOC * 100);
    evRemaining.push(agentResults[i].state.evRequiredKWh);

    baselineCostSum += baselineResults[i].costUSD;
    agentCostSum += agentResults[i].costUSD;
    baselineCostCumulative.push(baselineCostSum);
    agentCostCumulative.push(agentCostSum);
  }

  return {
    baselineCost: baselineMetrics.totalCost,
    agentCost: agentMetrics.totalCost,
    baselineKWh: baselineMetrics.totalImportedKWh,
    agentKWh: agentMetrics.totalImportedKWh,
    evDeadlineMet: agentMetrics.evDeadlineMet,
    hours,
    prices,
    solar,
    batterySOC,
    evRemaining,
    baselineCostCumulative,
    agentCostCumulative,
  };
}
