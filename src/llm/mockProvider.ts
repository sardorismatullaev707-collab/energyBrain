// Mock LLM Provider - simulates AI reasoning deterministically

import { LLMProvider, LLMConfig } from "./provider.js";

/**
 * Mock LLM Provider that simulates reasoning without external APIs
 * Uses deterministic logic to parse prompts and generate realistic responses
 */
export class MockLLMProvider implements LLMProvider {
  name = "MockLLM";
  private seed: number;
  private config: LLMConfig;

  constructor(config: LLMConfig = {}) {
    this.config = config;
    this.seed = config.seed ?? 42;
  }

  async complete(prompt: string, schema?: unknown): Promise<string> {
    // Parse key information from prompt
    const info = this.parsePrompt(prompt);

    // Determine what kind of response is needed based on prompt content
    if (prompt.includes("interpret") || prompt.includes("events")) {
      return this.generateInterpretation(info);
    } else if (prompt.includes("propose") || prompt.includes("plans")) {
      return this.generatePlans(info);
    } else if (prompt.includes("choose") || prompt.includes("action")) {
      return this.generateActionChoice(info);
    }

    // Default fallback
    return JSON.stringify({ note: "mock response" });
  }

  private parsePrompt(prompt: string): Record<string, number> {
    const info: Record<string, number> = {};

    // Extract numeric values from prompt
    const tariffMatch = prompt.match(/tariff[:\s=]+\$?([\d.]+)/i);
    if (tariffMatch) info.tariff = parseFloat(tariffMatch[1]);

    const socMatch = prompt.match(/SOC[:\s=]+([\d.]+)%?/i);
    if (socMatch) info.soc = parseFloat(socMatch[1]) / 100;

    const evMatch = prompt.match(/EV\s*remain[:\s=]+([\d.]+)/i);
    if (evMatch) info.evRemain = parseFloat(evMatch[1]);

    const evDeadlineMatch = prompt.match(/EV\s*deadline\s*step[:\s=]+(\d+)/i);
    if (evDeadlineMatch) info.evDeadline = parseInt(evDeadlineMatch[1]);

    const gridMaxMatch = prompt.match(/grid.*max[:\s=]+([\d.]+)/i);
    if (gridMaxMatch) info.gridMax = parseFloat(gridMaxMatch[1]);

    const indoorMatch = prompt.match(/indoor[:\s=]+([\d.]+)/i);
    if (indoorMatch) info.indoor = parseFloat(indoorMatch[1]);

    const stepMatch = prompt.match(/step[:\s=]+(\d+)/i);
    if (stepMatch) info.step = parseInt(stepMatch[1]);

    return info;
  }

  private generateInterpretation(info: Record<string, number>): string {
    const events: string[] = [];
    let riskScore = 0;

    // Detect events based on parsed values
    if (info.tariff && info.tariff >= 0.6) {
      events.push("PRICE_SPIKE");
      riskScore += 0.3;
    }

    if (info.evRemain && info.evRemain > 0 && info.step && info.step >= 20) {
      events.push("EV_URGENT");
      riskScore += 0.2;
    }

    if (info.gridMax && info.gridMax <= 6.5) {
      events.push("GRID_OVERLOAD_RISK");
      riskScore += 0.15;
    }

    if (info.soc && info.soc < 0.15) {
      events.push("BATTERY_LOW");
      riskScore += 0.2;
    }

    if (info.indoor && (info.indoor < 23 || info.indoor > 26)) {
      events.push("COMFORT_DRIFT");
      riskScore += 0.15;
    }

    riskScore = Math.min(1, riskScore);

    const summary = this.generateNaturalLanguage(
      `Analyzed energy system state. Tariff at $${(info.tariff || 0).toFixed(2)}/kWh, ` +
      `battery SOC ${((info.soc || 0) * 100).toFixed(0)}%. ` +
      `Detected ${events.length} critical events requiring strategic response.`
    );

    return JSON.stringify({
      events,
      riskScore,
      summary,
    });
  }

  private generatePlans(info: Record<string, number>): string {
    const isSpike = info.tariff && info.tariff >= 0.6;
    const isModeratePriceHigh = info.tariff && info.tariff >= 0.35;
    const isCheap = info.tariff && info.tariff < 0.2;
    const evRemaining = info.evRemain || 0;
    const stepsLeft = info.evDeadline ? info.evDeadline - (info.step || 0) : 999;
    const evUrgent = evRemaining > 0 && stepsLeft <= 8; // Match CONFIG.EV_URGENT_STEPS_THRESHOLD
    const evModerateUrgency = evRemaining > 0 && stepsLeft <= 16; // Start charging earlier
    const lowSOC = info.soc && info.soc < 0.3;
    const goodSOC = info.soc ? info.soc >= 0.5 : false;
    const socValue = info.soc || 0.5;
    const currentStep = info.step || 0;
    
    // Smart spike prediction: spikes typically occur at steps 30-35 (peak hours)
    const spikeExpectedSoon = currentStep >= 25 && currentStep <= 29;
    const inSpikeWindow = currentStep >= 30 && currentStep <= 35;
    
    // Prepare battery for spike - relaxed condition to trigger more often
    const shouldPrepareForSpike = spikeExpectedSoon && socValue < 0.8 && (isCheap || info.tariff && info.tariff < 0.45);

    // Plan A: Cost optimization with spike prediction - but NEVER sacrifice EV deadline
    const planA = {
      id: "A",
      horizonSteps: 6,
      rationale: this.generateNaturalLanguage(
        isSpike
          ? "Aggressive cost reduction through maximum battery discharge during price spike. EV charging maintained if deadline approaching."
          : shouldPrepareForSpike
            ? "Preparing for anticipated price spike by charging battery during cheap tariff period. Strategic positioning for cost optimization."
            : "Opportunistic energy cost minimization by leveraging cheap tariff periods. EV deadline compliance is priority."
      ),
      actions: Array.from({ length: 6 }, () => {
        let batteryPower = 0;
        let evCharge = 0;
        
        // Battery strategy: prepare for spike, discharge during spike
        if (isSpike && socValue > 0.2) {
          batteryPower = -3.5; // Max discharge during spike - lower SOC threshold
        } else if (shouldPrepareForSpike) {
          batteryPower = 3.5; // Charge aggressively before spike
        } else if (spikeExpectedSoon && socValue < 0.75) {
          // Prepare even at moderate tariff if spike coming
          batteryPower = 3.0; // More aggressive (was 2.5)
        } else if (isCheap && socValue < 0.8) {
          batteryPower = 3.0; // Charge when cheap
        } else if (info.tariff && info.tariff < 0.35 && spikeExpectedSoon && socValue < 0.7) {
          // If spike expected, charge even at moderate price
          batteryPower = 2.5; // More aggressive (was 2.0)
          batteryPower = 2.0;
        }
        
        // EV strategy: charge early when cheap, avoid spike window
        if (evUrgent) {
          evCharge = 3.5; // MUST charge if urgent
        } else if (evRemaining > 0) {
          if (inSpikeWindow) {
            // During spike: charge minimum if urgent, else defer
            evCharge = evModerateUrgency ? 2.0 : 0;
          } else if (isCheap || evModerateUrgency) {
            // Charge aggressively when cheap OR when deadline approaching
            evCharge = 3.5;
          } else if (info.tariff && info.tariff < 0.3) {
            evCharge = 2.5; // Moderate charging at moderate price
          } else {
            evCharge = 1.0; // Minimum charging
          }
        }
        
        return {
          batteryPowerKW: batteryPower,
          evChargeKW: evCharge,
          hvacTargetTempC: 24.5,
          note: "PlanA",
        };
      }),
    };

    // Plan B: Safety-first with EV DEADLINE PRIORITY and spike awareness
    const planB = {
      id: "B",
      horizonSteps: 6,
      rationale: this.generateNaturalLanguage(
        "Prioritize EV deadline compliance and system safety. Steady EV charging with conservative battery management."
      ),
      actions: Array.from({ length: 6 }, () => {
        let batteryPower = 0;
        let evCharge = 0;
        
        // Conservative battery: charge when cheap, discharge during spike
        if (isSpike && socValue > 0.2) {
          batteryPower = -3.0; // More aggressive discharge (was -2.5)
        } else if (shouldPrepareForSpike || (spikeExpectedSoon && socValue < 0.75)) {
          batteryPower = 3.0; // Prepare for spike
        } else if (isCheap && socValue < 0.8) {
          batteryPower = 2.5;
          batteryPower = 2.5;
        }
        
        // EV: prioritize deadline over cost
        if (evRemaining > 0) {
          if (evUrgent) {
            evCharge = 3.5; // Max when urgent
          } else if (evModerateUrgency) {
            evCharge = 3.0; // Strong charging when deadline approaching
          } else if (inSpikeWindow) {
            evCharge = 1.5; // Minimum during spike
          } else {
            evCharge = 2.5; // Steady charging
          }
        }
        
        return {
          batteryPowerKW: batteryPower,
          evChargeKW: evCharge,
          hvacTargetTempC: 24.5,
          note: "PlanB",
        };
      }),
    };

    // Plan C: Peak shaving with EV deadline awareness
    const planC = {
      id: "C",
      horizonSteps: 6,
      rationale: this.generateNaturalLanguage(
        "Grid constraint optimization maintaining power draw below limits through dynamic battery buffering. EV deadline respected."
      ),
      actions: Array.from({ length: 6 }, () => {
        const remainingGrid = (info.gridMax || 6) - 2.5;
        let batteryPower = 0;
        let evCharge = 0;
        
        // Peak shaving: use battery to smooth load
        if (remainingGrid < 2 && socValue > 0.2) {
          batteryPower = -2.5;
        } else if (remainingGrid > 3 && isCheap && socValue < 0.8) {
          batteryPower = 2.0;
        }
        
        // EV: respect grid limits but prioritize deadline
        if (evRemaining > 0) {
          if (evUrgent) {
            evCharge = 3.5; // Ignore grid limits when urgent
          } else if (inSpikeWindow && !evModerateUrgency) {
            evCharge = Math.max(0, Math.min(2.0, remainingGrid - 0.5));
          } else {
            evCharge = Math.max(0, Math.min(3.5, remainingGrid - 0.5));
          }
        }
        
        return {
          batteryPowerKW: batteryPower,
          evChargeKW: evCharge,
          hvacTargetTempC: 24.5,
          note: "PlanC",
        };
      }),
    };

    return JSON.stringify([planA, planB, planC]);
  }

  private generateActionChoice(info: Record<string, number>): string {
    const isSpike = info.tariff && info.tariff >= 0.6;
    const evUrgent = info.evRemain && info.evRemain > 0;

    // Choose plan based on context
    let chosenPlanId = "B"; // default safe
    if (isSpike && info.soc && info.soc > 0.3) {
      chosenPlanId = "A"; // aggressive cost optimization
    } else if (info.gridMax && info.gridMax <= 6) {
      chosenPlanId = "C"; // peak shaving
    }

    const action = {
      batteryPowerKW: isSpike && info.soc && info.soc > 0.3 ? -3.5 : 0,
      evChargeKW: evUrgent && info.tariff && info.tariff < 0.3 ? 3.5 : evUrgent ? 2.0 : 0,
      hvacTargetTempC: isSpike ? 25.5 : 24.5,
      note: `Plan${chosenPlanId}`,
    };

    const reasoning = this.generateNaturalLanguage(
      `Selected Plan ${chosenPlanId} based on ${isSpike ? "price spike urgency" : "balanced optimization"}. ` +
      `Battery strategy: ${action.batteryPowerKW < 0 ? "discharge to offset grid costs" : action.batteryPowerKW > 0 ? "charging during favorable conditions" : "standby"}. ` +
      `EV charging ${action.evChargeKW > 0 ? `active at ${action.evChargeKW.toFixed(1)}kW` : "deferred"}.`
    );

    return JSON.stringify({
      chosenPlanId,
      action,
      reasoning,
    });
  }

  private generateNaturalLanguage(base: string): string {
    // Add slight variation using seed for more realistic output
    const variations = [
      base,
      base.replace(".", "; this approach"),
      base + " System analysis complete.",
    ];
    const index = this.seed % variations.length;
    return variations[index];
  }
}
