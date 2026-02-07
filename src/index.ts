// EnergyBrain - Autonomous Energy & Microgrid Decision Engine
// Main simulation runner comparing AI agents vs baseline controller

import { baselineAction } from "./sim/baseline.js";
import { executeAction } from "./skills/actuators.js";
import { createMemory } from "./memory/memoryStore.js";
import { logHeader, logSection } from "./util/logger.js";
import { logDecision, logStepDetail } from "./skills/alerts.js";
import { EnergyState, StepResult } from "./types.js";
import { CONFIG } from "./config.js";
import { MockLLMProvider } from "./llm/mockProvider.js";
import { createMockTelemetry, applyTelemetry } from "./mock/telemetry.js";
import { runAgentStep, AgentMode, DecisionLog } from "./agents/orchestrator.js";
import { printEvidenceReport } from "./util/report.js";

/**
 * Parse CLI arguments
 */
function parseArgs(): { mode: AgentMode; seed: number } {
  const args = process.argv.slice(2);
  let mode: AgentMode = "llm"; // default to LLM mode
  let seed = 42;

  for (const arg of args) {
    if (arg.startsWith("--mode=")) {
      const modeValue = arg.split("=")[1] as AgentMode;
      if (["heuristic", "llm", "hybrid"].includes(modeValue)) {
        mode = modeValue;
      }
    }
    if (arg.startsWith("--seed=")) {
      seed = parseInt(arg.split("=")[1]) || 42;
    }
  }

  return { mode, seed };
}

/**
 * Create initial state for simulation start
 */
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
    evDeadlineStep: 28, // must complete by ~7 hours
    evMaxChargeKW: 3.5,

    gridMaxKW: 6.0,
  };
}

/**
 * Run the AI agent system for 48 steps with telemetry stream
 */
async function runAgent(
  provider: MockLLMProvider,
  mode: AgentMode,
  seed: number
): Promise<{ results: StepResult[]; logs: DecisionLog[] }> {
  let state = initialState();
  const mem = createMemory();
  const telemetry = createMockTelemetry(seed);

  const results: StepResult[] = [];
  const logs: DecisionLog[] = [];

  logHeader(`🤖 AGENT SYSTEM RUN (${mode.toUpperCase()} mode)`);

  for (let i = 0; i < CONFIG.TOTAL_STEPS; i++) {
    // Get telemetry update for this step
    const telemetryResult = await telemetry.next();
    if (telemetryResult.done) break;
    
    state = applyTelemetry(state, telemetryResult.value);
    state.step = i;
    state.minute = i * 15;

    // Run orchestrated agent pipeline
    const { stepResult, decisionLog } = await runAgentStep(state, mem, provider, mode);
    
    results.push(stepResult);
    logs.push(decisionLog);

    // Log critical steps (around tariff shock and events)
    if (
      i === 0 ||
      i === 28 ||
      i === 29 ||
      i === 30 ||
      i === 31 ||
      i === 32 ||
      i === 33 ||
      i === 47
    ) {
      logDecision(state.step, `[${getLLMBadge(decisionLog.usedLLM)}] ${decisionLog.interpreted.summary}`);
      logDecision(state.step, decisionLog.reasoning);
      logStepDetail(state.step, decisionLog.chosenAction, stepResult);
      
      if (decisionLog.safetyIssues.length > 0) {
        console.log(`  ⚠️  Safety issues filtered: ${decisionLog.safetyIssues.join(", ")}`);
      }
    }

    // Move to next state
    state = stepResult.nextState;
  }

  return { results, logs };
}

/**
 * Get badge showing which agents used LLM
 */
function getLLMBadge(usedLLM: { interpreter: boolean; planner: boolean; executor: boolean }): string {
  const llmCount = Object.values(usedLLM).filter(Boolean).length;
  if (llmCount === 0) return "HEURISTIC";
  if (llmCount === 3) return "🧠 LLM";
  return `🧠 LLM(${llmCount}/3)`;
}

/**
 * Run the baseline controller for 48 steps
 */
async function runBaseline(seed: number): Promise<StepResult[]> {
  let state = initialState();
  const telemetry = createMockTelemetry(seed);

  const results: StepResult[] = [];

  logHeader("📊 BASELINE RUN");

  for (let i = 0; i < CONFIG.TOTAL_STEPS; i++) {
    // Get telemetry update
    const telemetryResult = await telemetry.next();
    if (telemetryResult.done) break;
    
    state = applyTelemetry(state, telemetryResult.value);
    state.step = i;
    state.minute = i * 15;

    const action = baselineAction(state);
    const stepRes = executeAction(state, action);
    results.push(stepRes);

    // Log same critical steps for comparison
    if (
      i === 0 ||
      i === 28 ||
      i === 29 ||
      i === 30 ||
      i === 31 ||
      i === 32 ||
      i === 33 ||
      i === 47
    ) {
      logDecision(state.step, `Baseline: ${action.note}`);
      logStepDetail(state.step, action, stepRes);
    }

    state = stepRes.nextState;
  }

  return results;
}

/**
 * Main entry point
 */
(async () => {
  try {
    const { mode, seed } = parseArgs();

    console.log("\n🔋 EnergyBrain - Autonomous Microgrid Decision Engine\n");
    console.log(`Configuration:`);
    console.log(`  • Mode: ${mode.toUpperCase()}`);
    console.log(`  • Seed: ${seed}`);
    console.log(`\nSimulating 48 steps (12 hours) with:`);
    console.log("  • Dynamic tariffs with price shock");
    console.log("  • Solar generation with cloud event");
    console.log("  • EV charging deadline");
    console.log("  • Grid power limit");
    console.log("  • Comfort constraints");
    console.log(`  • ${mode === "llm" ? "🧠 AI agents with LLM reasoning" : mode === "hybrid" ? "🧠 Hybrid LLM + heuristics" : "⚡ Fast heuristics"}\n`);

    // Create LLM provider
    const provider = new MockLLMProvider({ seed });

    // Run both systems
    const { results: agentRes, logs: agentLogs } = await runAgent(provider, mode, seed);
    const baseRes = await runBaseline(seed);

    // Generate comprehensive evidence report
    printEvidenceReport(mode, baseRes, agentRes, agentLogs);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
})();
