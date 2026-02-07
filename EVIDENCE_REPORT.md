# Evidence Report Enhancement

## Overview

EnergyBrain now generates a comprehensive **Evidence Report** at the end of each simulation run that proves physical validity and explains where cost savings come from. This judge-grade report is designed for easy presentation on a projector and provides complete transparency into the AI agent's performance.

## Report Sections

### 1. 📊 System Metrics

Detailed comparison of **Baseline** vs **Agent** performance:

- **Total Cost**: Overall energy cost (import - export + penalties)
- **Import Cost**: Cost of electricity purchased from grid
- **Export Revenue**: Revenue from selling to grid (when enabled)
- **Penalties**: Grid limit violation charges
- **Total Imported/Exported kWh**: Energy flow quantities
- **Peak Import Power**: Maximum grid demand
- **Comfort Violations**: Temperature deviations from comfort band
- **EV Deadline Met**: Whether EV charging target was achieved
- **EV Charging Cost**: Tariff-weighted cost of EV energy

### 2. 💰 Savings Attribution

Breaks down **where the savings come from**:

#### Price Spike Mitigation (Steps 30-31)
- Baseline vs Agent cost during $0.75/kWh spike
- Import reduction in kWh
- Contribution percentage to total savings
- Shows how battery discharge avoids expensive imports

#### EV Charging Schedule Optimization
- Baseline vs Agent EV charging cost
- Demonstrates intelligent timing (charge when tariffs are low)
- Can be negative if agent charges at worse times

#### Peak Shaving
- Peak demand reduction
- Penalty avoidance (if applicable)
- Important for grid infrastructure and demand charges

### 3. 🔒 Safety & Reliability

Proves the AI system is **safe and validated**:

- **Plan Generation**: Total candidate plans proposed
- **Plan Rejection**: How many plans violated safety constraints
- **Rejection Rate**: Percentage of plans rejected
- **Top Rejection Reasons**:
  - `GRID_OVER`: Would exceed grid import limit
  - `SOC_TOO_LOW/HIGH`: Battery SOC out of safe bounds
  - `EV_DEADLINE_RISK`: Would miss EV charging deadline
  - `COMFORT_OUT_OF_BOUNDS`: Temperature violations
- **LLM vs Heuristic Usage**: Shows which agents used LLM reasoning

### 4. ✅ Sanity Checks

Runtime assertions that **prove physical validity**:

1. **No grid export when disabled**: Ensures export is 0 when `EXPORT_ENABLED=false`
2. **Total cost non-negative**: When export is disabled, cost must be ≥ 0
3. **Battery SOC within [0%, 100%]**: Battery never overcharged or overdischarged
4. **EV charge progresses monotonically**: EV energy never decreases while charging

**All checks MUST pass or the program throws an error.**

### 5. 💡 High Savings Explanation (LLM mode > 25%)

When LLM mode achieves >25% savings, a clear one-line explanation is provided:

```
High savings (37.3%) driven by avoiding grid import during tariff
shock via battery discharge + better EV timing. Agent reduced import by
1.01 kWh during $0.75/kWh spike, saving $0.76.
```

This helps judges quickly understand the mechanism behind significant savings.

## Implementation

### Module: `src/util/report.ts`

**Key Functions:**
- `computeSystemMetrics(results)`: Calculates all metrics from step results
- `computeSafetyStats(logs)`: Aggregates safety and LLM usage statistics
- `runSanityChecks(...)`: Validates physical constraints
- `printEvidenceReport(...)`: Generates formatted console output

### Integration: `src/index.ts`

The main runner now:
1. Runs baseline and agent simulations
2. Collects all step results and decision logs
3. Calls `printEvidenceReport()` instead of old summary functions
4. Report prints automatically at the end

### Data Flow

```
StepResult[] (48 steps)
    ↓
computeSystemMetrics()
    ↓
SystemMetrics (totalCost, importKWh, peakKW, etc.)
    ↓
printEvidenceReport()
    ↓
Console output (formatted markdown-like text)
```

## Example Output Snippets

### Heuristic Mode (6.4% savings)
```
Total Savings: $0.48 (6.4%)

1. Price Spike Mitigation (Steps 30-31):
   Baseline spike cost    : $0.76
   Agent spike cost       : $0.71
   Spike savings          : $0.05
   Contribution to total  : 10.9%
```

### LLM Mode (37.3% savings)
```
Total Savings: $2.78 (37.3%)

1. Price Spike Mitigation (Steps 30-31):
   Spike savings          : $0.76
   Contribution to total  : 27.3%

2. EV Charging Schedule Optimization:
   EV scheduling savings  : $1.73
   Contribution to total  : 62.2%
```

### Hybrid Mode (20.7% savings)
```
LLM vs Heuristic Usage (per agent):
  Interpreter (LLM)      : 32/48 steps
  Planner (LLM)          : 32/48 steps
  Executor (LLM)         : 32/48 steps
```

## Benefits

1. **Transparency**: Every dollar of savings is explained and attributed
2. **Validation**: Sanity checks prove physical correctness
3. **Presentation-Ready**: Clean formatting for demos/judging
4. **Debugging**: Safety stats reveal what plans were rejected and why
5. **Comparability**: All three modes use the same report format
6. **Credibility**: Judge-grade evidence that results are real, not bugs

## Usage

No changes needed - the report is automatically generated:

```bash
# All modes now produce Evidence Report
npm run dev -- --mode=llm
npm run dev -- --mode=heuristic
npm run dev -- --mode=hybrid
```

The report prints at the end of the simulation, after all step logs.

## Verification

Run any mode and verify:
- ✅ All sanity checks pass
- ✅ Savings attribution sums to ~100%
- ✅ Export is 0.00 kWh (when disabled)
- ✅ Battery SOC never exceeds bounds
- ✅ EV charge progresses correctly
- ✅ Peak shaving shows real reduction

**If any check fails, the program throws an error - no fake results allowed!**
