// Scoring and comparison utilities

import { StepResult } from "../types.js";

export type Summary = {
  totalCost: number;
  importCost: number;
  exportRevenue: number;
  peakImportKW: number;
  totalExportKWh: number;
  comfortViol: number;
  penalties: number;
};

/**
 * Summarize a full day run of step results
 */
export function summarize(results: StepResult[]): Summary {
  let importCost = 0;
  let exportRevenue = 0;
  let totalExportKWh = 0;
  
  for (const r of results) {
    // Calculate import cost and export revenue from costUSD
    // costUSD = import - export, so we need to reconstruct
    const stepImportCost = r.gridImportKW * 0.25 * r.state.tariff;
    const stepExportRevenue = r.gridExportKW * 0.25 * 0.05; // Using feed-in tariff
    
    importCost += stepImportCost;
    exportRevenue += stepExportRevenue;
    totalExportKWh += r.gridExportKW * 0.25;
  }
  
  const totalCost = results.reduce((s, r) => s + r.costUSD + r.gridPenaltyUSD, 0);
  const peakImportKW = Math.max(...results.map((r) => r.gridImportKW));
  const comfortViol = results.reduce((s, r) => s + r.comfortViolation, 0);
  const penalties = results.reduce((s, r) => s + r.gridPenaltyUSD, 0);

  return { totalCost, importCost, exportRevenue, peakImportKW, totalExportKWh, comfortViol, penalties };
}

/**
 * Compare two summaries and calculate improvements
 */
export function compareSummaries(baseline: Summary, agent: Summary) {
  return {
    savedUSD: baseline.totalCost - agent.totalCost,
    peakReducedKW: baseline.peakImportKW - agent.peakImportKW,
    comfortImproved: baseline.comfortViol - agent.comfortViol,
    penaltyReducedUSD: baseline.penalties - agent.penalties,
  };
}
