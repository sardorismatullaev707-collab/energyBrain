// Agent Orchestrator - coordinates all agents in the decision pipeline

import { EnergyState, Action, StepResult, Memory, Plan } from "../types.js";
import { interpretState, llmInterpretState, Interpreted } from "./stateInterpreter.js";
import { proposePlans, llmProposePlans } from "./planner.js";
import { checkPlanSafety } from "./safety.js";
import { chooseAction, llmChooseAction } from "./executor.js";
import { executeAction } from "../skills/actuators.js";
import { rememberDecision } from "../memory/memoryStore.js";

export type AgentMode = "heuristic" | "llm" | "hybrid";

export interface DecisionLog {
  step: number;
  interpreted: Interpreted;
  allPlansCount: number;
  feasiblePlansCount: number;
  safetyIssues: string[];
  chosenAction: Action;
  reasoning: string;
  usedLLM: {
    interpreter: boolean;
    planner: boolean;
    executor: boolean;
  };
}

export interface OrchestratorResult {
  stepResult: StepResult;
  decisionLog: DecisionLog;
}

/**
 * Main orchestration function that runs the full agent pipeline
 * 
 * Pipeline:
 * 1. Interpret state (detect events, assess risk)
 * 2. Propose candidate plans
 * 3. Validate plans against safety constraints
 * 4. Choose best action from feasible plans
 * 5. Execute action via simulator
 * 6. Store decision in memory
 */
export async function runAgentStep(
  state: EnergyState,
  memory: Memory,
  provider: { complete: (prompt: string) => Promise<string> },
  mode: AgentMode
): Promise<OrchestratorResult> {
  const usedLLM = {
    interpreter: false,
    planner: false,
    executor: false,
  };

  // Determine if we should use LLM for this step
  const shouldUseLLM = (agentType: "interpreter" | "planner" | "executor"): boolean => {
    if (mode === "heuristic") return false;
    if (mode === "llm") return true;
    
    // Hybrid mode: use LLM on critical events or every 6 steps
    if (mode === "hybrid") {
      const isCriticalStep = state.step % 6 === 0;
      const hasCriticalEvent = 
        state.tariff >= 0.6 || // price spike
        (state.evRequiredKWh > 0 && state.evDeadlineStep - state.step <= 8) || // EV urgent
        state.batterySOC < 0.15; // battery low
      
      return isCriticalStep || hasCriticalEvent;
    }
    
    return false;
  };

  // Step 1: Interpret state
  let interpreted: Interpreted;
  if (shouldUseLLM("interpreter")) {
    const result = await llmInterpretState(provider, state, memory);
    interpreted = result.result;
    usedLLM.interpreter = result.usedLLM;
  } else {
    interpreted = interpretState(state, memory);
  }

  // Step 2: Propose plans
  let plans: Plan[];
  if (shouldUseLLM("planner")) {
    const result = await llmProposePlans(provider, state, interpreted.events);
    plans = result.result;
    usedLLM.planner = result.usedLLM;
  } else {
    plans = proposePlans(state, interpreted.events);
  }

  // Step 3: Safety validation (always deterministic)
  const safetyResults = plans.map((p) => ({
    plan: p,
    safety: checkPlanSafety(state, p),
  }));

  const feasiblePlans = safetyResults.filter((r) => r.safety.ok).map((r) => r.plan);
  const allSafetyIssues = safetyResults
    .filter((r) => !r.safety.ok)
    .flatMap((r) => r.safety.reasons);

  // Fallback: if no plans are feasible, use conservative fallback
  // Prefer Plan B (safety-first) or Plan D (emergency EV) if it exists
  let chosenPlans: Plan[];
  if (feasiblePlans.length > 0) {
    chosenPlans = feasiblePlans;
  } else {
    // Emergency fallback: try to find any plan that at least addresses EV
    const emergencyPlan = plans.find((p) => p.rationale.includes("EMERGENCY"));
    chosenPlans = emergencyPlan ? [emergencyPlan] : [plans[1]]; // Plan B as last resort
  }

  // Step 4: Choose action
  let action: Action;
  let reasoning: string;
  if (shouldUseLLM("executor")) {
    const result = await llmChooseAction(provider, state, memory, chosenPlans);
    action = result.result.action;
    reasoning = result.result.reasoning;
    usedLLM.executor = result.usedLLM;
  } else {
    const result = chooseAction(state, memory, chosenPlans);
    action = result.action;
    reasoning = result.reasoning;
  }

  // Step 5: Execute action
  const stepResult = executeAction(state, action);

  // Step 6: Remember decision
  rememberDecision(
    memory,
    state.step,
    interpreted.summary + " | " + reasoning,
    action,
    {
      costUSD: stepResult.costUSD + stepResult.gridPenaltyUSD,
      peakKW: stepResult.gridImportKW,
      comfortViolation: stepResult.comfortViolation,
    }
  );

  // Build decision log
  const decisionLog: DecisionLog = {
    step: state.step,
    interpreted,
    allPlansCount: plans.length,
    feasiblePlansCount: feasiblePlans.length,
    safetyIssues: allSafetyIssues,
    chosenAction: action,
    reasoning,
    usedLLM,
  };

  return { stepResult, decisionLog };
}
