// Memory management for agent decisions

import { Memory, Action } from "../types.js";
import { CONFIG } from "../config.js";

export function createMemory(): Memory {
  return {
    lastDecisions: [],
    learnedConstraints: [],
    notes: [],
  };
}

export function rememberDecision(
  mem: Memory,
  step: number,
  summary: string,
  action: Action,
  outcome: { costUSD: number; peakKW: number; comfortViolation: number }
): void {
  mem.lastDecisions.push({ step, summary, action, outcome });
  
  // Keep only recent history
  if (mem.lastDecisions.length > CONFIG.MEMORY_MAX_DECISIONS) {
    mem.lastDecisions.shift();
  }
}

export function addConstraint(mem: Memory, text: string): void {
  if (!mem.learnedConstraints.includes(text)) {
    mem.learnedConstraints.push(text);
  }
}

export function addNote(mem: Memory, text: string): void {
  mem.notes.push(text);
}

/**
 * Generate brief summary of memory for agent context
 */
export function memoryBrief(mem: Memory): string {
  const recentDecisions = mem.lastDecisions
    .slice(-5)
    .map((d) => {
      // Truncate long summaries to prevent string length issues
      const truncatedSummary = d.summary.length > 80 
        ? d.summary.substring(0, 80) + "..." 
        : d.summary;
      return `#${d.step}`;
    })
    .join(",");

  const constraints = mem.learnedConstraints.slice(-3).join("; ");

  return `Recent:[${recentDecisions || "none"}] Constraints:[${constraints || "none"}]`;
}
