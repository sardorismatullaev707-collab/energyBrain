// Planner Agent - generates candidate action plans

import { EnergyState, Plan, Action } from "../types.js";
import { CONFIG } from "../config.js";

function createAction(
  state: EnergyState,
  batteryPowerKW: number,
  evChargeKW: number,
  hvacTargetTempC: number,
  note: string
): Action {
  return { batteryPowerKW, evChargeKW, hvacTargetTempC, note };
}

/**
 * Reasoner Agent: Proposes multiple candidate plans
 * 
 * Each plan has a different strategy:
 * - Plan A (Cost-Min): Minimize energy cost, aggressive battery usage
 * - Plan B (Safety-First): Conservative, ensure all deadlines met
 * - Plan C (Peak-Shaving): Keep grid usage under limit at all costs
 */
export function proposePlans(state: EnergyState, events: string[]): Plan[] {
  const horizon = CONFIG.PLAN_HORIZON_STEPS;
  const plans: Plan[] = [];

  const isSpike = events.includes("PRICE_SPIKE");
  const evUrgent = events.includes("EV_URGENT");
  const gridRisk = events.includes("GRID_OVERLOAD_RISK");
  const comfortDrift = events.includes("COMFORT_DRIFT");
  
  // Base HVAC target, but adjust for pre-cooling strategy
  let hvacBase = 24.5;
  
  // Pre-cooling: if we're approaching a price spike and battery is high, cool more now
  const approachingSpike = state.tariff < 0.3 && state.step >= 24 && state.step < 30;
  if (approachingSpike && state.batterySOC > 0.5) {
    hvacBase = 23.5; // Pre-cool before expensive period
  } else if (isSpike && state.batterySOC < 0.3) {
    hvacBase = 25.5; // Allow warmer during spike to save energy
  } else if (comfortDrift) {
    hvacBase = 24.5; // Return to comfort
  }

  // Plan A: Cost Minimization with Spike Prediction
  // - Prepare battery before expected spike (steps 25-29)
  // - Discharge battery aggressively during price spikes (steps 30-35)
  // - Smart EV charging: aggressive when cheap, delay when expensive unless urgent
  // - Avoid EV charging during spike window if possible
  const spikeExpectedSoon = state.step >= 25 && state.step <= 29;
  const inSpikeWindow = state.step >= 30 && state.step <= 35;
  // Prepare if: (1) before spike window AND (2) battery not full AND (3) not already in high price
  const shouldPrepareForSpike = spikeExpectedSoon && state.batterySOC < 0.8 && state.tariff < 0.5;
  
  const planA: Plan = {
    horizonSteps: horizon,
    rationale:
      "Minimize cost with spike prediction. Prepare battery before spike, discharge during spike, smart EV timing.",
    actions: Array.from({ length: horizon }, () => {
      // EV: charge aggressively when cheap, avoid spike window - DEADLINE IS HARD CONSTRAINT
      let ev = 0;
      if (state.evRequiredKWh > 0) {
        const stepsLeft = state.evDeadlineStep - state.step;
        const moderateUrgency = stepsLeft <= CONFIG.EV_URGENT_STEPS_THRESHOLD * 2;
        
        if (evUrgent || stepsLeft <= CONFIG.EV_URGENT_STEPS_THRESHOLD) {
          // HARD CONSTRAINT: Must charge at max rate when deadline near
          ev = state.evMaxChargeKW;
        } else if (inSpikeWindow && !moderateUrgency) {
          // During spike: charge minimum only if some urgency
          ev = moderateUrgency ? Math.min(2.0, state.evMaxChargeKW) : 0;
        } else if (state.tariff < 0.2 && !gridRisk) {
          ev = state.evMaxChargeKW; // Full power when cheap and safe
        } else if (state.tariff < 0.3 || moderateUrgency) {
          ev = Math.min(2.5, state.evMaxChargeKW); // Moderate when moderate price or deadline approaching
        } else if (stepsLeft <= horizon * 3) {
          // Getting close - maintain minimum safe rate
          ev = Math.min(1.5, state.evMaxChargeKW);
        }
        // else delay charging until cheaper (only if plenty of time left)
      }
      
      // Smart battery: prepare for spike, discharge during spike
      let batt = 0;
      if (isSpike && state.batterySOC > 0.25) {
        // Max discharge during spike
        batt = -state.batteryMaxDischargeKW;
      } else if (shouldPrepareForSpike) {
        batt = Math.min(3.5, state.batteryMaxChargeKW); // Charge aggressively before expected spike
      } else if (spikeExpectedSoon && state.batterySOC < 0.7) {
        // Even if tariff not super cheap, prepare for spike
        batt = 3.0;
      } else if (state.tariff < 0.2 && state.batterySOC < 0.8) {
        batt = 3.0; // Charge more aggressively when tariff cheap
      } else if (state.solarKW > 2.5 && state.batterySOC < 0.9) {
        batt = 2.5; // Charge more when solar available
      }
      
      return createAction(state, batt, ev, hvacBase, "PlanA");
    }),
  };
  plans.push(planA);

  // Plan B: Safety First with Smart Timing
  // - Ensure EV deadline met with steady charging (HARD CONSTRAINT)
  // - More aggressive battery discharge during spike for savings
  // - Charge battery aggressively when cheap
  const planB: Plan = {
    horizonSteps: horizon,
    rationale:
      "Ensure EV deadline with steady charging. Conservative battery use for safety and modest savings.",
    actions: Array.from({ length: horizon }, () => {
      // EV charging is PRIORITY when deadline approaching or remaining kWh exists
      let ev = 0;
      if (state.evRequiredKWh > 0) {
        const stepsLeft = state.evDeadlineStep - state.step;
        const moderateUrgency = stepsLeft <= CONFIG.EV_URGENT_STEPS_THRESHOLD * 2;
        
        if (stepsLeft <= CONFIG.EV_URGENT_STEPS_THRESHOLD) {
          // URGENT: Charge at max rate when deadline near
          ev = state.evMaxChargeKW;
        } else if (moderateUrgency) {
          // Moderate urgency: charge more aggressively
          ev = inSpikeWindow ? Math.min(1.5, state.evMaxChargeKW) : Math.min(3.0, state.evMaxChargeKW);
        } else if (inSpikeWindow) {
          // During spike: minimum charging if not urgent
          ev = Math.min(1.0, state.evMaxChargeKW);
        } else {
          // Can defer but still charge steadily
          ev = Math.min(2.5, state.evMaxChargeKW);
        }
      }
      
      // Battery: more aggressive discharge during spike
      let batt = 0;
      if (isSpike && state.batterySOC > 0.25) {
        // Aggressive discharge during spike
        batt = -3.5;
      } else if (spikeExpectedSoon && state.batterySOC < 0.75) {
        // Prepare for spike even at moderate tariff
        batt = 3.0;
      } else if (state.tariff < 0.2 && state.batterySOC < 0.8) {
        batt = 3.0; // Charge aggressively when cheap
      } else if (state.tariff < 0.35 && state.batterySOC < 0.7 && spikeExpectedSoon) {
        // If spike coming soon, charge even at moderate price
        batt = 2.5;
        batt = 2.0;
      }
      
      return createAction(state, batt, ev, hvacBase, "PlanB");
    }),
  };
  plans.push(planB);

  // Plan C: Peak Shaving
  // - Keep grid usage below limit
  // - Use battery to shave peaks
  // - Dynamically adjust EV charging to available headroom
  // Plan C: Peak Shaving
  // - Keep grid below limit using battery buffering
  // - EV deadline still priority
  const planC: Plan = {
    horizonSteps: horizon,
    rationale:
      "Keep grid below limit by using battery to shave peaks and controlling EV charge dynamically.",
    actions: Array.from({ length: horizon }, () => {
      const predictedBase = state.baseLoadKW + 2.0; // HVAC approx
      const remainingGrid = Math.max(0, state.gridMaxKW - predictedBase);
      
      // EV still has priority if deadline approaching
      let ev = 0;
      if (state.evRequiredKWh > 0) {
        const stepsLeft = state.evDeadlineStep - state.step;
        if (stepsLeft <= CONFIG.EV_URGENT_STEPS_THRESHOLD) {
          ev = state.evMaxChargeKW; // Override grid limit concern
        } else {
          ev = Math.max(0, Math.min(state.evMaxChargeKW, remainingGrid - 0.5));
        }
      }
      
      // Battery: peak shaving only
      const needsPeakShaving = predictedBase + ev > state.gridMaxKW;
      const batt =
        needsPeakShaving && state.batterySOC > 0.2
          ? -2.5 // discharge to stay under limit
          : 0;
      
      return createAction(state, batt, ev, hvacBase, "PlanC");
    }),
  };
  plans.push(planC);

  // Plan D: Emergency EV Deadline Compliance
  // - ONLY used when deadline is imminent and EV not charged
  // - Max EV charge rate, everything else minimal
  // - This ensures we ALWAYS have a valid plan that meets EV deadline
  if (state.evRequiredKWh > 0.1) {
    const stepsLeft = state.evDeadlineStep - state.step;
    if (stepsLeft <= CONFIG.EV_URGENT_STEPS_THRESHOLD * 1.5) {
      const planD: Plan = {
        horizonSteps: horizon,
        rationale:
          "EMERGENCY: EV deadline imminent. Max charge rate to ensure SLA compliance.",
        actions: Array.from({ length: horizon }, () => {
          return createAction(
            state,
            0, // No battery activity
            state.evMaxChargeKW, // Max EV charge
            hvacBase - 1.0, // Reduce HVAC slightly
            "PlanD-Emergency"
          );
        }),
      };
      plans.push(planD);
    }
  }

  return plans;
}

/**
 * LLM-backed plan generation with validation and fallback
 */
export async function llmProposePlans(
  provider: { complete: (prompt: string) => Promise<string> },
  state: EnergyState,
  events: string[]
): Promise<{ result: Plan[]; usedLLM: boolean }> {
  try {
    const stepsLeft = state.evDeadlineStep - state.step;
    const evUrgency = state.evRequiredKWh > 0 && stepsLeft <= CONFIG.EV_URGENT_STEPS_THRESHOLD 
      ? "CRITICAL - MUST CHARGE NOW" 
      : state.evRequiredKWh > 0 
        ? `${stepsLeft} steps left to deadline` 
        : "completed";
    
    const prompt = `You are an energy management strategist. Propose 3 alternative action plans.

Current State:
- Step: ${state.step}/${CONFIG.TOTAL_STEPS}
- Tariff: $${state.tariff}/kWh
- SOC: ${(state.batterySOC * 100).toFixed(0)}%
- Battery max charge: ${state.batteryMaxChargeKW} kW
- Battery max discharge: ${state.batteryMaxDischargeKW} kW
- EV remaining: ${state.evRequiredKWh.toFixed(1)} kWh (${evUrgency})
- EV deadline step: ${state.evDeadlineStep} (${stepsLeft} steps left)
- EV max charge: ${state.evMaxChargeKW} kW
- Grid max: ${state.gridMaxKW} kW
- Events: ${events.join(", ") || "none"}

CRITICAL CONSTRAINTS:
1. EV DEADLINE IS HARD CONSTRAINT - MUST meet ${state.evDeadlineStep} or run is INVALID
2. If EV remaining > 0 and steps left <= ${CONFIG.EV_URGENT_STEPS_THRESHOLD}, EV charging is HIGHEST PRIORITY
3. Never sacrifice EV deadline for cost savings

Respond with JSON array of 3 plans, each with 6 actions:
[{
  "id": "A",
  "horizonSteps": 6,
  "rationale": "strategy explanation",
  "actions": [
    {"batteryPowerKW": -3.5 to +3.5, "evChargeKW": 0 to 3.5, "hvacTargetTempC": 23-26, "note": "PlanA"},
    ... 5 more
  ]
}, ... 2 more plans B and C]`;

    const response = await provider.complete(prompt);
    const parsed = JSON.parse(response);

    // Validate and clamp
    if (!Array.isArray(parsed) || parsed.length !== 3) {
      throw new Error("Expected 3 plans");
    }

    const validatedPlans = parsed.map((p: Plan) => {
      if (!Array.isArray(p.actions) || p.actions.length !== 6) {
        throw new Error("Each plan must have 6 actions");
      }

      // Clamp all action values to safe ranges
      p.actions = p.actions.map((a) => ({
        batteryPowerKW: Math.max(
          -state.batteryMaxDischargeKW,
          Math.min(state.batteryMaxChargeKW, a.batteryPowerKW || 0)
        ),
        evChargeKW: Math.max(0, Math.min(state.evMaxChargeKW, a.evChargeKW || 0)),
        hvacTargetTempC: Math.max(22.5, Math.min(27, a.hvacTargetTempC || 24.5)),
        note: a.note || "LLM",
      }));

      return p;
    });

    return { result: validatedPlans, usedLLM: true };
  } catch (error) {
    // Fallback to heuristic
    return {
      result: proposePlans(state, events),
      usedLLM: false,
    };
  }
}
